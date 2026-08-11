# HirePilot Demo Video Script (3-5 minutes)

**How to record this:**

1. Open **Loom** (free) at https://www.loom.com
2. Click "Record" → "Screen Only" (no camera needed for a clean demo)
3. Paste each section's "WHAT TO SAY" into the script
4. Keep the cursor slow so judges can follow
5. Stop recording, copy the Loom URL into the README's `## Demo video` section

---

## SCRIPT

### [0:00] OPENING (15 seconds)

**Show:** the live URL bar (Chrome address bar): `hirepilot-aman.vercel.app`

**WHAT TO SAY:**

> "Hi, this is HirePilot — an AI-powered Applicant Tracking System built for DevFusion 4.O, Problem Statement 2. This is the live deployment on Vercel, running on Neon Postgres. Let me walk you through the full flow in under 4 minutes."

---

### [0:15] LANDING PAGE (30 seconds)

**Action:** Press Enter → arrive on the homepage. Scroll slowly down through all 7 sections.

**WHAT TO SAY:**

> "Here's the landing page with 7 sections — hero, features, how-it-works, testimonials, pricing, FAQ, and a final CTA. Note the deterministic-AI tagline: no LLM, no API bills, fully explainable. Every claim here is backed by a real working feature."

---

### [0:45] PUBLIC JOB BOARD (45 seconds)

**Action:** Click "Browse open jobs". Land on `/jobs`. Show 10 seeded jobs.

**WHAT TO SAY:**

> "The public job board shows 10 real jobs across 3 companies — HirePilot Demo, Acme Corp, Northwind Tech. Each job has a salary range, work mode, employment type, and 5+ skills. The filter sidebar works in real time — let me show by filtering for 'Remote' + 'Full-time'."

> _Click "Remote", "Full-time" → list updates live_

> "Same endpoint, no separate search API. Built on PostgreSQL with the same Prisma client that powers the rest of the app."

---

### [1:30] CANDIDATE FLOW (60 seconds)

**Action:** Click any job. Land on `/jobs/[id]`. Show the AI MatchCard in the sidebar.

**WHAT TO SAY:**

> "Here's the job detail. The right sidebar shows a real-time AI match card. Let me sign in as a candidate and see the match score update in real time."

> _Sign in: `arjun.candidate@test.dev` / `Demo@12345`_

> "And now — the match card shows a real match score with the deterministic algorithm: 200-skill taxonomy fuzzy-matched against the job, weighted across 5 dimensions. The score is honest because there's no LLM — just transparent math. Notice the breakdown: skill overlap 75%, experience 80%, education 50%."

> _Click "Apply for this role"_

> "Apply flow writes to the database and the application is created. No page reload, instant feedback."

---

### [2:30] RECRUITER FLOW (60 seconds)

**Action:** Sign out, sign in as `recruiter@hirepilot.dev` / `Demo@12345`. Land on `/recruiter/dashboard`. Then click "Pipeline".

**WHAT TO SAY:**

> "Now the recruiter side. Dashboard shows stats, charts, and a 7-stage pipeline with 15 applications already distributed across stages. Let me drag this application from 'Tech Interview' to 'Offer' — this is the Kanban with full state machine validation."

> _Drag a card across columns_

> "Optimistic UI, audit log entry created, candidate gets a notification, and the stage history records who moved what and when. The state machine prevents invalid transitions — try dragging from HIRED and it'll be rejected."

> _Click "Schedule interview" on a card_

> "Now scheduling a Technical interview. I pick the candidate, time, add interviewers. Submitting creates the interview, generates a real RFC 5545 .ics file, emails it to the candidate and every interviewer, and creates in-app notifications for everyone."

---

### [3:30] OFFER + WRAP-UP (30 seconds)

**Action:** Drag a card to OFFER column. Click "Send offer". Fill in salary + joining date. Submit.

**WHAT TO SAY:**

> "Last piece — the recruiter sends an offer. The form opens when the card reaches the OFFER column. Submitting generates a real PDF using @react-pdf/renderer, persists the PDF, moves the application to OFFER, notifies the candidate, and emails the offer. The candidate signs in, sees the offer card, can accept or decline with a single click. Hiring done in under 90 seconds for the full pipeline. That's HirePilot."

---

### [4:00] END (10 seconds)

**Show:** the GitHub repo at `github.com/amanraj74/hirepilot`

**WHAT TO SAY:**

> "Full source code is on GitHub — public repo, 30+ commits, every feature you saw. Thanks for watching."

---

## Tips for the recording

- **Speak clearly** — judges may watch on mute
- **Move slowly** — cursor should not jump around
- **Let pages load fully** before clicking — wait 1-2s after each navigation
- **Show real data** — not mocked text. We have 10 real jobs seeded.
- **Don't show code** — the README + GitHub covers that
- **If something errors**: pause, narrate the error honestly. Shows debugging maturity.

## Settings

- **Quality:** 1080p
- **Camera:** Off
- **Mic:** Built-in laptop (clear voice is more important than fancy)
- **Length target:** 3:00 - 4:00 (sweet spot — judges watch fully if under 4 min)
- **Upload to Loom** → get a public URL
- **Put URL in the README** at the `## Demo video` section I'll add below
