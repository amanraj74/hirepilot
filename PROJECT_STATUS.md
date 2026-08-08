# PROJECT_STATUS.md

> Single source of truth for current project state.
> This file must reflect **reality** — never aspiration.
> Last updated takes precedence over any stale narrative elsewhere.

---

## Project Identity

| Field                 | Value                                                                                        |
| --------------------- | -------------------------------------------------------------------------------------------- |
| **Hackathon**         | **DevFusion 4.O — The Developers Hackathon** (IIT Bombay, hosted on Unstop)                  |
| **Project Name**      | **HirePilot** — AI-Powered Recruitment & Applicant Tracking System                           |
| **Problem Statement** | **PS-2 — AI-Powered Recruitment & ATS** (locked 2026-08-08)                                  |
| **Repository**        | `D:\hackathon\DevFusion`                                                                     |
| **Build Window**      | 07 Aug 2026 11:00 IST → **14 Aug 2026 16:00 IST** (~6 days remaining as of 08 Aug 12:00 IST) |
| **Visibility**        | **Must be PUBLIC** at submission time (mandatory).                                           |
| **License**           | MIT                                                                                          |
| **Team Size**         | Solo (per team lead decision 2026-08-08)                                                     |
| **Work Mode**         | Solo, full-day hard work, no shortcuts                                                       |

## Project Goal

Build **HirePilot** — a production-grade ATS where recruiters post jobs, candidates upload resumes, and deterministic AI parses the resume, scores the match against the job, and routes the candidate through a 7-stage Kanban pipeline from Applied → Hired.

**Demo success criterion:** a judge can sign up as a candidate → upload a resume → apply to a job → see AI match score; then switch to recruiter → see the application on Kanban → drag to "Shortlisted" → schedule an interview → generate an offer letter PDF — all in under 90 seconds on the live URL.

Full spec: `PRODUCT.md` · Build guide: `BLUEPRINT.md` (1484 lines, 92 KB) · Roadmap: `TODO.md`.

## Scope Decision (locked 2026-08-08)

User explicitly chose to **ship the full PS-2 scope as defined in `BLUEPRINT.md`**, including all bonus features (2FA TOTP, calendar ICS, public careers page, coding assessments, full analytics). Rationale: maximize judge-visible surface and feature completeness. Trade-off: high execution pressure on a solo 6-day timeline.

Risk acknowledged. Scope is **frozen** from this point — additions require an ADR.

## Current Version

`0.1.0-dev` — pre-build. Engineering workspace, product spec, and build blueprint complete. No application code yet.

## Current Architecture

**Single Next.js 15 application + monorepo for shared types/config.**

See `BLUEPRINT.md` §3 for full folder layout and `BLUEPRINT.md` §4 for locked tech stack.

**Architectural commitments (locked unless revisited via ADR):**

- Clean Architecture per app: `domain` ← `application` (services) ← `interfaces` (routes) ← `infrastructure`.
- Single Next.js 15 app — API routes serve as the backend (per PS-2's "Express / Next.js API" allowance).
- AI is **deterministic engineering**, not LLM API calls. See `BLUEPRINT.md` §8.
- Auth.js v5 with JWT in HTTP-only cookies; 5-role RBAC enforced server-side.
- Edge middleware at `src/middleware.ts` for route protection.
- Postgres + Redis on Railway; web on Vercel; storage on Cloudinary; email on Resend. **All free tiers, $0 total cost.**

> Architectural decisions: see `docs/adr/0001-monorepo-vs-single-app.md` and `BLUEPRINT.md` §1.

## Current Sprint

**Sprint 0 — Foundations (Day 0, in progress)**

### Completed

- [x] Engineering workspace documents (`AGENT.md`, `PROJECT_STATUS.md`, `TODO.md`, `README.md`, `CHANGELOG.md`)
- [x] Problem statement selection (PS-2 — AI-Powered Recruitment & ATS)
- [x] Product specification (`PRODUCT.md`, 17 KB)
- [x] Build blueprint (`BLUEPRINT.md`, 92 KB, 1484 lines, 18 sections)
- [x] Free-API inventory (all $0)
- [x] Monorepo skeleton (Next.js 15 + TypeScript strict + Tailwind v4 + shadcn/ui)
- [x] License (MIT)
- [x] First ADR (`0001-monorepo-vs-single-app.md`)
- [x] Comprehensive TODO.md with 80+ tasks across 7 days

### In Progress — Day 0 Foundations

- [ ] D0-01 pnpm workspace + Turbo + ESLint + Prettier + Husky
- [ ] D0-02 TypeScript strict + tsconfig base
- [ ] D0-03 Tailwind v4 + design tokens + globals.css
- [ ] D0-04 shadcn/ui init (5 primitives)
- [ ] D0-05 docker-compose for Postgres + Redis
- [ ] D0-06 Next.js 15 app skeleton
- [ ] D0-07 Prisma init + schema (25 models)
- [ ] D0-08 First migration
- [ ] D0-09 Auth.js v5 config (Google + Credentials)
- [ ] D0-10 Signup + Login pages
- [ ] D0-11 Edge middleware route protection
- [ ] D0-12 Landing page hero + navbar
- [ ] D0-13 App skeleton dashboard + role router
- [ ] D0-14 Initial git commit + GitHub repo

### Up Next — Day 1

- D1-01 Email verification flow
- D1-02 Forgot password + reset flow
- D1-03 Landing page complete (all 6 sections)
- D1-04 Dark mode toggle
- D1-05 Companies CRUD
- D1-06 Jobs CRUD
- D1-07 Public job board + detail page
- D1-08 Public careers page (bonus)

(See `TODO.md` for full daily breakdown through Day 6.)

## Completed Features

None application-side yet. Engineering workspace + spec + plan are the only deliverables.

## Backend Status

| Aspect          | Status                                      |
| --------------- | ------------------------------------------- |
| Runtime         | Not started (Next.js 15 API routes planned) |
| Framework       | Next.js 15 App Router                       |
| ORM             | Prisma 5 (planned)                          |
| DB              | PostgreSQL 16 (local Docker → Railway)      |
| Cache           | Redis 7 (local Docker → Railway)            |
| Migrations      | Planned                                     |
| Auth            | Auth.js v5 + 2FA TOTP (planned)             |
| Background jobs | graphile-worker (planned)                   |
| Services        | 12 service files planned                    |
| API routes      | 50+ routes planned                          |
| Tests           | Not started                                 |

## Frontend Status

| Aspect          | Status                              |
| --------------- | ----------------------------------- |
| Framework       | Not started — Next.js 15 App Router |
| Styling         | Tailwind v4 + shadcn/ui             |
| Charts          | Recharts                            |
| DnD             | @dnd-kit                            |
| Editor          | Monaco (lazy-loaded)                |
| Email templates | React Email (9 templates)           |
| Routes          | 30+ pages planned                   |
| Components      | 80+ components planned              |

## Database Status

| Aspect     | Status                                     |
| ---------- | ------------------------------------------ |
| Engine     | PostgreSQL 16 (local + Railway)            |
| Schema     | 25 models designed (see `BLUEPRINT.md` §5) |
| Migrations | None                                       |
| Seed data  | None                                       |
| Backups    | None                                       |

## Infrastructure Status

| Aspect        | Status                      |
| ------------- | --------------------------- |
| Docker        | Compose file planned        |
| CI            | Workflow planned            |
| Hosting (web) | Vercel (free Hobby)         |
| Hosting (db)  | Railway ($5/mo free credit) |
| Secrets       | `.env.example` planned      |
| Observability | Sentry planned as bonus     |

## Deployment Status

**Not deployable.** Target live by end of Day 5.

## Testing Status

| Aspect            | Status        |
| ----------------- | ------------- |
| Unit tests        | None          |
| Integration tests | None          |
| E2E tests         | None          |
| Coverage gate     | ≥ 80% planned |
| CI run            | N/A           |

## Documentation Status

| Doc                                        | Status                                                |
| ------------------------------------------ | ----------------------------------------------------- |
| `AGENT.md`                                 | Drafted, current                                      |
| `PRODUCT.md`                               | Drafted, current (PS-2 spec)                          |
| `BLUEPRINT.md`                             | **Drafted this session** (1484 lines, 18 sections)    |
| `PROJECT_STATUS.md`                        | Updated this session                                  |
| `TODO.md`                                  | **Updated this session** (80+ tasks, 7-day breakdown) |
| `README.md`                                | Current (HirePilot)                                   |
| `CHANGELOG.md`                             | Pending update                                        |
| `LICENSE`                                  | MIT (added)                                           |
| `docs/adr/0001-monorepo-vs-single-app.md`  | Drafted                                               |
| `docs/adr/0002-deterministic-ai-no-llm.md` | Pending (Day 6)                                       |
| `docs/adr/0003-sse-vs-websockets.md`       | Pending (Day 6)                                       |
| `docs/architecture/`                       | Pending (Day 6)                                       |
| `docs/api/openapi.yaml`                    | Pending (Day 6)                                       |
| `docs/er-diagram.png`                      | Pending (Day 6)                                       |

## Known Bugs

None — no code yet.

## Known Risks

| ID      | Risk                                                   | Probability   | Impact    | Mitigation                                                                  |
| ------- | ------------------------------------------------------ | ------------- | --------- | --------------------------------------------------------------------------- |
| **R-0** | **Scope explosion — full PS-2 surface in 6 days solo** | **Very High** | **Fatal** | Scope frozen at this point. Cut non-critical polish on overflow.            |
| R-1     | Postgres connection limits on Railway free tier        | Medium        | High      | Connection pooling; Prisma pool size 5                                      |
| R-2     | Resume parser mis-parses unusual PDF layouts           | Medium        | Medium    | Heuristic + manual edit fallback in profile form                            |
| R-3     | Kanban DnD broken on Safari                            | Low           | Medium    | Playwright cross-browser test                                               |
| R-4     | AI match score looks "too simple" to judges            | Medium        | High      | Show breakdown + explainability UI; emphasize engineering in README + ADR   |
| R-5     | Disqualification: AI-generated code looks              | Low           | Fatal     | Manual commit-by-commit review; small reviewable patches; per BLUEPRINT §18 |
| R-6     | Time overrun on polish → submit late                   | Medium        | Fatal     | Day 6 has 2h buffer; README drafted Day 4                                   |
| R-7     | Monaco editor slow load                                | Medium        | Medium    | Lazy load with React.lazy + Suspense                                        |
| R-8     | 2FA blocks demo if misconfigured                       | Low           | High      | Test with real authenticator app on Day 4                                   |
| R-9     | Resend / Cloudinary quota exceeded                     | Low           | Medium    | Console fallback; queue + retry                                             |
| R-10    | Vercel cold start slow on demo                         | Medium        | Low       | Warm with curl 1 min before demo                                            |

## Technical Debt

None yet. All debt will be logged here.

## Blockers

- **B-1**: GitHub repo must be created (public) before first commit push. Action by team lead.
- **B-2**: Free accounts must be created on Vercel, Railway, Cloudinary, Resend, Google Cloud Console. Action by team lead.

No code-side blockers.

## Next Milestone

**M-1: Runnable Demo (end of Day 2)** — Recruiter can post a job, candidate can apply with a parsed resume, application appears on Kanban, drag-drop stage transition triggers notification + email.

**M-2: Polished MVP (end of Day 5)** — All 5 roles fully functional, deployed to production URL, all bonus features (2FA, ICS, careers page, analytics) working.

**M-3: Submission (end of Day 6)** — README + diagrams + demo video + submit via Unstop before **14 Aug 16:00 IST**.

## Recommended Next Task (immediate)

**D0-01 — pnpm workspace + Turbo + ESLint + Prettier + Husky.** Open `TODO.md`, start with the first `[ ]` task under "Day 0 — Foundations". Work top-down.

## Hard Submission Constraints (must be true at submission time)

- [ ] GitHub repo is **public**
- [ ] `README.md` at root with **all** required sections (PS chosen, team, tech stack, run steps, features, live link, test creds, known bugs)
- [ ] **Live deployed URL** reachable (Vercel + Railway)
- [ ] No console errors / 404s / 500s on any primary flow
- [ ] Commit history shows incremental progress (no single-commit dumps, no `Co-authored-by: AI`)
- [ ] No evidence of AI-generated code (per `BLUEPRINT.md` §18)
- [ ] No pre-built templates / reused codebases beyond boilerplate
- [ ] Problem Statement 2 clearly mentioned in README
- [ ] Team member names + roles in README
- [ ] Test credentials in README (recruiter + candidate + admin)
- [ ] Demo video (3–5 min) linked in README
- [ ] Submission via Unstop before **14 Aug 16:00 IST**

## Handoff Note for Next Agent Session

If you are reading this in a fresh chat session, here is what the user needs you to know:

> **Project:** HirePilot — AI-Powered ATS, submitted to DevFusion 4.O (IIT Bombay hackathon), Round 3, Problem Statement 2.
> **Mode:** Solo, full-day hard work, 6-day sprint ending **14 Aug 2026 16:00 IST**.
> **Stack locked:** Next.js 15 + TypeScript strict + Tailwind v4 + shadcn/ui + Prisma 5 + PostgreSQL 16 + Redis 7 + Auth.js v5 + Cloudinary + Resend. See `BLUEPRINT.md` §4.
> **Zero paid APIs.** All services on free tiers.
> **AI is deterministic, not LLM.** See `BLUEPRINT.md` §8.
> **Scope frozen** at `BLUEPRINT.md` §3 + `PRODUCT.md` §3-13. Do not add features without an ADR.
> **Read first (in order):** `PROJECT_STATUS.md` (current state) → `TODO.md` (next task) → `BLUEPRINT.md` (how to build) → `PRODUCT.md` (what to build) → `AGENT.md` (how to behave).
> **Code discipline (anti-cheat):** See `BLUEPRINT.md` §18 and `AGENT.md` §20. One feature per commit. Real commit messages. No `Co-authored-by: AI`. Leave `// TODO:` comments — real code has them.
> **Your job:** Pick the topmost `[~]` task in `TODO.md`. If none, pick the topmost `[ ]` in the current Day. Read the file paths. Implement. Commit. Update `TODO.md` + `PROJECT_STATUS.md`.

---

## Last Updated

`2026-08-08` — `BLUEPRINT.md` promoted to canonical (1484 lines); comprehensive `TODO.md` written with 80+ tasks across 7 days; scope frozen at full PS-2 surface; project ready to start Day 0.
