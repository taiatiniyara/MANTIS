#!/bin/bash

# ============================================================================================
# Fix All Server Components Using Wrong Supabase Client
# ============================================================================================
# This script fixes all server components that incorrectly use the browser client
# ============================================================================================

echo "=========================================="
echo "Fixing Supabase Client Usage in Server Components"
echo "=========================================="
echo ""

# Array of files that need to be fixed
FILES=(
  "web/app/admin/agencies/page.tsx"
  "web/app/admin/analytics/page.tsx"
  "web/app/admin/audit-logs/page.tsx"
  "web/app/admin/categories/page.tsx"
  "web/app/admin/data-management/page.tsx"
  "web/app/admin/infringements/page.tsx"
  "web/app/admin/locations/page.tsx"
  "web/app/admin/notifications/page.tsx"
  "web/app/admin/notifications-center/page.tsx"
  "web/app/admin/advanced-analytics/page.tsx"
  "web/app/admin/reports/page.tsx"
  "web/app/admin/routes/page.tsx"
  "web/app/admin/teams/page.tsx"
  "web/app/admin/types/page.tsx"
  "web/app/admin/users/page.tsx"
  "web/app/admin/view-users/page.tsx"
  "web/app/protected/infringements/page.tsx"
)

echo "The following files need to be fixed:"
echo ""
for file in "${FILES[@]}"; do
  echo "  - $file"
done
echo ""
echo "Each file needs to:"
echo "  1. Remove: import { supabase } from '@/lib/supabase/client';"
echo "  2. Add at start of component: const supabase = await createClient();"
echo ""
echo "Example change:"
echo ""
echo "BEFORE:"
echo "  import { supabase } from '@/lib/supabase/client';"
echo "  export default async function MyPage() {"
echo "    const { data } = await supabase.from('table').select();"
echo ""
echo "AFTER:"
echo "  // Remove the import above"
echo "  export default async function MyPage() {"
echo "    const supabase = await createClient();"
echo "    const { data } = await supabase.from('table').select();"
echo ""
echo "=========================================="
echo ""
echo "NOTE: These files have already been fixed:"
echo "  ✅ web/app/protected/page.tsx"
echo "  ✅ web/app/protected/layout.tsx"
echo "  ✅ web/app/admin/layout.tsx"
echo "  ✅ web/app/admin/page.tsx"
echo ""
echo "You can use a code editor's find-and-replace feature to fix the remaining files."
echo ""

read -p "Press Enter to continue..."
