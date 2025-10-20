#!/bin/bash

# Script to fix searchParams in Next.js 15 - they must be awaited

echo "Fixing searchParams in admin pages for Next.js 15..."

# Files to fix
files=(
  "web/app/admin/locations/page.tsx"
  "web/app/admin/routes/page.tsx"
  "web/app/admin/categories/page.tsx"
  "web/app/admin/types/page.tsx"
  "web/app/admin/infringements/page.tsx"
  "web/app/admin/reports/page.tsx"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing $file..."
  else
    echo "File not found: $file"
  fi
done

echo "Done! Now you need to:"
echo "1. Add 'Promise<>' to all searchParams type definitions"
echo "2. Add 'const params = await searchParams;' after auth checks"
echo "3. Replace all 'searchParams.property' with 'params.property'"
