# Setup

## Prerequisites

- Node.js 20+
- Android Studio and/or Xcode for local native builds
- Expo CLI tooling through `pnpm exec expo`
- A running CICT backend

## Install

```bash
cd /home/ronmarche14/projects/CICT
pnpm install
```

## Environment

```bash
cp .env.example .env
```

Set:

`EXPO_PUBLIC_API_URL=http://localhost:5000/api`

Use a device-reachable URL when running on Android emulators, iOS simulators, or physical phones.

Recommended for physical phone testing from WSL:

1. Start the backend
2. From the repo root run:
   `pnpm run backend:tunnel`
3. Copy the `https://...trycloudflare.com` URL from cloudflared
4. Set:
   `EXPO_PUBLIC_API_URL=<that-url>/api`
5. Restart Expo:
   `cd /home/ronmarche14/projects/CICT/apps/mobile && pnpm exec expo start --tunnel -c`

## Run Commands

```bash
pnpm run mobile:dev
pnpm run mobile:android
pnpm run mobile:ios
pnpm run mobile:web
```

## Backend Dependency Notes

- Start MongoDB and the backend from `apps/backend`.
- Student auth, event registration, and attendance flows depend on the backend being available.
- `localhost` only works for the machine running the backend. Physical phones need a reachable LAN IP or a public tunnel URL.

## Local Full-Stack Workflow

Terminal 1:

```bash
cd /home/ronmarche14/projects/CICT
pnpm run backend:mongo:up
pnpm run backend:dev
```

Terminal 2:

```bash
cd /home/ronmarche14/projects/CICT
pnpm run mobile:dev
```
