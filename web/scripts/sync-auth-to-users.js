#!/usr/bin/env node

/**
 * Sync Auth Users to Users Table
 * 
 * This script finds users in auth.users that don't have corresponding
 * records in the public.users table and creates them.
 * 
 * Usage:
 *   node sync-auth-to-users.js
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iftscgsnqurgvscedhiv.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmdHNjZ3NucXVyZ3ZzY2VkaGl2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDI5NzQ1MCwiZXhwIjoyMDc1ODczNDUwfQ.8yPMnZnScCtN0JmHIfZwQM9oR1VCozsNhpF28bCb31w';

// Mapping of email addresses to their roles and agencies
const USER_MAPPINGS = {
  'admin@mantis.gov.fj': {
    role: 'super_admin',
    position: 'System Administrator',
    agency: null,
    location: null
  },
  'fpf.admin@mantis.gov.fj': {
    role: 'agency_admin',
    position: 'Chief Inspector',
    agency: 'Fiji Police Force',
    location: 'Central Division'
  },
  'lta.admin@mantis.gov.fj': {
    role: 'agency_admin',
    position: 'Senior Transport Officer',
    agency: 'Land Transport Authority',
    location: 'Central Region'
  },
  'suva.admin@mantis.gov.fj': {
    role: 'agency_admin',
    position: 'City Parking Manager',
    agency: 'Suva City Council',
    location: null
  },
  'officer.john@fpf.gov.fj': {
    role: 'officer',
    position: 'Police Constable',
    agency: 'Fiji Police Force',
    location: 'Central Division'
  },
  'officer.sarah@fpf.gov.fj': {
    role: 'officer',
    position: 'Police Corporal',
    agency: 'Fiji Police Force',
    location: 'Western Division'
  },
  'inspector.mike@lta.gov.fj': {
    role: 'officer',
    position: 'Transport Inspector',
    agency: 'Land Transport Authority',
    location: 'Central Region'
  }
};

async function getAuthUsers() {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=100`, {
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch auth users: ${response.statusText}`);
  }

  const data = await response.json();
  return data.users || [];
}

async function getExistingUserIds() {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/users?select=id`, {
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    }
  });

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return data.map(u => u.id);
}

async function getAgencyId(agencyName) {
  if (!agencyName) return null;

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/agencies?name=eq.${encodeURIComponent(agencyName)}&select=id`,
    {
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      }
    }
  );

  if (!response.ok) return null;

  const data = await response.json();
  return data[0]?.id || null;
}

async function getLocationId(agencyId, locationName) {
  if (!agencyId || !locationName) return null;

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/locations?agency_id=eq.${agencyId}&name=eq.${encodeURIComponent(locationName)}&select=id`,
    {
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      }
    }
  );

  if (!response.ok) return null;

  const data = await response.json();
  return data[0]?.id || null;
}

async function createUserProfile(userId, email, mapping) {
  const agencyId = mapping.agency ? await getAgencyId(mapping.agency) : null;
  const locationId = agencyId && mapping.location 
    ? await getLocationId(agencyId, mapping.location) 
    : null;

  const response = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      id: userId,
      agency_id: agencyId,
      role: mapping.role,
      position: mapping.position,
      location_id: locationId
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create user profile: ${error}`);
  }

  return await response.json();
}

async function syncUsers() {
  console.log('🔄 Starting user sync from auth.users to users table...\n');

  try {
    // Get all auth users
    const authUsers = await getAuthUsers();
    console.log(`📊 Found ${authUsers.length} users in auth.users\n`);

    // Get existing user IDs
    const existingUserIds = await getExistingUserIds();
    console.log(`📊 Found ${existingUserIds.length} users in users table\n`);

    // Find users that need to be synced
    const usersToSync = authUsers.filter(user => !existingUserIds.includes(user.id));

    if (usersToSync.length === 0) {
      console.log('✅ All auth users are already synced to users table!\n');
      return;
    }

    console.log(`🔄 Need to sync ${usersToSync.length} users:\n`);
    console.log('═'.repeat(100));

    let synced = 0;
    let skipped = 0;
    let errors = 0;

    for (const authUser of usersToSync) {
      const email = authUser.email;
      console.log(`\n👤 Processing: ${email}`);

      // Check if we have a mapping for this email
      const mapping = USER_MAPPINGS[email];

      if (!mapping) {
        // Default mapping for unknown users
        console.log('   ⚠️  No mapping found, using default (officer role)');
        const defaultMapping = {
          role: 'officer',
          position: 'Officer',
          agency: null,
          location: null
        };

        try {
          await createUserProfile(authUser.id, email, defaultMapping);
          console.log(`   ✅ Synced with default role: officer`);
          synced++;
        } catch (error) {
          console.log(`   ❌ Error: ${error.message}`);
          errors++;
        }
        continue;
      }

      try {
        console.log(`   ├─ Role: ${mapping.role}`);
        console.log(`   ├─ Position: ${mapping.position}`);
        if (mapping.agency) console.log(`   ├─ Agency: ${mapping.agency}`);
        if (mapping.location) console.log(`   ├─ Location: ${mapping.location}`);

        await createUserProfile(authUser.id, email, mapping);

        const roleIcon = mapping.role === 'super_admin' ? '🔴' : 
                        mapping.role === 'agency_admin' ? '🔵' : '🟢';
        console.log(`   └─ ✅ Synced: ${roleIcon} ${mapping.role.toUpperCase()}`);
        synced++;
      } catch (error) {
        console.log(`   └─ ❌ Error: ${error.message}`);
        errors++;
      }
    }

    console.log('\n' + '═'.repeat(100));
    console.log('\n📊 Sync Summary:');
    console.log(`   ✅ Synced: ${synced}`);
    console.log(`   ⚠️  Skipped: ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📋 Total: ${usersToSync.length}`);

    if (synced > 0) {
      console.log('\n🎉 User sync completed successfully!\n');
      console.log('📝 Synced Users:');
      usersToSync.forEach(u => {
        const mapping = USER_MAPPINGS[u.email];
        if (mapping) {
          const roleIcon = mapping.role === 'super_admin' ? '🔴' : 
                          mapping.role === 'agency_admin' ? '🔵' : '🟢';
          console.log(`   ${roleIcon} ${u.email} → ${mapping.role}`);
        }
      });
      console.log('\n🚀 You can now log in at: http://localhost:3000/auth/login\n');
    }

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    console.log('\nMake sure:');
    console.log('1. Supabase project is accessible');
    console.log('2. SERVICE_ROLE_KEY is correct');
    console.log('3. Database has agencies and locations seeded\n');
    process.exit(1);
  }
}

// Run the script
syncUsers();
