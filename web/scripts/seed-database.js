#!/usr/bin/env node

/**
 * Seed Database with Initial Data
 * 
 * Seeds agencies, locations, infringement categories, and types.
 * Must be run before syncing users.
 */

const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iftscgsnqurgvscedhiv.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmdHNjZ3NucXVyZ3ZzY2VkaGl2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDI5NzQ1MCwiZXhwIjoyMDc1ODczNDUwfQ.8yPMnZnScCtN0JmHIfZwQM9oR1VCozsNhpF28bCb31w';

async function insertData(table, records, description) {
  console.log(`\n📝 Inserting ${description}...`);
  
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation,resolution=ignore-duplicates'
    },
    body: JSON.stringify(records)
  });

  if (!response.ok && response.status !== 409) {
    const error = await response.text();
    console.log(`   ⚠️  Some records may already exist`);
    return [];
  }

  const data = response.ok ? await response.json() : [];
  console.log(`   ✅ Inserted ${Array.isArray(data) ? data.length : 'some'} records`);
  return Array.isArray(data) ? data : [];
}

async function seedDatabase() {
  console.log('🌱 Starting database seeding...\n');
  console.log('═'.repeat(100));

  try {
    // 1. Insert Agencies
    const agencies = [
      { name: 'Fiji Police Force' },
      { name: 'Land Transport Authority' },
      { name: 'Suva City Council' },
      { name: 'Lautoka City Council' },
      { name: 'Nadi Town Council' },
      { name: 'Labasa Town Council' }
    ];

    await insertData('agencies', agencies, 'agencies');

    // Fetch agencies to get their IDs
    const agenciesResp = await fetch(
      `${SUPABASE_URL}/rest/v1/agencies?select=id,name`,
      {
        headers: {
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        }
      }
    );
    
    if (!agenciesResp.ok) {
      throw new Error('Failed to fetch agencies');
    }
    
    const agenciesList = await agenciesResp.json();
    
    if (!Array.isArray(agenciesList)) {
      throw new Error('Invalid response from agencies endpoint');
    }
    
    const agencyMap = Object.fromEntries(agenciesList.map(a => [a.name, a.id]));

    // 2. Insert Locations
    const locations = [
      // Police Divisions
      { agency_id: agencyMap['Fiji Police Force'], type: 'division', name: 'Central Division' },
      { agency_id: agencyMap['Fiji Police Force'], type: 'division', name: 'Western Division' },
      { agency_id: agencyMap['Fiji Police Force'], type: 'division', name: 'Northern Division' },
      { agency_id: agencyMap['Fiji Police Force'], type: 'division', name: 'Eastern Division' },
      // LTA Regions
      { agency_id: agencyMap['Land Transport Authority'], type: 'region', name: 'Central Region' },
      { agency_id: agencyMap['Land Transport Authority'], type: 'region', name: 'Western Region' },
      { agency_id: agencyMap['Land Transport Authority'], type: 'region', name: 'Northern Region' },
      // Councils
      { agency_id: agencyMap['Suva City Council'], type: 'council', name: 'Suva City Council' },
      { agency_id: agencyMap['Lautoka City Council'], type: 'council', name: 'Lautoka City Council' },
      { agency_id: agencyMap['Nadi Town Council'], type: 'council', name: 'Nadi Town Council' },
      { agency_id: agencyMap['Labasa Town Council'], type: 'council', name: 'Labasa Town Council' },
    ];

    await insertData('locations', locations, 'locations');

    // 3. Insert Infringement Categories
    const categories = [
      { name: 'Speeding', description: 'Exceeding posted speed limits' },
      { name: 'Parking', description: 'Illegal or improper parking' },
      { name: 'Licensing', description: 'Driver or vehicle licensing offences' },
      { name: 'Vehicle Condition', description: 'Unsafe or unroadworthy vehicles' },
      { name: 'Dangerous Driving', description: 'Reckless or negligent driving' }
    ];

    await insertData('infringement_categories', categories, 'infringement categories');

    // Fetch categories to get their IDs
    const categoriesResp = await fetch(
      `${SUPABASE_URL}/rest/v1/infringement_categories?select=id,name`,
      {
        headers: {
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        }
      }
    );
    
    if (!categoriesResp.ok) {
      throw new Error('Failed to fetch infringement categories');
    }
    
    const categoriesList = await categoriesResp.json();
    
    if (!Array.isArray(categoriesList)) {
      throw new Error('Invalid response from categories endpoint');
    }
    
    const categoryMap = Object.fromEntries(categoriesList.map(c => [c.name, c.id]));

    // 4. Insert Infringement Types
    const types = [
      // Speeding
      {
        category_id: categoryMap['Speeding'],
        code: 'SPD-001',
        name: 'Exceeding speed limit by 10-15 km/h',
        description: 'Minor speeding offence',
        fine_amount: 50.00,
        demerit_points: 1,
        gl_code: '4100'
      },
      {
        category_id: categoryMap['Speeding'],
        code: 'SPD-002',
        name: 'Exceeding speed limit by 16-30 km/h',
        description: 'Moderate speeding offence',
        fine_amount: 100.00,
        demerit_points: 2,
        gl_code: '4100'
      },
      // Parking
      {
        category_id: categoryMap['Parking'],
        code: 'PRK-001',
        name: 'Parking in a no-parking zone',
        description: 'Vehicle parked in restricted area',
        fine_amount: 40.00,
        demerit_points: 0,
        gl_code: '4200'
      },
      // Licensing
      {
        category_id: categoryMap['Licensing'],
        code: 'LIC-001',
        name: 'Driving without a valid license',
        description: 'Unlicensed driver',
        fine_amount: 200.00,
        demerit_points: 3,
        gl_code: '4300'
      },
      // Vehicle Condition
      {
        category_id: categoryMap['Vehicle Condition'],
        code: 'VEH-001',
        name: 'Driving with defective lights',
        description: 'Vehicle lights not operational',
        fine_amount: 30.00,
        demerit_points: 0,
        gl_code: '4400'
      },
      // Dangerous Driving
      {
        category_id: categoryMap['Dangerous Driving'],
        code: 'DD-001',
        name: 'Reckless driving',
        description: 'Driving in a manner dangerous to the public',
        fine_amount: 300.00,
        demerit_points: 5,
        gl_code: '4500'
      }
    ];

    await insertData('infringement_types', types, 'infringement types');

    console.log('\n' + '═'.repeat(100));
    console.log('\n✅ Database seeding complete!\n');

    // Summary
    console.log('📊 Summary:');
    console.log(`   ✅ Agencies: ${agencies.length}`);
    console.log(`   ✅ Locations: ${locations.length}`);
    console.log(`   ✅ Infringement Categories: ${categories.length}`);
    console.log(`   ✅ Infringement Types: ${types.length}`);
    console.log('\n🎯 Next step: Run sync-users-direct.js to sync auth users\n');

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
}

seedDatabase();
