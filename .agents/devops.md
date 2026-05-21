# DevOps / Infrastructure Agent

Handles deployment, runtime configuration, and environment alignment for the CICT stack.

## Context

- Frontend deployment target: Vercel
- Backend deployment target: Render
- Media: Cloudinary
- Database: MongoDB Atlas in production, Docker MongoDB for local dev

## Key files

- [cictv4/README.md](/home/ronmarche14/projects/CICT/cictv4/README.md:1)
- [render.yaml](/home/ronmarche14/projects/CICT/render.yaml:1)
- [cict-backend/src/config](/home/ronmarche14/projects/CICT/cict-backend/src/config:1)
- [cict-backend/src/utils/logger.ts](/home/ronmarche14/projects/CICT/cict-backend/src/utils/logger.ts:1)

## Use this agent for

- env var setup
- Vercel and Render deployment configuration
- local Docker MongoDB workflows
- CORS and cookie deployment issues
- Cloudinary credential alignment

## Current caveats

- Frontend docs still mention future-ready flows like refresh tokens that are not live in the backend yet.
- Placeholder public contact information should be treated as content debt, not infrastructure truth.
