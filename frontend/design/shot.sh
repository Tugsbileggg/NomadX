#!/bin/bash
# Screenshot a running dev-server route with headless Chrome.
# Usage: design/shot.sh <route> <out-name> [width] [height]
set -euo pipefail

ROUTE="${1:-/}"
NAME="${2:-shot}"
W="${3:-1280}"
H="${4:-1000}"
OUT="/private/tmp/claude-502/-Users-khtnax-Documents-lumina/9845c70f-27c3-401d-9be3-aed82cdbaec1/scratchpad/${NAME}.png"

"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
  --virtual-time-budget=6000 \
  --window-size="${W},${H}" \
  --screenshot="${OUT}" \
  "http://localhost:3000${ROUTE}" >/dev/null 2>&1

echo "${OUT}"
