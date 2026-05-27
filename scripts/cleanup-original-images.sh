#!/usr/bin/env bash
# cleanup-original-images.sh
#
# Run this once after the perf/image-webp-conversion branch is merged.
# It deletes all original JPG/PNG files in public/static/images/ for which
# a .webp version now exists. The .webp files were created by the
# image-conversion pass in May 2026.
#
# Usage (from repo root):
#   bash scripts/cleanup-original-images.sh
#
# Safe to re-run; exits cleanly if nothing is left to delete.

set -euo pipefail

IMG_DIR="public/static/images"
deleted=0
skipped=0

while IFS= read -r -d '' webp; do
  stem="${webp%.webp}"
  for ext in .jpg .jpeg .png .gif; do
    orig="${stem}${ext}"
    if [[ -f "$orig" ]]; then
      echo "Deleting: $orig"
      rm "$orig"
      ((deleted++)) || true
    fi
  done
done < <(find "$IMG_DIR" -name "*.webp" -not -path "*/logo/*" -print0)

# Also remove the logo backup created during resize
if [[ -f "public/static/images/logo/light_original.png" ]]; then
  echo "Deleting: public/static/images/logo/light_original.png"
  rm "public/static/images/logo/light_original.png"
  ((deleted++)) || true
fi

echo ""
echo "Done. Deleted $deleted original file(s)."
