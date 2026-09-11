# AGENTS.md

## Project Overview
FamilyHub — a React 19 + Vite 8 single-page app. Frontend only; no backend, database, or external services.

## Setup
Run via `docker compose -f docker-compose.base44.yml up -d --build`.
The compose service uses `node:22-bookworm-slim`, bind-mounts the repo at `/app`, runs `npm install` then `npm run dev` (Vite dev server with HMR on port 5173, mapped to host port 3000).

## Verification
- Preview should serve the app at `/` (health path).
- Vite HMR reflects source edits live; no rebuild needed.
- No secrets or environment variables required.

## Key Commands
- Dev: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint` (oxlint)
