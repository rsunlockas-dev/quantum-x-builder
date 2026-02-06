#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
FLAGS_FILE="$ROOT_DIR/_state/feature_flags.v1.json"

if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required but not installed"
  exit 1
fi

if [ ! -f "$FLAGS_FILE" ]; then
  echo "feature flags file not found: $FLAGS_FILE"
  exit 1
fi

if [ $# -lt 1 ]; then
  echo "Usage: ./_OPS/flags/set-autonomy.sh true|false"
  exit 1
fi

VALUE="$1"
if [ "$VALUE" != "true" ] && [ "$VALUE" != "false" ]; then
  echo "Value must be true or false"
  exit 1
fi

TMP_FILE="${FLAGS_FILE}.tmp"
jq ".autonomy.enabled = ${VALUE}" "$FLAGS_FILE" > "$TMP_FILE"
mv "$TMP_FILE" "$FLAGS_FILE"

echo "autonomy.enabled set to ${VALUE}"
