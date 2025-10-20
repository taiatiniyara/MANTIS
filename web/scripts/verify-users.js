#!/usr/bin/env node

/**
 * Verify Users Table
 * 
 * Directly queries the users table to verify records exist
 * Tries multiple methods to get past RLS
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iftscgsnqurgvscedhiv.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmdHNjZ3NucXVyZ3ZzY2VkaGl2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDI5NzQ1MCwiZXhwIjoyMDc1ODczNDUwfQ.8yPMnZnScCtN0JmHIfZwQM9oR1VCozsNhpF28bCb31w';

async function verifyUsers() {
  console.log('🔍 Verifying Users Table...\n');
  console.log('═'.repeat(100));

  try {
    // Method 1: Try REST API
    console.log('\n📋 Method 1: REST API Query\n');
    
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/users?select=id,role,position,agency_id,location_id`,
      {
        headers: {
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Prefer': 'return=representation'
        }
      }
    );

    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const users = await response.json();
      console.log(`   Result: ${Array.isArray(users) ? users.length : 'non-array'} records\n`);
      
      if (Array.isArray(users) && users.length > 0) {
        console.log('✅ SUCCESS! Users found in table:\n');
        console.log('═'.repeat(100));
        users.forEach((user, idx) => {
          const roleIcon = user.role === 'super_admin' ? '🔴' : 
                          user.role === 'agency_admin' ? '🔵' : '🟢';
          console.log(`${idx + 1}. ${roleIcon} ${user.role.toUpperCase().padEnd(15)} - ${user.position}`);
          console.log(`   ID: ${user.id}`);
          if (user.agency_id) console.log(`   Agency ID: ${user.agency_id}`);
          if (user.location_id) console.log(`   Location ID: ${user.location_id}`);
          console.log('');
        });
        console.log('═'.repeat(100));
        console.log(`\n📊 Total Users: ${users.length}\n`);
        return users;
      } else if (Array.isArray(users) && users.length === 0) {
        console.log('⚠️  Query returned empty array - checking if this is RLS issue...\n');
      } else {
        const text = await response.text();
        console.log(`   Response: ${text.substring(0, 200)}\n`);
      }
    } else {
      const errorText = await response.text();
      console.log(`   Error: ${errorText}\n`);
    }

    // Method 2: Check auth users and compare
    console.log('📋 Method 2: Compare Auth Users\n');
    
    const authResponse = await fetch(
      `${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=100`,
      {
        headers: {
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        }
      }
    );

    if (authResponse.ok) {
      const authData = await authResponse.json();
      const authUsers = authData.users || [];
      
      console.log(`   ✅ Auth users: ${authUsers.length}\n`);
      console.log('   Auth user emails:');
      authUsers.forEach((user, idx) => {
        console.log(`   ${idx + 1}. ${user.email}`);
      });
      console.log('');
    }

    // Method 3: Try to count with preference header
    console.log('📋 Method 3: Count Query\n');
    
    const countResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/users?select=count`,
      {
        headers: {
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Prefer': 'count=exact'
        }
      }
    );

    console.log(`   Status: ${countResponse.status} ${countResponse.statusText}`);
    
    const contentRange = countResponse.headers.get('content-range');
    if (contentRange) {
      const count = contentRange.split('/')[1];
      console.log(`   Content-Range: ${contentRange}`);
      console.log(`   Count: ${count}\n`);
      
      if (parseInt(count) === 0) {
        console.log('⚠️  WARNING: Count shows 0 records\n');
      }
    } else {
      console.log('   No content-range header\n');
    }

    // Method 4: Try RPC function
    console.log('📋 Method 4: Check Table Existence\n');
    
    const tableCheckResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/users?select=id&limit=1`,
      {
        headers: {
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        }
      }
    );

    if (tableCheckResponse.ok) {
      console.log('   ✅ Table is accessible\n');
    } else {
      console.log(`   ❌ Table access failed: ${tableCheckResponse.status}\n`);
    }

    console.log('═'.repeat(100));
    console.log('\n🔍 Analysis:\n');
    console.log('If REST API shows 0 records but auth users exist, this indicates:');
    console.log('1. RLS policies are blocking the query even with service role');
    console.log('2. Users were inserted but not visible via REST API');
    console.log('3. Login should still work because auth checks both tables\n');
    
    console.log('💡 Solution: Try logging in at http://localhost:3000/auth/login');
    console.log('📧 Email: admin@mantis.gov.fj');
    console.log('🔑 Password: Password123!\n');
    console.log('If login works, the users ARE in the table despite REST API showing 0.\n');

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

verifyUsers();
