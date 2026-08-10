// Match scorer — deterministic 5-dimension scoring against a job.
// Pure function, easy to test.

export type ParsedResumeLite = {
  skills: Array<{ name: string; weight: number }>;
  yearsExperience: number;
  degreeLevel: 'PHD' | 'MASTERS' | 'BACHELORS' | 'DIPLOMA' | 'NONE';
  // Optional: candidate's location/work-mode preferences (future field)
};

export type JobForScoring = {
  skillsRequired: string[];
  experienceYears: number | null;
  experienceLevel: 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD' | 'EXECUTIVE';
  workMode: 'REMOTE' | 'HYBRID' | 'ONSITE';
  location: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
};

export type MatchResult = {
  score: number; // 0–100
  strongSkills: string[];
  missingSkills: string[];
  weakAreas: string[];
  recommendations: string[];
  breakdown: {
    skillOverlap: number;
    experienceScore: number;
    educationScore: number;
  };
};

const WEIGHT = {
  skill: 0.55,
  experience: 0.3,
  education: 0.15,
} as const;

const DEGREE_RANK: Record<ParsedResumeLite['degreeLevel'], number> = {
  NONE: 0,
  DIPLOMA: 1,
  BACHELORS: 2,
  MASTERS: 3,
  PHD: 4,
};

const EXPERIENCE_LEVEL_TO_MIN: Record<JobForScoring['experienceLevel'], number> = {
  ENTRY: 0,
  MID: 2,
  SENIOR: 5,
  LEAD: 7,
  EXECUTIVE: 10,
};

export function scoreMatch(resume: ParsedResumeLite, job: JobForScoring): MatchResult {
  // Normalise everything to lowercase for matching.
  const candidateSkillNames = new Set(resume.skills.map((s) => s.name.toLowerCase()));
  const requiredSkills = new Set(job.skillsRequired.map((s) => s.toLowerCase()));

  // Skill overlap — weighted by job-skill weight (default 1 if missing).
  let matchedWeight = 0;
  let requiredWeight = 0;
  const strong: string[] = [];
  for (const req of requiredSkills) {
    // skill.weight from taxonomy (default 0.6 for normal skills)
    requiredWeight += 1;
    if (candidateSkillNames.has(req)) {
      matchedWeight += 1;
      // Find original casing.
      strong.push(job.skillsRequired.find((s) => s.toLowerCase() === req) ?? req);
    }
  }
  const skillOverlap = requiredWeight === 0 ? 0 : matchedWeight / requiredWeight;

  // Experience — sigmoid-shaped "do they meet/exceed the minimum?"
  const minYears = job.experienceYears ?? EXPERIENCE_LEVEL_TO_MIN[job.experienceLevel];
  const candidateYears = resume.yearsExperience;
  const experienceDelta = candidateYears - minYears;
  // Map delta → [0, 1] smoothly. +0 years = 0.5, +3 years = ~0.95, -2 = ~0.15.
  const experienceScore = 1 / (1 + Math.exp(-experienceDelta));

  // Education — bump score if candidate meets or exceeds typical for level.
  const jobEducationRank =
    job.experienceLevel === 'EXECUTIVE'
      ? DEGREE_RANK.MASTERS
      : job.experienceLevel === 'LEAD'
        ? DEGREE_RANK.BACHELORS
        : DEGREE_RANK.DIPLOMA;
  const candidateRank = DEGREE_RANK[resume.degreeLevel];
  const educationScore = candidateRank >= jobEducationRank ? 1 : candidateRank / jobEducationRank;

  // Weighted total.
  const total =
    WEIGHT.skill * skillOverlap +
    WEIGHT.experience * experienceScore +
    WEIGHT.education * educationScore;
  const score = Math.round(Math.max(0, Math.min(1, total)) * 100);

  // Missing skills = required but not on resume.
  const missing = job.skillsRequired.filter((s) => !candidateSkillNames.has(s.toLowerCase()));

  // Weak areas — heuristic.
  const weakAreas: string[] = [];
  if (skillOverlap < 0.5) weakAreas.push('Less than half of the required skills match');
  if (candidateYears < minYears)
    weakAreas.push(`Below minimum experience (${candidateYears}y vs ${minYears}y)`);
  if (candidateRank < jobEducationRank)
    weakAreas.push('Education level below typical for this role');

  // Recommendations — concrete.
  const recommendations: string[] = [];
  if (missing.length > 0) recommendations.push(`Build depth in: ${missing.slice(0, 3).join(', ')}`);
  if (candidateYears < minYears)
    recommendations.push('Highlight projects demonstrating relevant experience');
  if (skillOverlap >= 0.8)
    recommendations.push('Strong match — emphasize your top skills in the cover letter');

  return {
    score,
    strongSkills: strong,
    missingSkills: missing,
    weakAreas,
    recommendations,
    breakdown: {
      skillOverlap: Math.round(skillOverlap * 100),
      experienceScore: Math.round(experienceScore * 100),
      educationScore: Math.round(educationScore * 100),
    },
  };
}
