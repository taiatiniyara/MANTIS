# Google Maps Setup Guide for MANTIS Mobile

## Prerequisites
- Google Cloud Platform account
- Billing enabled on your GCP project

## Step 1: Create Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Maps SDK for Android**
   - **Maps SDK for iOS**
   - **Geocoding API** (optional, for address lookups)
   - **Places API** (optional, for location search)

4. Create API credentials:
   - Navigate to **APIs & Services** > **Credentials**
   - Click **+ CREATE CREDENTIALS** > **API key**
   - Copy the generated API key

## Step 2: Restrict API Key (Recommended)

### For Android:
1. Click on your API key in the credentials page
2. Under **Application restrictions**, select **Android apps**
3. Click **+ Add an item**
4. Enter:
   - **Package name**: `com.mantis.mobile`
   - **SHA-1 certificate fingerprint**: Get this by running:
     ```bash
     cd android
     ./gradlew signingReport
     ```
5. Save

### For iOS:
1. Create a separate API key for iOS (recommended)
2. Under **Application restrictions**, select **iOS apps**
3. Click **+ Add an item**
4. Enter:
   - **Bundle identifier**: `com.mantis.mobile`
5. Save

## Step 3: Configure API Keys in app.json

Replace `YOUR_GOOGLE_MAPS_API_KEY_HERE` in `app.json`:

```json
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "AIza..."  // Your Android API key
        }
      }
    },
    "ios": {
      "config": {
        "googleMapsApiKey": "AIza..."  // Your iOS API key (or same key)
      }
    }
  }
}
```

## Step 4: Environment Variables (Optional but Recommended)

For better security, use environment variables:

1. Create `.env` file in mobile folder (if not exists):
```bash
EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_KEY=AIza...
EXPO_PUBLIC_GOOGLE_MAPS_IOS_KEY=AIza...
```

2. Update `app.json` to use env vars:
```json
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "${EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_KEY}"
        }
      }
    },
    "ios": {
      "config": {
        "googleMapsApiKey": "${EXPO_PUBLIC_GOOGLE_MAPS_IOS_KEY}"
      }
    }
  }
}
```

3. Add `.env` to `.gitignore`:
```bash
echo ".env" >> .gitignore
```

## Step 5: Build and Test

### For Development (Expo Go):
Expo Go doesn't support Google Maps. You need to create a development build:

```bash
# Create development build for Android
npx expo run:android

# Create development build for iOS
npx expo run:ios
```

### For Production:
```bash
# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

## Troubleshooting

### "Map is blank" or "Failed to load map"
- Verify API key is correct
- Check that billing is enabled on your GCP project
- Ensure Maps SDK for Android/iOS is enabled
- Check API key restrictions match your bundle ID/package name

### "Authorization failure"
- API key restrictions are too strict
- Bundle identifier or package name doesn't match
- API not enabled in Google Cloud Console

### Development Build Required
- Google Maps requires a custom development build
- Cannot use Expo Go for maps functionality
- Run `npx expo prebuild` to generate native folders

## Cost Considerations

Google Maps Platform offers:
- **$200 free credit per month**
- **28,000 map loads free per month** (at $7 per 1000 loads)
- Monitor usage in [Google Cloud Console](https://console.cloud.google.com/)

For typical MANTIS usage (10-20 officers), you should stay well within the free tier.

## Next Steps

After setup:
1. Test the map view screen: `/map-view`
2. Verify markers appear for infringements
3. Test GPS location tracking
4. Ensure map controls work (zoom, pan, center)

## Support Resources

- [Expo Maps Documentation](https://docs.expo.dev/versions/latest/sdk/map-view/)
- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [React Native Maps GitHub](https://github.com/react-native-maps/react-native-maps)
