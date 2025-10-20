#!/bin/bash

# ============================
# GIS & Google Maps Setup Script
# ============================
# This script installs required packages for Maps integration

echo "🗺️  MANTIS - GIS & Google Maps Integration Setup"
echo "================================================"
echo ""

# Navigate to web directory
cd "$(dirname "$0")/../web" || exit 1

echo "📦 Installing Google Maps packages..."
echo ""

# Install Google Maps JavaScript API Loader
npm install @googlemaps/js-api-loader

# Install Google Maps TypeScript types
npm install --save-dev @types/google.maps

# Alternative: React Google Maps API (optional, more React-friendly)
echo ""
echo "📦 Installing React Google Maps API (alternative approach)..."
npm install @react-google-maps/api

echo ""
echo "✅ Packages installed successfully!"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Get Google Maps API Key:"
echo "   - Go to https://console.cloud.google.com/"
echo "   - Enable Maps JavaScript API, Places API, Geocoding API"
echo "   - Create API key"
echo ""
echo "2. Add to .env.local:"
echo "   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here"
echo ""
echo "3. Apply database migration:"
echo "   - Open Supabase Dashboard → SQL Editor"
echo "   - Run: db/migrations/014_gis_integration.sql"
echo ""
echo "4. Read full guide:"
echo "   - docs/GIS_MAPS_INTEGRATION.md"
echo ""
echo "🚀 Ready to integrate maps into MANTIS!"
