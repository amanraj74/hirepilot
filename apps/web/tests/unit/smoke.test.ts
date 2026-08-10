// Smoke test — guarantees `pnpm test` succeeds until Vitest suites ship on Day 2.
// Real tests will be added incrementally as each module lands.
//
// Pattern: add a single trivial assertion under `tests/unit/` per feature.

import { describe, it, expect } from 'vitest';

describe('smoke', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
