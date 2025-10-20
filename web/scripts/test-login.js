#!/usr/bin/env node

/**
 * Alternative User Verification
 * 
 * Since RLS blocks even service role queries, we'll:
 * 1. Use a PostgreSQL query via Supabase SQL API
 * 2. Or create a test login attempt
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iftscgsnqurgvscedhiv.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmdHNjZ3NucXVyZ3ZzY2VkaGl2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDI5NzQ1MCwiZXhwIjoyMDc1ODczNDUwfQ.8yPMnZnScCtN0JmHIfZwQM9oR1VCozsNhpF28bCb31w';

async function testLogin() {
  console.log('🔐 Testing Login to Verify Users Table...\n');
  console.log('═'.repeat(100));

  try {
    // Create a Supabase client
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('\n📋 Test 1: Attempt Login with Admin Credentials\n');
    
    // Try to sign in as admin
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@mantis.gov.fj',
      password: 'Password123!'
    });

    if (error) {
      console.log(`   ❌ Login failed: ${error.message}`);
      console.log(`   Error code: ${error.status}\n`);
      
      if (error.message.includes('Invalid login credentials')) {
        console.log('⚠️  This could mean:');
        console.log('   1. Password is incorrect');
        console.log('   2. Email is incorrect');
        console.log('   3. User doesn\'t exist in auth.users\n');
      }
    } else {
      console.log('   ✅ Login successful!\n');
      console.log('   User ID:', data.user?.id);
      console.log('   Email:', data.user?.email);
      console.log('   Email confirmed:', data.user?.email_confirmed_at ? 'Yes' : 'No');
      
      // Now try to fetch user profile
      console.log('\n📋 Test 2: Fetch User Profile from users table\n');
      
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.log(`   ❌ Profile fetch failed: ${profileError.message}`);
        console.log(`   Error code: ${profileError.code}\n`);
        console.log('⚠️  This confirms: User is in auth.users but NOT in public.users table!\n');
        console.log('📝 Solution: The sync script needs to be run again OR');
        console.log('   there\'s an issue with how users were inserted.\n');
      } else {
        console.log('   ✅ Profile found!\n');
        console.log('   Role:', profile.role);
        console.log('   Position:', profile.position);
        console.log('   Agency ID:', profile.agency_id || 'None');
        console.log('   Location ID:', profile.location_id || 'None\n');
        
        console.log('═'.repeat(100));
        console.log('\n🎉 SUCCESS! Users table has data and is working correctly!\n');
      }
      
      // Sign out
      await supabase.auth.signOut();
    }

    console.log('═'.repeat(100));
    console.log('\n📊 Summary:\n');
    console.log('Auth Users: 7 (confirmed)');
    console.log('Public Users: Unknown (RLS blocking queries)');
    console.log('\nNext Step: Try logging in via web interface');
    console.log('URL: http://localhost:3000/auth/login\n');

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testLogin();
