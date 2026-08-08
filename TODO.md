# TODO.md — HirePilot Engineering Roadmap

> Living backlog for **DevFusion 4.O — Round 3 — PS-2 (AI-Powered Recruitment & ATS)**.
> Tasks derived from **`BLUEPRINT.md` §16 (6-Day Plan, Hourly)**.
> Solo full-day sprint · **08 Aug 2026 → 14 Aug 2026 16:00 IST** (`T-0` to `T-6 days`).
> Every task is small, reviewable, and committed independently.

---

## How to use this file

1. **Start of every session:** read `PROJECT_STATUS.md` first. It tells you exactly where you are.
2. **Pick the topmost `[~]` task** (in-progress). If none, pick the topmost `[ ]` in the current Day.
3. **Open the file path** mentioned in the task. Read the context. Implement. Commit. Update this file.
4. **End of every session:** mark complete tasks `[x]`, add tomorrow's first task as `[~]`, update `PROJECT_STATUS.md`.

> `[ ]` pending · `[~]` in progress · `[x]` done · `[!]` blocked

---

## Priority Bands

| Band                  | Day            | What blocks if missed |
| --------------------- | -------------- | --------------------- |
| **Foundations**       | Day 0          | Every other day       |
| **Core Data**         | Day 1          | M-1 Runnable Demo     |
| **AI Pipeline**       | Day 2          | M-1 Runnable Demo     |
| **Interview + Offer** | Day 3          | M-2 Polished MVP      |
| **Dashboards + 2FA**  | Day 4          | M-2 Polished MVP      |
| **Deploy + Polish**   | Day 5          | Submission            |
| **Submission**        | Day 6          | Submission            |
| **Future**            | Post-hackathon | Nothing               |

---

## How each task is formatted

```
### D0-XX — Task name
- **Priority**: Critical
- **Dependencies**: D0-YY
- **Estimated time**: 30 min
- **Files**:
  - `apps/web/prisma/schema.prisma` (new)
  - `apps/web/src/server/db.ts` (new)
- **Acceptance criteria**:
  - [ ] verifiable thing 1
  - [ ] verifiable thing 2
- **Commit**: `chore: scaffold X`
- **Status**: [ ]
```

---

# Day 0 — Foundations Only (8h, T-0)

> **Goal:** monorepo up, DB schema live, auth working, landing page exists, first commit.
> **Commit target:** `feat: monorepo scaffold + db schema + auth` by end of Day 0.

## D0-01 — pnpm workspace + Turbo + ESLint + Prettier + Husky

- **Priority**: Critical
- **Dependencies**: none
- **Estimated time**: 30 min
- **Files**:
  - `package.json` (root)
  - `pnpm-workspace.yaml`
  - `turbo.json`
  - `.eslintrc.json`
  - `.prettierrc`
  - `.husky/pre-commit`
- **Acceptance criteria**:
  - `pnpm install` succeeds on a fresh clone
  - `pnpm -r build` is a no-op success (no apps yet)
  - `pnpm lint` runs ESLint
  - Pre-commit hook runs lint-staged on staged files
- **Commit**: `chore: scaffold pnpm workspace + turbo + lint`
- **Status**: [ ]

## D0-02 — TypeScript strict + tsconfig base

- **Priority**: Critical
- **Dependencies**: D0-01
- **Estimated time**: 15 min
- **Files**:
  - `packages/config/tsconfig/base.json`
  - `tsconfig.json` (root)
- **Acceptance criteria**:
  - `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`
  - All apps extend `packages/config/tsconfig/base.json`
  - `pnpm typecheck` runs tsc across all workspaces
- **Commit**: `chore: tsconfig strict mode across workspace`
- **Status**: [ ]

## D0-03 — Tailwind v4 + design tokens + globals.css

- **Priority**: Critical
- **Dependencies**: D0-02
- **Estimated time**: 20 min
- **Files**:
  - `apps/web/src/styles/globals.css`
  - `apps/web/src/styles/tokens.ts`
  - `apps/web/tailwind.config.ts`
  - `apps/web/postcss.config.mjs`
- **Acceptance criteria**:
  - Tailwind v4 imported in `globals.css` via `@import "tailwindcss"`
  - CSS custom properties for: brand colors, radius, font stack
  - Dark mode: `class` strategy (toggled via `darkModeToggle`)
  - `tokens.ts` exports `brand`, `radius`, `font` objects
- **Commit**: `chore: tailwind v4 + design tokens`
- **Status**: [ ]

## D0-04 — shadcn/ui init (5 primitives)

- **Priority**: Critical
- **Dependencies**: D0-03
- **Estimated time**: 20 min
- **Files**:
  - `apps/web/components.json`
  - `apps/web/src/components/ui/button.tsx`
  - `apps/web/src/components/ui/card.tsx`
  - `apps/web/src/components/ui/input.tsx`
  - `apps/web/src/components/ui/label.tsx`
  - `apps/web/src/components/ui/skeleton.tsx`
- **Acceptance criteria**:
  - `pnpm dlx shadcn@latest init` succeeds
  - 5 primitives added
  - `button.tsx` has `default`, `destructive`, `outline`, `ghost`, `link` variants
  - `card.tsx` has `Card`, `CardHeader`, `CardTitle`, `CardContent`, `CardFooter`
- **Commit**: `chore: shadcn/ui init + 5 primitives`
- **Status**: [ ]

## D0-05 — docker-compose for Postgres + Redis

- **Priority**: Critical
- **Dependencies**: D0-01
- **Estimated time**: 15 min
- **Files**:
  - `infra/docker/docker-compose.yml`
  - `infra/docker/.env.example`
- **Acceptance criteria**:
  - `docker compose -f infra/docker/docker-compose.yml up -d` boots Postgres 16 + Redis 7
  - Health checks pass (`pg_isready`, `redis-cli ping`)
  - Volumes persist data between runs
  - Ports: 5432 (Postgres), 6379 (Redis)
- **Commit**: `chore: docker-compose for postgres + redis`
- **Status**: [ ]

## D0-06 — Next.js 15 app skeleton

- **Priority**: Critical
- **Dependencies**: D0-04
- **Estimated time**: 30 min
- **Files**:
  - `apps/web/package.json`
  - `apps/web/next.config.mjs`
  - `apps/web/src/app/layout.tsx`
  - `apps/web/src/app/page.tsx` (placeholder)
  - `apps/web/src/app/error.tsx`
  - `apps/web/src/app/not-found.tsx`
  - `apps/web/.env.example`
- **Acceptance criteria**:
  - `pnpm --filter web dev` boots on `:3000`
  - Root layout wraps children with theme provider + toaster
  - `error.tsx` is a global error boundary
  - `not-found.tsx` is a 404 page
  - `.env.example` lists all required vars (no real values)
- **Commit**: `chore: next.js 15 app skeleton`
- **Status**: [ ]

## D0-07 — Prisma init + schema (all 25 models)

- **Priority**: Critical
- **Dependencies**: D0-06, D0-05
- **Estimated time**: 2h
- **Files**:
  - `apps/web/prisma/schema.prisma`
  - `apps/web/src/server/db.ts`
- **Acceptance criteria**:
  - All 25 models defined per `BLUEPRINT.md` §5
  - Enums: `Role`, `UserStatus`, `WorkMode`, `EmploymentType`, `ExperienceLevel`, `JobStatus`, `ApplicationStage`, `InterviewType`, `InterviewPlatform`, `InterviewStatus`, `AssessmentType`, `AssessmentStatus`, `AssessmentAttemptStatus`, `AssessmentQuestionType`, `OfferLetterStatus`, `NotificationType`
  - Composite indexes as listed in `BLUEPRINT.md` §5
  - All FKs use `cuid()` IDs
  - Money fields as integer cents + currency
  - `db.ts` exports PrismaClient singleton with dev hot-reload guard
- **Commit**: `feat: prisma schema with 25 models`
- **Status**: [ ]

## D0-08 — First migration

- **Priority**: Critical
- **Dependencies**: D0-07
- **Estimated time**: 15 min
- **Files**:
  - `apps/web/prisma/migrations/20260808000000_init/migration.sql` (generated)
- **Acceptance criteria**:
  - `pnpm --filter web db:migrate` succeeds
  - Migration generates all 25 tables in `hirepilot` database
  - `psql` connection works from local
- **Commit**: `feat: initial prisma migration`
- **Status**: [ ]

## D0-09 — Auth.js v5 config (Google + Credentials)

- **Priority**: Critical
- **Dependencies**: D0-08
- **Estimated time**: 1h
- **Files**:
  - `apps/web/src/server/auth/config.ts`
  - `apps/web/src/server/auth/session.ts`
  - `apps/web/src/server/auth/rbac.ts`
  - `apps/web/src/types/next-auth.d.ts`
  - `apps/web/src/app/api/auth/[...nextauth]/route.ts`
- **Acceptance criteria**:
  - Google OAuth provider configured (reads `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`)
  - Credentials provider with bcrypt password verification
  - JWT strategy; session in HTTP-only `Secure` cookie
  - `requireRole([...])` helper exported
  - `Session` type augmented with `role`, `id`, `companyId`, `twoFactorEnabled`
  - `auth()` helper available in Route Handlers
- **Commit**: `feat: auth.js v5 with google + credentials`
- **Status**: [ ]

## D0-10 — Signup + Login pages

- **Priority**: Critical
- **Dependencies**: D0-09
- **Estimated time**: 1h
- **Files**:
  - `apps/web/src/app/(auth)/layout.tsx`
  - `apps/web/src/app/(auth)/signup/page.tsx`
  - `apps/web/src/app/(auth)/login/page.tsx`
  - `apps/web/src/app/(auth)/signup/actions.ts`
  - `apps/web/src/app/(auth)/login/actions.ts`
  - `apps/web/src/lib/validations/auth.ts`
- **Acceptance criteria**:
  - Signup form: name, email, password, role select (Candidate/Recruiter)
  - Login form: email, password
  - Client-side + server-side validation via Zod
  - On signup: create User, hash password, send verification email (console in dev)
  - On login: verify credentials, create session, redirect to `/dashboard`
  - Error toasts on failure
  - Sign out button in user menu
- **Commit**: `feat: signup + login pages with validation`
- **Status**: [ ]

## D0-11 — Edge middleware route protection

- **Priority**: Critical
- **Dependencies**: D0-09
- **Estimated time**: 20 min
- **Files**:
  - `apps/web/src/middleware.ts`
- **Acceptance criteria**:
  - `next-auth/middleware` default export
  - Matcher covers: `/(app)/:path*`, `/api/recruiter/:path*`, `/api/admin/:path*`, `/api/hiring-manager/:path*`, `/api/interviewer/:path*`, `/api/me/:path*`
  - Unauthenticated requests to `/api/*` → 401 JSON
  - Unauthenticated requests to `/(app)/*` → redirect to `/login`
- **Commit**: `feat: edge middleware route protection`
- **Status**: [ ]

## D0-12 — Landing page hero + navbar

- **Priority**: Critical
- **Dependencies**: D0-06
- **Estimated time**: 1h
- **Files**:
  - `apps/web/src/app/(marketing)/layout.tsx`
  - `apps/web/src/app/(marketing)/page.tsx`
  - `apps/web/src/components/layout/marketing-navbar.tsx`
  - `apps/web/src/components/layout/footer.tsx`
  - `apps/web/src/components/landing/hero.tsx`
- **Acceptance criteria**:
  - Hero: headline + sub + CTA buttons (Sign Up, Browse Jobs)
  - Navbar: logo + links (Features, Pricing, Careers, Login/Signup)
  - Footer: links + copyright
  - Responsive (mobile + desktop)
  - Dark mode safe
- **Commit**: `feat: landing page hero + navbar + footer`
- **Status**: [ ]

## D0-13 — App skeleton dashboard + role router

- **Priority**: Critical
- **Dependencies**: D0-11
- **Estimated time**: 30 min
- **Files**:
  - `apps/web/src/app/(app)/layout.tsx`
  - `apps/web/src/app/(app)/dashboard/page.tsx`
  - `apps/web/src/components/layout/app-shell.tsx`
- **Acceptance criteria**:
  - `/(app)/layout.tsx` wraps children in `app-shell` (sidebar + topbar)
  - `/(app)/dashboard/page.tsx` reads session role, redirects to the right role-specific dashboard
  - Placeholder: each role just shows "Welcome, {role}"
- **Commit**: `feat: app shell + role-aware dashboard router`
- **Status**: [ ]

## D0-14 — Initial git commit + GitHub repo

- **Priority**: Critical
- **Dependencies**: D0-13
- **Estimated time**: 15 min
- **Files**:
  - `.gitignore` (root)
- **Acceptance criteria**:
  - `git init` in repo root
  - `.gitignore` excludes `.env`, `node_modules`, `.next`, `dist`, `coverage`, `*.log`
  - First commit: `feat: monorepo scaffold + db schema + auth + landing`
  - Create **public** GitHub repo: `YOUR_USERNAME/hirepilot`
  - `git remote add origin <url>` + `git push -u origin main`
- **Commit**: `chore: initial commit + github repo`
- **Status**: [ ]

---

# Day 1 — Auth Complete + Core Data (8h, T-1 day)

> **Goal:** email verification + password reset work; companies + jobs CRUD live; public job board works.
> **Commit window:** 3 commits (email flows, landing complete, jobs CRUD).

## D1-01 — Email verification flow

- **Priority**: Critical
- **Dependencies**: D0-10
- **Estimated time**: 1h
- **Files**:
  - `apps/web/src/app/api/auth/verify-email/route.ts`
  - `apps/web/src/app/(auth)/verify-email/page.tsx`
  - `apps/web/src/server/email/transport.ts`
  - `apps/web/src/server/email/templates/email-verification.tsx`
  - `apps/web/src/server/email/send.ts`
- **Acceptance criteria**:
  - `POST /api/auth/verify-email?token=X` validates `VerificationToken` and sets `User.emailVerified = now`
  - Email template renders verification link with token
  - In dev: `EMAIL_PROVIDER=console` logs email to stdout
  - Verified users can access recruiter features
- **Commit**: `feat: email verification flow`
- **Status**: [ ]

## D1-02 — Forgot password + reset flow

- **Priority**: Critical
- **Dependencies**: D1-01
- **Estimated time**: 1h
- **Files**:
  - `apps/web/src/app/api/auth/forgot-password/route.ts`
  - `apps/web/src/app/api/auth/reset-password/route.ts`
  - `apps/web/src/app/(auth)/forgot-password/page.tsx`
  - `apps/web/src/app/(auth)/reset-password/page.tsx`
  - `apps/web/src/server/email/templates/password-reset.tsx`
- **Acceptance criteria**:
  - `POST /api/auth/forgot-password { email }` → 1h-expiry `VerificationToken`
  - Reset page reads `?token=X`, validates, accepts new password
  - Password hashed with bcrypt cost 12
  - Token deleted after use
- **Commit**: `feat: forgot + reset password flow`
- **Status**: [ ]

## D1-03 — Landing page: all 6 sections

- **Priority**: Critical
- **Dependencies**: D0-12
- **Estimated time**: 2h
- **Files**:
  - `apps/web/src/components/landing/features.tsx`
  - `apps/web/src/components/landing/testimonials.tsx`
  - `apps/web/src/components/landing/pricing.tsx`
  - `apps/web/src/components/landing/faq.tsx`
  - `apps/web/src/components/landing/contact-form.tsx`
  - `apps/web/src/app/(marketing)/pricing/page.tsx`
- **Acceptance criteria**:
  - Features: 6-card grid with icons (from `lucide-react`)
  - Testimonials: 3 cards with avatar + quote + name
  - Pricing: 3 tiers (Free, Pro, Enterprise)
  - FAQ: 6 accordion items
  - Contact form: name, email, message, submit (mailto: link for v1)
  - All sections dark-mode safe, responsive
- **Commit**: `feat: landing page complete (all 6 sections)`
- **Status**: [ ]

## D1-04 — Dark mode toggle

- **Priority**: High
- **Dependencies**: D0-03
- **Estimated time**: 20 min
- **Files**:
  - `apps/web/src/components/shared/dark-mode-toggle.tsx`
  - `apps/web/src/components/layout/topbar.tsx`
  - `apps/web/src/lib/hooks/use-theme.ts`
- **Acceptance criteria**:
  - Toggle in topbar, persists choice in localStorage
  - Respects `prefers-color-scheme` on first load
  - No flash on reload (theme applied via `suppressHydrationWarning` + inline script)
- **Commit**: `feat: dark mode toggle with localStorage persistence`
- **Status**: [ ]

## D1-05 — Companies CRUD (recruiter)

- **Priority**: Critical
- **Dependencies**: D0-14
- **Estimated time**: 1h
- **Files**:
  - `apps/web/src/server/services/companies.service.ts`
  - `apps/web/src/app/api/recruiter/companies/route.ts`
  - `apps/web/src/app/api/recruiter/companies/[companyId]/route.ts`
  - `apps/web/src/app/(app)/companies/page.tsx`
  - `apps/web/src/app/(app)/companies/new/page.tsx`
  - `apps/web/src/app/(app)/companies/[companyId]/page.tsx`
  - `apps/web/src/lib/validations/companies.ts`
- **Acceptance criteria**:
  - List user's companies (recruiter sees own; admin sees all)
  - Create / edit / view (soft delete only)
  - All fields: name, website, industry, size, description, logo, socials, locations
  - RBAC: only Recruiter/Admin can create companies
  - File upload for logo via Cloudinary (or local dev fallback)
- **Commit**: `feat: companies CRUD service + API + UI`
- **Status**: [ ]

## D1-06 — Jobs CRUD (recruiter)

- **Priority**: Critical
- **Dependencies**: D1-05
- **Estimated time**: 2h
- **Files**:
  - `apps/web/src/server/services/jobs.service.ts`
  - `apps/web/src/app/api/recruiter/jobs/route.ts`
  - `apps/web/src/app/api/recruiter/jobs/[jobId]/route.ts`
  - `apps/web/src/app/api/recruiter/jobs/[jobId]/duplicate/route.ts`
  - `apps/web/src/app/(app)/recruiter/jobs/page.tsx`
  - `apps/web/src/app/(app)/recruiter/jobs/new/page.tsx`
  - `apps/web/src/app/(app)/recruiter/jobs/[jobId]/page.tsx`
  - `apps/web/src/app/(app)/recruiter/jobs/[jobId]/edit/page.tsx`
  - `apps/web/src/lib/validations/jobs.ts`
- **Acceptance criteria**:
  - Full job creation form with all spec fields (title, dept, location, salary, skills, JD, etc.)
  - Edit / close / duplicate / soft-delete
  - Status: DRAFT / OPEN / CLOSED / FILLED
  - Rich text editor for description
  - Skill selector with typeahead from taxonomy
  - Salary range slider with currency
- **Commit**: `feat: jobs CRUD service + API + UI`
- **Status**: [ ]

## D1-07 — Public job board + detail page

- **Priority**: Critical
- **Dependencies**: D1-06
- **Estimated time**: 1h
- **Files**:
  - `apps/web/src/app/api/jobs/route.ts`
  - `apps/web/src/app/api/jobs/[jobId]/route.ts`
  - `apps/web/src/app/(marketing)/jobs/page.tsx`
  - `apps/web/src/app/(marketing)/jobs/[jobId]/page.tsx`
- **Acceptance criteria**:
  - Public list with all 9 filters: q, location, workMode, salary, skills, type, company, experience, deadline
  - Job detail page: full description + "Apply Now" CTA (redirects to login if not authenticated)
  - Pagination via `?page=1&limit=20`
  - PostgreSQL FTS on `(title, description)` via `to_tsvector` + `@@ to_tsquery`
- **Commit**: `feat: public job board + detail page with filters`
- **Status**: [ ]

## D1-08 — Public careers page (bonus)

- **Priority**: Medium
- **Dependencies**: D1-07
- **Estimated time**: 30 min
- **Files**:
  - `apps/web/src/app/(marketing)/careers/page.tsx`
  - `apps/web/src/app/(marketing)/careers/[jobId]/page.tsx`
  - `apps/web/src/app/api/careers/route.ts`
- **Acceptance criteria**:
  - `/careers` lists all open jobs grouped by company
  - `Apply Now` CTA
  - No authentication required
- **Commit**: `feat: public careers page (bonus)`
- **Status**: [ ]

---

# Day 2 — Resume AI + Application Pipeline (8h, T-2 days)

> **Goal:** resume upload → parse → match score; apply-to-job flow; Kanban with drag-drop.
> **Commit window:** 3 commits.

## D2-01 — Resume upload to Cloudinary

- **Priority**: Critical
- **Dependencies**: D0-14
- **Estimated time**: 1h
- **Files**:
  - `apps/web/src/server/storage/cloudinary.ts`
  - `apps/web/src/server/storage/local.ts`
  - `apps/web/src/app/api/upload/resume/route.ts`
  - `apps/web/src/components/resume/resume-uploader.tsx`
- **Acceptance criteria**:
  - File type validation: PDF, DOCX only (mimetype + magic bytes)
  - Max size: 10MB
  - Upload to Cloudinary via signed upload (or local FS in dev)
  - Returns `fileUrl`, `publicId`
- **Commit**: `feat: resume upload with cloudinary + validation`
- **Status**: [ ]

## D2-02 — Resume parser pipeline

- **Priority**: Critical
- **Dependencies**: D2-01
- **Estimated time**: 2h
- **Files**:
  - `apps/web/src/server/ai/resume-parser.ts`
  - `apps/web/src/server/ai/section-detector.ts`
  - `apps/web/src/server/ai/field-extractor.ts`
  - `apps/web/src/server/ai/skill-extractor.ts`
  - `apps/web/src/server/ai/experience-estimator.ts`
  - `apps/web/src/server/ai/education-parser.ts`
  - `apps/web/src/server/ai/data/skill-taxonomy.json`
  - `apps/web/tests/unit/ai/resume-parser.test.ts`
  - `apps/web/tests/fixtures/resume.pdf`
  - `apps/web/tests/fixtures/resume.docx`
- **Acceptance criteria**:
  - `parseResume(buffer, mime)` returns `ParsedResume`
  - `pdf-parse` for PDF, `mammoth` for DOCX
  - Section detection: regex-based (Education, Experience, Skills, Projects, Certifications)
  - Field extraction: email, phone, name, GitHub, LinkedIn via regex
  - Skill extraction: Fuse.js fuzzy match against 1500+ skill taxonomy
  - Experience estimator: date range parser → total years (float)
  - Education parser: degree level detection (PhD > Masters > Bachelors > Diploma)
  - ≥ 5 unit tests per extractor
  - Test with real `resume.pdf` + `resume.docx` fixtures
- **Commit**: `feat: resume parser pipeline (extract + match + test)`
- **Status**: [ ]

## D2-03 — Profile auto-populate from parsed resume

- **Priority**: Critical
- **Dependencies**: D2-02
- **Estimated time**: 1h
- **Files**:
  - `apps/web/src/app/api/me/resume/route.ts`
  - `apps/web/src/app/(app)/profile/resume/page.tsx`
  - `apps/web/src/components/resume/parsed-resume-card.tsx`
- **Acceptance criteria**:
  - `POST /api/me/resume` accepts the uploaded file URL, triggers parse, populates `CandidateProfile`
  - Profile completion % calculated
  - User can edit any auto-populated field
- **Commit**: `feat: profile auto-populate from parsed resume`
- **Status**: [ ]

## D2-04 — Match scorer + golden tests

- **Priority**: Critical
- **Dependencies**: D2-02
- **Estimated time**: 1h
- **Files**:
  - `apps/web/src/server/ai/match-scorer.ts`
  - `apps/web/src/app/api/recruiter/applications/[applicationId]/match/route.ts`
  - `apps/web/src/app/api/recruiter/jobs/[jobId]/match/route.ts`
  - `apps/web/tests/unit/ai/match-scorer.test.ts`
- **Acceptance criteria**:
  - `scoreMatch(parsed, job)` returns `MatchResult` with all 5 dimensions
  - Weighted formula: 0.40 skills + 0.25 experience + 0.15 education + 0.10 location + 0.10 salary
  - Strong / missing / weak skills computed
  - ≥ 5 golden tests
  - `POST /api/recruiter/applications/:id/match` recomputes and saves `ResumeAnalysis`
- **Commit**: `feat: match scorer with weighted dimensions + golden tests`
- **Status**: [ ]

## D2-05 — Match card UI

- **Priority**: Critical
- **Dependencies**: D2-04
- **Estimated time**: 30 min
- **Files**:
  - `apps/web/src/components/resume/match-card.tsx`
  - `apps/web/src/components/resume/match-badge.tsx`
- **Acceptance criteria**:
  - Match card exactly as PS-2 spec shows: ring + score + Strong/Missing + Recommendation
  - Match badge: green > 75, yellow > 50, red < 50
  - Mobile responsive
- **Commit**: `feat: match card UI (score + skills + recommendation)`
- **Status**: [ ]

## D2-06 — Apply to job flow

- **Priority**: Critical
- **Dependencies**: D2-03
- **Estimated time**: 1h
- **Files**:
  - `apps/web/src/app/api/jobs/[jobId]/apply/route.ts`
  - `apps/web/src/app/(app)/jobs/[jobId]/apply/page.tsx`
  - `apps/web/src/server/services/applications.service.ts`
  - `apps/web/src/server/email/templates/application-confirmation.tsx`
- **Acceptance criteria**:
  - Cover letter field + "use AI suggestion" button (template-based v1)
  - Confirmation page shown after apply
  - Application confirmation email sent (Resend or console)
  - Stage starts at `APPLIED`
  - One application per (candidate, job) enforced
- **Commit**: `feat: apply-to-job flow with confirmation email`
- **Status**: [ ]

## D2-07 — Application stage state machine

- **Priority**: Critical
- **Dependencies**: D2-06
- **Estimated time**: 1h
- **Files**:
  - `apps/web/src/app/api/recruiter/applications/[applicationId]/stage/route.ts`
  - `apps/web/src/app/api/recruiter/applications/route.ts`
  - `apps/web/src/app/api/me/applications/route.ts`
- **Acceptance criteria**:
  - PATCH stage transitions validated against allowed transitions
  - Each transition writes `ApplicationStageEvent` (audit)
  - `stageHistory` updated on `Application`
  - Returns updated application
- **Commit**: `feat: application stage state machine + audit`
- **Status**: [ ]

## D2-08 — Kanban board with @dnd-kit

- **Priority**: Critical
- **Dependencies**: D2-07
- **Estimated time**: 2h
- **Files**:
  - `apps/web/src/components/kanban/kanban-board.tsx`
  - `apps/web/src/components/kanban/kanban-column.tsx`
  - `apps/web/src/components/kanban/kanban-card.tsx`
  - `apps/web/src/components/kanban/kanban-overlay.tsx`
  - `apps/web/src/app/(app)/recruiter/pipeline/page.tsx`
  - `apps/web/src/app/(app)/recruiter/pipeline/[jobId]/page.tsx`
- **Acceptance criteria**:
  - 7 columns: Applied → Screening → Shortlisted → Tech Interview → HR Interview → Offer → Hired (+ Rejected)
  - Drag-drop between columns
  - Card shows: candidate name, avatar, match score, applied date
  - Optimistic UI: card moves immediately, server confirms
  - On drop: PATCH stage API called
  - Touch + keyboard accessible
- **Commit**: `feat: kanban board with drag-and-drop`
- **Status**: [ ]

## D2-09 — Stage transition notifications (SSE + email)

- **Priority**: Critical
- **Dependencies**: D2-08
- **Estimated time**: 1h
- **Files**:
  - `apps/web/src/server/sse/emitter.ts`
  - `apps/web/src/app/api/sse/route.ts`
  - `apps/web/src/lib/hooks/use-sse.ts`
  - `apps/web/src/components/layout/notification-bell.tsx`
  - `apps/web/src/server/services/notifications.service.ts`
  - `apps/web/src/server/email/templates/shortlisted.tsx`
- **Acceptance criteria**:
  - SSE endpoint: `GET /api/sse` with 30s keep-alive
  - When a stage changes, Notification row created + SSE event sent to candidate
  - Notification bell shows unread count
  - Email sent on: SHORTLISTED, REJECTED
  - Candidate bell + email recipient wired
- **Commit**: `feat: stage transition notifications (sse + email)`
- **Status**: [ ]

## D2-10 — Candidate "My Applications" view

- **Priority**: High
- **Dependencies**: D2-09
- **Estimated time**: 30 min
- **Files**:
  - `apps/web/src/app/(app)/applications/page.tsx`
  - `apps/web/src/app/(app)/applications/[applicationId]/page.tsx`
- **Acceptance criteria**:
  - List applications with stage badge + timestamps
  - Timeline view of stage history
  - Empty state for new users
- **Commit**: `feat: candidate my-applications view + timeline`
- **Status**: [ ]

## D2-11 — Global search (Postgres FTS)

- **Priority**: High
- **Dependencies**: D1-07
- **Estimated time**: 1h
- **Files**:
  - `apps/web/src/server/services/search.service.ts`
  - `apps/web/src/app/api/search/route.ts`
  - `apps/web/src/components/layout/command-palette.tsx`
- **Acceptance criteria**:
  - `GET /api/search?q=` searches: Jobs, Candidates (recruiter-only), Companies, Interviews
  - ⌘K command palette triggers search
  - Result types: Highlighted title + subtitle + link
- **Commit**: `feat: global search via postgres fts + command palette`
- **Status**: [ ]

---

# Day 3 — Interview + Assessment + Offer (8h, T-3 days)

> **Goal:** interview scheduling, feedback scorecard, coding assessment, offer letter PDF.
> **Commit window:** 4 commits.

## D3-01 — Interview scheduler

- **Priority**: Critical
- **Dependencies**: D2-07
- **Estimated time**: 1.5h
- **Files**:
  - `apps/web/src/server/services/interviews.service.ts`
  - `apps/web/src/server/calendar/ics.ts`
  - `apps/web/src/app/api/recruiter/interviews/route.ts`
  - `apps/web/src/app/api/recruiter/interviews/[interviewId]/route.ts`
  - `apps/web/src/app/api/recruiter/interviews/[interviewId]/invite/route.ts`
  - `apps/web/src/app/(app)/recruiter/interviews/page.tsx`
  - `apps/web/src/app/(app)/recruiter/interviews/schedule/page.tsx`
  - `apps/web/src/app/(app)/recruiter/interviews/[interviewId]/page.tsx`
  - `apps/web/src/components/interview/schedule-form.tsx`
  - `apps/web/src/components/interview/interview-card.tsx`
- **Acceptance criteria**:
  - Schedule form: candidate (auto from application), interviewer, date/time, duration, platform
  - Meeting link auto-generated (Google Meet placeholder URL pattern)
  - ICS file generated via `ics` package
  - On "Send invite": email candidate with ICS attachment + dashboard notification
  - Recruiter can edit / cancel
- **Commit**: `feat: interview scheduler with ics invite`
- **Status**: [ ]

## D3-02 — Interview feedback scorecard

- **Priority**: Critical
- **Dependencies**: D3-01
- **Estimated time**: 1h
- **Files**:
  - `apps/web/src/server/services/interviews.service.ts` (add feedback)
  - `apps/web/src/app/api/interviewer/feedback/[interviewId]/route.ts`
  - `apps/web/src/app/api/interviewer/assignments/route.ts`
  - `apps/web/src/app/(app)/interviewer/assignments/page.tsx`
  - `apps/web/src/app/(app)/interviewer/feedback/[interviewId]/page.tsx`
  - `apps/web/src/components/interview/feedback-scorecard.tsx`
- **Acceptance criteria**:
  - 6 dimensions × 1–5 star rating: Technical, Communication, Problem Solving, Teamwork, Leadership, Overall
  - Comments textarea
  - Recommendation: Strong Hire / Hire / No Hire / Strong No Hire
  - Submits to `Feedback` table
- **Commit**: `feat: interview feedback scorecard (6 dimensions)`
- **Status**: [ ]

## D3-03 — Hiring manager shortlist + decision view

- **Priority**: High
- **Dependencies**: D3-02
- **Estimated time**: 1h
- **Files**:
  - `apps/web/src/app/api/hiring-manager/shortlist/route.ts`
  - `apps/web/src/app/api/hiring-manager/applications/[applicationId]/approve/route.ts`
  - `apps/web/src/app/(app)/hiring-manager/shortlist/page.tsx`
  - `apps/web/src/app/(app)/hiring-manager/decisions/page.tsx`
  - `apps/web/src/components/interview/feedback-comparison.tsx`
- **Acceptance criteria**:
  - Side-by-side comparison of multiple interviewer feedback
  - Average per dimension
  - Hire manager Approve / Reject with notes
- **Commit**: `feat: hiring manager shortlist + decision view`
- **Status**: [ ]

## D3-04 — Coding assessment builder

- **Priority**: Critical
- **Dependencies**: D0-14
- **Estimated time**: 2h
- **Files**:
  - `apps/web/src/server/services/assessments.service.ts`
  - `apps/web/src/server/ai/data/question-bank.json`
  - `apps/web/src/server/ai/interview-questions.ts`
  - `apps/web/src/app/api/recruiter/assessments/route.ts`
  - `apps/web/src/app/api/recruiter/assessments/[assessmentId]/route.ts`
  - `apps/web/src/app/api/recruiter/assessments/[assessmentId]/questions/route.ts`
  - `apps/web/src/app/api/recruiter/assessments/[assessmentId]/assign/route.ts`
  - `apps/web/src/app/(app)/recruiter/assessments/page.tsx`
  - `apps/web/src/app/(app)/recruiter/assessments/new/page.tsx`
  - `apps/web/src/app/(app)/recruiter/assessments/[assessmentId]/page.tsx`
- **Acceptance criteria**:
  - Question types: MCQ, CODE, SQL, DEBUG
  - Add questions: prompt, options (MCQ), solution, points, language
  - Time limit, passing score
  - Status: DRAFT / ACTIVE / ARCHIVED
  - "Assign to candidates" sends email with assessment link
- **Commit**: `feat: coding assessment builder`
- **Status**: [ ]

## D3-05 — Assessment take environment

- **Priority**: Critical
- **Dependencies**: D3-04
- **Estimated time**: 2h
- **Files**:
  - `apps/web/src/app/api/assessments/[assessmentId]/route.ts`
  - `apps/web/src/app/api/assessments/[assessmentId]/start/route.ts`
  - `apps/web/src/app/api/assessments/[assessmentId]/submit/route.ts`
  - `apps/web/src/app/api/assessments/[assessmentId]/result/route.ts`
  - `apps/web/src/app/(app)/assessments/page.tsx`
  - `apps/web/src/app/(app)/assessments/[assessmentId]/page.tsx`
  - `apps/web/src/app/(app)/assessments/[assessmentId]/take/page.tsx`
  - `apps/web/src/app/(app)/assessments/[assessmentId]/result/page.tsx`
  - `apps/web/src/components/assessment/assessment-shell.tsx`
  - `apps/web/src/components/assessment/countdown-timer.tsx`
  - `apps/web/src/components/assessment/tab-switch-guard.tsx`
  - `apps/web/src/components/assessment/mcq-question.tsx`
  - `apps/web/src/components/assessment/code-editor.tsx`
  - `apps/web/src/components/assessment/sql-editor.tsx`
  - `apps/web/src/components/assessment/debug-task.tsx`
  - `apps/web/src/components/assessment/question-navigator.tsx`
  - `apps/web/src/components/assessment/submission-guard.tsx`
- **Acceptance criteria**:
  - Full-screen take environment
  - Countdown timer (turns red <5min)
  - Tab-switch guard: warn at 1, auto-submit at 3
  - Monaco editor lazy-loaded for code/SQL/debug
  - Question navigator sidebar with answered/flagged status
  - One-attempt rule enforced
  - Auto-submit on timer expiry
  - Result page shows score + per-question breakdown
- **Commit**: `feat: assessment take environment (timer + tab guard + monaco)`
- **Status**: [ ]

## D3-06 — Offer letter PDF generator

- **Priority**: Critical
- **Dependencies**: D2-07
- **Estimated time**: 1h
- **Files**:
  - `apps/web/src/server/pdf/offer-letter.tsx`
  - `apps/web/src/server/pdf/render.ts`
  - `apps/web/src/server/services/offers.service.ts`
  - `apps/web/src/app/api/recruiter/offers/route.ts`
  - `apps/web/src/app/api/recruiter/offers/[offerId]/route.ts`
  - `apps/web/src/app/api/recruiter/offers/[offerId]/pdf/route.ts`
  - `apps/web/src/app/(app)/recruiter/offers/page.tsx`
  - `apps/web/src/app/(app)/recruiter/offers/generate/page.tsx`
  - `apps/web/src/components/offer/generate-form.tsx`
- **Acceptance criteria**:
  - Generate form: candidate, role, salary, joining date, location, benefits
  - PDF rendered via `@react-pdf/renderer`
  - PDF uploaded to Cloudinary
  - `pdfUrl` stored on `OfferLetter`
  - Recruiter can preview / download
- **Commit**: `feat: offer letter PDF generator`
- **Status**: [ ]

## D3-07 — Offer accept/reject flow (candidate)

- **Priority**: Critical
- **Dependencies**: D3-06
- **Estimated time**: 30 min
- **Files**:
  - `apps/web/src/app/api/offers/[offerId]/accept/route.ts`
  - `apps/web/src/app/api/offers/[offerId]/reject/route.ts`
  - `apps/web/src/app/(app)/offers/page.tsx`
  - `apps/web/src/app/(app)/offers/[offerId]/page.tsx`
  - `apps/web/src/components/offer/offer-letter-preview.tsx`
  - `apps/web/src/components/offer/offer-card.tsx`
- **Acceptance criteria**:
  - Candidate sees offers with status badges
  - Accept / Reject buttons with confirmation
  - On accept: application stage → HIRED, recruiter notified
  - On reject: application stage → REJECTED, recruiter notified
- **Commit**: `feat: offer accept/reject flow`
- **Status**: [ ]

## D3-08 — Send offer email + remaining email templates

- **Priority**: High
- **Dependencies**: D3-07
- **Estimated time**: 1h
- **Files**:
  - `apps/web/src/server/email/templates/offer-letter.tsx`
  - `apps/web/src/server/email/templates/rejection.tsx`
  - `apps/web/src/server/email/templates/interview-invite.tsx`
  - `apps/web/src/server/email/templates/assessment-link.tsx`
  - `apps/web/src/server/email/templates/joining-instructions.tsx`
  - `apps/web/src/server/workers/tasks.ts`
- **Acceptance criteria**:
  - All 9 templates created
  - All transactional sends go through `graphile-worker` queue
  - Retry on failure (3 attempts, exponential backoff)
- **Commit**: `feat: 9 email templates + background queue`
- **Status**: [ ]

---

# Day 4 — Dashboards + 2FA + Notifications (8h, T-4 days)

> **Goal:** all 5 roles have working dashboards, 2FA setup flow, real-time notification polish.
> **Commit window:** 3 commits.

## D4-01 — 2FA setup flow (TOTP)

- **Priority**: High
- **Dependencies**: D0-09
- **Estimated time**: 1.5h
- **Files**:
  - `apps/web/src/server/2fa/totp.ts`
  - `apps/web/src/app/api/2fa/setup/route.ts`
  - `apps/web/src/app/api/2fa/verify/route.ts`
  - `apps/web/src/app/api/2fa/disable/route.ts`
  - `apps/web/src/app/(app)/settings/security/page.tsx`
  - `apps/web/src/app/(auth)/verify-otp/page.tsx`
  - `apps/web/src/server/email/templates/2fa-otp.tsx`
- **Acceptance criteria**:
  - `POST /api/2fa/setup` → secret + QR data URI
  - QR code rendered via `qrcode.toDataURL`
  - User scans with Google Authenticator, enters 6-digit token
  - `POST /api/2fa/verify { token }` enables 2FA
  - On next login: after correct password, check `twoFactorEnabled` → redirect to `/verify-otp`
  - Disable requires password re-entry
- **Commit**: `feat: 2FA TOTP setup + login flow`
- **Status**: [ ]

## D4-02 — Device session tracking

- **Priority**: High
- **Dependencies**: D0-09
- **Estimated time**: 1h
- **Files**:
  - `apps/web/src/server/services/sessions.service.ts`
  - `apps/web/src/app/api/sessions/route.ts`
  - `apps/web/src/app/api/sessions/[sessionId]/route.ts`
- **Acceptance criteria**:
  - On login: parse `user-agent` with `ua-parser-js` → create `DeviceSession`
  - `GET /api/sessions` lists user's active sessions
  - `DELETE /api/sessions/:id` revokes specific session
- **Commit**: `feat: device session tracking + revoke`
- **Status**: [ ]

## D4-03 — SSE emitter + client wiring

- **Priority**: High
- **Dependencies**: D2-09
- **Estimated time**: 1h
- **Files**:
  - `apps/web/src/server/sse/emitter.ts`
  - `apps/web/src/app/api/sse/route.ts`
  - `apps/web/src/lib/hooks/use-sse.ts`
  - `apps/web/src/components/layout/notification-bell.tsx`
  - `apps/web/src/app/(app)/notifications/page.tsx`
- **Acceptance criteria**:
  - SSE endpoint with 30s keep-alive
  - `useSSE()` hook connects + parses events
  - Notification bell shows unread count (live)
  - Mark as read on click
  - Notifications page: paginated history
- **Commit**: `feat: SSE notifications + bell + history page`
- **Status**: [ ]

## D4-04 — Recruiter dashboard (8 widgets + 4 charts)

- **Priority**: Critical
- **Dependencies**: D2-08
- **Estimated time**: 2h
- **Files**:
  - `apps/web/src/server/services/analytics.service.ts`
  - `apps/web/src/app/api/recruiter/dashboard/route.ts`
  - `apps/web/src/app/api/recruiter/analytics/funnel/route.ts`
  - `apps/web/src/app/api/recruiter/analytics/time-to-hire/route.ts`
  - `apps/web/src/app/api/recruiter/analytics/source-analysis/route.ts`
  - `apps/web/src/app/(app)/recruiter/dashboard/page.tsx`
  - `apps/web/src/components/charts/chart-card.tsx`
  - `apps/web/src/components/charts/hiring-funnel-chart.tsx`
  - `apps/web/src/components/charts/monthly-hiring-chart.tsx`
  - `apps/web/src/components/charts/conversion-rate-chart.tsx`
  - `apps/web/src/components/charts/source-analysis-chart.tsx`
  - `apps/web/src/components/charts/stat-card.tsx`
- **Acceptance criteria**:
  - 8 stat widgets: Total Jobs, Active Candidates, Today's Interviews, Pending Reviews, Offer Acceptance Rate, Hiring Funnel, Candidate Conversion Rate, Monthly Hiring Chart
  - 4 Recharts: hiring funnel, monthly hiring, conversion rate, source analysis
  - Recent activity feed
  - All aggregations done in Prisma, not in-memory
- **Commit**: `feat: recruiter dashboard (8 widgets + 4 charts)`
- **Status**: [ ]

## D4-05 — Candidate dashboard

- **Priority**: High
- **Dependencies**: D2-10
- **Estimated time**: 1h
- **Files**:
  - `apps/web/src/app/(app)/dashboard/page.tsx` (candidate branch)
  - `apps/web/src/components/charts/stat-card.tsx`
- **Acceptance criteria**:
  - Profile completion ring
  - Applied jobs list
  - Upcoming interviews with countdown
  - Coding assessments pending + completed
  - Offer letters
  - Notifications
- **Commit**: `feat: candidate dashboard`
- **Status**: [ ]

## D4-06 — Admin dashboard

- **Priority**: High
- **Dependencies**: D0-06
- **Estimated time**: 1h
- **Files**:
  - `apps/web/src/app/api/admin/users/route.ts`
  - `apps/web/src/app/api/admin/users/[userId]/route.ts`
  - `apps/web/src/app/api/admin/users/[userId]/suspend/route.ts`
  - `apps/web/src/app/api/admin/companies/route.ts`
  - `apps/web/src/app/api/admin/companies/[companyId]/route.ts`
  - `apps/web/src/app/api/admin/audit-logs/route.ts`
  - `apps/web/src/app/api/admin/settings/route.ts`
  - `apps/web/src/app/api/admin/reports/route.ts`
  - `apps/web/src/app/(app)/admin/dashboard/page.tsx`
  - `apps/web/src/app/(app)/admin/users/page.tsx`
  - `apps/web/src/app/(app)/admin/users/[userId]/page.tsx`
  - `apps/web/src/app/(app)/admin/companies/page.tsx`
  - `apps/web/src/app/(app)/admin/companies/[companyId]/page.tsx`
  - `apps/web/src/app/(app)/admin/audit-logs/page.tsx`
  - `apps/web/src/app/(app)/admin/platform-settings/page.tsx`
  - `apps/web/src/app/(app)/admin/reports/page.tsx`
- **Acceptance criteria**:
  - User list with role + status + actions
  - Suspend / change role
  - Company CRUD
  - Audit log: paginated with filters (entity, userId, action, date)
  - Platform settings: feature flags
  - Reports: aggregated platform stats
- **Commit**: `feat: admin dashboard with users + audit + companies`
- **Status**: [ ]

## D4-07 — Hiring manager + Interviewer dashboards

- **Priority**: High
- **Dependencies**: D3-03, D3-02
- **Estimated time**: 1h
- **Files**:
  - `apps/web/src/app/(app)/hiring-manager/dashboard/page.tsx`
  - `apps/web/src/app/(app)/interviewer/dashboard/page.tsx`
- **Acceptance criteria**:
  - Hiring manager: shortlist overview, pending decisions
  - Interviewer: assigned interviews, recent submissions
- **Commit**: `feat: hiring manager + interviewer dashboards`
- **Status**: [ ]

## D4-08 — Feedback summarizer (TF-IDF)

- **Priority**: Medium
- **Dependencies**: D3-02
- **Estimated time**: 1h
- **Files**:
  - `apps/web/src/server/ai/feedback-summarizer.ts`
  - `apps/web/tests/unit/ai/feedback-summarizer.test.ts`
- **Acceptance criteria**:
  - `summarizeFeedback(feedbacks)` returns themes + average per dimension + recommendation
  - Uses `natural.TfIdf`
  - Recommendation: STRONG_HIRE / HIRE / NO_HIRE
- **Commit**: `feat: feedback summarizer (TF-IDF)`
- **Status**: [ ]

---

# Day 5 — Deploy + Polish (8h, T-5 days)

> **Goal:** live on Vercel + Railway, all flows working on production, dark mode + skeletons + ⌘K polished.
> **Commit window:** 3 commits.

## D5-01 — Deploy Postgres + Redis to Railway

- **Priority**: Critical
- **Dependencies**: D0-05
- **Estimated time**: 45 min
- **Files**:
  - `infra/railway/postgres.json`
  - `infra/railway/redis.json`
- **Acceptance criteria**:
  - Postgres deployed, `DATABASE_URL` copied
  - Redis deployed, `REDIS_URL` copied
  - Migration run against Railway DB
- **Commit**: `chore: railway postgres + redis deployments`
- **Status**: [ ]

## D5-02 — Deploy web to Vercel

- **Priority**: Critical
- **Dependencies**: D5-01
- **Estimated time**: 45 min
- **Files**:
  - `vercel.json`
  - `apps/web/.env.production.example`
- **Acceptance criteria**:
  - Vercel project created, root = `apps/web`
  - All env vars from `.env.example` set in Vercel
  - `vercel.json` configures build + framework
  - Production URL accessible, `/api/health` returns ok
- **Commit**: `chore: vercel deployment config`
- **Status**: [ ]

## D5-03 — Seed production DB

- **Priority**: Critical
- **Dependencies**: D5-02
- **Estimated time**: 30 min
- **Files**:
  - `apps/web/prisma/seed.ts`
- **Acceptance criteria**:
  - 3 companies, 5 jobs, 15 applications across 8 stages
  - 10 candidates with parsed resume data
  - 5 scheduled interviews
  - 2 assessments (MCQ + CODE), 5 attempts
  - 2 offer letters (1 pending, 1 accepted)
  - 50 notifications, 100 audit log entries
  - Seed prints all credentials to stdout
- **Commit**: `feat: seed script with demo data`
- **Status**: [ ]

## D5-04 — E2E smoke test on production

- **Priority**: Critical
- **Dependencies**: D5-03
- **Estimated time**: 1h
- **Files**:
  - `apps/web/tests/e2e/auth.spec.ts`
  - `apps/web/tests/e2e/resume-upload.spec.ts`
  - `apps/web/tests/e2e/apply-job.spec.ts`
  - `apps/web/tests/e2e/recruiter-pipeline.spec.ts`
  - `apps/web/playwright.config.ts`
- **Acceptance criteria**:
  - 4 critical E2E flows pass on production URL
  - Playwright config targets production `baseURL`
  - Test report committed to `playwright-report/`
- **Commit**: `test: e2e flows on production`
- **Status**: [ ]

## D5-05 — Dark mode final pass + skeletons + empty states

- **Priority**: High
- **Dependencies**: D0-14
- **Estimated time**: 2h
- **Files**:
  - audit all pages for dark mode
  - `apps/web/src/components/shared/skeleton-card.tsx`
  - `apps/web/src/components/shared/empty-state.tsx`
- **Acceptance criteria**:
  - Every page renders correctly in dark mode
  - Every list has a `<Skeleton />` loading state
  - Every list has an `<EmptyState />` with illustration
  - All toast notifications use `sonner`
- **Commit**: `polish: dark mode + skeletons + empty states`
- **Status**: [ ]

## D5-06 — Command palette completion

- **Priority**: Medium
- **Dependencies**: D2-11
- **Estimated time**: 1h
- **Files**:
  - `apps/web/src/components/layout/command-palette.tsx`
  - `apps/web/src/lib/hooks/use-keyboard-shortcut.ts`
- **Acceptance criteria**:
  - ⌘K opens palette
  - Search across jobs, candidates, navigation
  - Keyboard shortcuts: `J` (new job), `C` (new candidate), `P` (pipeline), `?` (overlay)
- **Commit**: `feat: command palette + keyboard shortcuts`
- **Status**: [ ]

## D5-07 — CI pipeline (GitHub Actions)

- **Priority**: Critical
- **Dependencies**: D0-01
- **Estimated time**: 1h
- **Files**:
  - `.github/workflows/ci.yml`
  - `.github/workflows/deploy.yml`
  - `.github/PULL_REQUEST_TEMPLATE.md`
- **Acceptance criteria**:
  - On PR: lint + typecheck + unit tests + build
  - On push to main: deploy hook triggered
  - pnpm cache enabled
  - Required check on `main`
- **Commit**: `ci: github actions workflow`
- **Status**: [ ]

## D5-08 — Lighthouse audit + perf fix

- **Priority**: Medium
- **Dependencies**: D5-02
- **Estimated time**: 1h
- **Files**:
  - monaco editor lazy loading
  - image optimization
- **Acceptance criteria**:
  - Lighthouse perf ≥ 85
  - Lighthouse a11y ≥ 95
  - Monaco lazy-loaded only on assessment route
- **Commit**: `perf: lighthouse pass + lazy loading`
- **Status**: [ ]

---

# Day 6 — Submission Package (8h, T-6 days = deadline)

> **Goal:** README + diagrams + demo video + submit via Unstop before 14 Aug 16:00 IST.
> **Commit window:** 4 commits.

## D6-01 — README.md complete

- **Priority**: Critical
- **Dependencies**: D0-14
- **Estimated time**: 1h
- **Files**:
  - `README.md`
- **Acceptance criteria** (per hackathon rules):
  - [ ] Project name: HirePilot
  - [ ] Problem Statement: DevFusion 4.O — PS-2
  - [ ] App description (2–3 paragraphs)
  - [ ] Full tech stack list
  - [ ] Step-by-step local run instructions
  - [ ] All built features (grouped by module)
  - [ ] Live deployment URL
  - [ ] Team member names + roles
  - [ ] All 7 demo credentials
  - [ ] Known bugs / limitations (honest list)
  - [ ] Architecture diagram link
  - [ ] ER diagram link
- **Commit**: `docs: complete README with all hackathon sections`
- **Status**: [ ]

## D6-02 — Architecture diagram + ER diagram

- **Priority**: Critical
- **Dependencies**: D0-07
- **Estimated time**: 1h
- **Files**:
  - `docs/architecture/system-context.png`
  - `docs/er-diagram.png`
- **Acceptance criteria**:
  - System context: C4 Level 1 diagram from draw.io
  - ER diagram: generated from dbdiagram.io or Prisma Studio
  - Both linked in README
- **Commit**: `docs: architecture + ER diagrams`
- **Status**: [ ]

## D6-03 — OpenAPI spec + Postman collection

- **Priority**: Critical
- **Dependencies**: D0-09
- **Estimated time**: 1h
- **Files**:
  - `apps/web/src/server/openapi.ts`
  - `docs/api/openapi.yaml`
  - `docs/api/postman-collection.json`
- **Acceptance criteria**:
  - OpenAPI spec generated from Zod schemas via `@anatine/zod-openapi`
  - Spec served at `/api/docs` in dev
  - Postman collection exported as JSON
  - Both linked in README
- **Commit**: `docs: openapi spec + postman collection`
- **Status**: [ ]

## D6-04 — ADRs (Architecture Decision Records)

- **Priority**: High
- **Dependencies**: D0-01
- **Estimated time**: 30 min
- **Files**:
  - `docs/adr/0001-monorepo-vs-single-app.md`
  - `docs/adr/0002-deterministic-ai-no-llm.md`
  - `docs/adr/0003-sse-vs-websockets.md`
- **Acceptance criteria**:
  - 3 ADRs explaining: monorepo choice, AI pipeline choice, notification transport choice
- **Commit**: `docs: 3 ADRs`
- **Status**: [ ]

## D6-05 — Demo video (3–5 min)

- **Priority**: Critical
- **Dependencies**: D5-04
- **Estimated time**: 2h
- **Files**:
  - `docs/demo-video.mp4` (or link to Loom/YouTube)
- **Acceptance criteria**:
  - Walkthrough:
    1. Landing page (10s)
    2. Sign up as candidate (20s)
    3. Upload resume → AI parse → profile auto-populate (30s)
    4. Browse jobs → apply (30s)
    5. Switch to recruiter → see Kanban (30s)
    6. Drag candidate to Shortlisted → AI match card (30s)
    7. Schedule interview → send ICS (20s)
    8. Take coding assessment (30s)
    9. Generate offer letter PDF (30s)
    10. Dark mode + command palette (20s)
  - Length: 3–5 min
  - Audio: clear narration
  - Resolution: 1080p
- **Commit**: `docs: demo video walkthrough`
- **Status**: [ ]

## D6-06 — Final commit cleanup + history review

- **Priority**: Critical
- **Dependencies**: D0-14
- **Estimated time**: 30 min
- **Files**:
  - `git log --oneline` review
- **Acceptance criteria**:
  - All commits have meaningful messages
  - No `Co-authored-by: AI` lines
  - No 50-file dumps
  - Each commit reviewable in < 5 minutes
- **Commit**: `chore: final commit cleanup`
- **Status**: [ ]

## D6-07 — Verify submission requirements

- **Priority**: Critical
- **Dependencies**: D6-06
- **Estimated time**: 30 min
- **Acceptance criteria**:
  - [ ] GitHub repo is **public**
  - [ ] Live URL works (HTTP 200)
  - [ ] No console errors on landing → signup → apply flow
  - [ ] Backend deployed AND connected to frontend on live URL
  - [ ] All major features work on live (not just locally)
  - [ ] No broken buttons / empty pages / console errors
  - [ ] Test credentials in README
  - [ ] All team members named in README
  - [ ] Problem statement chosen is clearly mentioned in README
- **Status**: [ ]

## D6-08 — Submit via Unstop

- **Priority**: Critical
- **Dependencies**: D6-07
- **Estimated time**: 15 min
- **Acceptance criteria**:
  - Submission before **14 Aug 2026 16:00 IST**
  - Both links submitted: GitHub URL + live URL
  - Submission confirmation screenshot saved
- **Commit**: `chore: submission confirmed`
- **Status**: [ ]

---

# Recently Completed

> _Empty — bootstrap session._

---

# Reordering Rules

When updating this file:

1. Mark in-progress tasks `[~]` and move to top of their priority band.
2. Cross out completed tasks and move to "Recently Completed" with the date.
3. If a task is blocked, mark `[!]` and add a one-line reason to `PROJECT_STATUS.md` § Blockers.
4. New tasks must include all six fields: priority, dependencies, time, files, acceptance criteria, commit.
5. Never delete a task — completed or not. History is audit gold.

---

# Sprint Status Snapshot

| Day   | Focus                          | Status      |
| ----- | ------------------------------ | ----------- |
| Day 0 | Foundations                    | Not started |
| Day 1 | Auth + Core Data               | Not started |
| Day 2 | Resume AI + Kanban             | Not started |
| Day 3 | Interview + Assessment + Offer | Not started |
| Day 4 | Dashboards + 2FA               | Not started |
| Day 5 | Deploy + Polish                | Not started |
| Day 6 | Submission                     | Not started |

**Total estimated time:** 56 hours (8h × 7 days) of focused engineering work.
**Actual deadline:** 14 Aug 2026 16:00 IST.
**Buffer:** Day 6 has 2–4h of slack for last-minute fixes.

---

_Lock the scope. Commit often. Read every patch before committing. Win this._
