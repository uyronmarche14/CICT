#!/usr/bin/env bash

set -euo pipefail

BACKEND_URL="${1:-http://localhost:5000}"

if ! command -v cloudflared >/dev/null 2>&1; then
  echo "cloudflared is required but was not found in PATH."
  exit 1
fi

cat <<EOF
Starting a temporary public tunnel for the CICT backend.

Backend target: ${BACKEND_URL}

When cloudflared prints the public https://...trycloudflare.com URL:
1. Copy it
2. Set apps/mobile/.env to:
   EXPO_PUBLIC_API_URL=<that-url>/api
3. Restart Expo with:
   cd apps/mobile && pnpm exec expo start --tunnel -c

Leave this terminal running while testing on the phone.
EOF

exec cloudflared tunnel --url "${BACKEND_URL}"
