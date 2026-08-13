// Resume service — orchestrates upload, parse, store, profile sync.
//
// File storage is delegated to the storage abstraction in
// @/server/storage: Cloudinary when CLOUDINARY_* env vars are set,
// otherwise the local filesystem under apps/web/public/uploads/.

import { prisma } from '@/server/db';
import { parseResume, type ParsedResume } from '@/server/ai/resume-parser';
import { scoreMatch, type MatchResult, type ParsedResumeLite } from '@/server/ai/match-scorer';
import { getStorage } from '@/server/storage';

const ALLOWED_MIME = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
]);

const ALLOWED_EXT = new Set(['.pdf', '.docx', '.doc', '.txt']);
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export class ResumeUploadError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ResumeUploadError';
  }
}

/**
 * Process an uploaded resume: validate, save via storage, parse, store
 * metadata, and sync extracted fields into the candidate profile.
 */
export async function processResumeUpload(input: {
  userId: string;
  file: File;
}): Promise<ParsedResume> {
  if (!ALLOWED_MIME.has(input.file.type)) {
    throw new ResumeUploadError(415, `Unsupported file type: ${input.file.type || 'unknown'}`);
  }
  const ext = '.' + (input.file.name.split('.').pop() ?? '').toLowerCase();
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

  const buffer = Buffer.from(await input.file.arrayBuffer());

  // Upload via the storage abstraction. Any failure (Cloudinary required
  // on Vercel, Cloudinary API rejected, disk full, dynamic-import error)
  // is wrapped in ResumeUploadError so the route handler surfaces it as
  // a structured JSON 4xx/5xx instead of a 500 HTML page that the
  // client can't parse.
  let storage;
  try {
    storage = await getStorage();
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Storage init failed';
    throw new ResumeUploadError(503, msg);
  }
  let upload;
  try {
    upload = await storage.upload({
      buffer,
      filename: input.file.name,
      mimeType: input.file.type || 'application/octet-stream',
      folder: 'resumes',
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Upload failed';
    throw new ResumeUploadError(502, `Storage upload failed: ${msg}`);
  }

  const publicPath = upload.url;
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
    // Best-effort: delete the uploaded file on parse failure.
    await storage.delete(upload.storageId).catch(() => {});
    const msg = err instanceof Error ? err.message : 'Parse failed';
    throw new ResumeUploadError(422, `Could not parse the resume: ${msg}`);
  }

  // Persist ResumeFile + sync CandidateProfile (atomic).
  await prisma.$transaction(async (tx) => {
    // Resume.candidateId references CandidateProfile.id (NOT User.id),
    // so we have to look up the profile first. The profile is created
    // on sign-up for candidates, so this should always exist.
    const profile = await tx.candidateProfile.upsert({
      where: { userId: input.userId },
      update: {},
      create: { userId: input.userId },
      select: { id: true },
    });

    // Get the existing version count for this candidate.
    const existing = await tx.resume.count({ where: { candidateId: profile.id } });
    const newVersion = existing + 1;

    const resumeFile = await tx.resume.create({
      data: {
        candidateId: profile.id,
        fileUrl: publicPath,
        publicId: upload.storageId,
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
