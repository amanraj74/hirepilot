import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth/config';
import { getResumeForUser } from '@/server/services/resume.service';
import { ResumeUploader } from '@/components/resume/resume-uploader';

export const metadata: Metadata = {
  title: 'Profile · HirePilot',
};

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const DEGREE_LABEL: Record<string, string> = {
  PHD: 'PhD',
  MASTERS: "Master's",
  BACHELORS: "Bachelor's",
  DIPLOMA: 'Diploma',
  NONE: 'Not detected',
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login?callbackUrl=/profile');
  if (session.user.role !== 'CANDIDATE') redirect('/dashboard');

  const { latestResume, profile } = await getResumeForUser(session.user.id);

  const skills =
    profile?.skills ??
    (latestResume?.parsedData ? extractSkillsFromParsed(latestResume.parsedData) : []) ??
    [];
  const years = profile?.totalExperienceYears ?? null;
  const degree = latestResume?.parsedData ? extractDegree(latestResume.parsedData) : 'NONE';
  const profileCompletion = latestResume ? estimateCompletionFromProfile(profile) : 0;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Your profile</h1>
        <p className="mt-2 text-muted-foreground">
          Upload your resume and we&rsquo;ll parse it deterministically — no LLM, no API bills,
          fully auditable. Detected skills drive your match scores on every job.
        </p>
      </header>

      <ResumeUploader
        currentSkills={skills}
        currentYears={years}
        currentDegree={DEGREE_LABEL[degree] ?? 'Not detected'}
        resumeUpdatedAt={profile?.resumeUpdatedAt ?? null}
        profileCompletion={profileCompletion}
      />

      {latestResume && (
        <details className="rounded-lg border border-border bg-card p-4 text-sm">
          <summary className="cursor-pointer font-medium">
            View raw parsed data (v{latestResume.version})
          </summary>
          <pre className="mt-3 max-h-96 overflow-auto rounded bg-muted/40 p-3 text-xs">
            {JSON.stringify(latestResume.parsedData, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers (small, page-local)

type ParsedShape = {
  fields?: { yearsExperience?: number; degreeLevel?: string };
  skills?: Array<{ name: string }>;
};

function extractSkillsFromParsed(parsed: unknown): string[] {
  const p = parsed as ParsedShape;
  return (p.skills ?? []).map((s) => s.name);
}

function extractDegree(parsed: unknown): string {
  const p = parsed as ParsedShape;
  return p.fields?.degreeLevel ?? 'NONE';
}

function estimateCompletionFromProfile(
  profile: { skills: string[]; totalExperienceYears: number | null } | null,
): number {
  if (!profile) return 0;
  let pct = 0;
  if (profile.skills.length > 0) pct += 30;
  if (profile.totalExperienceYears && profile.totalExperienceYears > 0) pct += 15;
  return pct;
}
