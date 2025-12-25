#!/usr/bin/env bash
set -euo pipefail
# Usage: ./scripts/get_admin_token.sh [email] [password]
EMAIL=${1:-admin@nexusart.com}
PASSWORD=${2:-admin123}

# Send form-encoded request to login endpoint
RESPONSE=$(curl -s -X POST -d "username=${EMAIL}" -d "password=${PASSWORD}" http://localhost:8000/api/auth/login || true)

# Try to extract access_token
if command -v jq >/dev/null 2>&1; then
  TOKEN=$(echo "$RESPONSE" | jq -r '.access_token // empty')
else
  TOKEN=$(echo "$RESPONSE" | python - <<'PY'
import sys, json
try:
    obj = json.load(sys.stdin)
    print(obj.get('access_token',''))
except Exception:
    sys.exit(0)
PY
)
fi

if [ -n "$TOKEN" ]; then
  echo "$TOKEN"
  exit 0
else
  >&2 echo "Failed to obtain token. Response was:" 
  >&2 echo "$RESPONSE"
  exit 1
fi
