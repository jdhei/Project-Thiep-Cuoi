#!/bin/bash
set -e
cd "$(dirname "$0")/.."

echo "Applying staged .new files..."

for f in $(find . -name "*.new" -type f ! -path "./.git/*"); do
  target="${f%.new}"
  echo "  $f → $target"
  mv "$f" "$target"
done

# Cleanup
rm -f "src/app/w/%5Bslug%5D/page.tsx"
rm -f scripts/apply-tpl-06-07.sh
rm -f scripts/apply-tpl.sh
rm -f scripts/apply-med.sh
rm -f scripts/test
rm -f scripts/apply-staged.sh

echo ""
echo "✅ Done! Now run:"
echo "  git add -A"
echo "  git commit -m \"feat: TPL + MED complete (74%)\" "
echo "  git push"
