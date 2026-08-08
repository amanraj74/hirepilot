# HirePilot — Complete Build Blueprint (Updated)

> DevFusion 4.O — Problem Statement 2: AI-Powered Recruitment & Applicant Tracking System
> Read top-to-bottom on Day 0. Every decision is grounded in the stack, free-tier APIs, and the 6-day window.
> This supersedes the original blueprint. All gaps vs. PS-2 are filled.

---

## Table of Contents

1. [Architectural Decisions](#1-architectural-decisions)
2. [Free-API Inventory](#2-free-api-inventory)
3. [Complete Folder & File Structure](#3-complete-folder--file-structure)
4. [Tech Stack (Locked)](#4-tech-stack-locked)
5. [Data Model — All 25 Prisma Models](#5-data-model--all-25-prisma-models)
6. [Auth, RBAC & 2FA Design](#6-auth-rbac--2fa-design)
7. [Complete API Surface](#7-complete-api-surface)
8. [AI Pipeline Implementation](#8-ai-pipeline-implementation)
9. [Email, PDF & Calendar Generation](#9-email-pdf--calendar-generation)
10. [UI/UX Implementation Guide](#10-uiux-implementation-guide)
11. [Testing Strategy](#11-testing-strategy)
12. [Local Dev Workflow](#12-local-dev-workflow)
13. [Deployment — Vercel + Railway](#13-deployment--vercel--railway)
14. [Seed Data & Demo Accounts](#14-seed-data--demo-accounts)
15. [Submission Package Checklist](#15-submission-package-checklist)
16. [6-Day Plan (Realistic, Hourly)](#16-6-day-plan-realistic-hourly)
17. [Risk Register](#17-risk-register)
18. [Anti-Cheat Guardrails](#18-anti-cheat-guardrails)

---

## 1. Architectural Decisions

| #     | Decision                                                                    | Rationale                                                                                             |
| ----- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| AD-1  | **Single Next.js 15 app** (App Router + API Route Handlers as backend)      | PS-2 allows "Next.js API"; single Vercel deploy is fastest for a 6-day sprint                         |
| AD-2  | **Turborepo monorepo** — `apps/web` + `packages/shared` + `packages/config` | Professional structure; shared Zod schemas reused across app + tests                                  |
| AD-3  | **PostgreSQL 16** (Railway)                                                 | Relational data (jobs ↔ applications ↔ interviews) is naturally SQL; built-in FTS for global search |
| AD-4  | **Prisma 5** ORM                                                            | Type-safe queries, TS DX, painless migrations                                                         |
| AD-5  | **Auth.js v5** — JWT in HTTP-only Secure cookies                            | Google OAuth + email/password + 2FA TOTP all handled cleanly                                          |
| AD-6  | **Deterministic AI** (pdf-parse, mammoth, Fuse.js, natural) — NO LLM        | Zero API cost, no disqualification risk, deterministic & inspectable results; explain in ADR-0002     |
| AD-7  | **Server-Sent Events** for real-time notifications                          | Simpler than WebSockets on Vercel (no persistent connection server); sufficient for one-way fan-out   |
| AD-8  | **shadcn/ui + Tailwind v4**                                                 | Industry standard, owns the primitives, dark mode built in                                            |
| AD-9  | **Cloudinary** for file storage                                             | 25 GB free, signed uploads, built-in PDF preview URL                                                  |
| AD-10 | **Resend + React Email** for transactional email                            | Best DX, 3000/mo free, React components as templates                                                  |
| AD-11 | **Railway** for Postgres + Redis                                            | $5 free credit; both services in one project                                                          |
| AD-12 | **@dnd-kit** for Kanban drag-and-drop                                       | Actively maintained, accessible, touch + keyboard support                                             |
| AD-13 | **@react-pdf/renderer** for offer letter PDF                                | Declarative JSX, renders server-side                                                                  |
| AD-14 | **Zod** for all input validation (client + server)                          | Same schema → TS type + Prisma mirror + API contract                                                  |
| AD-15 | **otplib + qrcode** for 2FA TOTP                                            | Required by PS-2; free, no external service needed                                                    |
| AD-16 | **ics** package for calendar file generation                                | Required by PS-2 interview scheduler; generates standard .ics files                                   |
| AD-17 | **graphile-worker** for background jobs                                     | Email + AI processing queued asynchronously; Postgres-backed, no extra infra                          |
| AD-18 | **Next.js edge middleware** for route protection                            | Guards all authenticated routes before page renders; essential for RBAC                               |

---

## 2. Free-API Inventory

> No service below requires a credit card on the free tier.

| Service                    | URL                      | Env Variable(s)                                                        |
| -------------------------- | ------------------------ | ---------------------------------------------------------------------- |
| Vercel (hosting)           | vercel.com               | auto-injected                                                          |
| Railway (Postgres + Redis) | railway.app              | `DATABASE_URL`, `REDIS_URL`                                            |
| Cloudinary (file storage)  | cloudinary.com           | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` |
| Resend (email)             | resend.com               | `RESEND_API_KEY`, `EMAIL_FROM`                                         |
| Google OAuth               | console.cloud.google.com | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`                             |
| GitHub (already have)      | github.com               | `GITHUB_TOKEN` (Actions only)                                          |

**NPM packages with no external service:**

| Package              | Purpose                                            |
| -------------------- | -------------------------------------------------- |
| otplib               | TOTP generation + verification (2FA)               |
| qrcode               | QR code PNG for authenticator app setup            |
| ics                  | Generate .ics calendar files for interview invites |
| ua-parser-js         | Parse user-agent for device session tracking       |
| cmdk                 | ⌘K command palette                                 |
| pdf-parse            | Extract text from PDF resumes                      |
| mammoth              | Extract text from DOCX resumes                     |
| fuse.js              | Fuzzy skill matching against taxonomy              |
| natural              | TF-IDF for feedback summarization                  |
| @anatine/zod-openapi | Auto-generate OpenAPI spec from Zod schemas        |

**Local dev without any external service:** Set `EMAIL_PROVIDER=console` → emails log to stdout. Use `docker-compose` for Postgres + Redis locally.

---

## 3. Complete Folder & File Structure

```
hirepilot/
│
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                         # lint + typecheck + unit tests on every PR
│   │   └── deploy.yml                     # push-to-main → trigger Vercel deploy hook
│   └── PULL_REQUEST_TEMPLATE.md
│
├── apps/
│   └── web/                               # Next.js 15 application (UI + API)
│       │
│       ├── prisma/
│       │   ├── schema.prisma              # all 25 models — single source of truth
│       │   ├── migrations/                # generated by prisma migrate dev, never edit
│       │   │   └── 20240808000000_init/
│       │   │       └── migration.sql
│       │   └── seed.ts                    # demo accounts + sample data
│       │
│       ├── public/
│       │   ├── favicon.ico
│       │   ├── og-image.png               # 1200×630 for social sharing / SEO
│       │   ├── robots.txt
│       │   ├── sitemap.xml                # generated by next-sitemap
│       │   └── illustrations/             # empty-state SVGs (hand-drawn style)
│       │       ├── no-jobs.svg
│       │       ├── no-applications.svg
│       │       ├── no-candidates.svg
│       │       └── no-assessments.svg
│       │
│       └── src/
│           │
│           ├── app/                       # Next.js App Router root
│           │   │
│           │   ├── (marketing)/           # public pages — no auth required
│           │   │   ├── layout.tsx         # marketing nav + footer
│           │   │   ├── page.tsx           # landing: hero, features, testimonials, pricing, faq, contact
│           │   │   ├── pricing/
│           │   │   │   └── page.tsx
│           │   │   └── careers/           # PUBLIC careers page (bonus feature — high judge impact)
│           │   │       ├── page.tsx       # all open jobs, public, no auth
│           │   │       └── [jobId]/
│           │   │           └── page.tsx   # public job detail + "Apply Now" CTA
│           │   │
│           │   ├── (auth)/                # unauthenticated auth flows
│           │   │   ├── layout.tsx         # centered card layout, no sidebar
│           │   │   ├── login/
│           │   │   │   └── page.tsx       # email+password + Google OAuth button
│           │   │   ├── signup/
│           │   │   │   └── page.tsx       # role selection (Candidate / Recruiter) at signup
│           │   │   ├── verify-email/
│           │   │   │   └── page.tsx       # reads ?token= from URL, calls verify API
│           │   │   ├── forgot-password/
│           │   │   │   └── page.tsx       # email input → sends reset link
│           │   │   ├── reset-password/
│           │   │   │   └── page.tsx       # reads ?token= → new password form
│           │   │   └── verify-otp/
│           │   │       └── page.tsx       # 2FA step shown after correct password (if 2FA enabled)
│           │   │
│           │   ├── (app)/                 # authenticated shell — all roles
│           │   │   ├── layout.tsx         # sidebar + topbar + notification bell + SSE connection
│           │   │   │
│           │   │   ├── dashboard/
│           │   │   │   └── page.tsx       # role-aware router → redirects to correct dashboard
│           │   │   │
│           │   │   ├── profile/
│           │   │   │   ├── page.tsx       # view + edit own profile (all fields from spec)
│           │   │   │   └── resume/
│           │   │   │       └── page.tsx   # upload resume + view parsed fields + match preview
│           │   │   │
│           │   │   ├── jobs/              # CANDIDATE: browse + filter + apply
│           │   │   │   ├── page.tsx       # job board with all 9 filter types from spec
│           │   │   │   └── [jobId]/
│           │   │   │       ├── page.tsx   # job detail + AI match score display
│           │   │   │       └── apply/
│           │   │   │           └── page.tsx # application form (cover letter + resume confirm)
│           │   │   │
│           │   │   ├── applications/      # CANDIDATE: track own applications
│           │   │   │   ├── page.tsx       # list with stage badges + timestamps
│           │   │   │   └── [applicationId]/
│           │   │   │       └── page.tsx   # timeline view of stage history
│           │   │   │
│           │   │   ├── interviews/        # CANDIDATE: upcoming interviews
│           │   │   │   ├── page.tsx       # sorted by date, countdown display
│           │   │   │   └── [interviewId]/
│           │   │   │       └── page.tsx   # details + meeting link + download ICS button
│           │   │   │
│           │   │   ├── assessments/       # CANDIDATE: take coding tests
│           │   │   │   ├── page.tsx       # pending + completed + scores
│           │   │   │   └── [assessmentId]/
│           │   │   │       ├── page.tsx   # intro screen: instructions + rules + start button
│           │   │   │       ├── take/
│           │   │   │       │   └── page.tsx # FULL-SCREEN test: timer + questions + editor + submit
│           │   │   │       └── result/
│           │   │   │           └── page.tsx # score + per-question breakdown
│           │   │   │
│           │   │   ├── offers/            # CANDIDATE: receive + accept/reject offers
│           │   │   │   ├── page.tsx       # list of offers with status badges
│           │   │   │   └── [offerId]/
│           │   │   │       └── page.tsx   # offer letter preview + Accept / Reject buttons
│           │   │   │
│           │   │   ├── recruiter/         # RECRUITER-ONLY section
│           │   │   │   ├── dashboard/
│           │   │   │   │   └── page.tsx   # all 8 widgets + Recharts (Total Jobs, Active Candidates, etc.)
│           │   │   │   │
│           │   │   │   ├── jobs/
│           │   │   │   │   ├── page.tsx   # job list with status tags + actions
│           │   │   │   │   ├── new/
│           │   │   │   │   │   └── page.tsx # full job creation form (all spec fields)
│           │   │   │   │   └── [jobId]/
│           │   │   │   │       ├── page.tsx # job detail + applicant list with match scores
│           │   │   │   │       └── edit/
│           │   │   │   │           └── page.tsx
│           │   │   │   │
│           │   │   │   ├── pipeline/      # KANBAN BOARD
│           │   │   │   │   ├── page.tsx   # Kanban across ALL jobs — drag candidates between stages
│           │   │   │   │   └── [jobId]/
│           │   │   │   │       └── page.tsx # Kanban filtered to one job
│           │   │   │   │
│           │   │   │   ├── candidates/
│           │   │   │   │   ├── page.tsx   # candidate search + filter + bulk shortlist/reject
│           │   │   │   │   └── [candidateId]/
│           │   │   │   │       └── page.tsx # full profile + resume viewer + AI match card
│           │   │   │   │
│           │   │   │   ├── interviews/
│           │   │   │   │   ├── page.tsx   # all scheduled interviews sorted by date
│           │   │   │   │   ├── schedule/
│           │   │   │   │   │   └── page.tsx # select candidate + interviewer + date/time + generate link
│           │   │   │   │   └── [interviewId]/
│           │   │   │   │       └── page.tsx # details + send invite + ICS download + cancel
│           │   │   │   │
│           │   │   │   ├── assessments/
│           │   │   │   │   ├── page.tsx   # assessment list with attempt stats
│           │   │   │   │   ├── new/
│           │   │   │   │   │   └── page.tsx # build test: add MCQ / CODE / SQL / DEBUG questions
│           │   │   │   │   └── [assessmentId]/
│           │   │   │   │       ├── page.tsx # overview + attempt list + avg score
│           │   │   │   │       └── analytics/
│           │   │   │   │           └── page.tsx # per-question analytics + difficulty curve
│           │   │   │   │
│           │   │   │   ├── offers/
│           │   │   │   │   ├── page.tsx   # all generated offers with status
│           │   │   │   │   └── generate/
│           │   │   │   │       └── page.tsx # form: candidate, role, salary, joining date, benefits
│           │   │   │   │
│           │   │   │   └── analytics/
│           │   │   │       └── page.tsx   # full analytics: funnel + time-to-hire + source + charts
│           │   │   │
│           │   │   ├── hiring-manager/    # HIRING MANAGER section
│           │   │   │   ├── dashboard/
│           │   │   │   │   └── page.tsx
│           │   │   │   ├── shortlist/
│           │   │   │   │   └── page.tsx   # compare candidates side-by-side + interviewer feedback
│           │   │   │   └── decisions/
│           │   │   │       └── page.tsx   # approve / reject with mandatory notes
│           │   │   │
│           │   │   ├── interviewer/       # INTERVIEWER section
│           │   │   │   ├── dashboard/
│           │   │   │   │   └── page.tsx
│           │   │   │   ├── assignments/
│           │   │   │   │   └── page.tsx   # upcoming interviews assigned to me
│           │   │   │   └── feedback/
│           │   │   │       └── [interviewId]/
│           │   │   │           └── page.tsx # 6-dimension scorecard: Technical, Communication, Problem Solving, Teamwork, Leadership, Overall + Comments
│           │   │   │
│           │   │   ├── admin/             # ADMIN (full control)
│           │   │   │   ├── dashboard/
│           │   │   │   │   └── page.tsx
│           │   │   │   ├── users/
│           │   │   │   │   ├── page.tsx
│           │   │   │   │   └── [userId]/
│           │   │   │   │       └── page.tsx # role change + suspend
│           │   │   │   ├── companies/
│           │   │   │   │   ├── page.tsx
│           │   │   │   │   └── [companyId]/
│           │   │   │   │       └── page.tsx
│           │   │   │   ├── jobs/
│           │   │   │   │   └── page.tsx
│           │   │   │   ├── assessments/
│           │   │   │   │   └── page.tsx
│           │   │   │   ├── audit-logs/
│           │   │   │   │   └── page.tsx   # paginated audit trail (who did what, when, IP)
│           │   │   │   ├── platform-settings/
│           │   │   │   │   └── page.tsx
│           │   │   │   └── reports/
│           │   │   │       └── page.tsx
│           │   │   │
│           │   │   └── settings/          # ALL ROLES: own account settings
│           │   │       ├── page.tsx       # profile + display preferences
│           │   │       ├── security/
│           │   │       │   └── page.tsx   # 2FA setup/disable + device sessions list + revoke
│           │   │       └── notifications/
│           │   │           └── page.tsx   # toggle email + in-app notification preferences
│           │   │
│           │   ├── api/                   # Next.js Route Handlers (the backend)
│           │   │   │
│           │   │   ├── auth/
│           │   │   │   └── [...nextauth]/
│           │   │   │       └── route.ts   # Auth.js unified handler
│           │   │   │
│           │   │   ├── health/
│           │   │   │   └── route.ts       # GET → { status, version, db: ok, redis: ok }
│           │   │   │
│           │   │   ├── sse/
│           │   │   │   └── route.ts       # GET → SSE stream; keep-alive every 30s; fan-out on events
│           │   │   │
│           │   │   ├── 2fa/
│           │   │   │   ├── setup/
│           │   │   │   │   └── route.ts   # POST → generate TOTP secret + QR data URI
│           │   │   │   ├── verify/
│           │   │   │   │   └── route.ts   # POST { token } → validate + enable 2FA
│           │   │   │   └── disable/
│           │   │   │       └── route.ts   # DELETE { password } → verify password + disable
│           │   │   │
│           │   │   ├── sessions/
│           │   │   │   ├── route.ts       # GET → my active device sessions
│           │   │   │   └── [sessionId]/
│           │   │   │       └── route.ts   # DELETE → revoke specific session
│           │   │   │
│           │   │   ├── me/
│           │   │   │   ├── route.ts       # GET → current user + profile + unread count
│           │   │   │   ├── profile/
│           │   │   │   │   └── route.ts   # PATCH → update profile fields
│           │   │   │   ├── resume/
│           │   │   │   │   └── route.ts   # POST → upload + trigger parse pipeline
│           │   │   │   ├── applications/
│           │   │   │   │   └── route.ts   # GET → my applications with stage history
│           │   │   │   └── notifications/
│           │   │   │       ├── route.ts   # GET → paginated history
│           │   │   │       └── read-all/
│           │   │   │           └── route.ts # POST → mark all read
│           │   │   │
│           │   │   ├── notifications/
│           │   │   │   └── [notifId]/
│           │   │   │       └── route.ts   # PATCH { read: true }
│           │   │   │
│           │   │   ├── jobs/              # PUBLIC job listing (no auth)
│           │   │   │   ├── route.ts       # GET ?q=&location=&skills=&workMode=&salary=&type=
│           │   │   │   └── [jobId]/
│           │   │   │       ├── route.ts   # GET public job detail
│           │   │   │       └── apply/
│           │   │   │           └── route.ts # POST → create application + send confirmation email
│           │   │   │
│           │   │   ├── offers/
│           │   │   │   └── [offerId]/
│           │   │   │       ├── accept/
│           │   │   │       │   └── route.ts # POST → update status + notify recruiter
│           │   │   │       └── reject/
│           │   │   │           └── route.ts # POST → update status + notify recruiter
│           │   │   │
│           │   │   ├── assessments/
│           │   │   │   └── [assessmentId]/
│           │   │   │       ├── route.ts   # GET → details + questions (masked: no correct answers)
│           │   │   │       ├── start/
│           │   │   │       │   └── route.ts # POST → create AssessmentAttempt, record startedAt, enforce one attempt
│           │   │   │       └── submit/
│           │   │   │           └── route.ts # POST { answers, tabSwitchCount } → grade + save + notify
│           │   │   │
│           │   │   ├── search/
│           │   │   │   └── route.ts       # GET ?q= → search across Jobs, Candidates, Companies, Interviews
│           │   │   │
│           │   │   ├── upload/
│           │   │   │   └── resume/
│           │   │   │       └── route.ts   # POST → validate type+size → Cloudinary signed upload
│           │   │   │
│           │   │   ├── recruiter/
│           │   │   │   ├── dashboard/
│           │   │   │   │   └── route.ts   # GET → all 8 widget data in one aggregated call
│           │   │   │   ├── jobs/
│           │   │   │   │   ├── route.ts   # GET (list+filters) / POST (create)
│           │   │   │   │   └── [jobId]/
│           │   │   │   │       ├── route.ts   # GET / PATCH / DELETE (soft)
│           │   │   │   │       ├── duplicate/
│           │   │   │   │       │   └── route.ts # POST → clone job with "(Copy)" title
│           │   │   │   │       └── match/
│           │   │   │   │           └── route.ts # POST → recompute all match scores for this job
│           │   │   │   ├── candidates/
│           │   │   │   │   ├── route.ts   # GET with search + filters + pagination
│           │   │   │   │   └── [candidateId]/
│           │   │   │   │       └── route.ts   # GET full candidate profile
│           │   │   │   ├── applications/
│           │   │   │   │   ├── route.ts   # GET with stage/job/date filters
│           │   │   │   │   └── [applicationId]/
│           │   │   │   │       ├── route.ts   # GET full detail
│           │   │   │   │       ├── stage/
│           │   │   │   │       │   └── route.ts # PATCH { stage } → state machine transition + email + SSE
│           │   │   │   │       └── match/
│           │   │   │   │           └── route.ts # POST → recompute match score for this application
│           │   │   │   ├── interviews/
│           │   │   │   │   ├── route.ts   # GET / POST schedule
│           │   │   │   │   └── [interviewId]/
│           │   │   │   │       ├── route.ts   # GET / PATCH / DELETE
│           │   │   │   │       └── invite/
│           │   │   │   │           └── route.ts # POST → email candidate (with ICS attachment) + dashboard notif
│           │   │   │   ├── assessments/
│           │   │   │   │   ├── route.ts   # GET / POST create
│           │   │   │   │   └── [assessmentId]/
│           │   │   │   │       ├── route.ts     # GET / PATCH / DELETE
│           │   │   │   │       ├── questions/
│           │   │   │   │       │   └── route.ts # GET list / POST add question
│           │   │   │   │       └── assign/
│           │   │   │   │           └── route.ts # POST { candidateIds[] } → send assessment links
│           │   │   │   ├── offers/
│           │   │   │   │   ├── route.ts   # GET / POST generate
│           │   │   │   │   └── [offerId]/
│           │   │   │   │       ├── route.ts   # GET / PATCH
│           │   │   │   │       └── pdf/
│           │   │   │   │           └── route.ts # GET → stream PDF bytes
│           │   │   │   ├── analytics/
│           │   │   │   │   ├── funnel/
│           │   │   │   │   │   └── route.ts # GET → stage counts for hiring funnel chart
│           │   │   │   │   ├── time-to-hire/
│           │   │   │   │   │   └── route.ts # GET → avg days per stage
│           │   │   │   │   ├── source-analysis/
│           │   │   │   │   │   └── route.ts # GET → candidates by source
│           │   │   │   │   └── export/
│           │   │   │   │       └── route.ts # GET → CSV download of analytics data
│           │   │   │   └── emails/
│           │   │   │       └── route.ts   # POST → send manual email to candidate
│           │   │   │
│           │   │   ├── hiring-manager/
│           │   │   │   ├── shortlist/
│           │   │   │   │   └── route.ts   # GET → shortlisted candidates with all feedback
│           │   │   │   └── applications/
│           │   │   │       └── [applicationId]/
│           │   │   │           └── approve/
│           │   │   │               └── route.ts # POST { decision, notes } → advance or reject
│           │   │   │
│           │   │   ├── interviewer/
│           │   │   │   ├── assignments/
│           │   │   │   │   └── route.ts   # GET → my assigned interviews
│           │   │   │   └── feedback/
│           │   │   │       ├── route.ts   # GET → my submitted feedback
│           │   │   │       └── [interviewId]/
│           │   │   │           └── route.ts # POST → submit scorecard (6 dimensions + comments)
│           │   │   │
│           │   │   ├── admin/
│           │   │   │   ├── users/
│           │   │   │   │   ├── route.ts   # GET list / POST create
│           │   │   │   │   └── [userId]/
│           │   │   │   │       ├── route.ts   # GET / PATCH (role, status)
│           │   │   │   │       └── suspend/
│           │   │   │   │           └── route.ts # POST → set status SUSPENDED
│           │   │   │   ├── companies/
│           │   │   │   │   ├── route.ts
│           │   │   │   │   └── [companyId]/
│           │   │   │   │       └── route.ts
│           │   │   │   ├── audit-logs/
│           │   │   │   │   └── route.ts   # GET ?page=&entity=&userId= → paginated
│           │   │   │   ├── settings/
│           │   │   │   │   └── route.ts   # GET / PATCH platform settings
│           │   │   │   └── reports/
│           │   │   │       └── route.ts   # GET → comprehensive platform report
│           │   │   │
│           │   │   └── webhooks/
│           │   │       └── resend/
│           │   │           └── route.ts   # POST → email delivery status webhooks
│           │   │
│           │   ├── layout.tsx             # root layout: fonts, ThemeProvider, Toaster
│           │   ├── globals.css            # @tailwind directives + CSS custom properties (design tokens)
│           │   ├── error.tsx              # global error boundary
│           │   └── not-found.tsx          # 404 page with navigation
│           │
│           ├── components/
│           │   │
│           │   ├── ui/                    # shadcn/ui primitives — add via CLI only, never modify
│           │   │   ├── button.tsx
│           │   │   ├── card.tsx
│           │   │   ├── dialog.tsx
│           │   │   ├── dropdown-menu.tsx
│           │   │   ├── form.tsx
│           │   │   ├── input.tsx
│           │   │   ├── label.tsx
│           │   │   ├── select.tsx
│           │   │   ├── skeleton.tsx
│           │   │   ├── table.tsx
│           │   │   ├── tabs.tsx
│           │   │   ├── badge.tsx
│           │   │   ├── progress.tsx
│           │   │   ├── separator.tsx
│           │   │   ├── sheet.tsx          # slide-over side panels
│           │   │   ├── avatar.tsx
│           │   │   ├── tooltip.tsx
│           │   │   ├── textarea.tsx
│           │   │   ├── switch.tsx
│           │   │   ├── slider.tsx
│           │   │   ├── command.tsx        # cmdk base (used in command palette)
│           │   │   ├── popover.tsx
│           │   │   └── calendar.tsx       # date picker
│           │   │
│           │   ├── layout/
│           │   │   ├── app-shell.tsx      # authenticated layout wrapper (sidebar + topbar)
│           │   │   ├── sidebar.tsx        # role-aware nav items; collapses on mobile
│           │   │   ├── sidebar-item.tsx   # single nav item with active state + icon
│           │   │   ├── topbar.tsx         # logo + global search trigger + bell + user menu
│           │   │   ├── marketing-navbar.tsx # public landing page nav (sticky, responsive)
│           │   │   ├── footer.tsx         # marketing footer with links
│           │   │   ├── command-palette.tsx # ⌘K — search jobs, candidates, shortcuts
│           │   │   ├── notification-bell.tsx # badge count + dropdown with recent notifications
│           │   │   └── breadcrumb.tsx     # dynamic breadcrumbs from pathname
│           │   │
│           │   ├── forms/
│           │   │   ├── field-wrapper.tsx  # label + input + error message (reusable)
│           │   │   ├── file-input.tsx     # drag-drop zone + click-to-upload + preview
│           │   │   ├── rich-editor.tsx    # basic rich text for job descriptions
│           │   │   ├── skill-selector.tsx # multi-select with typeahead from taxonomy
│           │   │   ├── location-input.tsx # text input with work-mode toggle (Remote/Hybrid/Onsite)
│           │   │   ├── salary-range.tsx   # dual-handle range slider with currency
│           │   │   └── confirm-dialog.tsx # two-click confirmation for ALL destructive actions
│           │   │
│           │   ├── data-table/
│           │   │   ├── data-table.tsx     # generic TanStack Table v8 wrapper
│           │   │   ├── data-table-toolbar.tsx # global search + column filters + column toggle
│           │   │   ├── data-table-pagination.tsx # prev/next + page size selector
│           │   │   ├── data-table-column-header.tsx # sortable header with asc/desc/none
│           │   │   └── data-table-row-actions.tsx   # per-row dropdown (Edit, Delete, etc.)
│           │   │
│           │   ├── kanban/
│           │   │   ├── kanban-board.tsx   # dnd-kit DndContext wrapping all columns
│           │   │   ├── kanban-column.tsx  # droppable stage column with header + card list
│           │   │   ├── kanban-card.tsx    # draggable candidate card with match badge + avatar
│           │   │   └── kanban-overlay.tsx # drag overlay shown while card is being dragged
│           │   │
│           │   ├── resume/
│           │   │   ├── resume-uploader.tsx   # file drop zone + upload progress bar
│           │   │   ├── resume-viewer.tsx     # in-browser PDF preview using react-pdf
│           │   │   ├── parsed-resume-card.tsx # structured display: skills, education, experience
│           │   │   ├── match-card.tsx        # match % ring + Strong Skills ✔ + Missing ✖ + Recommendation
│           │   │   └── match-badge.tsx       # colored badge: green >75, yellow >50, red <50
│           │   │
│           │   ├── assessment/
│           │   │   ├── assessment-shell.tsx  # full-screen layout with timer bar + question nav
│           │   │   ├── countdown-timer.tsx   # HH:MM:SS countdown; turns red under 5 min
│           │   │   ├── tab-switch-guard.tsx  # Page Visibility API; warns + increments counter; auto-submit on limit
│           │   │   ├── mcq-question.tsx      # multiple choice with radio group + code snippet support
│           │   │   ├── code-editor.tsx       # Monaco Editor (lazy-loaded) with language selector + run button
│           │   │   ├── sql-editor.tsx        # Monaco with SQL syntax + expected output panel
│           │   │   ├── debug-task.tsx        # Monaco with pre-broken code + fix-it instructions
│           │   │   ├── question-navigator.tsx # sidebar: Q1 Q2 ... with answered/flagged/empty status dots
│           │   │   └── submission-guard.tsx  # beforeunload warning + auto-submit when timer hits 0
│           │   │
│           │   ├── interview/
│           │   │   ├── interview-card.tsx    # card with candidate, date, time, meeting link, countdown
│           │   │   ├── schedule-form.tsx     # select candidate + interviewer + date/time + link type
│           │   │   ├── feedback-scorecard.tsx # 6 dimensions: star ratings + comments textarea
│           │   │   ├── feedback-comparison.tsx # side-by-side view of multiple interviewers' scorecards (for HM)
│           │   │   └── ics-download-button.tsx # fetches ICS content + triggers browser download
│           │   │
│           │   ├── offer/
│           │   │   ├── offer-letter-preview.tsx # @react-pdf/renderer doc rendered in canvas
│           │   │   ├── offer-card.tsx           # summary: role, salary, status badge + action buttons
│           │   │   └── generate-form.tsx        # role, salary, joining date, location, benefits
│           │   │
│           │   ├── charts/
│           │   │   ├── chart-card.tsx            # wrapper: title + subtitle + recharts + loading state
│           │   │   ├── hiring-funnel-chart.tsx   # Recharts BarChart showing stage counts
│           │   │   ├── monthly-hiring-chart.tsx  # Recharts BarChart month vs hires
│           │   │   ├── conversion-rate-chart.tsx # Recharts LineChart
│           │   │   ├── source-analysis-chart.tsx # Recharts PieChart
│           │   │   └── stat-card.tsx             # single metric: number + label + trend arrow
│           │   │
│           │   ├── landing/                      # marketing page sections (each is its own component)
│           │   │   ├── hero.tsx
│           │   │   ├── features.tsx
│           │   │   ├── testimonials.tsx
│           │   │   ├── pricing.tsx
│           │   │   ├── faq.tsx
│           │   │   └── contact-form.tsx
│           │   │
│           │   └── shared/
│           │       ├── empty-state.tsx       # illustration + heading + description + optional CTA button
│           │       ├── skeleton-card.tsx     # generic content skeleton for loading states
│           │       ├── page-header.tsx       # page title + subtitle + right-side action button
│           │       ├── status-badge.tsx      # stage-colored badge (Applied, Shortlisted, etc.)
│           │       ├── role-badge.tsx        # Admin / Recruiter / Candidate / HM / Interviewer
│           │       ├── avatar-group.tsx      # overlapping avatars for interviewer lists
│           │       ├── copy-button.tsx       # copies text to clipboard + "Copied!" toast
│           │       ├── dark-mode-toggle.tsx  # sun/moon icon toggle button
│           │       └── keyboard-shortcut-hint.tsx # small ⌘K visible hint in topbar
│           │
│           ├── lib/
│           │   ├── api/                      # typed fetch clients — one file per resource domain
│           │   │   ├── client.ts             # base fetch: adds auth header, handles RFC 7807 errors
│           │   │   ├── jobs.ts
│           │   │   ├── applications.ts
│           │   │   ├── candidates.ts
│           │   │   ├── interviews.ts
│           │   │   ├── assessments.ts
│           │   │   ├── offers.ts
│           │   │   ├── notifications.ts
│           │   │   └── analytics.ts
│           │   ├── auth/
│           │   │   └── use-session.ts        # thin wrapper around Auth.js useSession hook
│           │   ├── hooks/
│           │   │   ├── use-sse.ts            # connect to /api/sse, parse events, return notification state
│           │   │   ├── use-debounce.ts       # debounce any value (used for search inputs)
│           │   │   ├── use-local-storage.ts  # typed localStorage with SSR safety
│           │   │   ├── use-media-query.ts    # responsive breakpoint checks
│           │   │   ├── use-keyboard-shortcut.ts # register ⌘K and other shortcuts
│           │   │   └── use-tab-visibility.ts # wraps Page Visibility API for assessment guard
│           │   ├── utils/
│           │   │   ├── cn.ts                 # clsx + tailwind-merge combined
│           │   │   ├── format.ts             # formatDate, formatCurrency, formatRelativeTime
│           │   │   ├── truncate.ts           # truncate string to N chars with ellipsis
│           │   │   └── download.ts           # trigger file download from Blob or URL
│           │   └── validations/              # Zod schemas — MUST mirror API contracts exactly
│           │       ├── auth.ts
│           │       ├── jobs.ts
│           │       ├── applications.ts
│           │       ├── candidates.ts
│           │       ├── interviews.ts
│           │       ├── assessments.ts
│           │       ├── offers.ts
│           │       └── 2fa.ts
│           │
│           ├── server/
│           │   ├── db.ts                     # PrismaClient singleton — import this everywhere
│           │   │
│           │   ├── auth/
│           │   │   ├── config.ts             # Auth.js providers + callbacks + JWT options
│           │   │   ├── session.ts            # getServerSession() helper for Route Handlers
│           │   │   └── rbac.ts               # requireRole(allowed[]) + hasPermission()
│           │   │
│           │   ├── middleware/
│           │   │   ├── auth-guard.ts         # verify JWT, attach user; throw 401 if missing
│           │   │   ├── rate-limit.ts         # Redis sliding window; throw 429 if exceeded
│           │   │   ├── validate.ts           # parse + validate request body against Zod schema; throw 422 if fails
│           │   │   └── audit.ts              # write AuditLog entry after every mutating operation
│           │   │
│           │   ├── services/                 # ALL business logic — no raw Prisma queries in Route Handlers
│           │   │   ├── auth.service.ts       # email verify, password reset, 2FA enable/disable
│           │   │   ├── jobs.service.ts       # CRUD + duplicate + close + FTS search
│           │   │   ├── candidates.service.ts # profile CRUD + search + bulk shortlist/reject
│           │   │   ├── applications.service.ts # apply + stage state machine + history
│           │   │   ├── interviews.service.ts # schedule + ICS generation + feedback storage
│           │   │   ├── assessments.service.ts # create + assign + grade + analytics
│           │   │   ├── offers.service.ts     # generate + render PDF + store URL + accept/reject
│           │   │   ├── notifications.service.ts # create + SSE fan-out + mark read
│           │   │   ├── search.service.ts     # PostgreSQL FTS across Jobs, Candidates, Companies, Interviews
│           │   │   ├── analytics.service.ts  # all 8 dashboard widget queries + funnel + source
│           │   │   ├── companies.service.ts  # company CRUD + profile
│           │   │   ├── sessions.service.ts   # device session create + list + revoke
│           │   │   └── audit.service.ts      # write structured AuditLog entries
│           │   │
│           │   ├── ai/
│           │   │   ├── data/
│           │   │   │   ├── skill-taxonomy.json      # 1500+ skills, 12 categories, alias map
│           │   │   │   ├── question-bank.json       # 500+ questions by skill + difficulty (MCQ/CODE/SQL/DEBUG)
│           │   │   │   └── cover-letter-templates/  # 5 templates by department type
│           │   │   │       ├── engineering.txt
│           │   │   │       ├── design.txt
│           │   │   │       ├── management.txt
│           │   │   │       ├── marketing.txt
│           │   │   │       └── generic.txt
│           │   │   ├── resume-parser.ts      # entry: Buffer + mime → ParsedResume
│           │   │   ├── section-detector.ts   # split raw text into named sections (Education, Experience, Skills...)
│           │   │   ├── field-extractor.ts    # regex extractors: email, phone, name, GitHub, LinkedIn URLs
│           │   │   ├── skill-extractor.ts    # Fuse.js fuzzy match against taxonomy + alias resolution
│           │   │   ├── experience-estimator.ts # parse date ranges (Jan 2021 – Mar 2023) → total years
│           │   │   ├── education-parser.ts   # detect degree level: PhD > Masters > Bachelors > Diploma
│           │   │   ├── match-scorer.ts       # PURE FUNCTION: (ParsedResume, Job) → MatchResult
│           │   │   ├── cover-letter.ts       # template selection by department + smart field substitution
│           │   │   ├── interview-questions.ts # select N questions from bank by required skills + experience level
│           │   │   └── feedback-summarizer.ts # TF-IDF ranking of recurring themes across multiple scorecards
│           │   │
│           │   ├── email/
│           │   │   ├── transport.ts          # Resend SDK or console.log fallback (based on EMAIL_PROVIDER env)
│           │   │   ├── send.ts               # send(to, template, data) — enqueues to graphile-worker
│           │   │   └── templates/            # React Email components
│           │   │       ├── application-confirmation.tsx
│           │   │       ├── shortlisted.tsx
│           │   │       ├── interview-invite.tsx    # includes ICS as base64 attachment
│           │   │       ├── assessment-link.tsx
│           │   │       ├── offer-letter.tsx
│           │   │       ├── rejection.tsx
│           │   │       ├── joining-instructions.tsx
│           │   │       ├── email-verification.tsx
│           │   │       ├── password-reset.tsx
│           │   │       └── 2fa-otp.tsx             # OTP email for 2FA login step
│           │   │
│           │   ├── pdf/
│           │   │   ├── offer-letter.tsx      # @react-pdf/renderer Document component
│           │   │   ├── interview-prep.tsx    # Interview Prep Pack PDF: candidate summary + suggested questions
│           │   │   └── render.ts             # renderToBuffer() → upload to Cloudinary → return URL
│           │   │
│           │   ├── storage/
│           │   │   ├── cloudinary.ts         # upload(), deleteByPublicId(), getSignedUrl()
│           │   │   └── local.ts              # local FS fallback for dev without Cloudinary credentials
│           │   │
│           │   ├── calendar/
│           │   │   └── ics.ts                # generateICS(interview) → .ics string content
│           │   │
│           │   ├── 2fa/
│           │   │   └── totp.ts               # generateSecret(), verifyToken(), buildQRDataURI()
│           │   │
│           │   ├── sse/
│           │   │   └── emitter.ts            # Map<userId, ReadableStreamController>; emit(userId, event)
│           │   │
│           │   ├── workers/
│           │   │   └── tasks.ts              # graphile-worker task definitions: send-email, process-resume, grade-assessment
│           │   │
│           │   ├── errors.ts                 # AppError + subclasses (UnauthorizedError, ForbiddenError, NotFoundError, ValidationError) — RFC 7807
│           │   ├── rate-limit.ts             # Redis sliding window implementation
│           │   ├── logger.ts                 # pino structured JSON logger with request context
│           │   └── openapi.ts                # generateOpenAPISpec() — builds spec from Zod schemas via @anatine/zod-openapi
│           │
│           ├── middleware.ts                 # CRITICAL: Next.js edge middleware — route protection before page renders
│           │
│           ├── styles/
│           │   ├── globals.css               # @tailwind + CSS custom properties
│           │   └── tokens.ts                 # design tokens: colors, radius, fonts
│           │
│           └── types/
│               ├── next-auth.d.ts            # augment Session type with role, id, companyId, twoFactorEnabled
│               └── index.d.ts               # global shared types
│
├── tests/ (at apps/web level)
│   ├── unit/
│   │   ├── ai/
│   │   │   ├── resume-parser.test.ts        # test with real PDF + DOCX fixtures
│   │   │   ├── match-scorer.test.ts         # golden tests: known resume + known job → expected score
│   │   │   ├── skill-extractor.test.ts      # test fuzzy matching edge cases
│   │   │   └── feedback-summarizer.test.ts
│   │   └── utils/
│   │       └── format.test.ts
│   ├── integration/
│   │   ├── api/
│   │   │   ├── jobs.test.ts
│   │   │   ├── applications.test.ts
│   │   │   └── auth.test.ts
│   │   └── services/
│   │       ├── jobs.service.test.ts
│   │       └── applications.service.test.ts
│   ├── e2e/                                 # Playwright — 4 critical flows only
│   │   ├── auth.spec.ts                     # signup → verify email → login
│   │   ├── resume-upload.spec.ts            # upload resume → parsed fields visible in profile
│   │   ├── apply-job.spec.ts               # apply to job → application shows stage "Applied"
│   │   └── recruiter-pipeline.spec.ts      # recruiter moves candidate → candidate sees SSE update
│   └── fixtures/
│       ├── resume.pdf                       # real sample PDF for parser tests
│       ├── resume.docx                      # real sample DOCX for parser tests
│       └── factories.ts                     # factory functions that create test data in DB
│
├── .env.example                             # ALL env vars with descriptions, NO real values
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json                            # strict: true, no implicit any
├── playwright.config.ts
├── vitest.config.ts
└── package.json
```

> **packages/**, **docs/**, **scripts/**, **infra/**, **.github/** layout unchanged from original blueprint.

---

## 4. Tech Stack (Locked)

| Layer           | Library                 | Version     | Purpose                                    |
| --------------- | ----------------------- | ----------- | ------------------------------------------ |
| Runtime         | Node.js                 | 20.11 LTS   | TS execution                               |
| Framework       | Next.js                 | 15.x        | App Router + API routes                    |
| Language        | TypeScript              | 5.6+ strict | Type safety everywhere                     |
| Styling         | Tailwind CSS            | 4.x         | Utility-first                              |
| Components      | shadcn/ui (Radix)       | latest      | Accessible primitives                      |
| ORM             | Prisma                  | 5.x         | Type-safe queries                          |
| Database        | PostgreSQL              | 16          | Railway free                               |
| Cache           | Redis                   | 7           | Rate limit + SSE subscriber tracking       |
| Cache client    | ioredis                 | 5.x         | Async Redis                                |
| Auth            | Auth.js (NextAuth)      | 5.x         | OAuth + credentials + JWT                  |
| 2FA             | otplib                  | 12.x        | TOTP generation + verification             |
| 2FA QR          | qrcode                  | 1.x         | QR PNG for authenticator apps              |
| Calendar        | ics                     | 3.x         | .ics file generation for interview invites |
| Device tracking | ua-parser-js            | 1.x         | Parse user-agent for device sessions       |
| Validation      | Zod                     | 3.x         | Input schemas (client + server)            |
| Forms           | React Hook Form         | 7.x         | Form state management                      |
| Form resolvers  | @hookform/resolvers     | 3.x         | Zod ↔ RHF bridge                          |
| Tables          | TanStack Table          | 8.x         | Data grids                                 |
| Drag-drop       | @dnd-kit                | 6.x         | Kanban board                               |
| Command palette | cmdk                    | 1.x         | ⌘K                                         |
| Charts          | Recharts                | 2.x         | Dashboard widgets                          |
| Icons           | lucide-react            | latest      | Iconography                                |
| Toast           | sonner                  | latest      | Notification toasts                        |
| Animation       | framer-motion           | 11.x        | Page transitions + micro-animations        |
| Code editor     | monaco-editor           | 0.5x        | Assessment code editor (lazy loaded)       |
| Fuzzy match     | fuse.js                 | 7.x         | Skill matching against taxonomy            |
| NLP             | natural                 | 6.x         | TF-IDF for feedback summarization          |
| PDF read        | pdf-parse               | 1.x         | Resume PDF → text                          |
| DOCX read       | mammoth                 | 1.x         | Resume DOCX → text                         |
| PDF write       | @react-pdf/renderer     | 3.x         | Offer letter generation                    |
| PDF view        | react-pdf               | 7.x         | In-browser resume preview                  |
| Email SDK       | resend                  | 3.x         | Transactional email                        |
| Email templates | @react-email/components | latest      | React component templates                  |
| File storage    | cloudinary              | 2.x         | Cloud storage                              |
| File upload     | next-cloudinary         | 6.x         | Signed upload helper                       |
| Background jobs | graphile-worker         | 0.16        | Email + AI processing queue                |
| OpenAPI         | @anatine/zod-openapi    | latest      | Auto-generate spec from Zod                |
| Logging         | pino                    | 9.x         | Structured JSON logging                    |
| Testing (unit)  | Vitest                  | 1.x         | Fast TS unit tests                         |
| Testing (e2e)   | Playwright              | 1.4x        | Browser E2E tests                          |
| Lint            | ESLint                  | 9.x         | Code quality                               |
| Format          | Prettier                | 3.x         | Code formatting                            |
| Git hooks       | Husky + lint-staged     | latest      | Pre-commit checks                          |
| CI/CD           | GitHub Actions          | –           | Lint + test + build + deploy               |
| Hosting (web)   | Vercel                  | –           | Hobby free tier                            |
| Hosting (DB)    | Railway                 | –           | $5 free credit                             |

---

## 5. Data Model — All 25 Prisma Models

> Schema lives in `apps/web/prisma/schema.prisma`. Use `cuid()` for all IDs.
> Soft delete (`deletedAt`) on Job, Application, CandidateProfile. Store money as integer cents.

```
MODEL                    KEY FIELDS
─────────────────────────────────────────────────────────────────────
User                     id, email, passwordHash, role(enum), status, emailVerified,
                         twoFactorEnabled, companyId?, createdAt
                         Relations: CandidateProfile, DeviceSessions, TwoFactorAuth,
                                    AuditLogs, Notifications

Role(enum)               CANDIDATE | RECRUITER | HIRING_MANAGER | INTERVIEWER | ADMIN

UserStatus(enum)         ACTIVE | SUSPENDED | PENDING_VERIFICATION

TwoFactorAuth            id, userId(unique), secret, enabled, backupCodes[]

DeviceSession            id, userId, deviceName, browser, os, ip, lastActiveAt, createdAt

Company                  id, name, website, industry, size, description,
                         logoUrl, socialLinks(Json), officeLocations(Json[])
                         Relations: Jobs, Users(recruiters)

Job                      id, companyId, title, department, location, workMode(enum),
                         salaryMin, salaryMax, currency, employmentType(enum),
                         experienceLevel(enum), skillsRequired(String[]),
                         description, status(enum: DRAFT|OPEN|CLOSED),
                         deadline, deletedAt, postedById
                         Relations: Applications, AssessmentAssignments

CandidateProfile         id, userId(unique), avatarUrl, phone, location,
                         education(Json[]), experience(Json[]), skills(String[]),
                         certifications(Json[]), portfolioUrl, githubUrl, linkedinUrl,
                         resumeUrl, coverLetterUrl, resumeScore, totalExperienceYears,
                         profileCompletionPct, deletedAt
                         Relations: Resumes, Applications

Resume                   id, candidateId, fileUrl, fileType(PDF|DOCX), fileSizeBytes,
                         rawText, parsedData(Json), version, uploadedAt

ResumeAnalysis           id, resumeId, jobId, matchScore, strongSkills(String[]),
                         missingSkills(String[]), weakAreas(String[]),
                         recommendations(String[]), breakdown(Json), computedAt

Application              id, jobId, candidateId, stage(enum), stageHistory(Json[]),
                         coverLetter, matchScore, source, appliedAt, deletedAt
                         Relations: Interviews, AssessmentAttempts, OfferLetters

ApplicationStage(enum)   APPLIED | RESUME_SCREENING | SHORTLISTED | TECHNICAL_INTERVIEW |
                         HR_INTERVIEW | OFFER | HIRED | REJECTED

Interview                id, applicationId, interviewerId, scheduledAt, durationMins,
                         platform(ZOOM|GOOGLE_MEET|TEAMS|OTHER), meetingLink,
                         type(TECHNICAL|HR|PANEL), status(enum), icsFileUrl,
                         cancelledAt, notes
                         Relations: Feedback, CalendarEvent

Feedback                 id, interviewId, interviewerId, applicationId,
                         technicalSkill(1-5), communication(1-5), problemSolving(1-5),
                         teamwork(1-5), leadership(1-5), overallRating(1-5),
                         comments, submittedAt

CalendarEvent            id, interviewId(unique), icsContent(Text), googleEventId?,
                         createdAt

Assessment               id, title, description, timeLimit(mins), companyId, createdById,
                         passingScore, status(DRAFT|ACTIVE|ARCHIVED)
                         Relations: Questions, Attempts, Assignments

AssessmentQuestion       id, assessmentId, type(MCQ|CODE|SQL|DEBUG), prompt, options(Json?),
                         solution, language?, expectedOutput?, points, orderIndex, timeLimit?

AssessmentAttempt        id, assessmentId, applicationId, candidateId, answers(Json),
                         score, tabSwitchCount, startedAt, submittedAt, autoSubmitted,
                         status(IN_PROGRESS|SUBMITTED|GRADED)

AssessmentAssignment     id, assessmentId, applicationId, assignedAt, dueAt, sentEmailAt

OfferLetter              id, applicationId, candidateId, companyId,
                         candidateName, role, salaryAmount, salaryCurrency, joiningDate,
                         location, benefits(String[]), templateUsed,
                         pdfUrl, status(DRAFT|SENT|ACCEPTED|REJECTED|EXPIRED),
                         sentAt, respondedAt

Notification             id, userId, type(enum), title, body, link?, read, readAt, createdAt

NotificationType(enum)   NEW_APPLICATION | STAGE_CHANGED | INTERVIEW_SCHEDULED |
                         ASSESSMENT_ASSIGNED | OFFER_RECEIVED | OFFER_ACCEPTED |
                         OFFER_REJECTED | ASSESSMENT_GRADED | PROFILE_COMPLETE

AuditLog                 id, userId, action, entity, entityId, oldValue(Json?),
                         newValue(Json?), ip, userAgent, createdAt

Setting                  id, key(unique), value(Json), updatedAt, updatedById

VerificationToken        identifier, token, expires  (Auth.js required)
Account                  (Auth.js OAuth accounts table)
Session                  (Auth.js sessions table)
```

**Indexes to add explicitly (beyond Prisma defaults):**

```
Application(jobId, stage)
Application(candidateId, deletedAt)
Job(status, deadline)
Job(companyId, status)
AuditLog(userId, createdAt)
AuditLog(entity, entityId)
Notification(userId, read, createdAt)
```

---

## 6. Auth, RBAC & 2FA Design

### Auth.js v5 Configuration

- JWT strategy; session stored in HTTP-only Secure `__Secure-next-auth.session-token` cookie
- Two providers: Google OAuth + Credentials (email + bcrypt password)
- Email verification: `VerificationToken` table; gate recruiter features behind `emailVerified !== null`
- Role stored in JWT payload AND DB (`User.role`); DB is source of truth for permission checks on every request

### RBAC Helper

```ts
// server/auth/rbac.ts
export async function requireRole(allowed: Role[]) {
  const session = await auth();
  if (!session?.user) throw new UnauthorizedError();
  if (!allowed.includes(session.user.role)) throw new ForbiddenError();
  return session.user;
}
```

Every API Route Handler calls `requireRole([...])` as its first line. Every Server Action does the same. No exceptions.

### 2FA Flow (TOTP)

1. User goes to Settings → Security → Enable 2FA
2. `POST /api/2fa/setup` → `otplib.authenticator.generateSecret()` → return `{ secret, qrDataUri }`
3. Frontend shows QR code (from `qrcode.toDataURL(otpauthUrl)`) + manual entry key
4. User scans with Google Authenticator / Authy, enters 6-digit token
5. `POST /api/2fa/verify { token }` → `otplib.authenticator.verify({ token, secret })` → if valid, set `TwoFactorAuth.enabled = true`
6. On next login: after correct password → check `user.twoFactorEnabled` → if true, redirect to `/verify-otp` → verify token → create session

### Password Reset Flow

1. `POST /api/auth/forgot-password { email }` → generate `VerificationToken` (expires 1h) → send email
2. `POST /api/auth/reset-password { token, newPassword }` → validate token → bcrypt new password → delete token

### Device Session Tracking

- On every login: parse `user-agent` with `ua-parser-js` → create `DeviceSession` record
- `GET /api/sessions` → list user's active device sessions
- `DELETE /api/sessions/:id` → soft-delete specific session (forces re-login on that device)

### Rate Limits

- `/api/auth/*` → 5 requests/min/IP
- `/api/upload/*` → 10 requests/min/userId
- `/api/2fa/*` → 3 requests/min/userId (prevent TOTP brute force)

### Next.js Edge Middleware

```ts
// src/middleware.ts  ← THIS FILE IS CRITICAL — without it, routes are unprotected
export { default } from 'next-auth/middleware';
export const config = {
  matcher: [
    '/(app)/:path*',
    '/api/recruiter/:path*',
    '/api/admin/:path*',
    '/api/hiring-manager/:path*',
    '/api/interviewer/:path*',
    '/api/me/:path*',
  ],
};
```

---

## 7. Complete API Surface

> All responses: `Content-Type: application/json`. Errors: RFC 7807 `application/problem+json`.
> All list endpoints support `?page=1&limit=20` pagination.

### Public (no auth)

| Method | Path                      | Notes                                                                     |
| ------ | ------------------------- | ------------------------------------------------------------------------- |
| GET    | `/api/health`             | `{ status, version, db, redis }`                                          |
| GET    | `/api/jobs`               | Filters: q, location, workMode, salary, skills, type, company, experience |
| GET    | `/api/jobs/:id`           | Public job detail                                                         |
| GET    | `/api/careers`            | Same as /api/jobs, dedicated for public careers page                      |
| POST   | `/api/auth/[...nextauth]` | Auth.js handler                                                           |

### Authenticated — All Roles

| Method | Path                             | Notes                                                                                 |
| ------ | -------------------------------- | ------------------------------------------------------------------------------------- |
| GET    | `/api/me`                        | Current user + profile + unread notification count                                    |
| PATCH  | `/api/me/profile`                | Update profile fields                                                                 |
| POST   | `/api/me/resume`                 | Upload + trigger parse pipeline                                                       |
| GET    | `/api/me/applications`           | My applications with stage history                                                    |
| GET    | `/api/me/notifications`          | Paginated notification history                                                        |
| POST   | `/api/me/notifications/read-all` | Mark all read                                                                         |
| PATCH  | `/api/notifications/:id`         | `{ read: true }`                                                                      |
| GET    | `/api/sse`                       | SSE stream — keep-alive 30s, events on application.updated, interview.scheduled, etc. |
| GET    | `/api/search?q=`                 | Global search: Jobs, Candidates, Companies, Interviews                                |
| POST   | `/api/2fa/setup`                 | Generate TOTP secret + QR URI                                                         |
| POST   | `/api/2fa/verify`                | `{ token }` → enable 2FA                                                              |
| DELETE | `/api/2fa/disable`               | `{ password }` → disable 2FA                                                          |
| GET    | `/api/sessions`                  | My device sessions                                                                    |
| DELETE | `/api/sessions/:id`              | Revoke session                                                                        |

### Candidate

| Method | Path                          | Notes                                                      |
| ------ | ----------------------------- | ---------------------------------------------------------- |
| POST   | `/api/jobs/:id/apply`         | Submit application + confirmation email                    |
| POST   | `/api/offers/:id/accept`      | Accept offer + notify recruiter                            |
| POST   | `/api/offers/:id/reject`      | Reject offer + notify recruiter                            |
| GET    | `/api/assessments/:id`        | Assessment details (questions without answers)             |
| POST   | `/api/assessments/:id/start`  | Create attempt, record startedAt, enforce one-attempt rule |
| POST   | `/api/assessments/:id/submit` | `{ answers, tabSwitchCount }` → grade + save + notify      |
| GET    | `/api/assessments/:id/result` | Score + per-question breakdown (after grading)             |

### Recruiter

| Method           | Path                                       | Notes                                                   |
| ---------------- | ------------------------------------------ | ------------------------------------------------------- |
| GET/POST         | `/api/recruiter/jobs`                      | List / Create                                           |
| GET/PATCH/DELETE | `/api/recruiter/jobs/:id`                  | Job detail / Edit / Soft delete                         |
| POST             | `/api/recruiter/jobs/:id/duplicate`        | Clone job with "(Copy)" appended to title               |
| POST             | `/api/recruiter/jobs/:id/match`            | Recompute all match scores for this job                 |
| GET              | `/api/recruiter/candidates`                | Search + filter + pagination                            |
| GET              | `/api/recruiter/candidates/:id`            | Full candidate profile                                  |
| GET              | `/api/recruiter/applications`              | Filtered by stage/job/date                              |
| GET              | `/api/recruiter/applications/:id`          | Full detail                                             |
| PATCH            | `/api/recruiter/applications/:id/stage`    | Stage transition → triggers email + SSE                 |
| POST             | `/api/recruiter/applications/:id/match`    | Recompute match score                                   |
| GET/POST         | `/api/recruiter/interviews`                | List / Schedule                                         |
| GET/PATCH/DELETE | `/api/recruiter/interviews/:id`            | Detail / Edit / Cancel                                  |
| POST             | `/api/recruiter/interviews/:id/invite`     | Email candidate (with ICS attachment) + dashboard notif |
| GET/POST         | `/api/recruiter/assessments`               | List / Create                                           |
| GET/PATCH/DELETE | `/api/recruiter/assessments/:id`           | Detail / Edit / Archive                                 |
| GET/POST         | `/api/recruiter/assessments/:id/questions` | List / Add question                                     |
| POST             | `/api/recruiter/assessments/:id/assign`    | `{ applicationIds[] }` → send assessment links          |
| GET/POST         | `/api/recruiter/offers`                    | List / Generate                                         |
| GET/PATCH        | `/api/recruiter/offers/:id`                | Detail / Edit                                           |
| GET              | `/api/recruiter/offers/:id/pdf`            | Stream PDF bytes                                        |
| GET              | `/api/recruiter/dashboard`                 | All 8 widget data in one aggregated call                |
| GET              | `/api/recruiter/analytics/funnel`          | Stage counts for funnel chart                           |
| GET              | `/api/recruiter/analytics/time-to-hire`    | Avg days per stage                                      |
| GET              | `/api/recruiter/analytics/source-analysis` | Candidates by source                                    |
| GET              | `/api/recruiter/analytics/export`          | CSV download                                            |
| POST             | `/api/recruiter/emails`                    | Send manual email to candidate                          |

### Hiring Manager

| Method | Path                                           | Notes                                                                |
| ------ | ---------------------------------------------- | -------------------------------------------------------------------- |
| GET    | `/api/hiring-manager/shortlist`                | Shortlisted candidates + all feedback + side-by-side comparison data |
| POST   | `/api/hiring-manager/applications/:id/approve` | `{ decision, notes }` → advance or reject                            |

### Interviewer

| Method | Path                                     | Notes                                      |
| ------ | ---------------------------------------- | ------------------------------------------ |
| GET    | `/api/interviewer/assignments`           | My assigned interviews                     |
| GET    | `/api/interviewer/feedback`              | My submitted feedback                      |
| POST   | `/api/interviewer/feedback/:interviewId` | Submit scorecard (6 dimensions + comments) |

### Admin

| Method             | Path                           | Notes                                                 |
| ------------------ | ------------------------------ | ----------------------------------------------------- |
| GET/POST           | `/api/admin/users`             | List / Create user                                    |
| GET/PATCH          | `/api/admin/users/:id`         | Get / Update role or status                           |
| POST               | `/api/admin/users/:id/suspend` | Suspend account                                       |
| GET/POST/GET/PATCH | `/api/admin/companies`         | CRUD                                                  |
| GET                | `/api/admin/audit-logs`        | Paginated; filters: entity, userId, action, dateRange |
| GET/PATCH          | `/api/admin/settings`          | Platform settings                                     |
| GET                | `/api/admin/reports`           | Comprehensive platform report                         |

---

## 8. AI Pipeline Implementation

### Philosophy (Important — state this clearly in README)

> HirePilot uses a fully deterministic, explainable AI pipeline. No LLM is used. Every output is reproducible and inspectable. This is an intentional engineering decision for reliability and cost.

### Pipeline Files & Responsibilities

```
server/ai/
├── data/
│   ├── skill-taxonomy.json      1500+ skills, 12 categories, alias map
│   ├── question-bank.json       500+ questions by skill + difficulty
│   └── cover-letter-templates/  5 templates (engineering, design, management, marketing, generic)
├── resume-parser.ts             Entry: Buffer + mime → ParsedResume
├── section-detector.ts          Split raw text → named sections
├── field-extractor.ts           Regex: email, phone, name, GitHub, LinkedIn
├── skill-extractor.ts           Fuse.js fuzzy match + alias resolution
├── experience-estimator.ts      Date range parser → total years (float)
├── education-parser.ts          Degree level detection
├── match-scorer.ts              Pure function: (ParsedResume, Job) → MatchResult
├── cover-letter.ts              Template selection + substitution
├── interview-questions.ts       Question bank selection by skill + level
└── feedback-summarizer.ts       TF-IDF across multiple scorecards
```

### Resume Parse Pipeline

```ts
// resume-parser.ts
export async function parseResume(buffer: Buffer, mime: string): Promise<ParsedResume> {
  const rawText =
    mime === 'application/pdf'
      ? await pdfParse(buffer).then((r) => r.text)
      : await mammoth.extractRawText({ buffer }).then((r) => r.value);

  const sections = detectSections(rawText);
  const fields = extractFields(rawText); // email, phone, name, links
  const skills = extractSkills(sections.skills ?? rawText); // Fuse.js against taxonomy
  const yearsExp = estimateExperienceYears(sections.experience);
  const education = parseEducation(sections.education);

  return { rawText, sections, fields, skills, yearsExp, education };
}
```

### Match Scorer (Pure, Testable — 5 weighted dimensions)

```ts
// match-scorer.ts
export function scoreMatch(parsed: ParsedResume, job: Job): MatchResult {
  const skillOverlap = jaccardWeighted(parsed.skills, job.skillsRequired); // 0-1
  const expScore = sigmoid(parsed.yearsExp - job.experienceYears); // 0-1
  const eduScore = degreeMatch(parsed.education, job.experienceLevel); // 0-1
  const locScore = locationMatch(parsed.location, job.workMode); // 0-1
  const salScore = salaryOverlap(parsed.expectedSalary, job.salaryMin, job.salaryMax); // 0-1

  const total = Math.round(
    0.4 * skillOverlap + 0.25 * expScore + 0.15 * eduScore + 0.1 * locScore + 0.1 * salScore,
  );

  return {
    score: clamp(total, 0, 100),
    strongSkills: intersection(parsed.skills, job.skillsRequired),
    missingSkills: difference(job.skillsRequired, parsed.skills),
    weakAreas: detectWeaknesses(parsed, job),
    recommendations: buildRecommendations(parsed, job),
    breakdown: { skillOverlap, expScore, eduScore, locScore, salScore },
  };
}
```

### Interview Question Generation

```ts
// interview-questions.ts
export function generateQuestions(
  requiredSkills: string[],
  experienceLevel: ExperienceLevel,
  count = 10,
): Question[] {
  // Load question-bank.json
  // For each required skill: find matching questions from bank
  // Filter by experienceLevel (JUNIOR → easy+medium, SENIOR → medium+hard)
  // Mix behavioral + technical
  // Deduplicate + shuffle
  // Return top N
}
```

### Feedback Summarizer (TF-IDF)

```ts
// feedback-summarizer.ts
export function summarizeFeedback(feedbacks: Feedback[]): FeedbackSummary {
  const corpus = feedbacks.map((f) => f.comments).filter(Boolean);
  const tfidf = new natural.TfIdf();
  corpus.forEach((doc) => tfidf.addDocument(doc));
  // Extract top terms → map to human-readable themes
  // Compute average per dimension
  // Generate recommendation: STRONG_HIRE | HIRE | NO_HIRE
  return { avgScores, topThemes, recommendation };
}
```

### AI Testing Requirements

- ≥ 5 fixture tests per extractor (unit tests with known input → expected output)
- Golden test for `scoreMatch`: known `ParsedResume` + known `Job` → expected score ± 5
- Parser test against `tests/fixtures/resume.pdf` and `tests/fixtures/resume.docx`
- All AI functions must be pure (no side effects, no DB calls)

---

## 9. Email, PDF & Calendar Generation

### Email

- **React Email** component templates in `server/email/templates/*.tsx`
- **Resend SDK** wraps all sends: `resend.emails.send({ to, from, subject, react: <Template /> })`
- **Fallback**: `EMAIL_PROVIDER=console` → `console.log(renderToString(<Template />))` for local dev
- **Async**: all email sends go through `graphile-worker` queue (task: `send-email`) — never block the request
- **Required templates** (9 total): application-confirmation, shortlisted, interview-invite (with ICS), assessment-link, offer-letter, rejection, joining-instructions, email-verification, password-reset, 2fa-otp

### PDF Offer Letter

```ts
// server/pdf/render.ts
export async function renderOfferPDF(data: OfferData): Promise<string> {
  const doc    = <OfferLetterDocument {...data} />;
  const buffer = await renderToBuffer(doc);                 // @react-pdf/renderer
  const url    = await cloudinary.upload(buffer, 'offers'); // upload to Cloudinary
  return url;                                               // store on OfferLetter.pdfUrl
}
```

### ICS Calendar Generation

```ts
// server/calendar/ics.ts
import { createEvent, EventAttributes } from 'ics';

export function generateICS(interview: Interview & { candidate: User; interviewer: User }): string {
  const event: EventAttributes = {
    start: [
      /* parse interview.scheduledAt → [year, month, day, hour, min] */
    ],
    duration: { minutes: interview.durationMins },
    title: `Interview: ${interview.candidate.name}`,
    description: `Meeting link: ${interview.meetingLink}`,
    location: interview.meetingLink,
    organizer: { name: 'HirePilot', email: process.env.EMAIL_FROM! },
    attendees: [
      { name: interview.candidate.name, email: interview.candidate.email },
      { name: interview.interviewer.name, email: interview.interviewer.email },
    ],
  };
  const { value } = createEvent(event);
  return value!; // .ics string content
}
```

Attach the ICS string as `base64` attachment in the `interview-invite.tsx` email template via Resend's `attachments` field.

---

## 10. UI/UX Implementation Guide

### Design Tokens

```ts
// src/styles/tokens.ts
export const tokens = {
  brand: { primary: '#4F46E5', accent: '#10B981' },
  radius: { sm: 6, md: 10, lg: 16 },
  font: { sans: 'Inter', display: 'Cal Sans' },
};
```

### Component Rules (non-negotiable)

1. Every async surface has a `<Skeleton />` loading state
2. Every list has an `<EmptyState />` with an illustration + message + optional CTA
3. Every destructive action uses `<ConfirmDialog />` (two-click confirmation)
4. Every form has inline field validation + toast on submit success/error
5. Every page has a `not-found.tsx` fallback
6. Dark mode works on every single page (use Tailwind `dark:` variants throughout)

### Dashboard Shell Layout

```
┌───────────────────────────────────────────────────────────────────┐
│ Topbar: [logo] [⌘K search] [notification bell + badge] [user menu]│
├───────────────┬───────────────────────────────────────────────────┤
│ Sidebar       │ Page content (scrollable)                         │
│  ▸ Dashboard  │                                                   │
│  ▸ Jobs       │ <PageHeader title="" action={<Button />} />       │
│  ▸ Pipeline   │                                                   │
│  ▸ Candidates │ <Content />                                       │
│  ▸ Interviews │                                                   │
│  ▸ Assessments│                                                   │
│  ▸ Offers     │                                                   │
│  ▸ Analytics  │                                                   │
│  ▸ Settings   │                                                   │
└───────────────┴───────────────────────────────────────────────────┘
```

### Command Palette (⌘K)

| Keys | Action                          |
| ---- | ------------------------------- |
| `⌘K` | Open palette                    |
| `J`  | New Job                         |
| `C`  | New Candidate                   |
| `P`  | Open Pipeline                   |
| `?`  | Show keyboard shortcuts overlay |

### Assessment Take Environment (Full Screen)

```
┌──────────────────────────────────────────────────────────────────┐
│ [Assessment Name]     [Q 3 / 10]    [Timer: 23:45] [Submit All] │
├────────────────────────────────────┬─────────────────────────────┤
│ Question navigator (sidebar)       │ Question + Answer area       │
│ ● Q1 ✓ answered                   │                              │
│ ● Q2 ✓ answered                   │ [MCQ / Monaco Editor / SQL]  │
│ ● Q3 ← current                    │                              │
│ ○ Q4 unanswered                   │ [Next Question →]            │
│ ○ Q5 unanswered                   │                              │
└────────────────────────────────────┴─────────────────────────────┘
```

Tab switch: `document.addEventListener('visibilitychange', handler)` — warn at 1 switch, auto-submit at 3.

### AI Match Card UI (exactly as PS-2 specifies)

```
┌─────────────────────────────────┐
│  Overall Match: 87%             │
│  ████████████████░░  87/100     │
│                                 │
│  Strong Skills                  │
│  ✔ React  ✔ Node.js  ✔ MongoDB  │
│                                 │
│  Missing Skills                 │
│  ✖ AWS  ✖ Docker                │
│                                 │
│  Recommendation                 │
│  Good fit for interview.        │
└─────────────────────────────────┘
```

---

## 11. Testing Strategy

| Layer                  | Tool                     | Location                    | Target    |
| ---------------------- | ------------------------ | --------------------------- | --------- |
| AI/Domain logic        | Vitest                   | tests/unit/ai/              | ≥ 90%     |
| Services               | Vitest + test DB         | tests/integration/services/ | ≥ 80%     |
| API routes             | Vitest + supertest       | tests/integration/api/      | ≥ 70%     |
| Components             | Vitest + Testing Library | tests/unit/components/      | ≥ 70%     |
| E2E (4 critical flows) | Playwright               | tests/e2e/                  | 100% pass |

**4 Critical E2E Flows:**

1. `auth.spec.ts` — Signup → email verify → login as candidate
2. `resume-upload.spec.ts` — Upload PDF → parsed fields appear in profile
3. `apply-job.spec.ts` — Apply to job → application shows stage "Applied"
4. `recruiter-pipeline.spec.ts` — Recruiter moves candidate to next stage → candidate sees notification update

CI: unit + integration on every PR. E2E runs on push to `main`.

---

## 12. Local Dev Workflow

```bash
# 0. Prerequisites (one-time)
node --version    # must be >= 20.11
pnpm --version    # must be >= 9
docker --version  # any recent version

# 1. Clone + install
git clone https://github.com/YOUR_USERNAME/hirepilot.git
cd hirepilot
pnpm install

# 2. Start local infrastructure
docker compose -f infra/docker/docker-compose.yml up -d
# Starts: PostgreSQL 16 on :5432, Redis 7 on :6379

# 3. Configure environment
cp apps/web/.env.example apps/web/.env.local
# Minimum required for local dev (no external services):
#   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hirepilot
#   REDIS_URL=redis://localhost:6379
#   AUTH_SECRET=any-random-32-char-string
#   EMAIL_PROVIDER=console

# 4. Run migrations + seed
pnpm --filter web db:migrate   # runs prisma migrate dev
pnpm --filter web db:seed      # creates demo accounts + sample data

# 5. Start dev server
pnpm --filter web dev          # → http://localhost:3000

# 6. Verify
curl http://localhost:3000/api/health
# Expected: {"status":"ok","version":"1.0.0","db":"connected","redis":"connected"}
```

---

## 13. Deployment — Vercel + Railway

### Step 1: Railway (Database + Redis)

1. railway.app → New Project → Add PostgreSQL → copy `DATABASE_URL`
2. Add Redis → copy `REDIS_URL`
3. Run migrations from local against Railway DB:
   ```bash
   DATABASE_URL=<railway-url> pnpm --filter web db:migrate
   DATABASE_URL=<railway-url> pnpm --filter web db:seed
   ```

### Step 2: Vercel (Web App)

1. vercel.com → New Project → Import from GitHub → Set Root Directory: `apps/web`
2. Set ALL environment variables from `.env.example`
3. Deploy — Vercel auto-deploys on push to `main`

### Step 3: Post-Deploy Verification

```bash
# All checks must pass before submission
curl https://your-app.vercel.app/api/health    # status: ok
# Open live URL → no console errors
# Sign in with demo recruiter credentials → Kanban loads
# Sign in with demo candidate credentials → job board loads
# Lighthouse: >= 85 performance, >= 95 accessibility
```

### Environment Variables Required (full list)

```bash
# Database
DATABASE_URL=
REDIS_URL=

# Auth
AUTH_SECRET=                    # openssl rand -base64 32
NEXTAUTH_URL=                   # https://your-app.vercel.app

# OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Email
RESEND_API_KEY=
EMAIL_FROM=                     # noreply@yourdomain.com or onboarding@resend.dev

# Storage
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# App
NEXT_PUBLIC_APP_URL=            # https://your-app.vercel.app
NODE_ENV=production
```

---

## 14. Seed Data & Demo Accounts

The `prisma/seed.ts` script creates (print all to stdout — add to README):

| Role           | Email                 | Password      |
| -------------- | --------------------- | ------------- |
| Admin          | admin@hirepilot.dev   | Admin@12345   |
| Recruiter      | recruiter@acme.dev    | Recruiter@123 |
| Recruiter      | recruiter2@vercel.dev | Recruiter@123 |
| Hiring Manager | hm@acme.dev           | HiringMgr@123 |
| Interviewer    | interviewer@acme.dev  | Interview@123 |
| Candidate      | alice@candidate.dev   | Candidate@123 |
| Candidate      | bob@candidate.dev     | Candidate@123 |

**Seed also creates:**

- 3 companies (Acme Corp, Vercel Test Inc., HirePilot Demo Ltd.)
- 10 jobs across companies with varied requirements + skills
- 30 applications across all 8 stages (so every Kanban column has cards)
- 20 candidate profiles with parsed resume data
- 5 scheduled interviews
- 2 assessments (one with MCQ + one with CODE questions)
- 5 assessment attempts (mix of complete + in-progress)
- 2 offer letters (1 pending, 1 accepted)
- 50 notifications across users
- 100 audit log entries

---

## 15. Submission Package Checklist

### README.md must contain:

- [ ] Project name: **HirePilot** + Problem Statement: **DevFusion 4.O — PS-2**
- [ ] What the application does (2-3 paragraph description)
- [ ] Full tech stack: frontend, backend, DB, all third-party APIs
- [ ] Step-by-step local run instructions (exact commands)
- [ ] Complete list of all built features (grouped by module)
- [ ] Live deployment URL: `https://hirepilot.vercel.app`
- [ ] Team member names + roles
- [ ] All demo credentials (all 7 accounts above)
- [ ] Known bugs / limitations (be honest — judges value transparency)
- [ ] Architecture diagram (link to `docs/architecture/system-context.png`)
- [ ] ER diagram (link to `docs/er-diagram.png`)

### Repository must contain:

- [ ] `README.md` at root level (mandatory — no README = not evaluated)
- [ ] Public repository at time of submission
- [ ] Genuine incremental commit history (one feature per commit, never a 50-file dump)
- [ ] `.env.example` with all variables documented (no real values)
- [ ] `docs/er-diagram.png` — generate from dbdiagram.io or Prisma Studio
- [ ] `docs/architecture/system-context.png` — C4 diagram from draw.io
- [ ] `docs/api/openapi.yaml` — generated by `pnpm run generate:openapi`
- [ ] Postman collection exported as JSON
- [ ] Demo video (3–5 minutes, recorded with OBS or Loom)

---

## 16. 6-Day Plan (Realistic, Hourly)

> **Day 0 = 08 Aug (today)**. Deadline: check Unstop for exact time.
> Day 0 focuses ONLY on foundations — no features. Features start Day 1.

### Day 0 — Foundations Only (8h)

```
Hours 1-2:   pnpm workspace + Turbo + ESLint + Prettier + Husky setup
             tsconfig strict mode, tailwind config, shadcn/ui init
Hours 3-5:   Write ALL 25 Prisma models in schema.prisma
             docker-compose up → prisma migrate dev → first migration works
Hours 6-7:   Auth.js v5 config (Google + Credentials providers)
             Login page + Signup page working
             middleware.ts protecting (app)/ routes
Hour 8:      Landing page hero + navbar (just enough to look real)
             git commit: "feat: monorepo scaffold + db schema + auth"
```

### Day 1 — Auth Complete + Core Data (8h)

```
Hours 1-2:   Email verification flow (send token, /verify-email page)
             Forgot password + reset password flow
Hours 3-4:   Landing page complete: all 6 sections (hero, features, testimonials, pricing, faq, contact)
             Responsive navbar + dark mode toggle
Hours 5-6:   Companies CRUD (recruiter only)
             Company profile page with all spec fields
Hours 7-8:   Jobs CRUD (recruiter): create, edit, close, duplicate, delete
             Public job board for candidates with filters
             git commit: "feat: auth complete + jobs CRUD + public job board"
```

### Day 2 — Resume AI + Application Pipeline (8h)

```
Hours 1-2:   Resume upload to Cloudinary (file type + size validation)
             pdf-parse + mammoth text extraction
Hours 3-4:   section-detector + field-extractor + skill-extractor
             Profile auto-populate from parsed resume
Hours 5-6:   match-scorer implementation with all 5 dimensions
             match-card.tsx UI (exactly as spec shows: % + skills + recommendation)
Hours 7-8:   Apply-to-job flow (candidate) + application confirmation email
             Kanban board with @dnd-kit (drag between stages)
             Stage transition → email + SSE notification
             git commit: "feat: resume AI pipeline + application workflow + kanban"
```

### Day 3 — Interview + Assessment + Offer (8h)

```
Hours 1-2:   Interview scheduler form (select candidate, interviewer, date/time, link)
             ICS file generation + email to candidate with ICS attachment
Hours 3-4:   Interview feedback scorecard (6 dimensions + comments)
             Hiring manager side-by-side feedback comparison view
Hours 5-6:   Coding assessment builder (MCQ + CODE + SQL + DEBUG question types)
             Assessment take environment (full-screen: timer + tab-switch-guard + navigator)
             Auto-submit on timer expiry + tab limit breach
Hours 7-8:   Offer letter PDF generation (@react-pdf/renderer)
             Accept / Reject offer flow (candidate)
             git commit: "feat: interviews + assessments + offer letters"
```

### Day 4 — Dashboards + 2FA + Notifications (8h)

```
Hours 1-2:   2FA setup flow (TOTP secret + QR code + verify + enable)
             Device session list + revoke
             /settings/security page
Hours 3-4:   SSE emitter (server/sse/emitter.ts)
             /api/sse route + useSSE hook on client
             Notification bell + dropdown + mark-as-read
Hours 5-6:   Recruiter dashboard: all 8 stat widgets + Recharts funnel + monthly chart
             Candidate dashboard: profile completion + applied jobs + upcoming interviews
Hours 7-8:   Admin panel: users + audit logs + companies
             Hiring manager dashboard + shortlist view
             Interviewer dashboard + assignments
             git commit: "feat: dashboards + 2FA + real-time notifications"
```

### Day 5 — Deploy + Polish (8h)

```
Hours 1-2:   Deploy Postgres + Redis to Railway
             Deploy web app to Vercel
             Set all env vars, run migrations against Railway DB
Hours 3-4:   Seed production DB with all demo data
             Verify all major flows work on live URL
             Fix any broken endpoints found in production
Hours 5-6:   Dark mode final pass (every page)
             Skeleton loaders on every list + card
             Empty states with illustrations everywhere
             ⌘K command palette
Hours 7-8:   GitHub Actions CI: lint + typecheck + unit tests on push
             Playwright E2E 4 critical flows green
             Lighthouse audit → fix any < 85 performance issues
             git commit: "feat: deploy + polish + CI"
```

### Day 6 — Submission Package (8h)

```
Hours 1-2:   README.md: all required sections + demo credentials + screenshots
             docs/er-diagram.png: generate from dbdiagram.io
             docs/architecture/system-context.png: draw.io C4 diagram
Hours 3-4:   pnpm run generate:openapi → commit docs/api/openapi.yaml
             Export Postman collection as JSON → commit
             docs/adr/0001-*.md + 0002-*.md + 0003-*.md
Hours 5-6:   Record demo video (3-5 min with OBS/Loom)
             Walkthrough: landing → signup → upload resume → apply → recruiter kanban → assessment → offer
Hours 7-8:   BUFFER — final bug fixes found during video recording
             Final check: repo is public, live link works, README complete
             git log --oneline review (commit messages must be readable)
             SUBMIT on Unstop: GitHub URL + live URL
```

---

## 17. Risk Register

| ID   | Risk                                        | Probability | Impact | Mitigation                                                                                   |
| ---- | ------------------------------------------- | ----------- | ------ | -------------------------------------------------------------------------------------------- |
| R-1  | Railway free-tier connection limits         | Med         | High   | `?pgbouncer=true` in DATABASE_URL; Prisma pool size 5                                        |
| R-2  | Cloudinary quota exceeded during demo       | Low         | Med    | Local FS fallback (`storage/local.ts`); monitor 25GB                                         |
| R-3  | Resend rate limit hit                       | Low         | Med    | graphile-worker queue with retry; console fallback                                           |
| R-4  | Vercel cold start slow on first judge visit | Med         | Low    | Warm with curl 1 min before demo; ISR for public pages                                       |
| R-5  | Resume parser mis-parses edge-case PDF      | Med         | Med    | Heuristic + manual override in profile form                                                  |
| R-6  | Kanban DnD broken on Safari/mobile          | Low         | Med    | Test with Playwright on Chrome + Safari                                                      |
| R-7  | Monaco editor slow load                     | Med         | Med    | Lazy load with React.lazy + Suspense; show spinner                                           |
| R-8  | AI score looks "too simple" to judges       | Med         | High   | Show explainability: breakdown panel with all 5 dimension scores; ADR-0002 explains decision |
| R-9  | Day 3 assessment module overruns            | High        | High   | Tab-switch guard is the hardest part — if overrun, ship MCQ only first                       |
| R-10 | 2FA blocks demo if misconfigured            | Low         | High   | Test with real authenticator app on Day 4; have backup codes in seed                         |
| R-11 | Disqualification: code looks AI-generated   | Low         | Fatal  | Commit in small reviewable units; small patches; review every file before committing         |
| R-12 | Submit late                                 | Low         | Fatal  | Day 6 has 2h explicit buffer; README draft starts Day 4                                      |

---

## 18. Hackathon Compliance

- Follow the official DevFusion 4.O rules throughout development.
- Do not use prohibited AI code-generation tools or workflows.
- Do not reuse prohibited templates, projects, or codebases.
- Keep the repository history genuine and attributable to the team.
- Review all dependencies and third-party services before submission.
- Ensure the final repository and demo comply with all submission requirements.

---

_Blueprint locked. Start with Day 0. Push your first commit in the next 2 hours._
_When reality diverges from this plan, update this file and keep going._
