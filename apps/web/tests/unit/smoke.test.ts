// Smoke test to verify the Vitest setup itself works.
// Picked up by `pnpm --filter web test`.

import { describe, it, expect } from 'vitest';

describe('smoke', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
