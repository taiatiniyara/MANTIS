#!/bin/bash

# ============================================================================================
# Apply Authentication Fixes
# ============================================================================================
# This script helps you apply the authentication fixes to your Supabase database
# ============================================================================================

echo "=========================================="
echo "MANTIS Authentication Fix"
echo "=========================================="
echo ""
echo "This will guide you through fixing the authentication system."
echo ""
echo "Step 1: Please open your Supabase Dashboard"
echo "  → Go to: https://supabase.com/dashboard"
echo "  → Select your project"
echo "  → Click on 'SQL Editor' in the left sidebar"
echo ""
echo "Step 2: Run Migration 009 (Auto-create users trigger)"
echo "  → Click 'New Query'"
echo "  → Copy the contents of: db/migrations/009_auto_create_users.sql"
echo "  → Paste into the SQL editor"
echo "  → Click 'Run'"
echo ""
read -p "Press Enter once you've completed Step 2..."
echo ""
echo "Step 3: Run Migration 010 (Sync existing users)"
echo "  → Click 'New Query'"
echo "  → Copy the contents of: db/migrations/010_sync_existing_users.sql"
echo "  → Paste into the SQL editor"
echo "  → Click 'Run'"
echo ""
read -p "Press Enter once you've completed Step 3..."
echo ""
echo "Step 4: Verify the fix"
echo "  → Run this query in SQL Editor to check all users:"
echo ""
cat << 'EOF'
SELECT 
  au.email,
  au.created_at as auth_created,
  pu.id IS NOT NULL as has_profile,
  pu.role,
  pu.position,
  a.name as agency_name
FROM auth.users au
LEFT JOIN public.users pu ON pu.id = au.id
LEFT JOIN agencies a ON a.id = pu.agency_id
ORDER BY au.created_at DESC;
EOF
echo ""
read -p "Press Enter once you've verified all users have profiles..."
echo ""
echo "=========================================="
echo "✅ Authentication Fix Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Test login with existing users"
echo "2. Test signup with a new user"
echo "3. Assign proper roles to users who have 'Pending Assignment'"
echo ""
echo "For more details, see: docs/AUTH_FIX_GUIDE.md"
echo ""
