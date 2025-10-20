/**
 * Simple login test - mimics exactly what the login form does
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function testLogin() {
  console.log('\n🔐 Testing Login Flow (exactly like the login form)\n');
  console.log('=' .repeat(60));
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  try {
    // Step 1: Sign in
    console.log('\n📝 Step 1: Signing in...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@mantis.gov.fj',
      password: 'Password123!'
    });
    
    if (authError) {
      console.log('❌ Login failed:', authError.message);
      return;
    }
    
    console.log('✅ Login successful!');
    console.log('   User ID:', authData.user.id);
    console.log('   Email:', authData.user.email);
    
    // Step 2: Try to fetch profile (what login form does)
    console.log('\n👤 Step 2: Fetching user profile...');
    const { data: userData, error: profileError } = await supabase
      .from('users')
      .select('role, agency_id, position')
      .eq('id', authData.user.id)
      .single();
    
    if (profileError) {
      console.log('❌ Profile fetch failed:', profileError.message);
      console.log('   Code:', profileError.code);
      console.log('   Hint:', profileError.hint);
      console.log('\n⚠️  This means RLS is BLOCKING the query');
      console.log('   The SQL file was NOT run successfully in Supabase');
      return;
    }
    
    console.log('✅ Profile fetched successfully!');
    console.log('   Role:', userData.role);
    console.log('   Position:', userData.position);
    console.log('   Agency ID:', userData.agency_id);
    
    // Step 3: Determine redirect
    const redirectPath = userData.role === 'super_admin' ? '/admin' : '/protected';
    console.log('\n🎯 Step 3: Redirect destination');
    console.log('   Would redirect to:', redirectPath);
    
    console.log('\n✅ LOGIN WOULD WORK! The redirect should happen correctly.');
    
  } catch (error) {
    console.log('\n❌ Unexpected error:', error.message);
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
}

testLogin();
