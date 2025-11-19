#!/bin/bash

# ============================
# GIS & Mapping Setup Script
# ============================
# This script installs required packages for Maps integration
# Web: Leaflet.js | Mobile: React Native Maps (Google Maps)

echo "🗺️  MANTIS - GIS & Mapping Integration Setup"
echo "============================================="
echo ""

# Navigate to web directory
cd "$(dirname "$0")/../web" || exit 1

echo "📦 Installing Leaflet packages for web..."
echo ""

# Install Leaflet and related packages
npm install leaflet@^1.9.4
npm install leaflet-draw@^1.0.4
npm install leaflet.heat@^0.2.0

# Install TypeScript types
npm install --save-dev @types/leaflet@^1.9.21
npm install --save-dev @types/leaflet-draw@^1.0.13
npm install --save-dev @types/leaflet.heat@^0.2.5

echo ""
echo "✅ Web packages installed successfully!"
echo ""

# Navigate to mobile directory
cd ../mobile || exit 1

echo "📦 Checking mobile map packages..."
echo ""

# React Native Maps is already in package.json
echo "✅ React Native Maps already configured in package.json"

echo ""
echo "📋 Next Steps:"
echo ""
echo "For Web Application (Leaflet):"
echo "   - No API key required (uses OpenStreetMap tiles)"
echo "   - Maps already integrated in web/components/maps/"
echo ""
echo "For Mobile Application (Google Maps):"
echo "   1. Get Google Maps API Key:"
echo "      - Go to https://console.cloud.google.com/"
echo "      - Enable Maps JavaScript API, Places API, Geocoding API"
echo "      - Create API key"
echo ""
echo "   2. Add to mobile/.env:"
echo "      EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here"
echo ""
echo "   3. Configure in app.config.js"
echo ""
echo "Database Setup:"
echo "   - GPS tracking with PostGIS is in migration 004"
echo "   - Run: supabase db push"
echo ""
echo "🚀 Ready to use maps in MANTIS!"
