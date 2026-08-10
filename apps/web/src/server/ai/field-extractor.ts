// Field extractors — pull email, phone, name, links, education, experience
// from parsed resume sections. All regex/heuristic, no LLM.

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_RE = /(\+?\d{1,3}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/;
const URL_RE = /\b(?:https?:\/\/|www\.)[^\s<>"']+/gi;
const GITHUB_RE = /github\.com\/([a-zA-Z0-9-]+)/i;
const LINKEDIN_RE = /linkedin\.com\/in\/([a-zA-Z0-9-]+)/i;

const DEGREE_WORDS = [
  'bachelor',
  'master',
  'phd',
  'doctorate',
  'mba',
  'b.s.',
  'm.s.',
  'b.a.',
  'm.a.',
  'bsc',
  'msc',
  'btech',
  'mtech',
  'b.e.',
  'm.e.',
  'b.tech',
  'm.tech',
];

export function extractEmail(text: string): string | null {
  const m = text.match(EMAIL_RE);
  return m ? m[0].toLowerCase() : null;
}

export function extractPhone(text: string): string | null {
  const m = text.match(PHONE_RE);
  return m ? m[0].trim() : null;
}

export function extractName(text: string, fallbackEmail?: string | null): string | null {
  // Heuristic: the candidate's name is usually in the first 1–3 lines of
  // the contact area, formatted as "First Last" or "First Middle Last".
  // Falls back to deriving from email local-part if no good match.
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .slice(0, 5);

  for (const line of lines) {
    // Skip lines that look like email, phone, address, URL
    if (EMAIL_RE.test(line)) continue;
    if (PHONE_RE.test(line)) continue;
    if (/^https?:\/\//i.test(line) || /www\./i.test(line)) continue;
    if (line.includes('@')) continue;
    // Match 2–4 words, mostly letters, possibly with dots/commas
    const match = line.match(/^([A-Z][a-zA-Z'.-]{1,20})(?:\s+([A-Z][a-zA-Z'.-]{1,20})){1,3}$/);
    if (match) {
      // Strip trailing punctuation
      return line.replace(/[,;]+$/, '').trim();
    }
  }

  if (fallbackEmail) {
    const local = fallbackEmail.split('@')[0] ?? '';
    // Replace common separators with spaces, title-case
    return local
      .split(/[._-]+/)
      .filter((p) => p.length > 0)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
      .join(' ');
  }
  return null;
}

export function extractLinks(text: string): {
  github: string | null;
  linkedin: string | null;
  website: string | null;
} {
  const urls = text.match(URL_RE) ?? [];
  let github: string | null = null;
  let linkedin: string | null = null;
  const website: string | null = null;
  for (const u of urls) {
    const clean = u.replace(/[,;]+$/, '');
    if (!github) {
      const m = clean.match(GITHUB_RE);
      if (m && m[1]) github = `https://github.com/${m[1]}`;
    }
    if (!linkedin) {
      const m = clean.match(LINKEDIN_RE);
      if (m && m[1]) linkedin = `https://linkedin.com/in/${m[1]}`;
    }
  }
  return { github, linkedin, website };
}

export function detectDegreeLevel(
  educationText: string,
): 'PHD' | 'MASTERS' | 'BACHELORS' | 'DIPLOMA' | 'NONE' {
  const lower = educationText.toLowerCase();
  if (lower.includes('phd') || lower.includes('doctorate')) return 'PHD';
  if (
    lower.includes('master') ||
    lower.includes('m.s.') ||
    lower.includes('msc') ||
    lower.includes('m.tech') ||
    lower.includes('mba')
  )
    return 'MASTERS';
  if (
    lower.includes('bachelor') ||
    lower.includes('b.s.') ||
    lower.includes('bsc') ||
    lower.includes('b.tech') ||
    lower.includes('b.e.') ||
    lower.includes('b.a.')
  )
    return 'BACHELORS';
  if (DEGREE_WORDS.some((d) => lower.includes(d))) return 'DIPLOMA';
  return 'NONE';
}

export function estimateYearsExperience(experienceSection: string): number {
  if (!experienceSection) return 0;
  // Look for "X years" / "X+ years" patterns.
  const matches = experienceSection.match(/(\d{1,2})\+?\s*(?:years?|yrs?)\b/gi) ?? [];
  let max = 0;
  for (const m of matches) {
    const n = parseInt(m, 10);
    if (!Number.isNaN(n) && n > max && n < 60) max = n;
  }
  if (max > 0) return max;

  // Fallback: count year ranges in date spans (2018-2022 = 4 years).
  const rangeMatches =
    experienceSection.match(/(20\d{2})\s*[–-]\s*(20\d{2}|present|current)/gi) ?? [];
  if (rangeMatches.length > 0) {
    let total = 0;
    for (const r of rangeMatches) {
      const [start, end] = (r.split(/[–-]/) ?? []).map((s) => s.trim());
      if (!start || !end) continue;
      const startYear = parseInt(start, 10);
      const endYear = /present|current/i.test(end) ? new Date().getFullYear() : parseInt(end, 10);
      if (!Number.isNaN(startYear) && !Number.isNaN(endYear) && endYear >= startYear) {
        total += endYear - startYear;
      }
    }
    return Math.min(total, 40);
  }
  return 0;
}
