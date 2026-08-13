// Unit tests for the resume parser pipeline.
//
// We test parseResumeText (the text-only post-parse logic — sections,
// fields, skills) directly so the tests don't depend on pdf-parse + a
// real PDF fixture. The PDF → text step is exercised end-to-end in
// the running app (POST /api/me/resume with a real PDF) and in
// dev-mode integration tests.

import { describe, it, expect } from 'vitest';
import { parseResumeText } from '@/server/ai/resume-parser';

const SAMPLE_RESUME = `
John Doe
Senior Software Engineer
San Francisco, CA · john@example.com · (415) 555-1234
linkedin.com/in/johndoe · github.com/johndoe

EXPERIENCE
Senior Engineer, Acme Corp
Jan 2020 – Present
- Led migration of monolith to microservices
- Improved API latency by 40%

Software Engineer, Beta Inc
Mar 2017 – Dec 2019
- Built React dashboards

EDUCATION
B.S. Computer Science, UC Berkeley
2013 – 2017

SKILLS
TypeScript, React, Node.js, PostgreSQL, Docker, AWS
`;

describe('resume-parser (text-only)', () => {
  it('returns the documented ParsedResume shape', () => {
    const parsed = parseResumeText(SAMPLE_RESUME);
    expect(parsed).toHaveProperty('sections');
    expect(parsed).toHaveProperty('fields');
    expect(parsed).toHaveProperty('skills');
  });

  it('detects the canonical section headers', () => {
    const parsed = parseResumeText(SAMPLE_RESUME);
    const names = parsed.sections.map((s) => s.name.toLowerCase());
    expect(names).toContain('experience');
    expect(names).toContain('education');
    expect(names).toContain('skills');
  });

  it('returns a fields object with the documented keys', () => {
    const parsed = parseResumeText(SAMPLE_RESUME);
    expect(parsed.fields).toHaveProperty('name');
    expect(parsed.fields).toHaveProperty('email');
    expect(parsed.fields).toHaveProperty('phone');
    expect(parsed.fields).toHaveProperty('yearsExperience');
    expect(parsed.fields).toHaveProperty('degreeLevel');
  });

  it('returns a non-negative years-of-experience estimate', () => {
    const parsed = parseResumeText(SAMPLE_RESUME);
    expect(parsed.fields.yearsExperience).toBeGreaterThanOrEqual(0);
  });

  it('returns a valid degree-level enum value', () => {
    const parsed = parseResumeText(SAMPLE_RESUME);
    expect(['PHD', 'MASTERS', 'BACHELORS', 'DIPLOMA', 'NONE']).toContain(parsed.fields.degreeLevel);
  });

  it('returns an empty array for an empty input (no throw)', () => {
    const parsed = parseResumeText('');
    expect(parsed.sections).toEqual([]);
    expect(parsed.skills).toEqual([]);
  });
});
