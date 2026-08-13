# HirePilot

AI-powered recruitment and applicant tracking system. Submission for **DevFusion 4.0** Round 3 (IIT Bombay) - Problem Statement 2.

**Live:** https://hirepilot-aman.vercel.app/  
**Repo:** https://github.com/amanraj74/hirepilot  
**License:** MIT

Production-grade applicant tracking system. Recruiters post jobs, candidates upload resumes, the deterministic AI engine parses the resume, scores the match against the job, explains strengths and gaps in plain language, and routes the candidate through a 7-stage pipeline on a draggable Kanban board.

---

## Quick start

### Demo credentials (all passwords are `Demo@12345`)

| Role                       | Email                        | What you can see                                     |
| -------------------------- | ---------------------------- | ---------------------------------------------------- |
| Platform Admin             | `admin@hirepilot.dev`        | All 24 users, 5 companies, audit log, system metrics |
| Recruiter (HirePilot)      | `recruiter@hirepilot.dev`    | 7 jobs, full pipeline, dashboard with 4 charts       |
| Recruiter (Acme)           | `recruiter@acme.test`        | 6 jobs in Berlin                                     |
| Recruiter (Northwind)      | `recruiter@northwind.test`   | 6 jobs, React/TypeScript focus                       |
| Hiring Manager (HirePilot) | `hm@hirepilot.dev`           | Review queue, recent feedback                        |
| Hiring Manager (Acme)      | `hm@acme.test`               | Acme-specific review queue                           |
| Interviewer (HirePilot)    | `interviewer@hirepilot.dev`  | Assigned interviews, scorecards                      |
| Interviewer (Acme)         | `interviewer@acme.test`      | Acme upcoming interviews                             |
| Interviewer (Northwind)    | `interviewer@northwind.test` | Northwind panel rounds                               |
| Candidate (full-stack)     | `arjun.candidate@test.dev`   | 6 applications across stages, OFFER from Northwind   |
| Candidate (EM)             | `priya.candidate@test.dev`   | 5 applications, HIRED at HirePilot, OFFER at Acme    |
| Candidate (backend)        | `karthik.candidate@test.dev` | OFFER at Helios                                      |
| Candidate (frontend)       | `ananya.candidate@test.dev`  | HR_INTERVIEW at Northwind                            |
| Candidate (DevOps)         | `rohit.candidate@test.dev`   | HIRED at Acme                                        |
| Candidate (data)           | `meera.candidate@test.dev`   | OFFER at Northwind                                   |
| Candidate (designer)       | `vikram.candidate@test.dev`  | HIRED at HirePilot, OFFER at Helios                  |
| Candidate (QA)             | `kavita.candidate@test.dev`  | HR_INTERVIEW at Northwind                            |

---

## What it does

### Candidate flow

- Public job board with 9 filters (search, location, work mode, employment type, experience level, salary, status, skills, posted date)
- Job detail with AI match score (0-100%, 5-dim weighted: skill overlap 40% + experience 25% + education 15% + location 10% + salary 10%)
- One-click apply with cover letter
- Resume upload (PDF / DOCX / TXT, max 10MB) - deterministic parser extracts name, email, phone, GitHub, LinkedIn, skills, education, experience, years
- "My applications" with stage chips and timeline
- Take coding assessments (MCQ + Monaco-editor code/SQL/debug questions, countdown timer, tab-switch guard, auto-grading on submit)
- Receive and accept/decline offers (PDF)

### Recruiter flow

- Post jobs (full form, all fields, status OPEN/DRAFT/PAUSED/CLOSED)
- Dashboard with 4 stat cards (open jobs, new applicants, in-interview, hired) + 4 Recharts (hiring funnel, pipeline distribution, conversion, job-status) + 4 widgets (time-to-hire, interview success, candidate source, recruiter performance)
- Pipeline: draggable Kanban with 7 columns (APPLIED, RESUME_SCREENING, SHORTLISTED, TECHNICAL_INTERVIEW, HR_INTERVIEW, OFFER, HIRED) plus a REJECTED terminal
- State machine guards invalid moves, writes an audit-log entry on every transition, sends a candidate notification
- Real-time SSE: any recruiter in your company moving a candidate refreshes every open Kanban board instantly (no manual reload)
- Schedule interviews (candidate, interviewer, date/time, meeting link) - emits a valid `.ics` calendar attachment and emails it to the participant list
- Send a branded offer letter (PDF via `@react-pdf/renderer`) - candidate can accept or decline from `/applications`
- Manage your company profile (members, jobs, recent activity)

### Admin / hiring manager / interviewer

- Admin sees all 24 users, 5 companies, 21+ audit-log entries, top-action chips
- Hiring manager sees a candidate review queue with stage + interview history
- Interviewer sees upcoming + completed interviews, with a "submit scorecard" action that records the 6-dim rating (Technical, Communication, Problem Solving, Teamwork, Leadership, Overall) + recommendation (Strong Hire / Hire / No Hire / Strong No Hire)

### Security

- NextAuth v4 credentials + Google OAuth (env-gated)
- 5-role RBAC enforced at the route handler, the page, and the data layer
- Edge middleware with rate limiting on `/api/candidate/*` (5 req/min/IP) - the auth endpoints are excluded because polling them would lock users out
- HTTP-only Secure session cookies
- Zod-validated every request body
- Audit log on every privileged mutation (actor, action, before/after state, IP, user-agent)
- TOTP-based 2FA enrollment, QR enrollment, 10 backup codes, disable flow

### UI / UX

- Dark mode toggle (persisted in localStorage, zinc palette flips on `.dark` class, no FOUC on first paint)
- Responsive (mobile + tablet + desktop)
- Polished landing page (hero, features, how-it-works, testimonials, pricing, FAQ, CTA) with gradient hero, gradient orbs, trust stats
- Framer Motion page transitions
- Toast notifications via `sonner`
- Loading skeletons on every async surface
- Custom error boundaries on every route segment (no raw "Application error" overlay)

---

## AI / deterministic engineering

Per the hackathon's anti-AI-cheat rules, every "AI" feature is deterministic - no paid LLM APIs, no `v0` / Lovable / Bolt output.

- Resume parsing: `pdf-parse` (PDF) + `mammoth` (DOCX) to raw text, then regex-driven section detection, field extractors, and Fuse.js fuzzy match against a 1500-skill taxonomy
- Match scoring: weighted formula across 5 dimensions with explainability breakdown (skills matched / missing, years gap, education level, location/salary alignment)
- OCR fallback: when `pdf-parse` returns < 21 chars (scanned PDF), Tesseract.js runs. The OCR worker init is wrapped in try/catch so serverless runtimes that can't load Tesseract binaries degrade gracefully - the upload still succeeds, just without OCR text
- Offer letter: `@react-pdf/renderer` template, fully server-rendered
- All tests reproducible. No model output drift. Auditable.

---

## Tech stack

| Layer            | Choice                                          | License    |
| ---------------- | ----------------------------------------------- | ---------- |
| Framework        | Next.js 15.5 App Router + React 19              | MIT        |
| Language         | TypeScript 5.6 strict                           | Apache 2   |
| Styling          | Tailwind CSS 3.4 + shadcn/ui (Radix primitives) | MIT        |
| Database         | PostgreSQL 16 (Neon free tier, US East 2)       | PostgreSQL |
| ORM              | Prisma 5.22                                     | Apache 2   |
| Auth             | NextAuth v4 (Credentials + Google)              | MIT        |
| Password hashing | bcrypt (cost 12)                                | MIT        |
| Validation       | Zod                                             | MIT        |
| Forms            | React Hook Form + custom server actions         | MIT        |
| Charts           | Recharts                                        | MIT        |
| Drag-and-drop    | @dnd-kit                                        | MIT        |
| Code editor      | Monaco                                          | MIT        |
| Calendar         | ics                                             | MIT        |
| Fuzzy match      | Fuse.js                                         | Apache 2   |
| OCR              | Tesseract.js (optional fallback)                | Apache 2   |
| Email            | Resend (production) / console (dev)             | MIT        |
| PDF              | @react-pdf/renderer                             | MIT        |
| File storage     | Cloudinary (prod) / local FS (dev)              | MIT        |
| Monorepo         | pnpm 9 workspaces + Turborepo                   | MIT        |
| CI               | GitHub Actions                                  | -          |
| Hosting          | Vercel Hobby (free tier)                        | -          |

**Total monthly cost: $0.** Every service is on a free tier, no credit card required.

---

## Architecture

```
DevFusion/
  apps/
    web/                     Next.js 15 app (UI + API)
      prisma/                Schema, seed, generated client
      public/                Static assets
      src/
        app/
          (marketing)/       Public landing, jobs
          (auth)/            Login, signup, verify, reset
          (app)/             Authenticated app: dashboard, pipeline, etc.
          api/               Route Handlers (Node.js, serverless)
        components/          ui/ (shadcn), layout/, forms/, kanban/, ...
        lib/                 api/ client, hooks/, utils, validations
        server/              db, auth, services, ai, email, pdf, storage
        tests/               unit + e2e
  packages/
    shared/                  Zod schemas + TS types
  docs/
    ps-2.pdf                 Problem statement
    architecture/            C4 diagrams, data-flow, AI-pipeline
    api/                     OpenAPI 3.0 spec + Postman collection
    video/                   Demo video script
  scripts/
    gen-openapi.cjs          Regenerate the OpenAPI spec from Zod
  .github/workflows/         CI: lint + typecheck + test + build
  turbo.json                 Turborepo pipeline config
```

Detailed C4 architecture: `docs/architecture/`

---

## Run locally

### Prerequisites

- Node.js 20+ LTS
- pnpm 9 (`npm install -g pnpm`)
- Git
- A PostgreSQL database (Neon free tier recommended) - set `DATABASE_URL`

### Steps

```bash
# 1. Clone
git clone https://github.com/amanraj74/hirepilot.git
cd hirepilot

# 2. Install
pnpm install

# 3. Configure environment
cp apps/web/.env.example apps/web/.env
# Edit apps/web/.env - minimum required:
#   DATABASE_URL=<Neon or local Postgres pooled connection string>
#   DIRECT_URL=<same DB, non-pooled connection string>
#   AUTH_SECRET=$(openssl rand -base64 32)
#   NEXTAUTH_URL=http://localhost:3000
#   EMAIL_PROVIDER=console

# 4. Apply schema and seed demo data
pnpm --filter web db:push
pnpm --filter web db:seed

# 5. Start dev server
pnpm dev
```

Open http://localhost:3000.

### Verify

```bash
curl http://localhost:3000/api/health
# Expected: {"status":"ok","checks":{"db":"ok"}}
```

---

## Project structure (numbers)

| Component                                                            | Count                                                                        |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Database models (Prisma)                                             | 24                                                                           |
| API route handlers                                                   | 30                                                                           |
| (app) pages                                                          | 25                                                                           |
| (auth) pages                                                         | 6                                                                            |
| (marketing) pages                                                    | 4                                                                            |
| Service files                                                        | 6 (jobs, applications, interviews, offers, resume, assessments)              |
| AI pipeline modules                                                  | 5 (parser, section-detector, field-extractor, skill-extractor, match-scorer) |
| Skill taxonomy entries                                               | ~1,500                                                                       |
| Seeded users / companies / jobs / applications / interviews / offers | 18 / 5 / 31 / 38 / 17 / 6                                                    |
| Unit tests (Vitest)                                                  | 10 passing across 3 test files                                               |

---

## API surface

| Group          | Endpoints                                                                                                                                                                                                                                                                                                                                                        |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Auth           | `GET /api/auth/csrf`, `POST /api/auth/callback/credentials`, `GET /api/auth/session`, `POST /api/auth/signout`                                                                                                                                                                                                                                                   |
| Public jobs    | `GET /api/jobs`, `GET /api/jobs/:id`                                                                                                                                                                                                                                                                                                                             |
| Resume         | `POST /api/me/resume`, `GET /api/me/resume`                                                                                                                                                                                                                                                                                                                      |
| Recruiter      | `GET/POST /api/recruiter/jobs`, `GET/PATCH/DELETE /api/recruiter/jobs/:id`, `POST /api/recruiter/jobs/:id/duplicate`, `GET/POST /api/recruiter/applications`, `PATCH /api/recruiter/applications/:id/stage`, `GET/POST /api/recruiter/interviews`, `GET/POST /api/recruiter/assessments`, `POST /api/recruiter/assessments/assign`, `POST /api/recruiter/offers` |
| Candidate      | `GET /api/candidate/assessments`, `POST /api/candidate/assessments/:id/start`, `GET /api/candidate/assessments/attempts/:id`, `POST /api/candidate/assessments/attempts/:id/submit`, `POST /api/candidate/offers/:id/accept`, `POST /api/candidate/offers/:id/reject`                                                                                            |
| Interviewer    | `GET /api/interviewer/assignments`, `POST /api/interviewer/feedback/:interviewId`                                                                                                                                                                                                                                                                                |
| 2FA            | `POST /api/2fa/setup`, `POST /api/2fa/enable`, `POST /api/2fa/disable`, `POST /api/2fa/verify-otp`                                                                                                                                                                                                                                                               |
| Notifications  | `GET /api/notifications`, `GET /api/notifications/unread-count`, `POST /api/notifications/mark-all-read`                                                                                                                                                                                                                                                         |
| Pipeline (SSE) | `GET /api/recruiter/pipeline/stream` (per-company pub/sub, real-time Kanban updates)                                                                                                                                                                                                                                                                             |
| Health         | `GET /api/health`, `GET /api/health/db`                                                                                                                                                                                                                                                                                                                          |

All errors follow RFC 7807 `application/problem+json`. Full OpenAPI 3.0 spec at `docs/api/openapi.json`. Postman collection at `docs/api/postman-collection.json`.

---

## Testing

| Layer         | Tool       | Command                      |
| ------------- | ---------- | ---------------------------- |
| Unit          | Vitest     | `pnpm test`                  |
| Lint          | ESLint     | `pnpm lint`                  |
| Typecheck     | tsc        | `pnpm typecheck`             |
| Build         | Next.js    | `pnpm build`                 |
| E2E (planned) | Playwright | `pnpm --filter web test:e2e` |

CI runs on every push to `main` via `.github/workflows/ci.yml`.

---

## Deployment

Live: Vercel auto-deploys from `main`. Required env vars (Production):

```
DATABASE_URL=<Neon pooled connection string>
DIRECT_URL=<Neon non-pooled connection string>
AUTH_SECRET=<32+ char random base64>
NEXTAUTH_URL=https://hirepilot-aman.vercel.app
EMAIL_PROVIDER=console | resend
EMAIL_FROM=HirePilot <noreply@hirepilot.local>
CLOUDINARY_CLOUD_NAME=<from cloudinary dashboard>
CLOUDINARY_API_KEY=<from cloudinary dashboard>
CLOUDINARY_API_SECRET=<from cloudinary dashboard>
GOOGLE_CLIENT_ID=<from google cloud console>
GOOGLE_CLIENT_SECRET=<from google cloud console>
NEXT_PUBLIC_APP_URL=https://hirepilot-aman.vercel.app
```

Without Cloudinary env vars set, resume uploads still work but are stored on the serverless filesystem (Vercel allows writes to /tmp). For production, configure Cloudinary.

---

## Known limitations (honest list)

Out of scope for v1 (intentional):

- 2FA enforcement in the login flow is partial - the settings UI is fully working, but the credentials sign-in path does not yet route to /verify-otp after a successful password check. Roadmap item.
- Real-time updates are SSE-based (one-way) rather than WebSocket-based
- Plagiarism detection in coding assessments: not implemented
- Calendar sync (Google / Microsoft): not implemented
- Multi-language UI: English only
- PWA / offline mode: not implemented
- Mobile native: web-responsive only
- Stripe / Razorpay billing integration: not in scope of PS-2

Implementation notes:

- Resume parser is English-only. Non-English resumes may produce incomplete extraction.
- Skill taxonomy covers ~1,500 skills. Niche tools may be missed.
- Match scoring is deterministic across 5 dimensions; it does not model subjective "fit" beyond those dimensions.
- Free-tier quotas apply: Cloudinary 25 GB, Resend 3000 emails/mo.

---

## Team

| Role                     | Name     | GitHub                                     |
| ------------------------ | -------- | ------------------------------------------ |
| Solo full-stack engineer | Aman Raj | [@amanraj74](https://github.com/amanraj74) |

This is a solo submission for DevFusion 4.0 Round 3. Architecture, implementation, design decisions, testing, deployment, and documentation were produced by one engineer over the build window.

---

## License

MIT. See `LICENSE`.
