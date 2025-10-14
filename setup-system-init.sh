#!/bin/bash

# System Initialization - Database Setup Script
# This script helps you set up the database functions needed for system initialization

echo "================================================"
echo "MANTIS System Initialization - Database Setup"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if SQL file exists
if [ ! -f "create-first-admin-function.sql" ]; then
    echo -e "${RED}ERROR: create-first-admin-function.sql not found${NC}"
    echo "Please ensure you're running this script from the MANTIS System directory"
    exit 1
fi

echo "This script will help you set up the database functions for system initialization."
echo ""
echo "You have two options:"
echo ""
echo "1. Copy SQL to clipboard (you'll paste it in Supabase Dashboard)"
echo "2. Execute directly via psql (requires database connection details)"
echo ""

read -p "Choose option (1 or 2): " option

case $option in
    1)
        echo ""
        echo -e "${YELLOW}Option 1: Manual Setup via Supabase Dashboard${NC}"
        echo ""
        echo "Steps:"
        echo "1. Go to your Supabase Dashboard"
        echo "2. Navigate to: SQL Editor"
        echo "3. Create a new query"
        echo "4. Copy the contents of: create-first-admin-function.sql"
        echo "5. Paste into the SQL Editor"
        echo "6. Click 'Run'"
        echo ""
        echo -e "${GREEN}SQL file location: $(pwd)/create-first-admin-function.sql${NC}"
        echo ""
        
        # Try to copy to clipboard if available
        if command -v pbcopy &> /dev/null; then
            cat create-first-admin-function.sql | pbcopy
            echo -e "${GREEN}✓ SQL copied to clipboard!${NC}"
        elif command -v xclip &> /dev/null; then
            cat create-first-admin-function.sql | xclip -selection clipboard
            echo -e "${GREEN}✓ SQL copied to clipboard!${NC}"
        elif command -v clip &> /dev/null; then
            cat create-first-admin-function.sql | clip
            echo -e "${GREEN}✓ SQL copied to clipboard!${NC}"
        else
            echo "Clipboard utility not found. Please copy the file manually."
        fi
        ;;
        
    2)
        echo ""
        echo -e "${YELLOW}Option 2: Direct Execution via psql${NC}"
        echo ""
        read -p "Enter Supabase host (e.g., db.xxxxx.supabase.co): " db_host
        read -p "Enter database name [default: postgres]: " db_name
        db_name=${db_name:-postgres}
        read -p "Enter username [default: postgres]: " db_user
        db_user=${db_user:-postgres}
        
        echo ""
        echo "Executing SQL script..."
        
        psql -h "$db_host" -U "$db_user" -d "$db_name" -f create-first-admin-function.sql
        
        if [ $? -eq 0 ]; then
            echo ""
            echo -e "${GREEN}✓ Database functions created successfully!${NC}"
        else
            echo ""
            echo -e "${RED}✗ Failed to execute SQL script${NC}"
            echo "Please check your connection details and try again"
            exit 1
        fi
        ;;
        
    *)
        echo -e "${RED}Invalid option${NC}"
        exit 1
        ;;
esac

echo ""
echo "================================================"
echo "Verification Steps"
echo "================================================"
echo ""
echo "Run these SQL queries in Supabase Dashboard to verify:"
echo ""
echo "1. Check if functions exist:"
echo "   SELECT routine_name FROM information_schema.routines"
echo "   WHERE routine_name IN ('insert_first_admin_profile', 'check_system_initialized');"
echo ""
echo "2. Test system status check:"
echo "   SELECT check_system_initialized();"
echo ""
echo "3. Check permissions:"
echo "   SELECT routine_name, grantee, privilege_type"
echo "   FROM information_schema.routine_privileges"
echo "   WHERE routine_name IN ('insert_first_admin_profile', 'check_system_initialized');"
echo ""
echo -e "${GREEN}Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Clear your browser cache"
echo "2. Navigate to the MANTIS web app"
echo "3. Try the system initialization flow"
echo ""
echo "For detailed instructions, see: SYSTEM_INIT_RLS_FIX.md"
echo ""
