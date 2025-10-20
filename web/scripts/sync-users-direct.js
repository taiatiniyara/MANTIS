#!/usr/bin/env node

/**
 * Sync Auth Users to Users Table (Direct Insert)
 * 
 * Uses Supabase service role to directly insert user records,
 * bypassing RLS policies.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iftscgsnqurgvscedhiv.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmdHNjZ3NucXVyZ3ZzY2VkaGl2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDI5NzQ1MCwiZXhwIjoyMDc1ODczNDUwfQ.8yPMnZnScCtN0JmHIfZwQM9oR1VCozsNhpF28bCb31w';

async function getAuthUsers() {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=100`, {
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    }
  });

  if (!response.ok) throw new Error('Failed to fetch auth users');
  const data = await response.json();
  return data.users || [];
}

async function getAgencies() {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/agencies?select=id,name`,
    {
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Prefer': 'return=representation'
      }
    }
  );

  if (!response.ok) return [];
  return await response.json();
}

async function getLocations() {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/locations?select=id,name,agency_id`,
    {
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Prefer': 'return=representation'
      }
    }
  );

  if (!response.ok) return [];
  return await response.json();
}

async function insertUser(user) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation,resolution=ignore-duplicates'
    },
    body: JSON.stringify(user)
  });

  if (!response.ok && !response.status === 409) {
    const error = await response.text();
    throw new Error(`Failed to insert user: ${error}`);
  }

  return response.ok ? await response.json() : null;
}

async function syncUsers() {
  console.log('🔄 Starting direct user sync...\n');

  try {
    // Get data
    const authUsers = await getAuthUsers();
    const agencies = await getAgencies();
    const locations = await getLocations();

    console.log(`📊 Found ${authUsers.length} auth users`);
    console.log(`📊 Found ${agencies.length} agencies`);
    console.log(`📊 Found ${locations.length} locations\n`);

    // Helper functions
    const findAgency = (name) => agencies.find(a => a.name === name);
    const findLocation = (agencyId, name) => 
      locations.find(l => l.agency_id === agencyId && l.name === name);

    // User mappings
    const mappings = {
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

    console.log('═'.repeat(100));
    let synced = 0;

    for (const authUser of authUsers) {
      const email = authUser.email;
      const mapping = mappings[email];

      if (!mapping) {
        console.log(`\n⚠️  Skipping ${email} - no mapping found`);
        continue;
      }

      console.log(`\n👤 Syncing: ${email}`);
      console.log(`   ├─ Role: ${mapping.role}`);
      console.log(`   ├─ Position: ${mapping.position}`);

      let agencyId = null;
      let locationId = null;

      if (mapping.agency) {
        const agency = findAgency(mapping.agency);
        if (agency) {
          agencyId = agency.id;
          console.log(`   ├─ Agency: ${mapping.agency} (${agencyId.substring(0, 8)}...)`);

          if (mapping.location) {
            const location = findLocation(agencyId, mapping.location);
            if (location) {
              locationId = location.id;
              console.log(`   ├─ Location: ${mapping.location} (${locationId.substring(0, 8)}...)`);
            }
          }
        }
      }

      try {
        const userRecord = {
          id: authUser.id,
          agency_id: agencyId,
          role: mapping.role,
          position: mapping.position,
          location_id: locationId
        };

        await insertUser(userRecord);

        const roleIcon = mapping.role === 'super_admin' ? '🔴' : 
                        mapping.role === 'agency_admin' ? '🔵' : '🟢';
        console.log(`   └─ ✅ Synced: ${roleIcon} ${mapping.role.toUpperCase()}`);
        synced++;
      } catch (error) {
        console.log(`   └─ ❌ Error: ${error.message}`);
      }
    }

    console.log('\n' + '═'.repeat(100));
    console.log(`\n✅ Successfully synced ${synced} of ${authUsers.length} users\n`);

    // Verify
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
      console.log('📊 Users now in database:\n');
      users.forEach(user => {
        const roleIcon = user.role === 'super_admin' ? '🔴' : 
                        user.role === 'agency_admin' ? '🔵' : '🟢';
        console.log(`   ${roleIcon} ${user.role.toUpperCase().padEnd(15)} - ${user.position}`);
      });
      console.log(`\n📋 Total: ${users.length} users\n`);
    }

    console.log('🚀 Login ready at: http://localhost:3000/auth/login');
    console.log('👤 Test with: admin@mantis.gov.fj / Password123!\n');

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
}

syncUsers();
