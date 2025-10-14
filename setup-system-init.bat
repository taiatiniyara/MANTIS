@echo off
REM System Initialization - Database Setup Script (Windows)
REM This script helps you set up the database functions needed for system initialization

echo ================================================
echo MANTIS System Initialization - Database Setup
echo ================================================
echo.

REM Check if SQL file exists
if not exist "create-first-admin-function.sql" (
    echo ERROR: create-first-admin-function.sql not found
    echo Please ensure you're running this script from the MANTIS System directory
    pause
    exit /b 1
)

echo This script will help you set up the database functions for system initialization.
echo.
echo The SQL file needs to be executed in your Supabase Dashboard:
echo.
echo Steps:
echo 1. Go to your Supabase Dashboard
echo 2. Navigate to: SQL Editor
echo 3. Create a new query
echo 4. Copy the contents of: create-first-admin-function.sql
echo 5. Paste into the SQL Editor
echo 6. Click 'Run'
echo.
echo SQL file location: %CD%\create-first-admin-function.sql
echo.

REM Try to copy to clipboard
type create-first-admin-function.sql | clip
if %errorlevel% equ 0 (
    echo [SUCCESS] SQL copied to clipboard!
    echo You can now paste it directly into Supabase SQL Editor
) else (
    echo Could not copy to clipboard. Please copy the file manually.
)

echo.
echo ================================================
echo Verification Steps
echo ================================================
echo.
echo Run these SQL queries in Supabase Dashboard to verify:
echo.
echo 1. Check if functions exist:
echo    SELECT routine_name FROM information_schema.routines
echo    WHERE routine_name IN ('insert_first_admin_profile', 'check_system_initialized');
echo.
echo 2. Test system status check:
echo    SELECT check_system_initialized();
echo.
echo 3. Check permissions:
echo    SELECT routine_name, grantee, privilege_type
echo    FROM information_schema.routine_privileges
echo    WHERE routine_name IN ('insert_first_admin_profile', 'check_system_initialized');
echo.
echo.
echo Next steps:
echo 1. Paste the SQL into Supabase Dashboard and run it
echo 2. Clear your browser cache
echo 3. Navigate to the MANTIS web app
echo 4. Try the system initialization flow
echo.
echo For detailed instructions, see: SYSTEM_INIT_RLS_FIX.md
echo.

pause
