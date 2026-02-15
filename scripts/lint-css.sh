#!/usr/bin/env bash
# ============================================================
# lint-css.sh — CSS Design System enforcement
#
# Rules enforced:
#   1. No hex colors (#xxx) in app.css
#   2. No rgb()/rgba()/hsl()/hsla() in app.css
#   3. Gradients must use "in oklab" interpolation
#
# Exit code:
#   0 = pass
#   1 = violations found
# ============================================================

set -euo pipefail

CSS_FILE="src/app.css"
ERRORS=0

echo "=== CSS Design Lint ==="
echo "Checking: $CSS_FILE"
echo ""

# --- Rule 1: No hex colors ---
# Match #xxx..#xxxxxxxx but skip comment lines and CSS id selectors
HEX_MATCHES=$(grep -nE '#[0-9a-fA-F]{3,8}\b' "$CSS_FILE" | grep -v '^\s*/\*' | grep -v '^\s*\*' || true)
if [ -n "$HEX_MATCHES" ]; then
  echo "ERROR: Hex colors found (use oklch() instead):"
  echo "$HEX_MATCHES"
  echo ""
  ERRORS=$((ERRORS + 1))
fi

# --- Rule 2: No rgb/rgba/hsl/hsla ---
RGB_MATCHES=$(grep -nEi '\b(rgb|rgba|hsl|hsla)\s*\(' "$CSS_FILE" | grep -v '^\s*/\*' | grep -v '^\s*\*' || true)
if [ -n "$RGB_MATCHES" ]; then
  echo "ERROR: rgb()/hsl() colors found (use oklch() instead):"
  echo "$RGB_MATCHES"
  echo ""
  ERRORS=$((ERRORS + 1))
fi

# --- Rule 3: Gradients must use "in oklab" ---
# Multi-line aware: for each gradient occurrence, check if "in oklab" appears
# within the gradient block (same line or next 3 lines)
GRADIENT_VIOLATIONS=""
while IFS=: read -r line_num _rest; do
  # Read the gradient line + next 3 lines to cover multi-line definitions
  END_LINE=$((line_num + 3))
  BLOCK=$(sed -n "${line_num},${END_LINE}p" "$CSS_FILE")
  if ! echo "$BLOCK" | grep -q 'in oklab'; then
    GRADIENT_VIOLATIONS="${GRADIENT_VIOLATIONS}  Line ${line_num}: ${_rest}\n"
  fi
done < <(grep -n 'gradient(' "$CSS_FILE" | grep -v '^\s*/\*' | grep -v '^\s*\*')

if [ -n "$GRADIENT_VIOLATIONS" ]; then
  echo "ERROR: Gradients without 'in oklab' interpolation found:"
  printf "%b" "$GRADIENT_VIOLATIONS"
  echo ""
  ERRORS=$((ERRORS + 1))
fi

# --- Result ---
if [ "$ERRORS" -gt 0 ]; then
  echo "FAILED: $ERRORS rule violation(s) found."
  echo "See docs/css-design.md for the design system rules."
  exit 1
else
  echo "PASSED: All CSS design rules satisfied."
  exit 0
fi
