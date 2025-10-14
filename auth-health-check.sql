-- ============================================================================
-- Auth System Health Check
-- ============================================================================
-- Run this script to verify your authentication setup is correct

-- 1. Check Agencies
SELECT 
  '✅ Agencies Check' as test,
  COUNT(*) as count,
  CASE WHEN COUNT(*) >= 3 THEN '✅ PASS' ELSE '❌ FAIL - Expected at least 3 agencies' END as status
FROM agencies WHERE active = true;

-- List agencies
SELECT '   Agency:' as detail, code, name, active FROM agencies ORDER BY code;

-- 2. Check Auth Users
SELECT 
  '✅ Auth Users Check' as test,
  COUNT(*) as count,
  CASE WHEN COUNT(*) >= 1 THEN '✅ PASS' ELSE '❌ FAIL - No auth users found' END as status
FROM auth.users;

-- List auth users
SELECT '   User:' as detail, email, created_at FROM auth.users ORDER BY created_at;

-- 3. Check User Profiles
SELECT 
  '✅ User Profiles Check' as test,
  COUNT(*) as count,
  CASE WHEN COUNT(*) >= 1 THEN '✅ PASS' ELSE '❌ FAIL - No user profiles found' END as status
FROM users;

-- List user profiles
SELECT 
  '   Profile:' as detail,
  display_name, 
  role, 
  COALESCE(a.name, 'No Agency') as agency,
  active
FROM users u
LEFT JOIN agencies a ON u.agency_id = a.id
ORDER BY role, display_name;

-- 4. Check Auth-Profile Links
SELECT 
  '✅ Auth-Profile Link Check' as test,
  COUNT(*) as auth_users,
  COUNT(u.id) as profiles,
  COUNT(*) - COUNT(u.id) as missing_profiles,
  CASE 
    WHEN COUNT(*) = COUNT(u.id) THEN '✅ PASS - All auth users have profiles'
    ELSE '⚠️  WARNING - Some auth users missing profiles'
  END as status
FROM auth.users au
LEFT JOIN users u ON au.id = u.id;

-- List auth users without profiles
SELECT 
  '   ⚠️  Missing Profile:' as detail,
  au.email,
  au.id as auth_user_id
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
WHERE u.id IS NULL;

-- 5. Check Role Distribution
SELECT 
  '✅ Role Distribution Check' as test,
  role,
  COUNT(*) as count
FROM users
GROUP BY role
ORDER BY role;

-- 6. Check Officer-Agency Links
SELECT 
  '✅ Officer-Agency Check' as test,
  COUNT(*) as officer_count,
  COUNT(agency_id) as with_agency,
  COUNT(*) - COUNT(agency_id) as without_agency,
  CASE 
    WHEN COUNT(*) = COUNT(agency_id) THEN '✅ PASS - All officers have agencies'
    WHEN COUNT(agency_id) = 0 THEN '❌ FAIL - No officers have agencies'
    ELSE '⚠️  WARNING - Some officers missing agencies'
  END as status
FROM users 
WHERE role IN ('officer', 'agency_admin');

-- List officers without agencies
SELECT 
  '   ⚠️  Officer Without Agency:' as detail,
  display_name,
  role
FROM users
WHERE role IN ('officer', 'agency_admin') AND agency_id IS NULL;

-- 7. Check Active Status
SELECT 
  '✅ Active Users Check' as test,
  SUM(CASE WHEN active THEN 1 ELSE 0 END) as active_count,
  SUM(CASE WHEN NOT active THEN 1 ELSE 0 END) as inactive_count,
  CASE 
    WHEN SUM(CASE WHEN active THEN 1 ELSE 0 END) >= 1 THEN '✅ PASS - Has active users'
    ELSE '❌ FAIL - No active users'
  END as status
FROM users;

-- 8. Check Offences Catalog
SELECT 
  '✅ Offences Catalog Check' as test,
  COUNT(*) as count,
  CASE WHEN COUNT(*) >= 5 THEN '✅ PASS' ELSE '⚠️  WARNING - Expected more offences' END as status
FROM offences WHERE active = true;

-- List offences
SELECT '   Offence:' as detail, code, description, base_fine_amount, category FROM offences WHERE active = true ORDER BY category, code;

-- 9. Check Vehicles
SELECT 
  '✅ Vehicles Check' as test,
  COUNT(*) as count,
  CASE WHEN COUNT(*) >= 1 THEN '✅ PASS' ELSE '⚠️  INFO - No vehicles yet' END as status
FROM vehicles WHERE active = true;

-- 10. Summary
SELECT 
  '═══════════════════════════════════════' as separator;

SELECT 
  '📊 SYSTEM SUMMARY' as summary;

SELECT 
  'Agencies' as entity,
  COUNT(*) as total,
  SUM(CASE WHEN active THEN 1 ELSE 0 END) as active
FROM agencies
UNION ALL
SELECT 
  'Auth Users' as entity,
  COUNT(*) as total,
  COUNT(*) as active
FROM auth.users
UNION ALL
SELECT 
  'User Profiles' as entity,
  COUNT(*) as total,
  SUM(CASE WHEN active THEN 1 ELSE 0 END) as active
FROM users
UNION ALL
SELECT 
  'Offences' as entity,
  COUNT(*) as total,
  SUM(CASE WHEN active THEN 1 ELSE 0 END) as active
FROM offences
UNION ALL
SELECT 
  'Vehicles' as entity,
  COUNT(*) as total,
  SUM(CASE WHEN active THEN 1 ELSE 0 END) as active
FROM vehicles;

SELECT 
  '═══════════════════════════════════════' as separator;

-- ============================================================================
-- Next Steps (if any checks failed)
-- ============================================================================

-- If "Auth Users Check" failed:
-- → Go to Supabase Dashboard > Authentication > Users
-- → Click "Add user" and create test accounts

-- If "User Profiles Check" failed:
-- → Run create-user-profiles.sql with actual auth user IDs

-- If "Auth-Profile Link Check" has warnings:
-- → Some auth users don't have profiles
-- → Use the user IDs shown above to create profiles

-- If "Officer-Agency Check" failed:
-- → Update officer profiles to assign them to agencies:
--   UPDATE users SET agency_id = 'agency-uuid-here' WHERE id = 'user-uuid-here';

-- If "Offences Catalog Check" failed:
-- → Run seed.sql to create the offences catalog

-- ============================================================================
-- Ready to Test!
-- ============================================================================
-- Once all checks pass:
-- 1. Open http://localhost:5173
-- 2. You should see the login page
-- 3. Log in with one of your test accounts
-- 4. You should see the dashboard with real user info in the sidebar
-- 5. Try logging out and logging in as different users
