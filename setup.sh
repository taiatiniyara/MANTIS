#!/bin/bash

# MANTIS Quick Setup Script for Windows (Git Bash)
# This script helps you through the setup process with guided prompts

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║   🛠️  MANTIS Setup Assistant                               ║"
echo "║   Multi-Agency National Traffic Infringement System       ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if we're in the right directory
if [ ! -f "README.md" ] || [ ! -d "web" ] || [ ! -d "mobile" ]; then
    echo "❌ Error: Please run this script from the MANTIS root directory"
    echo ""
    echo "Try:"
    echo '  cd "c:/Users/codec/OneDrive/Documents/MANTIS"'
    echo "  bash setup.sh"
    exit 1
fi

echo "✓ Running from MANTIS root directory"
echo ""

# Check for npx
if ! command -v npx &> /dev/null; then
    echo "❌ Error: npx not found. Please install Node.js first."
    exit 1
fi

echo "✓ npx is available"
echo ""

# Function to pause and wait for user
pause() {
    echo ""
    read -p "Press Enter to continue..."
    echo ""
}

# Welcome
echo "This script will guide you through setting up MANTIS."
echo ""
echo "You will need:"
echo "  1. A Supabase account (https://supabase.com)"
echo "  2. Your Supabase project credentials"
echo "  3. About 15-20 minutes"
echo ""
echo "📖 For detailed instructions, see: WINDOWS_SETUP.md"
pause

# Phase 1: Check Supabase Project
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Phase 1: Supabase Project"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Have you created a Supabase project?"
echo "  1. Go to: https://supabase.com/dashboard"
echo "  2. Click 'New Project'"
echo "  3. Wait for setup (~2 minutes)"
echo ""
read -p "Have you created your Supabase project? (y/n): " created_project

if [ "$created_project" != "y" ]; then
    echo ""
    echo "Please create your Supabase project first, then run this script again."
    echo "See WINDOWS_SETUP.md for detailed instructions."
    exit 0
fi

echo ""
echo "✓ Supabase project created"
pause

# Phase 2: Environment Variables
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Phase 2: Environment Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Do you have your Supabase credentials?"
echo ""
echo "You need:"
echo "  - Project URL (from Settings → API)"
echo "  - anon public key (from Settings → API)"
echo "  - service_role key (from Settings → API)"
echo "  - Reference ID (from Settings → General)"
echo ""
read -p "Do you have these ready? (y/n): " has_credentials

if [ "$has_credentials" != "y" ]; then
    echo ""
    echo "Please gather your credentials first:"
    echo "  1. Go to your Supabase project"
    echo "  2. Settings → API (copy URL and keys)"
    echo "  3. Settings → General (copy Reference ID)"
    echo ""
    echo "Then run this script again."
    exit 0
fi

# Create web .env.local
echo ""
echo "Creating web/.env.local..."
if [ ! -f "web/.env.local" ]; then
    cp web/.env.local.example web/.env.local
    echo "✓ Created web/.env.local from template"
    echo ""
    echo "⚠️  IMPORTANT: Edit web/.env.local and add your credentials!"
    echo ""
    echo "Opening file in VS Code..."
    code web/.env.local || echo "Please manually edit: web/.env.local"
else
    echo "✓ web/.env.local already exists"
fi

# Create mobile .env
echo ""
echo "Creating mobile/.env..."
if [ ! -f "mobile/.env" ]; then
    cp mobile/.env.example mobile/.env
    echo "✓ Created mobile/.env from template"
    echo ""
    echo "⚠️  IMPORTANT: Edit mobile/.env and add your credentials!"
    echo ""
    echo "Opening file in VS Code..."
    code mobile/.env || echo "Please manually edit: mobile/.env"
else
    echo "✓ mobile/.env already exists"
fi

echo ""
echo "Make sure you've updated both files with your Supabase credentials!"
pause

# Phase 3: Link Project
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Phase 3: Link Supabase Project"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
read -p "Enter your Supabase Reference ID: " project_ref

if [ -z "$project_ref" ]; then
    echo "❌ Error: Reference ID cannot be empty"
    exit 1
fi

echo ""
echo "Linking to Supabase project: $project_ref"
echo "You will be prompted for your database password..."
echo ""

npx supabase link --project-ref "$project_ref"

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Successfully linked to Supabase project"
else
    echo ""
    echo "❌ Failed to link project. Please check:"
    echo "  - Reference ID is correct"
    echo "  - Database password is correct"
    echo "  - You have internet connection"
    exit 1
fi

pause

# Phase 4: Push Migrations
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Phase 4: Push Database Migrations"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "This will create all database tables and RLS policies..."
echo ""

npx supabase db push

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Successfully pushed migrations"
    echo ""
    echo "Created tables:"
    echo "  ✓ agencies"
    echo "  ✓ locations"
    echo "  ✓ users"
    echo "  ✓ teams"
    echo "  ✓ routes"
    echo "  ✓ infringement_categories"
    echo "  ✓ infringement_types"
    echo "  ✓ infringements"
    echo "  ✓ RLS policies"
else
    echo ""
    echo "⚠️  Migration push had issues. This might be okay if tables already exist."
fi

pause

# Phase 5: Seed Data
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Phase 5: Seed Sample Data (Optional)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Would you like to load sample data?"
echo "(Agencies, locations, infringement types)"
echo ""
read -p "Load seed data? (y/n): " seed_data

if [ "$seed_data" = "y" ]; then
    echo ""
    echo "Loading seed data..."
    npx supabase db seed
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✓ Successfully loaded seed data"
    else
        echo ""
        echo "⚠️  Failed to load seed data (might already exist)"
    fi
else
    echo ""
    echo "Skipping seed data..."
fi

pause

# Phase 6: Create Super Admin
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Phase 6: Create Super Admin User"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "You need to create a super admin user manually:"
echo ""
echo "1. Go to your Supabase dashboard"
echo "2. Authentication → Users → Add user"
echo "3. Enter email and password"
echo "4. ✓ Check 'Auto Confirm User'"
echo "5. Copy the user's UUID"
echo "6. Go to Table Editor → users"
echo "7. Insert row:"
echo "     id: [paste UUID]"
echo "     role: super_admin"
echo "8. Save"
echo ""
echo "For detailed instructions, see WINDOWS_SETUP.md Step 8"
pause

# Phase 7: Test
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Phase 7: Start Development Server"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Ready to test your application?"
echo ""
read -p "Start the development server? (y/n): " start_server

if [ "$start_server" = "y" ]; then
    echo ""
    echo "Starting Next.js development server..."
    echo ""
    echo "Once started:"
    echo "  1. Open: http://localhost:3000"
    echo "  2. Login: http://localhost:3000/auth/login"
    echo "  3. Admin: http://localhost:3000/admin"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    
    cd web
    npm run dev
else
    echo ""
    echo "To start the server manually:"
    echo '  cd "c:/Users/codec/OneDrive/Documents/MANTIS/web"'
    echo "  npm run dev"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║   🎉 Setup Complete!                                       ║"
echo "║                                                            ║"
echo "║   Next steps:                                              ║"
echo "║   1. Test login at http://localhost:3000/auth/login        ║"
echo "║   2. Access admin at http://localhost:3000/admin           ║"
echo "║   3. Create your first agency!                             ║"
echo "║                                                            ║"
echo "║   For help, see:                                           ║"
echo "║   - WINDOWS_SETUP.md                                       ║"
echo "║   - SETUP_CHECKLIST.md                                     ║"
echo "║   - COMMANDS.md                                            ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
