# ADR-0001: Monorepo layout with single Next.js app

## Status

Accepted — 2026-08-08

## Context

Problem Statement 2 (PS-2) of DevFusion 4.O mandates a Node.js backend with a Next.js/React frontend. We had two choices for the deploy topology:

1. **Single Next.js app** with API Route Handlers serving as the backend.
2. **Split monorepo** with a Next.js web app and a separate Node.js Express service.

## Decision

We chose **option 1: single Next.js app + monorepo for shared types and config**.

The repository is structured as a monorepo:

- `apps/web/` — Next.js 15 application (UI + API routes + server logic)
- `packages/shared/` — Zod schemas and TypeScript types reused by tests and scripts
- `packages/config/` — shared ESLint, Tailwind, and TypeScript presets
- `infra/` — local docker-compose, Railway config templates

The FastAPI scaffold previously drafted has been removed.

## Consequences

### Positive

- **One deploy target** (Vercel) for the entire backend, instead of coordinating Vercel + Railway.
- **Faster local development** — single `pnpm dev` boots everything.
- **Type sharing without ceremony** — `@hirepilot/shared` is imported like any other package.
- **No CORS, no cross-service auth dance** — the API is co-located with the frontend.
- **Cleaner monorepo story** — pnpm workspaces + Turborepo give us task graph caching for free.

### Negative

- **Vendor lock-in to Next.js** for the API. Migrating to Express later means re-extracting services.
- **Vercel serverless constraints** — long-running tasks (resume parsing for large files) must be queued via `graphile-worker`, not run inline.
- **Single deploy means single blast radius** — a bad deploy takes down everything.

### Neutral

- The 5-role RBAC, audit logging, and rate limiting are all implemented inside `apps/web/src/server/`. If we ever split into multiple services, these become shared packages or a dedicated auth service.

## Alternatives considered

- **Express backend in `apps/api/`**: more conventional, but adds a deploy target, network hop, and CORS configuration. Not worth the complexity for a 6-day hackathon sprint.
- **Hono backend**: lighter than Express but still adds the same coordination cost.
- **FastAPI retained**: violates PS-2's mandatory Node.js stack. Rejected.

## References

- `BLUEPRINT.md` §1 (Architectural decisions)
- `PRODUCT.md` §6.2 (Information architecture)
- `README.md` (Tech stack table)
