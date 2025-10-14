# Google Maps API Configuration Guide

## 🗺️ Setting Up Google Maps API Keys for MANTIS Mobile

This guide walks you through setting up Google Maps API keys for iOS and Android.

---

## 📋 Prerequisites

- Google Cloud Platform account
- Billing enabled (required for Maps SDK)
- MANTIS Mobile project access

---

## 🔧 Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name: `MANTIS Mobile`
4. Click "Create"

---

## 🔑 Step 2: Enable Required APIs

Navigate to "APIs & Services" → "Library" and enable:

### Required APIs
- ✅ **Maps SDK for iOS** (for iOS app)
- ✅ **Maps SDK for Android** (for Android app)
- ✅ **Places API** (for reverse geocoding)
- ✅ **Geocoding API** (for address lookup)
- ✅ **Directions API** (for "Get Directions" feature)

---

## 🔐 Step 3: Create API Keys

### iOS API Key

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Name: `MANTIS Mobile iOS`
4. Click "Restrict Key"

**Restrictions:**
- **Application restrictions**: iOS apps
- **Bundle ID**: `com.mantis.mobile`
- **API restrictions**: Restrict key to:
  - Maps SDK for iOS
  - Places API
  - Geocoding API
  - Directions API

5. Save the key (format: `AIzaSyXxxx...`)

### Android API Key

1. Click "Create Credentials" → "API Key"
2. Name: `MANTIS Mobile Android`
3. Click "Restrict Key"

**Restrictions:**
- **Application restrictions**: Android apps
- **Package name**: `com.mantis.mobile`
- **SHA-1 fingerprint**: Get from your debug/release keystores
  ```bash
  # Debug keystore (for development)
  keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
  
  # Release keystore (for production)
  keytool -list -v -keystore /path/to/release.keystore -alias your-alias
  ```
- **API restrictions**: Restrict key to:
  - Maps SDK for Android
  - Places API
  - Geocoding API
  - Directions API

4. Save the key (format: `AIzaSyXxxx...`)

---

## 📝 Step 4: Update app.json

Replace the placeholder keys in `mantis-mobile/app.json`:

```json
{
  "expo": {
    "ios": {
      "config": {
        "googleMapsApiKey": "AIzaSyXxxx_YOUR_IOS_KEY_HERE"
      }
    },
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "AIzaSyXxxx_YOUR_ANDROID_KEY_HERE"
        }
      }
    }
  }
}
```

---

## 🔒 Step 5: Secure API Keys (Production)

### Option 1: Environment Variables (Recommended)

Create `mantis-mobile/.env`:
```bash
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_IOS=AIzaSyXxxx_YOUR_IOS_KEY
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID=AIzaSyXxxx_YOUR_ANDROID_KEY
```

Update `app.json` to use env vars:
```json
{
  "expo": {
    "ios": {
      "config": {
        "googleMapsApiKey": "${EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_IOS}"
      }
    },
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "${EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID}"
        }
      }
    }
  }
}
```

### Option 2: EAS Secrets (Production Builds)

```bash
# Set secrets for EAS Build
eas secret:create --scope project --name GOOGLE_MAPS_API_KEY_IOS --value AIzaSyXxxx
eas secret:create --scope project --name GOOGLE_MAPS_API_KEY_ANDROID --value AIzaSyXxxx
```

---

## 💰 Step 6: Set Up Billing Alerts

1. Go to "Billing" → "Budgets & alerts"
2. Create alert at $50, $100, $200
3. Monitor usage in "APIs & Services" → "Dashboard"

### Typical Usage Costs
- **Maps SDK**: $7 per 1,000 loads
- **Geocoding API**: $5 per 1,000 requests
- **Directions API**: $5 per 1,000 requests
- **Free tier**: $200 credit per month

**Estimated Monthly Cost** (100 officers, 50 infringements/day):
- Map loads: 5,000/month = $35
- Geocoding: 1,500/month = $7.50
- **Total**: ~$42.50/month (well under free tier)

---

## 🧪 Step 7: Test API Keys

### Test iOS Key
```bash
curl "https://maps.googleapis.com/maps/api/geocode/json?address=Suva,Fiji&key=YOUR_IOS_KEY"
```

### Test Android Key
```bash
curl "https://maps.googleapis.com/maps/api/geocode/json?address=Suva,Fiji&key=YOUR_ANDROID_KEY"
```

Expected response:
```json
{
  "results": [{
    "formatted_address": "Suva, Fiji",
    "geometry": {
      "location": {
        "lat": -18.1416,
        "lng": 178.4419
      }
    }
  }],
  "status": "OK"
}
```

---

## 🚨 Troubleshooting

### Error: "API key not valid"
- ✅ Check key is not restricted by IP
- ✅ Verify bundle ID (iOS) or package name (Android) matches
- ✅ Ensure APIs are enabled in GCP Console
- ✅ Wait 5 minutes after creating key (propagation)

### Error: "This API project is not authorized"
- ✅ Enable "Maps SDK for iOS/Android" in GCP Console
- ✅ Check billing is enabled
- ✅ Verify key restrictions match app

### Map shows blank/grey tiles
- ✅ API key missing or incorrect in app.json
- ✅ Maps SDK not enabled in GCP Console
- ✅ Bundle ID mismatch (rebuild app after changing)

### "Over quota" error
- ✅ Check billing in GCP Console
- ✅ Increase quota limits if needed
- ✅ Review usage dashboard for unexpected spikes

---

## 📊 Usage Monitoring

### Daily Checks
- Monitor "APIs & Services" → "Dashboard"
- Check for unusual spikes
- Review error rates

### Alerts to Set
- 80% of quota reached
- Error rate > 5%
- Daily cost > $5

---

## 🔐 Security Best Practices

1. **Never commit API keys** to version control
   - Add `.env` to `.gitignore`
   - Use EAS Secrets for production

2. **Use separate keys** for dev/staging/production
   - `MANTIS Mobile Dev`
   - `MANTIS Mobile Staging`
   - `MANTIS Mobile Production`

3. **Restrict keys properly**
   - iOS: Bundle ID restriction
   - Android: Package name + SHA-1 fingerprint
   - API restrictions to only needed services

4. **Rotate keys periodically**
   - Every 90 days for production
   - Immediately if compromised

5. **Monitor usage**
   - Set up billing alerts
   - Review logs weekly
   - Investigate anomalies

---

## 📚 Additional Resources

- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [Expo Maps Documentation](https://docs.expo.dev/versions/latest/sdk/map-view/)
- [react-native-maps GitHub](https://github.com/react-native-maps/react-native-maps)
- [API Key Best Practices](https://developers.google.com/maps/api-security-best-practices)

---

## ✅ Checklist

Before continuing with development:

- [ ] Google Cloud Project created
- [ ] Billing enabled with alerts set
- [ ] Maps SDK for iOS enabled
- [ ] Maps SDK for Android enabled
- [ ] Places API enabled
- [ ] Geocoding API enabled
- [ ] Directions API enabled
- [ ] iOS API key created and restricted
- [ ] Android API key created and restricted
- [ ] SHA-1 fingerprint added (Android)
- [ ] API keys added to app.json
- [ ] API keys tested with curl
- [ ] .env file created (optional)
- [ ] .gitignore includes .env

---

**Next Steps**: Once API keys are configured, proceed with building the map components!

**Document Created**: October 13, 2025  
**Phase**: 4 Sprint 1  
**Status**: Configuration Guide
