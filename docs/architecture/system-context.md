```mermaid
flowchart TB
    %% Client Layer
    subgraph Client["Browser (Vercel Edge)"]
        LP[("Landing Page<br/>7 sections")]
        JB["Public Job Board<br/>filters + search"]
        AUTH["/login /signup<br/>password reset"]
        DASH["Role-based dashboards"]
        RG[("Recruiter Pipeline<br/>Kanban + drag-drop")]
        AP["Candidate Apply<br/>flow + cover letter"]
        PR["Resume Upload<br/>+ Match Score"]
        OF["Offer Letter<br/>PDF accept/decline"]
    end

    %% Edge Layer
    subgraph Edge["Vercel Edge Runtime"]
        M["middleware.ts<br/>auth + RBAC guard"]
        DR["Next.js Route Handlers<br/>/api/* (Node serverless)"]
    end

    %% Backend Services
    subgraph Services["Backend Services (apps/web/src/server)"]
        AUTH_SVC["auth.ts<br/>Auth.js v4 + JWT"]
        JOB_SVC["jobs.service.ts<br/>CRUD + RBAC + state machine"]
        APP_SVC["applications.service.ts<br/>apply/accept/reject"]
        INTV_SVC["interviews.service.ts<br/>schedule + .ics"]
        OFF_SVC["offers.service.ts<br/>PDF + accept/reject"]
        RES_SVC["resume.service.ts<br/>parse + upload + profile sync"]
        AI["AI Pipeline<br/>deterministic, no LLM"]
    end

    %% AI Pipeline
    subgraph AI["AI Modules (src/server/ai)"]
        PARSE["resume-parser.ts<br/>pdf-parse + mammoth"]
        SECT["section-detector.ts<br/>regex-based"]
        FIELD["field-extractor.ts<br/>email/phone/links"]
        SKILL["skill-extractor.ts<br/>Fuse.js + 200-skill taxonomy"]
        MATCH["match-scorer.ts<br/>5-dim weighted (55/30/15)"]
    end

    %% Data Layer
    subgraph Data["Neon Postgres (prod)"]
        DB[("25 models<br/>AuditLog<br/>Resume<br/>OfferLetter<br/>Application<br/>Job<br/>User")]
    end

    %% External
    subgraph Ext["External Services"]
        EMAIL["Console (dev)<br/>Resend (prod)"]
        PDF["@react-pdf/renderer<br/>server-side"]
        FS["Local FS (dev)<br/>Cloudinary (prod)"]
    end

    %% Edges
    Client --> M
    M --> DR
    DR --> SERVICES
    SERVICES --> DB
    RES_SVC --> AI
    AI --> PARSE
    AI --> SECT
    AI --> FIELD
    AI --> SKILL
    AI --> MATCH
    OFF_SVC --> PDF
    RES_SVC --> FS
    AUTH_SVC --> EMAIL
    JOB_SVC --> DB
    APP_SVC --> DB
    INTV_SVC --> DB
    OFF_SVC --> DB
    RES_SVC --> DB

    %% Styling
    classDef client fill:#dbeafe,stroke:#3b82f6,color:#1e40af
    classDef edge fill:#fef3c7,stroke:#f59e0b,color:#92400e
    classDef services fill:#f3e8ff,stroke:#8b5cf6,color:#5b21b6
    classDef ai fill:#dcfce7,stroke:#16a34a,color:#14532d
    classDef data fill:#fee2e2,stroke:#dc2626,color:#7f1d1d
    classDef ext fill:#f5f5f4,stroke:#78716c,color:#1c1917

    class LP,JB,AUTH,DASH,RG,AP,PR,OF client
    class M,DR edge
    class AUTH_SVC,JOB_SVC,APP_SVC,INTV_SVC,OFF_SVC,RES_SVC services
    class PARSE,SECT,FIELD,SKILL,MATCH,AI ai
    class DB,Data data
    class EMAIL,PDF,FS,Ext ext
```

## Component responsibilities

| Layer               | Responsibility                                         | Tech                                                 |
| ------------------- | ------------------------------------------------------ | ---------------------------------------------------- |
| **Browser**         | All user-facing UI, drag-drop, real-time feedback      | Next.js 15 App Router, React 19, Tailwind, shadcn/ui |
| **Edge middleware** | Auth check, redirect unauthenticated from `/app/*`     | Next.js middleware + Auth.js callbacks               |
| **Route handlers**  | JSON API for `/api/*` (upload, stage move, send offer) | Next.js Route Handlers, Zod                          |
| **Services**        | Business logic, RBAC, state machine, transactions      | Prisma 5 + raw SQL helpers                           |
| **AI pipeline**     | Resume parsing, skill extraction, match scoring        | pdf-parse, mammoth, fuse.js, natural                 |
| **Data**            | Source of truth                                        | Neon Postgres (prod) / Docker (dev)                  |
| **External**        | Email, PDF rendering, file storage                     | Resend, @react-pdf/renderer, Cloudinary              |

## Data flow (apply → hire)

```
candidate uploads PDF
  → POST /api/me/resume
  → pdf-parse extracts text
  → section-detector → field-extractor → skill-extractor
  → candidate profile auto-populated
candidate browses /jobs
  → clicks a job
  → /jobs/[id] computes MatchCard in real-time
  → candidate clicks Apply
  → POST /api/jobs/[id]/apply
  → application row created (stage=APPLIED)
recruiter sees in pipeline
  → drag card to TECH_INTERVIEW
  → PATCH /api/recruiter/applications/[id]/stage
  → stage machine validates, audit log row, notification to candidate
recruiter schedules interview
  → POST /api/recruiter/interviews
  → ICS file generated, emailed to candidate + interviewers
recruiter sends offer
  → POST /api/recruiter/offers
  → @react-pdf renders branded PDF
  → PDF stored as data URL, application moves to OFFER stage
candidate accepts
  → POST /api/candidate/offers/[id]/accept
  → application → HIRED, offer → ACCEPTED
```
