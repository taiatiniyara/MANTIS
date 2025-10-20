#!/usr/bin/env node

/**
 * Seed Users Script for MANTIS
 * 
 * This script creates test users in Supabase using the Admin API
 * and then links them to agencies in the users table.
 * 
 * Usage:
 *   node seed-users.js
 * 
 * Default Password: Password123!
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iftscgsnqurgvscedhiv.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmdHNjZ3NucXVyZ3ZzY2VkaGl2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDI5NzQ1MCwiZXhwIjoyMDc1ODczNDUwfQ.8yPMnZnScCtN0JmHIfZwQM9oR1VCozsNhpF28bCb31w';

const DEFAULT_PASSWORD = 'Password123!';

const SEED_USERS = [
  {
    email: 'admin@mantis.gov.fj',
    role: 'super_admin',
    position: 'System Administrator',
    agency: null,
    location: null
  },
  {
    email: 'fpf.admin@mantis.gov.fj',
    role: 'agency_admin',
    position: 'Chief Inspector',
    agency: 'Fiji Police Force',
    location: 'Central Division'
  },
  {
    email: 'lta.admin@mantis.gov.fj',
    role: 'agency_admin',
    position: 'Senior Transport Officer',
    agency: 'Land Transport Authority',
    location: 'Central Region'
  },
  {
    email: 'suva.admin@mantis.gov.fj',
    role: 'agency_admin',
    position: 'City Parking Manager',
    agency: 'Suva City Council',
    location: null
  },
  {
    email: 'officer.john@fpf.gov.fj',
    role: 'officer',
    position: 'Police Constable',
    agency: 'Fiji Police Force',
    location: 'Central Division'
  },
  {
    email: 'officer.sarah@fpf.gov.fj',
    role: 'officer',
    position: 'Police Corporal',
    agency: 'Fiji Police Force',
    location: 'Western Division'
  },
  {
    email: 'inspector.mike@lta.gov.fj',
    role: 'officer',
    position: 'Transport Inspector',
    agency: 'Land Transport Authority',
    location: 'Central Region'
  }
];

async function createAuthUser(email, password) {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: {}
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create auth user: ${error}`);
  }

  return await response.json();
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

async function createUserProfile(userId, userData) {
  const agencyId = userData.agency ? await getAgencyId(userData.agency) : null;
  const locationId = agencyId && userData.location 
    ? await getLocationId(agencyId, userData.location) 
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
      role: userData.role,
      position: userData.position,
      location_id: locationId
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create user profile: ${error}`);
  }

  return await response.json();
}

async function seedUsers() {
  console.log('🌱 Starting MANTIS user seeding...\n');
  console.log(`📧 Creating ${SEED_USERS.length} users with password: ${DEFAULT_PASSWORD}\n`);
  console.log('═'.repeat(100));

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const userData of SEED_USERS) {
    try {
      console.log(`\n📝 Processing: ${userData.email}`);

      // Create auth user
      console.log('   ├─ Creating auth user...');
      const authUser = await createAuthUser(userData.email, DEFAULT_PASSWORD);
      console.log(`   ├─ ✅ Auth user created: ${authUser.id}`);

      // Create user profile
      console.log('   ├─ Creating user profile...');
      await createUserProfile(authUser.id, userData);
      
      const roleIcon = userData.role === 'super_admin' ? '🔴' : 
                       userData.role === 'agency_admin' ? '🔵' : '🟢';
      console.log(`   └─ ✅ Profile created: ${roleIcon} ${userData.role.toUpperCase()}`);
      
      created++;

    } catch (error) {
      if (error.message.includes('already registered') || error.message.includes('duplicate') || error.message.includes('email_exists')) {
        console.log(`   └─ ⚠️  User already exists, skipping`);
        skipped++;
      } else {
        console.log(`   └─ ❌ Error: ${error.message}`);
        errors++;
      }
    }
  }

  console.log('\n' + '═'.repeat(100));
  console.log('\n📊 Seeding Summary:');
  console.log(`   ✅ Created: ${created}`);
  console.log(`   ⚠️  Skipped: ${skipped}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log(`   📋 Total: ${SEED_USERS.length}`);

  if (created > 0) {
    console.log('\n🎉 User seeding completed successfully!\n');
    console.log('📝 Test Users Created:');
    console.log('   🔴 Super Admin: admin@mantis.gov.fj');
    console.log('   🔵 Agency Admins: fpf.admin@mantis.gov.fj, lta.admin@mantis.gov.fj, suva.admin@mantis.gov.fj');
    console.log('   🟢 Officers: officer.john@fpf.gov.fj, officer.sarah@fpf.gov.fj, inspector.mike@lta.gov.fj');
    console.log(`\n🔑 Password for all users: ${DEFAULT_PASSWORD}`);
    console.log('\n🚀 You can now log in at: http://localhost:3000/auth/login\n');
  } else if (skipped === SEED_USERS.length) {
    console.log('\n✨ All users already exist in the system!\n');
  } else {
    console.log('\n⚠️  Some errors occurred during seeding.\n');
  }
}

// Run the script
seedUsers().catch((error) => {
  console.error('\n❌ Fatal error:', error.message);
  process.exit(1);
});
