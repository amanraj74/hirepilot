// Section detection — splits a resume's plain text into named sections.
// Regex-driven, deterministic, no LLM. Catches the common section headers.

export type ResumeSection = {
  name:
    | 'contact'
    | 'summary'
    | 'experience'
    | 'education'
    | 'skills'
    | 'projects'
    | 'certifications'
    | 'languages'
    | 'other';
  content: string;
};

const SECTION_HEADERS: Array<{ name: ResumeSection['name']; patterns: RegExp[] }> = [
  {
    name: 'contact',
    patterns: [/^contact(\s+info(rmation)?)?$/im, /^personal(\s+(details|info))?$/im],
  },
  {
    name: 'summary',
    patterns: [
      /^(professional\s+)?summary$/im,
      /^profile$/im,
      /^objective$/im,
      /^about(\s+me)?$/im,
    ],
  },
  {
    name: 'experience',
    patterns: [
      /^(work\s+)?experience$/im,
      /^professional\s+experience$/im,
      /^employment(\s+history)?$/im,
      /^career\s+history$/im,
    ],
  },
  {
    name: 'education',
    patterns: [/^education(al)?(\s+background)?$/im, /^academics?$/im, /^qualifications?$/im],
  },
  {
    name: 'skills',
    patterns: [
      /^(technical\s+)?skills?$/im,
      /^(core\s+)?competenc(ies|y)$/im,
      /^technologies$/im,
      /^tech\s+stack$/im,
    ],
  },
  {
    name: 'projects',
    patterns: [/^projects?$/im, /^side\s+projects?$/im, /^personal\s+projects?$/im],
  },
  {
    name: 'certifications',
    patterns: [
      /^certifications?$/im,
      /^licenses?\s+(and|&)\s+certifications?$/im,
      /^professional\s+certifications?$/im,
    ],
  },
  {
    name: 'languages',
    patterns: [/^languages?$/im, /^spoken\s+languages?$/im],
  },
];

export function detectSections(rawText: string): ResumeSection[] {
  if (!rawText.trim()) return [];

  const lines = rawText.split(/\r?\n/);
  const sections: ResumeSection[] = [];
  let current: ResumeSection = { name: 'other', content: '' };
  let currentLines: string[] = [];

  function flush() {
    const text = currentLines.join('\n').trim();
    if (text) sections.push({ name: current.name, content: text });
    currentLines = [];
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      currentLines.push('');
      continue;
    }

    let matched: ResumeSection['name'] | null = null;
    for (const header of SECTION_HEADERS) {
      if (header.patterns.some((re) => re.test(trimmed))) {
        matched = header.name;
        break;
      }
    }

    if (matched) {
      // Flush previous.
      flush();
      current = { name: matched, content: '' };
      // Don't include the header line itself in the content.
    } else {
      currentLines.push(trimmed);
    }
  }
  flush();

  // If everything ended up in 'other' (no headers detected), the whole
  // resume is one blob — leave it as 'other' so downstream extractors can
  // still scan it.
  return sections;
}
