#!/usr/bin/env node

/**
 * View Admin Users Script
 * 
 * This script queries the Supabase database to show all admin users
 * (super_admin and agency_admin roles) in the MANTIS system.
 * 
 * Usage:
 *   node view-admin-users.js
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iftscgsnqurgvscedhiv.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmdHNjZ3NucXVyZ3ZzY2VkaGl2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDI5NzQ1MCwiZXhwIjoyMDc1ODczNDUwfQ.8yPMnZnScCtN0JmHIfZwQM9oR1VCozsNhpF28bCb31w';

async function viewAdminUsers() {
  console.log('🔍 Fetching admin users from MANTIS database...\n');

  try {
    // Query users table
    const usersResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?role=in.(super_admin,agency_admin)&select=id,role,position,created_at,agencies:agency_id(name)`, {
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!usersResponse.ok) {
      throw new Error(`Failed to fetch users: ${usersResponse.statusText}`);
    }

    const users = await usersResponse.json();

    if (!users || users.length === 0) {
      console.log('❌ No admin users found in the system.\n');
      console.log('To create an admin user:');
      console.log('1. Sign up at http://localhost:3000/auth/sign-up');
      console.log('2. Manually update the user role in Supabase to "super_admin"\n');
      return;
    }

    console.log(`✅ Found ${users.length} admin user(s):\n`);
    console.log('═'.repeat(100));

    // Fetch auth details for each user
    for (const user of users) {
      // Get auth user details
      const authResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${user.id}`, {
        headers: {
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        }
      });

      let email = 'N/A';
      if (authResponse.ok) {
        const authData = await authResponse.json();
        email = authData.email || 'N/A';
      }

      const role = user.role === 'super_admin' ? '🔴 SUPER ADMIN' : '🔵 AGENCY ADMIN';
      const agency = user.agencies?.name || 'No Agency';
      const position = user.position || 'No Position';
      const created = new Date(user.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      console.log(`\n${role}`);
      console.log(`─`.repeat(100));
      console.log(`📧 Email:      ${email}`);
      console.log(`👤 User ID:    ${user.id}`);
      console.log(`💼 Position:   ${position}`);
      console.log(`🏢 Agency:     ${agency}`);
      console.log(`📅 Created:    ${created}`);
      console.log(`═`.repeat(100));
    }

    console.log(`\n✨ Total Admin Users: ${users.length}\n`);

  } catch (error) {
    console.error('❌ Error fetching admin users:', error.message);
    console.log('\nMake sure:');
    console.log('1. Supabase is running');
    console.log('2. Environment variables are set correctly');
    console.log('3. The database has been migrated\n');
  }
}

// Run the script
viewAdminUsers();
