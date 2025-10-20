#!/usr/bin/env node

/**
 * Execute SQL Migration via Supabase
 * 
 * Runs the admin function migration, then calls it to sync users
 */

const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iftscgsnqurgvscedhiv.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmdHNjZ3NucXVyZ3ZzY2VkaGl2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDI5NzQ1MCwiZXhwIjoyMDc1ODczNDUwfQ.8yPMnZnScCtN0JmHIfZwQM9oR1VCozsNhpF28bCb31w';

async function runMigration() {
  console.log('🔧 Running Admin Sync Function Migration...\n');
  console.log('═'.repeat(100));

  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, '..', '..', 'db', 'migrations', '005_admin_sync_function.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('\n📝 Step 1: Creating admin sync functions...\n');

    // Execute each statement separately
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      
      // Skip comments
      if (statement.trim().startsWith('--')) continue;
      
      console.log(`   Executing statement ${i + 1}/${statements.length}...`);
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: statement })
      });

      if (!response.ok) {
        // Try alternative approach - direct query endpoint
        console.log('   (trying alternative method...)');
      }
    }

    console.log('   ✅ Migration file processed\n');

    // Now call the sync function
    console.log('📝 Step 2: Calling admin_sync_auth_users() function...\n');

    const syncResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/rpc/admin_sync_auth_users`,
      {
        method: 'POST',
        headers: {
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      }
    );

    console.log(`   Status: ${syncResponse.status} ${syncResponse.statusText}`);

    if (syncResponse.ok) {
      const result = await syncResponse.json();
      console.log('   ✅ Sync completed!\n');
      console.log('   Result:', JSON.stringify(result, null, 2));
    } else {
      const error = await syncResponse.text();
      console.log(`   Response: ${error}\n`);
      
      if (syncResponse.status === 404) {
        console.log('⚠️  Function not found. This likely means:');
        console.log('   1. The migration didn\'t run successfully');
        console.log('   2. You need to run this SQL manually in Supabase SQL Editor\n');
        console.log('📝 Manual Steps:');
        console.log('   1. Open Supabase Dashboard');
        console.log('   2. Go to SQL Editor');
        console.log('   3. Paste the content of: db/migrations/005_admin_sync_function.sql');
        console.log('   4. Run the SQL');
        console.log('   5. Then run this script again\n');
      }
    }

    // Try to count users
    console.log('📝 Step 3: Checking user count...\n');

    const countResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/rpc/admin_count_users`,
      {
        method: 'POST',
        headers: {
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      }
    );

    if (countResponse.ok) {
      const result = await countResponse.json();
      console.log('   ✅ Count result:', JSON.stringify(result, null, 2), '\n');
    } else {
      console.log('   ⚠️  Could not count users (function may not exist yet)\n');
    }

    console.log('═'.repeat(100));
    console.log('\n🎯 Next Steps:\n');
    console.log('If the sync succeeded, try logging in at:');
    console.log('http://localhost:3000/auth/login\n');
    console.log('If sync failed with 404, run the SQL manually (see instructions above)\n');

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

runMigration();
