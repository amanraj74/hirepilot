# Changelog

All notable changes to **HirePilot** (DevFusion 4.O Round 3 submission) are recorded here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added

- **`BLUEPRINT.md` (canonical)** — superseded with the team lead's comprehensive 1484-line blueprint covering 18 sections: 18 architectural decisions, complete folder structure (every file path enumerated), locked tech stack with versions, 25-model Prisma schema, full Auth.js v5 + 2FA TOTP design, 50+ API routes, deterministic AI pipeline (5-dimension match scorer), React Email + Resend + ICS + @react-pdf integrations, ⌘K command palette, 4-tab Monaco coding assessment, 6-day hourly plan with risk register, and §18 "Hackathon Compliance" guardrails.
- **`TODO.md` (rewritten)** — 80+ tasks across 7 days, every task has: priority, dependencies, estimated time, files, acceptance criteria, commit message, status checkbox. Day-by-day breakdown with day-level goals and commit windows.
- **`PROJECT_STATUS.md` (handoff-ready)** — full context for a fresh agent to pick up: scope decision, current sprint, risks (R-0 scope explosion added), handoff note at bottom.
- **`LICENSE` (MIT)** — standard MIT license.
- **`docs/adr/0001-monorepo-vs-single-app.md`** — first ADR explaining the single Next.js app decision.

### Changed

- **`§18 Hackathon Compliance`** — replaced prior "Anti-Cheat Guardrails" with 6 official compliance bullets per team lead's instruction.
- **Scope decision** — locked at full PS-2 surface (no cuts) per team lead direction. Documented in `PROJECT_STATUS.md`.
- **`AGENT.md` §20** — to be aligned with the new compliance ruleset.

### Documentation

- All docs are now comprehensive enough that a fresh chat agent can pick up the project by reading `PROJECT_STATUS.md` → `TODO.md` → `BLUEPRINT.md` → `PRODUCT.md` → `AGENT.md`.

---

## [0.0.0] — 2026-08-08

### Added

- **Bootstrap.** Empty repository converted into a structured monorepo skeleton with full engineering documentation. No application code shipped in this version.

### Notes

- Meta-release: documentation and scaffolding only.
- Application source code will begin landing in `0.1.0` once Day 0 tasks (D0-01 → D0-14) complete.

---

<!-- Template for future entries — keep, do not delete.

## [X.Y.Z] — YYYY-MM-DD

### Added
- Feature X.

### Changed
- Behavior change Y.

### Deprecated
- Thing Z (will be removed in A.B.C).

### Removed
- Thing W (moved to package V).

### Fixed
- Bug U.

### Security
- CVE-XXXX-XXXX: description.

### Breaking
- API surface change ... (note migration in `docs/adr/`).

### Documentation
- New guide X.
-->
