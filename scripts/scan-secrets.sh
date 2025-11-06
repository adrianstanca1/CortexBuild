#!/usr/bin/env bash
set -euo pipefail

echo "Scanning repository for potential hardcoded secrets..."

PATTERNS=(
  "sb_publishable_[A-Za-z0-9_\-]+"    # Supabase publishable key
  "eyJ[0-9A-Za-z_\-]+=*\.[0-9A-Za-z_\-]+=*\.[0-9A-Za-z_\-]+"  # JWT-like
  "sk-[A-Za-z0-9_\-]{20,}"            # OpenAI-like
  "AIza[0-9A-Za-z\-_]{35}"            # Google API key
  "ghp_[A-Za-z0-9]{36,}"              # GitHub token
)

EXIT=0
for pat in "${PATTERNS[@]}"; do
  if rg -n --hidden --glob '!node_modules' --pcre2 -i "$pat" . >/dev/null; then
    echo "Potential secret match for pattern: $pat"
    rg -n --hidden --glob '!node_modules' --pcre2 -i "$pat" . || true
    EXIT=1
  fi
done

if [[ $EXIT -ne 0 ]]; then
  echo "\nOne or more potential secrets detected. Please remediate before committing."
else
  echo "No potential secrets detected."
fi

exit $EXIT


