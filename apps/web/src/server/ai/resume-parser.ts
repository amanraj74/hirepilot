// Resume parser — orchestrates PDF/DOCX → raw text → sections → fields → skills.
// Deterministic engineering — no LLM calls.

// pdf-parse/lib/pdf-parse.js bypasses the test file the default entry attempts
// to load at module init (which breaks Next.js bundling).
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import mammoth from 'mammoth';
import { detectSections, type ResumeSection } from './section-detector';
import {
  detectDegreeLevel,
  estimateYearsExperience,
  extractEmail,
  extractLinks,
  extractName,
  extractPhone,
} from './field-extractor';
import { extractSkills, type SkillMatch } from './skill-extractor';

export type ParsedResume = {
  rawText: string;
  sections: ResumeSection[];
  fields: {
    name: string | null;
    email: string | null;
    phone: string | null;
    github: string | null;
    linkedin: string | null;
    website: string | null;
    yearsExperience: number;
    degreeLevel: 'PHD' | 'MASTERS' | 'BACHELORS' | 'DIPLOMA' | 'NONE';
  };
  skills: SkillMatch[];
};

// ---------------------------------------------------------------------------

export async function extractRawText(buffer: Buffer, mime: string): Promise<string> {
  if (mime === 'application/pdf' || mime === 'application/x-pdf') {
    const result = await pdfParse(buffer);
    return result.text;
  }
  if (
    mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mime === 'application/msword' ||
    mime === 'application/vnd.ms-word'
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }
  if (mime === 'text/plain' || mime === 'text/markdown') {
    return buffer.toString('utf8');
  }
  // Last resort — assume plain text.
  return buffer.toString('utf8');
}

// ---------------------------------------------------------------------------

export function parseResumeText(rawText: string): Omit<ParsedResume, 'rawText'> {
  const sections = detectSections(rawText);
  const byName = new Map<string, string>(sections.map((s) => [s.name, s.content]));

  const email = extractEmail(rawText);
  const phone = extractPhone(rawText);
  const name = extractName(rawText, email);
  const links = extractLinks(rawText);

  const educationText = byName.get('education') ?? '';
  const experienceText = byName.get('experience') ?? '';
  const skillsText = [byName.get('skills') ?? '', byName.get('summary') ?? '', experienceText].join(
    '\n',
  );

  return {
    sections,
    fields: {
      name,
      email,
      phone,
      github: links.github,
      linkedin: links.linkedin,
      website: links.website,
      yearsExperience: estimateYearsExperience(experienceText),
      degreeLevel: detectDegreeLevel(educationText),
    },
    skills: extractSkills(skillsText),
  };
}

export async function parseResume(buffer: Buffer, mime: string): Promise<ParsedResume> {
  const rawText = await extractRawText(buffer, mime);
  return {
    rawText,
    ...parseResumeText(rawText),
  };
}
