// Resume service — orchestrates upload, parse, store, profile sync.
//
// In dev: file is written to apps/web/.uploads/ (gitignored) and the URL
// stored on CandidateProfile points to a local /api/uploads/[file] proxy
// route. In prod we'd swap to Cloudinary via STORAGE_PROVIDER env.

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { prisma } from '@/server/db';
import { parseResume, type ParsedResume } from '@/server/ai/resume-parser';
import { scoreMatch, type MatchResult, type ParsedResumeLite } from '@/server/ai/match-scorer';

const ALLOWED_MIME = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
]);

const ALLOWED_EXT = new Set(['.pdf', '.docx', '.doc', '.txt']);
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

const UPLOAD_DIR = path.join(process.cwd(), '.uploads');

export class ResumeUploadError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ResumeUploadError';
  }
}

async function ensureUploadDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

/**
 * Process an uploaded resume: validate, save to disk, parse, store metadata,
 * and sync extracted fields into the candidate profile.
 */
export async function processResumeUpload(input: {
  userId: string;
  file: File;
}): Promise<ParsedResume> {
  if (!ALLOWED_MIME.has(input.file.type)) {
    throw new ResumeUploadError(415, `Unsupported file type: ${input.file.type || 'unknown'}`);
  }
  const ext = path.extname(input.file.name).toLowerCase();
  if (!ALLOWED_EXT.has(ext)) {
    throw new ResumeUploadError(415, `Unsupported file extension: ${ext}`);
  }
  if (input.file.size > MAX_BYTES) {
    throw new ResumeUploadError(
      413,
      `File too large: ${(input.file.size / 1024 / 1024).toFixed(1)}MB (max 10MB)`,
    );
  }
  if (input.file.size === 0) {
    throw new ResumeUploadError(400, 'File is empty');
  }

  await ensureUploadDir();

  const buffer = Buffer.from(await input.file.arrayBuffer());
  const safeBase = path.basename(input.file.name).replace(/[^a-zA-Z0-9._-]/g, '_');
  const storedFilename = `${randomBytes(8).toString('hex')}-${safeBase}`;
  const storedPath = path.join(UPLOAD_DIR, storedFilename);
  await fs.writeFile(storedPath, buffer);

  const publicPath = `/uploads/${storedFilename}`;
  const fileType = input.file.type.startsWith('application/')
    ? input.file.type === 'application/pdf'
      ? 'PDF'
      : 'DOCX'
    : 'TXT';

  // Parse outside the transaction (CPU-bound).
  let parsed: ParsedResume;
  try {
    parsed = await parseResume(buffer, input.file.type || 'text/plain');
  } catch (err) {
    // Clean up the file on parse failure.
    await fs.unlink(storedPath).catch(() => {});
    const msg = err instanceof Error ? err.message : 'Parse failed';
    throw new ResumeUploadError(422, `Could not parse the resume: ${msg}`);
  }

  // Persist ResumeFile + sync CandidateProfile (atomic).
  await prisma.$transaction(async (tx) => {
    // Get the existing version count for this candidate.
    const existing = await tx.resume.count({ where: { candidateId: input.userId } });
    const newVersion = existing + 1;

    const resumeFile = await tx.resume.create({
      data: {
        candidateId: input.userId,
        fileUrl: publicPath,
        publicId: storedFilename,
        fileType,
        fileSizeBytes: input.file.size,
        originalName: input.file.name,
        rawText: parsed.rawText,
        parsedData: parsed as unknown as object,
        parseStatus: 'Parsed',
        version: newVersion,
      },
    });

    // Sync the CandidateProfile fields.
    await tx.candidateProfile.upsert({
      where: { userId: input.userId },
      update: {
        phone: parsed.fields.phone ?? undefined,
        githubUrl: parsed.fields.github ?? undefined,
        linkedinUrl: parsed.fields.linkedin ?? undefined,
        skills: parsed.skills.map((s) => s.name),
        totalExperienceYears: parsed.fields.yearsExperience || null,
        // Only set resumeUrl / resumeFileId for the latest version.
        resumeUrl: publicPath,
        resumeFileId: resumeFile.id,
        resumeUpdatedAt: new Date(),
        profileCompletionPct: computeCompletion(parsed),
      },
      create: {
        userId: input.userId,
        phone: parsed.fields.phone ?? null,
        githubUrl: parsed.fields.github ?? null,
        linkedinUrl: parsed.fields.linkedin ?? null,
        skills: parsed.skills.map((s) => s.name),
        totalExperienceYears: parsed.fields.yearsExperience || null,
        resumeUrl: publicPath,
        resumeFileId: resumeFile.id,
        resumeUpdatedAt: new Date(),
        profileCompletionPct: computeCompletion(parsed),
      },
    });

    return resumeFile;
  });

  return parsed;
}

// ---------------------------------------------------------------------------

export async function getResumeForUser(userId: string) {
  const [latest, profile] = await Promise.all([
    prisma.resume.findFirst({
      where: { candidateId: userId },
      orderBy: { version: 'desc' },
      select: {
        id: true,
        fileUrl: true,
        fileType: true,
        fileSizeBytes: true,
        originalName: true,
        version: true,
        parsedData: true,
        uploadedAt: true,
      },
    }),
    prisma.candidateProfile.findUnique({
      where: { userId },
      select: { skills: true, totalExperienceYears: true, resumeUpdatedAt: true },
    }),
  ]);
  return { latestResume: latest, profile };
}

// ---------------------------------------------------------------------------

export async function computeAndStoreMatchScore(applicationId: string) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      job: {
        select: {
          skillsRequired: true,
          experienceYears: true,
          experienceLevel: true,
          workMode: true,
          location: true,
          salaryMin: true,
          salaryMax: true,
        },
      },
      candidate: {
        select: {
          id: true,
          candidateProfile: {
            select: {
              skills: true,
              totalExperienceYears: true,
              resumes: {
                orderBy: { version: 'desc' },
                take: 1,
                select: { parsedData: true },
              },
            },
          },
        },
      },
    },
  });

  if (!application) return null;
  const profile = application.candidate.candidateProfile;
  if (!profile || profile.skills.length === 0) return null;

  // Pull degreeLevel from the most recent parsed resume (not on profile).
  const latestParsed = profile.resumes[0]?.parsedData as
    | { fields?: { degreeLevel?: 'PHD' | 'MASTERS' | 'BACHELORS' | 'DIPLOMA' | 'NONE' } }
    | null
    | undefined;

  const resumeLite: ParsedResumeLite = {
    skills: profile.skills.map((s: string) => ({ name: s, weight: 0.6 })),
    yearsExperience: profile.totalExperienceYears ?? 0,
    degreeLevel: latestParsed?.fields?.degreeLevel ?? 'NONE',
  };

  const result: MatchResult = scoreMatch(resumeLite, application.job);

  await prisma.application.update({
    where: { id: applicationId },
    data: { matchScore: result.score },
  });

  return result;
}

// ---------------------------------------------------------------------------

function computeCompletion(p: ParsedResume): number {
  // Weighted completion across profile fields.
  let pct = 0;
  if (p.fields.name) pct += 10;
  if (p.fields.email) pct += 10;
  if (p.fields.phone) pct += 5;
  if (p.fields.github) pct += 5;
  if (p.fields.linkedin) pct += 5;
  if (p.skills.length > 0) pct += 30;
  if (p.fields.yearsExperience > 0) pct += 15;
  if (p.fields.degreeLevel !== 'NONE') pct += 10;
  if (p.sections.some((s) => s.name === 'experience')) pct += 10;
  return Math.min(100, pct);
}
