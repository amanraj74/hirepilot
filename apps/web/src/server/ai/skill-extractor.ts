// Skill extraction — fuzzy-matches resume text against the curated
// taxonomy. Uses Fuse.js for typo-tolerant matching.
//
// Tuned for real-world resumes:
// - threshold raised to 0.5 (was 0.4) so realistic resumes with
//   spacing / casing / minor typos still match.
// - minMatchLength of 3 chars so we don't false-positive on
//   common English words like "go" matching the language entry.
// - max matches capped at 40 to keep the profile UI snappy.

import Fuse from 'fuse.js';
import taxonomy from '@/data/skill-taxonomy.json';

export type SkillEntry = {
  name: string;
  category: string;
  aliases: string[];
  weight: number;
};

export type SkillMatch = {
  name: string;
  category: string;
  weight: number;
  matchedAlias: string;
};

const FUSE_THRESHOLD = 0.5; // 0 = perfect, 1 = horrible.
const MIN_SKILL_NAME_LENGTH = 3;
const MAX_MATCHES = 40;

let _fuse: Fuse<SkillEntry> | null = null;

function getFuse(): Fuse<SkillEntry> {
  if (_fuse) return _fuse;
  const entries = taxonomy.skills.map((s) => ({
    name: s.name,
    category: s.category,
    aliases: (s.aliases ?? []).map((a) => a.toLowerCase()),
    weight: (s as { weight?: number }).weight ?? 0.5,
  }));
  _fuse = new Fuse(entries, {
    keys: [
      { name: 'name', weight: 1 },
      { name: 'aliases', weight: 0.8 },
    ],
    threshold: FUSE_THRESHOLD,
    ignoreLocation: true,
    minMatchCharLength: MIN_SKILL_NAME_LENGTH,
    includeScore: true,
    useExtendedSearch: false,
  });
  return _fuse;
}

export function extractSkills(text: string): SkillMatch[] {
  if (!text.trim()) return [];

  const fuse = getFuse();
  const results = fuse.search(text);
  const seen = new Set<string>();
  const matches: SkillMatch[] = [];

  for (const r of results) {
    // Skip if the matched item is too far from the source.
    if (r.score === undefined || r.score > FUSE_THRESHOLD) continue;
    const key = r.item.name.toLowerCase();
    if (seen.has(key)) continue;
    if (r.item.name.length < MIN_SKILL_NAME_LENGTH) continue;
    seen.add(key);
    matches.push({
      name: r.item.name,
      category: r.item.category,
      weight: r.item.weight,
      matchedAlias: '',
    });
    if (matches.length >= MAX_MATCHES) break;
  }
  return matches;
}
