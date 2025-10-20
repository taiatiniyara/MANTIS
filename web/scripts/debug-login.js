#!/usr/bin/env node

/**
 * Complete Login Debugging Script
 * Shows exactly what's happening and where it's failing
 */

const { createClient } = require('@supabase/supabase-js');

// Load .env.local file
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iftscgsnqurgvscedhiv.supabase.co';
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmdHNjZ3NucXVyZ3ZzY2VkaGl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyOTc0NTAsImV4cCI6MjA3NTg3MzQ1MH0.6Nz5xaauBnf0iBXPzUVs4UsQECowPnFcoGbZ0B9forY';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmdHNjZ3NucXVyZ3ZzY2VkaGl2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDI5NzQ1MCwiZXhwIjoyMDc1ODczNDUwfQ.8yPMnZnScCtN0JmHIfZwQM9oR1VCozsNhpF28bCb31w';

async function debugLogin() {
  console.log('🔍 COMPLETE LOGIN DEBUG REPORT\n');
  console.log('═'.repeat(100));
  
  // Test 1: Check Supabase Connection
  console.log('\n📡 Test 1: Supabase Connection');
  console.log(`   URL: ${SUPABASE_URL}`);
  console.log(`   Has Anon Key: ${ANON_KEY ? 'Yes (' + ANON_KEY.substring(0, 20) + '...)' : 'No'}`);
  console.log(`   Has Service Key: ${SERVICE_ROLE_KEY ? 'Yes (' + SERVICE_ROLE_KEY.substring(0, 20) + '...)' : 'No'}`);

  try {
    const pingResponse = await fetch(SUPABASE_URL);
    console.log(`   ✅ Supabase reachable: ${pingResponse.status}`);
  } catch (error) {
    console.log(`   ❌ Supabase unreachable: ${error.message}`);
  }

  // Test 2: Auth Login
  console.log('\n🔐 Test 2: Authentication');
  const supabase = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@mantis.gov.fj',
    password: 'Password123!'
  });

  if (authError) {
    console.log(`   ❌ Auth failed: ${authError.message}`);
    console.log(`   Code: ${authError.status}`);
    return;
  }

  console.log(`   ✅ Auth successful`);
  console.log(`   User ID: ${authData.user.id}`);
  console.log(`   Email: ${authData.user.email}`);
  console.log(`   Email verified: ${authData.user.email_confirmed_at ? 'Yes' : 'No'}`);

  // Test 3: Try to fetch profile with anon key
  console.log('\n👤 Test 3: Fetch User Profile (as authenticated user)');
  
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', authData.user.id)
    .single();

  if (profileError) {
    console.log(`   ❌ Profile fetch failed: ${profileError.message}`);
    console.log(`   Code: ${profileError.code}`);
    console.log(`   Details: ${profileError.details || 'none'}`);
    console.log(`   Hint: ${profileError.hint || 'none'}`);
  } else if (profile) {
    console.log(`   ✅ Profile found!`);
    console.log(`   Role: ${profile.role}`);
    console.log(`   Position: ${profile.position}`);
    console.log(`   Agency ID: ${profile.agency_id || 'null'}`);
  } else {
    console.log(`   ⚠️  No profile returned (but no error either)`);
  }

  // Test 4: Try with service role key
  console.log('\n🔑 Test 4: Check with Service Role Key');
  const adminSupabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  
  const { data: adminProfile, error: adminError } = await adminSupabase
    .from('users')
    .select('*')
    .eq('id', authData.user.id)
    .single();

  if (adminError) {
    console.log(`   ❌ Service role also blocked: ${adminError.message}`);
  } else if (adminProfile) {
    console.log(`   ✅ Service role can see profile!`);
    console.log(`   Role: ${adminProfile.role}`);
  } else {
    console.log(`   ⚠️  No profile exists (user not in public.users table)`);
  }

  // Test 5: Count total users with service role
  console.log('\n📊 Test 5: Count All Users in Table');
  
  const { data: allUsers, error: countError } = await adminSupabase
    .from('users')
    .select('id, role', { count: 'exact' });

  if (countError) {
    console.log(`   ❌ Count failed: ${countError.message}`);
  } else {
    console.log(`   Total users in public.users: ${allUsers ? allUsers.length : 0}`);
    if (allUsers && allUsers.length > 0) {
      allUsers.forEach(u => console.log(`      - ${u.id.substring(0, 8)}... (${u.role})`));
    }
  }

  // Test 6: Check RLS Status
  console.log('\n🔒 Test 6: Check RLS Status');
  
  try {
    const { data: rlsStatus } = await adminSupabase.rpc('pg_catalog.pg_tables', {});
    console.log('   Unable to check RLS status via RPC');
  } catch (e) {
    console.log('   Unable to check RLS status programmatically');
  }

  console.log('\n' + '═'.repeat(100));
  console.log('\n📋 DIAGNOSIS:\n');

  if (profileError && profileError.code === '42501') {
    console.log('⚠️  RLS is BLOCKING access to users table');
    console.log('');
    console.log('This means either:');
    console.log('1. ❌ SQL has NOT been run in Supabase yet');
    console.log('2. ❌ Users table is still empty');
    console.log('3. ❌ RLS policies are preventing reads even after insert');
    console.log('');
    console.log('🔧 SOLUTION:');
    console.log('');
    console.log('You MUST run this SQL in Supabase SQL Editor:');
    console.log('');
    console.log('   1. Open: https://supabase.com/dashboard/project/iftscgsnqurgvscedhiv/sql/new');
    console.log('   2. Copy ALL content from: fix-user-sync-simple.sql');
    console.log('   3. Paste into SQL Editor');
    console.log('   4. Click RUN button');
    console.log('   5. Wait for "7 rows" result at bottom');
    console.log('   6. Run this script again to verify');
    console.log('');
  } else if (!profile && !adminProfile) {
    console.log('❌ Users table is EMPTY');
    console.log('');
    console.log('SQL has not been run yet. Follow steps above.');
    console.log('');
  } else if (profile) {
    console.log('✅ Everything is working!');
    console.log('');
    console.log('Login should work at: http://localhost:3001/auth/login');
    console.log('');
  }

  await supabase.auth.signOut();
}

debugLogin();
