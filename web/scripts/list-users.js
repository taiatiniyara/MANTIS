#!/usr/bin/env node

/**
 * List All Users Script for MANTIS
 * 
 * This script fetches and displays all users from Supabase
 * 
 * Usage:
 *   node list-users.js
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iftscgsnqurgvscedhiv.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmdHNjZ3NucXVyZ3ZzY2VkaGl2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDI5NzQ1MCwiZXhwIjoyMDc1ODczNDUwfQ.8yPMnZnScCtN0JmHIfZwQM9oR1VCozsNhpF28bCb31w';

async function listAllUsers() {
  console.log('🔍 Fetching all users from MANTIS...\n');

  try {
    // Fetch all auth users using admin API
    const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=100`, {
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }

    const data = await response.json();
    const users = data.users || [];

    if (!users || users.length === 0) {
      console.log('❌ No users found in the system.\n');
      return;
    }

    console.log(`✅ Found ${users.length} user(s) in the system:\n`);
    console.log('═'.repeat(120));

    for (const user of users) {
      console.log(`\n👤 User: ${user.email}`);
      console.log('─'.repeat(120));
      console.log(`   📧 Email:        ${user.email}`);
      console.log(`   🆔 ID:           ${user.id}`);
      console.log(`   📅 Created:      ${new Date(user.created_at).toLocaleString()}`);
      console.log(`   ✅ Confirmed:    ${user.email_confirmed_at ? 'Yes' : 'No'}`);
      console.log(`   📱 Last Sign In: ${user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}`);
      console.log('═'.repeat(120));
    }

    // Count by domain
    const domains = {};
    users.forEach(u => {
      const domain = u.email.split('@')[1];
      domains[domain] = (domains[domain] || 0) + 1;
    });

    console.log('\n📊 Users by Email Domain:');
    Object.entries(domains).forEach(([domain, count]) => {
      console.log(`   ${domain}: ${count} user(s)`);
    });

    console.log(`\n✨ Total Users: ${users.length}\n`);

    // Show test credentials if test users exist
    const testUsers = users.filter(u => u.email.includes('@mantis.gov.fj'));
    if (testUsers.length > 0) {
      console.log('🔑 Test User Credentials:');
      console.log('   Password: Password123!');
      console.log('\n   📋 Available Test Accounts:');
      testUsers.forEach(u => {
        const roleIcon = u.email.includes('admin@mantis') ? '🔴' :
                        u.email.includes('.admin@') ? '🔵' : '🟢';
        console.log(`   ${roleIcon} ${u.email}`);
      });
      console.log('\n🚀 Login at: http://localhost:3000/auth/login\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\nMake sure:');
    console.log('1. Supabase project is accessible');
    console.log('2. SERVICE_ROLE_KEY is correct in .env.local');
    console.log('3. You have internet connection\n');
  }
}

// Run the script
listAllUsers();
