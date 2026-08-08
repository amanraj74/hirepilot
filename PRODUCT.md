# HirePilot — Product Specification

> **AI-Powered Recruitment & Applicant Tracking System**
> Built for **DevFusion 4.O — The Developers Hackathon** (Round 3)
> Problem Statement: **PS-2 — AI-Powered Recruitment & ATS**
> Stack: Next.js 15 · TypeScript · PostgreSQL · Prisma · Auth.js · Cloudinary · Resend
> All services: **free tier, no credit card required**

---

## 1. Elevator Pitch

HirePilot is a production-grade Applicant Tracking System where recruiters post jobs, candidates upload resumes, and **deterministic AI** parses the resume, scores the match against the job, explains strengths and gaps in plain language, and routes the candidate through a 7-stage pipeline on a draggable Kanban board. Interviewers leave structured feedback, hiring managers compare it side-by-side, and offers are generated as branded PDFs. No paid LLM APIs. No placeholder UI. Every button in the screenshots below works on the deployed URL.

## 2. Personas & Primary Jobs-to-be-Done

| Persona                 | Goal in 60 seconds                                                 | Primary surface                        |
| ----------------------- | ------------------------------------------------------------------ | -------------------------------------- |
| **Recruiter Riya**      | Post a job, see ranked candidates, schedule 3 interviews           | Recruiter dashboard + Pipeline Kanban  |
| **Candidate Arjun**     | Upload resume, find a job, apply, see status                       | Candidate portal + Application tracker |
| **Hiring Manager Hema** | Approve shortlist, compare interviewer feedback, sign off on offer | Shortlist view + Decision panel        |
| **Interviewer Ishaan**  | Open assigned interview, submit structured scorecard               | Interview feedback form                |
| **Admin Adi**           | Manage users, companies, audit, feature flags                      | Admin panel                            |

## 3. Roles & Permission Matrix

| Capability                 | Candidate | Recruiter | Hiring Mgr | Interviewer | Admin |
| -------------------------- | :-------: | :-------: | :--------: | :---------: | :---: |
| View own profile           |     ✓     |     ✓     |     ✓      |      ✓      |   ✓   |
| Upload resume              |     ✓     |     –     |     –      |      –      |   –   |
| Apply to job               |     ✓     |     –     |     –      |      –      |   –   |
| View own applications      |     ✓     |     –     |     –      |      –      |   –   |
| Post / edit jobs           |     –     |     ✓     |     ✓      |      –      |   ✓   |
| View all candidates        |     –     |     ✓     |     ✓      |      –      |   ✓   |
| Move candidate on Kanban   |     –     |     ✓     |     ✓      |      –      |   ✓   |
| Schedule interview         |     –     |     ✓     |     –      |      –      |   ✓   |
| Submit interview feedback  |     –     |     –     |     –      |      ✓      |   –   |
| Compare feedback / approve |     –     |     –     |     ✓      |      –      |   ✓   |
| Generate offer letter      |     –     |     ✓     |     –      |      –      |   ✓   |
| Accept / reject offer      |     ✓     |     –     |     –      |      –      |   –   |
| Manage users / roles       |     –     |     –     |     –      |      –      |   ✓   |
| Manage companies           |     –     |     –     |     –      |      –      |   ✓   |
| View audit log             |     –     |     –     |     –      |      –      |   ✓   |
| Manage platform settings   |     –     |     –     |     –      |      –      |   ✓   |
| Take coding assessment     |     ✓     |     –     |     –      |      –      |   –   |
| Create coding assessment   |     –     |     ✓     |     –      |      –      |   ✓   |

## 4. Core User Flows

### 4.1 Recruiter: post job → screen → schedule → offer (the demo flow)

```
1. Recruiter signs up → completes company profile
2. Clicks "New Job" → wizard (title, dept, location, salary,
   skills, JD) → publishes
3. Candidates apply → "Applications: 12" widget updates live
4. Recruiter opens Pipeline → 7-column Kanban
5. Drags candidate from "Screening" → "Shortlisted"
6. Opens candidate → sees AI Resume Match card:
      Overall Match: 87%
      Strong: React, Node.js, MongoDB, TypeScript
      Missing: AWS, Docker
      Recommendation: Good fit for interview
7. Clicks "Schedule Interview" → picks interviewer + slot →
   meeting URL auto-generated → invitation email sent
8. Interviewer submits scorecard (technical, comm, problem-solving…)
9. Hiring manager sees side-by-side comparison → approves
10. Recruiter generates offer letter PDF → candidate receives
    email → accepts → stage flips to "Hired"
```

### 4.2 Candidate: upload → apply → track

```
1. Signs up via email or Google → uploads resume (PDF/DOCX)
2. Resume parsed in ~2s → profile auto-populated
   (name, email, phone, skills, experience, education)
3. Profile Completion widget shows 92%
4. Browses Jobs → filters by Location / Remote / Skills / Salary
5. Opens a job → clicks Apply → cover letter field
   (AI-suggested) → submits
6. Application appears in "My Applications" with stage chip
7. Receives in-app notification when stage changes
8. Receives email for interview invitation
9. Accepts / rejects offer from the same page
```

### 4.3 Interviewer: feedback

```
1. Sees assigned interview on dashboard
2. Opens interview detail → structured form
3. Rates 6 dimensions 1–5 + adds comments
4. Submits → visible to hiring manager immediately
```

### 4.4 Admin: audit + control

```
1. Audit log shows every privileged action
2. Can disable users, change roles, manage feature flags
3. Sees platform-wide metrics (MRR-style placeholders OK)
```

## 5. Application Workflow (the Kanban states)

```
Applied ──► Screening ──► Shortlisted ──► Tech Interview ──► HR Interview ──► Offer ──► Hired
                                                       │
                                                       └─► Rejected (from any stage)
```

- Each transition writes an `ApplicationStageEvent` (audit trail).
- Each transition triggers a notification (in-app + email where appropriate).
- Recruiters and Hiring Managers can drag-and-drop; candidates see read-only status.

## 6. Information Architecture

### 6.1 Public site

```
/                       Landing (hero, features, testimonials, pricing, FAQ, contact)
/pricing
/about
/blog                   (3 seed posts)
/login
/signup
/forgot-password
/reset-password?token=
/verify-email?token=
/jobs                   Public job board
/jobs/[id]              Public job detail
/jobs/[id]/apply        Application form
```

### 6.2 Authenticated app (`/app/*`)

```
/app                    Role-aware dashboard (router to correct dashboard)
/app/profile            Edit profile + resume
/app/applications       Candidate: my applications
/app/applications/[id]  Application detail
/app/jobs/manage        Recruiter: my jobs (table + filters)
/app/jobs/new           Job creation wizard
/app/jobs/[id]/edit
/app/candidates         Recruiter: candidate search
/app/candidates/[id]    Candidate profile + AI match card
/app/pipeline           Kanban board
/app/pipeline/[jobId]   Pipeline scoped to one job
/app/interviews         Interview list
/app/interviews/[id]    Interview detail + feedback form
/app/assessments        Coding assessment list
/app/assessments/[id]/take   Candidate: take test
/app/assessments/[id]/results Recruiter: results
/app/offers             Offer letter list
/app/offers/[id]        Offer detail + accept/reject
/app/companies          Company management
/app/companies/[id]
/app/settings           Personal settings + theme
/app/admin              Admin overview
/app/admin/users
/app/admin/companies
/app/admin/audit
/app/admin/settings
```

## 7. Data Model (Prisma)

> Single PostgreSQL database. Key entities listed; full Prisma schema in `apps/web/prisma/schema.prisma`.

```prisma
// Auth & people
model User          { id, email, emailVerified, name, image, passwordHash,
                      role (Candidate|Recruiter|HiringManager|Interviewer|Admin),
                      companyId?, createdAt, lastLoginAt }
model Account       { OAuth provider linkage }
model Session       { active sessions, device fingerprint }
model VerificationToken { email verify, password reset }

// Company
model Company       { id, name, slug, logo, website, industry, size,
                      description, socials (Json), locations (Json),
                      ownerId }

// Profile
model CandidateProfile  { userId, phone, location, headline, summary,
                           education (Json), experience (Json),
                           skills (String[]), certifications (Json),
                           portfolio, github, linkedin,
                           resumeUrl, resumeFileId, resumeUpdatedAt,
                           coverLetterTemplate, aiSuggestions (Json),
                           profileCompletion (Int) }
model RecruiterProfile  { userId, title, department, seniority }

// Jobs
model Job           { id, companyId, recruiterId, title, department,
                      location, salaryMin, salaryMax, salaryCurrency,
                      experienceYears, experienceLevel, skillsRequired (String[]),
                      employmentType (Full|Part|Contract|Intern),
                      workMode (Remote|Hybrid|Onsite),
                      description (rich text), requirements (rich text),
                      benefits (rich text),
                      status (Draft|Open|Paused|Closed|Filled),
                      publishedAt, deadline, createdAt, updatedAt }

// Resume pipeline
model ResumeFile    { id, candidateId, url, publicId, mimeType,
                      sizeBytes, originalName, version, rawText,
                      parsedData (Json), parseStatus (Pending|Parsed|Failed),
                      parseError, uploadedAt }
model ResumeAnalysis { id, resumeFileId, jobId?, score, strongSkills,
                       missingSkills, weakAreas, recommendations,
                       breakdown (Json), createdAt }

// Application
model Application   { id, jobId, candidateId, stage (enum 8 values),
                      source, coverLetterText, currentResumeId,
                      matchScore, createdAt, updatedAt, decidedAt }
model ApplicationStageEvent { id, applicationId, fromStage, toStage,
                              actorId, note, createdAt }

// Interview
model Interview     { id, applicationId, type (Phone|Technical|HR|Onsite),
                      scheduledAt, durationMin, meetingUrl, location?,
                      status (Scheduled|Completed|Cancelled|NoShow),
                      createdAt }
model InterviewParticipant { interviewId, userId, role }
model InterviewFeedback { id, interviewId, interviewerId,
                          technicalSkills (Int 1-5), communication (Int),
                          problemSolving (Int), teamwork (Int),
                          leadership (Int), overallRating (Int),
                          comments, recommendation (StrongHire|Hire|NoHire|StrongNoHire),
                          submittedAt }

// Assessments (lightweight)
model Assessment        { id, jobId?, title, type (MCQ|Coding),
                          durationMinutes, passingScore, problems (Json),
                          createdAt }
model AssessmentAttempt { id, assessmentId, candidateId, applicationId?,
                          startedAt, submittedAt?, answers (Json),
                          score, status, tabSwitches (Int) }

// Offer
model OfferLetter  { id, applicationId, candidateNameSnapshot,
                     roleSnapshot, salary, salaryCurrency, joiningDate,
                     location, benefits (Json), bodyMarkdown,
                     pdfUrl, status (Draft|Sent|Accepted|Rejected|Rescinded),
                     sentAt?, respondedAt?, createdAt }

// Notifications
model Notification { id, userId, type, title, message, link, read,
                     createdAt }

// Audit & system
model AuditLog    { id, actorId?, action, resource, resourceId,
                    ip, userAgent, metadata (Json), createdAt }
model Settings    { singleton, json blob (feature flags, limits) }
```

## 8. AI Pipeline (deterministic, zero paid APIs)

> This is the **15%** judging weight. Implemented as 4 stages, all offline.

### Stage 1 — Text extraction

- PDF: `pdf-parse` → raw text
- DOCX: `mammoth.extractRawText` → raw text
- Max 10MB (enforced before read)

### Stage 2 — Section detection

- Regex-driven header detection for: `EDUCATION`, `EXPERIENCE`, `SKILLS`, `PROJECTS`, `CERTIFICATIONS`, `LANGUAGES`, `SUMMARY`, `CONTACT`
- Each section becomes a string slice for downstream extractors

### Stage 3 — Field extraction

- **Email**: RFC-ish regex
- **Phone**: international regex + heuristic country detection
- **Name**: first non-empty line with 2–3 capitalized words, no digits
- **Skills**: fuzzy match (Fuse.js, threshold 0.3) against `skill-taxonomy.json` (1500+ skills, 12 categories, with aliases)
- **Education**: section parsing + degree keywords (B.Tech, M.S., PhD, etc.) + year range extraction
- **Experience**: section parsing + "X years" / date range heuristics → total years
- **Languages**: keyword match against ISO 639-1 set

### Stage 4 — Match scoring (against a specific Job)

```
score  =  0.40 × skill_overlap    (Jaccard, weighted by job-required importance)
        + 0.25 × experience_score (sigmoid on years vs required)
        + 0.15 × education_score  (degree level mapping)
        + 0.10 × location_score   (Remote OK / Hybrid / Onsite match)
        + 0.10 × salary_score     (overlap of expected vs range)
        → clamped [0, 100], rounded to int
```

Outputs:

- `score: 87`
- `strongSkills: ["React","Node.js","MongoDB","TypeScript"]`
- `missingSkills: ["AWS","Docker"]`
- `weakAreas: ["Limited cloud experience"]`
- `recommendations: ["Consider AWS training before interview"]`

### Bonus AI features (deterministic)

- **Cover letter generator**: template with `{role}` `{company}` `{topSkill}` `{yearsExp}` substitution + sentence reorder by detected seniority
- **Interview question generator**: question bank tagged by skill, draws N questions from job's required skills
- **Feedback summarizer**: keyword extraction across multiple scorecards + per-dimension average

## 9. Email Templates (Resend)

| Trigger              | Template               | Recipients               |
| -------------------- | ---------------------- | ------------------------ |
| Welcome              | `welcome`              | New user                 |
| Email verify         | `verify-email`         | New user                 |
| Password reset       | `password-reset`       | Requester                |
| Application received | `application-received` | Candidate                |
| Stage change         | `stage-update`         | Candidate                |
| Interview scheduled  | `interview-invitation` | Candidate + Interviewers |
| Assessment link      | `assessment-link`      | Candidate                |
| Offer letter sent    | `offer-sent`           | Candidate                |
| Rejection            | `rejection`            | Candidate                |

All templates use MJML → HTML, are dark-mode-safe, branded with company logo.

## 10. UI/UX Standards

- **Design system**: shadcn/ui + Tailwind v4 + custom design tokens (`apps/web/src/styles/tokens.ts`)
- **Theme**: dark + light, persisted per-user, system-default detection
- **Layout**: dashboard shell with collapsible sidebar, command palette (⌘K), keyboard shortcuts overlay
- **Components**: Skeleton loaders on every async surface, empty states with illustration, toast notifications (Sonner)
- **Drag-drop**: `@dnd-kit` for Kanban (touch + keyboard accessible)
- **Charts**: Recharts for dashboards (line, bar, donut, sparkline)
- **Accessibility**: WCAG 2.1 AA targets — focus rings, ARIA labels, contrast 4.5:1
- **Responsive**: mobile-first, breakpoints sm/md/lg/xl
- **Animation**: Framer Motion for entrance + state transitions (respect `prefers-reduced-motion`)

## 11. Security Posture

- Passwords: Argon2id (preferred) or bcrypt cost 12
- Sessions: HTTP-only `Secure` cookies, JWT access + refresh, rotation
- CSRF: double-submit token on state-changing requests
- XSS: React default escaping + DOMPurify on any rich-text render
- Rate limiting: per-IP + per-user on auth and upload endpoints (Redis-backed token bucket)
- File upload: MIME sniff + magic bytes check + ClamAV optional hook (deferred)
- RBAC: middleware on every API route; never trust client claims
- Audit log: every write to User, Role, Job, Application, OfferLetter, Setting, Assessment is logged
- Secrets: `.env.example` checked in; `.env` gitignored; Vercel + Railway env vars for prod

## 12. Non-Functional Targets

| Metric                      | Target             |
| --------------------------- | ------------------ |
| First contentful paint      | < 1.5 s            |
| Largest contentful paint    | < 2.5 s            |
| API p95 (read)              | < 200 ms           |
| API p95 (write)             | < 500 ms           |
| Resume parse                | < 3 s for 10MB PDF |
| Concurrent users (demo)     | 100                |
| Uptime target (demo window) | 99%                |
| Lighthouse (perf)           | ≥ 85               |
| Lighthouse (a11y)           | ≥ 95               |

## 13. Out of Scope (call out honestly in README)

- WebSocket-powered **live collaborative notes** (deferred — SSE used for notifications instead)
- **2FA / OTP** (schema hook reserved; not wired to UI in v1)
- **Plagiarism detection** in coding assessments (out of time)
- **Live collaborative whiteboard** for interviews
- **Calendar sync** (Google/Microsoft) — schema reserved
- **Multi-language UI** (English only)
- **PWA / offline mode**
- **Mobile native** (web responsive only)
- **Real-time WebSocket chat** between recruiter and candidate (in-app notification only)

## 14. Judging-Criterion Coverage Map

| Criterion (weight)                | Where we earn it                                                                      |
| --------------------------------- | ------------------------------------------------------------------------------------- |
| Core Functionality (30%)          | All 7 Kanban stages, all 5 roles, end-to-end apply→hire flow working                  |
| AI Features & Innovation (15%)    | Deterministic parsing + matching pipeline + 3 bonus AI helpers, all visible on the UI |
| UI/UX Design (15%)                | Dark/light theme, polished dashboards, Kanban, command palette, accessibility         |
| Code Quality & Architecture (15%) | Clean Architecture, TypeScript strict, monorepo, ~80% test coverage on domain         |
| Authentication & Security (10%)   | Auth.js + Google OAuth + Argon2 + RBAC + audit log                                    |
| Database Design (5%)              | Normalized schema, proper indexes, FK constraints, soft delete on critical entities   |
| Performance & Scalability (5%)    | Pagination, caching, query optimization, ISR for public pages                         |
| Deployment & Documentation (5%)   | Vercel + Railway live, README + ARCHITECTURE + ADR + API docs                         |

---

_This product spec is the contract. Any deviation must be agreed in writing (PR + this file updated)._
