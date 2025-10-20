#!/usr/bin/env node

/**
 * Run SQL Migration to Sync Users
 * 
 * This script runs the SQL migration directly using the service role key
 * to bypass RLS and sync auth users to the users table.
 */

const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iftscgsnqurgvscedhiv.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmdHNjZ3NucXVyZ3ZzY2VkaGl2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDI5NzQ1MCwiZXhwIjoyMDc1ODczNDUwfQ.8yPMnZnScCtN0JmHIfZwQM9oR1VCozsNhpF28bCb31w';

async function runMigration() {
  console.log('🔄 Running user sync migration...\n');

  try {
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '..', 'db', 'migrations', '004_sync_auth_users.sql');
    
    if (!fs.existsSync(migrationPath)) {
      // Try supabase folder instead
      const altPath = path.join(__dirname, '..', 'supabase', 'migrations', '004_sync_auth_users.sql');
      if (!fs.existsSync(altPath)) {
        throw new Error('Migration file not found');
      }
    }

    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📝 Executing SQL migration...\n');

    // Execute via Supabase REST API with RPC
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Migration failed: ${error}`);
    }

    console.log('✅ Migration executed successfully!\n');

    // Verify the sync
    const verifyResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/users?select=id,role,position&order=role.desc`,
      {
        headers: {
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        }
      }
    );

    if (verifyResponse.ok) {
      const users = await verifyResponse.json();
      console.log('📊 Verification - Users in public.users table:\n');
      console.log('═'.repeat(80));
      
      users.forEach(user => {
        const roleIcon = user.role === 'super_admin' ? '🔴' : 
                        user.role === 'agency_admin' ? '🔵' : '🟢';
        console.log(`${roleIcon} ${user.role.toUpperCase().padEnd(15)} - ${user.position}`);
      });
      
      console.log('═'.repeat(80));
      console.log(`\n✅ Total users synced: ${users.length}\n`);
      console.log('🚀 You can now log in at: http://localhost:3000/auth/login');
      console.log('👤 Test with: admin@mantis.gov.fj / Password123!\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

runMigration();
