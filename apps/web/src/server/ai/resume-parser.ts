// Resume parser — orchestrates PDF/DOCX → raw text → sections → fields → skills.
// Deterministic engineering — no LLM calls.
//
// OCR fallback: tesseract.js 5.x supports PDF input directly. We try
// it when pdf-parse returns <21 chars of text. If OCR itself fails
// (e.g. on serverless runtimes where the worker can't initialize,
// or for corrupted PDFs), we degrade gracefully — the upload
// still succeeds with whatever fields we managed to extract from
// the partial text, and the route reports `usedOcr: false` so the
// UI can surface a clear "your PDF may be image-based" toast.

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
  /** True when OCR was used because pdf-parse returned no text. */
  usedOcr?: boolean;
};

// ---------------------------------------------------------------------------

// Lazy-loaded Tesseract worker. The worker creation is slow (downloads
// ~30MB of traineddata on first run) so we cache the promise. If
// the worker fails to init (e.g. on serverless where the binary path
// is not writable), ocrPdf() returns '' and the upload still
// completes — we just won't extract skills from image PDFs.
let _ocrWorker: Promise<unknown> | null = null;

async function getOcrWorker(): Promise<unknown> {
  if (!_ocrWorker) {
    _ocrWorker = (async () => {
      try {
        const tessMod = await import('tesseract.js');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tess: any = (tessMod as any).default ?? tessMod;
        const worker = await tess.createWorker('eng');
        return worker;
      } catch (err) {
        console.warn('[resume-parser] OCR worker init failed (likely serverless):', err);
        return null;
      }
    })();
  }
  return _ocrWorker;
}

async function ocrPdf(buffer: Buffer): Promise<string> {
  try {
    const worker = (await getOcrWorker()) as null | {
      recognize: (img: Buffer) => Promise<{ data: { text: string } }>;
    };
    if (!worker) return '';
    const { data } = await worker.recognize(buffer);
    return data.text || '';
  } catch (err) {
    console.error('[resume-parser] OCR failed:', err);
    return '';
  }
}

// ---------------------------------------------------------------------------

export async function extractRawText(buffer: Buffer, mime: string): Promise<string> {
  if (mime === 'application/pdf' || mime === 'application/x-pdf') {
    const result = await pdfParse(buffer);
    if (result.text.trim().length > 20) {
      return result.text;
    }
    // Scanned / image-only PDF — fall back to OCR.
    const ocrText = await ocrPdf(buffer);
    if (ocrText.trim().length > 0) return ocrText;
    return result.text; // empty fallback so downstream still runs
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
  // Search for skills in the WHOLE resume — many real-world resumes
  // don't have a "Skills" section header. We still give the SKILLS
  // section (when present) extra weight via double-counting in the
  // search text below.
  const skillsSearchText = [
    byName.get('skills') ?? '',
    byName.get('summary') ?? '',
    experienceText,
    rawText, // full-text fallback so skills mentioned anywhere match.
  ].join('\n');

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
    skills: extractSkills(skillsSearchText),
  };
}

export async function parseResume(buffer: Buffer, mime: string): Promise<ParsedResume> {
  const pdfMime = mime === 'application/pdf' || mime === 'application/x-pdf';
  // Detect OCR use by sampling the PDF before extracting text.
  let usedOcr = false;
  let rawText: string;
  if (pdfMime) {
    const initial = await pdfParse(buffer);
    if (initial.text.trim().length <= 20) {
      const ocr = await ocrPdf(buffer);
      usedOcr = ocr.trim().length > 0;
      rawText = ocr.trim().length > 0 ? ocr : initial.text;
    } else {
      rawText = initial.text;
    }
  } else {
    rawText = await extractRawText(buffer, mime);
  }
  return {
    rawText,
    ...parseResumeText(rawText),
    usedOcr,
  };
}
