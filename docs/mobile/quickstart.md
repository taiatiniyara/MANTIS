# MANTIS Mobile - Quick Start Guide

This guide will help you get the MANTIS mobile app up and running on your device.

## Prerequisites

- **Node.js** 18+ and npm
- **Expo CLI**: Install globally with `npm install -g expo-cli`
- **Expo Go app** on your phone (iOS/Android) for testing
- **Supabase account** with MANTIS database set up

## Setup Steps

### 1. Install Dependencies

```bash
cd mobile
npm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=your-anon-key
```

You can find these values in your Supabase project settings at: https://app.supabase.com

### 3. Start Development Server

```bash
npm start
```

This will start the Expo development server and show you a QR code.

### 4. Run on Your Device

#### Option A: Physical Device (Recommended for Testing GPS/Camera)

1. Install **Expo Go** from the App Store (iOS) or Play Store (Android)
2. Open Expo Go and scan the QR code shown in your terminal
3. The app will load on your device

#### Option B: iOS Simulator (Mac only)

```bash
npm run ios
```

#### Option C: Android Emulator

```bash
npm run android
```

Make sure you have Android Studio installed with an emulator set up.

## Testing the App

### Test Credentials

Use these test accounts (make sure they exist in your Supabase database):

**Officer Account:**
- Email: `officer@example.com`
- Password: (set in Supabase Auth)

**Team Leader Account:**
- Email: `leader@example.com`
- Password: (set in Supabase Auth)

### Features to Test

1. **Login** - Sign in with test credentials
2. **Dashboard** - View stats and recent cases
3. **Create Infringement**
   - Select an offence
   - Enter driver details
   - Enter vehicle details
   - Capture GPS location
   - Take photos with camera
   - Submit or save as draft
4. **Map View** - See infringement locations on map
5. **Cases List** - Browse and filter cases
6. **Sync Status** - Check offline sync queue
7. **Profile** - View user info and sign out

## Offline Mode Testing

1. Enable Airplane Mode on your device
2. Create a new infringement (will be saved to sync queue)
3. Disable Airplane Mode
4. Dashboard will show sync status
5. Tap "Sync" to upload pending data

## Common Issues

### "Network request failed"
- Check your internet connection
- Verify Supabase URL and key in `.env.local`
- Make sure Supabase project is not paused

### Camera/Location not working
- Grant permissions when prompted
- Check device settings to ensure app has camera/location access
- Physical device required (simulators have limited sensor support)

### Map not displaying
- Check internet connection (maps require network)
- Verify `react-native-webview` is installed
- Try restarting the development server

### Build errors after installing packages
- Clear cache: `npx expo start -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Update Expo: `npm install expo@latest`

## Development Tips

### Hot Reloading

- Press `r` in the terminal to reload the app
- Shake your device to open the developer menu
- Changes to `.tsx` files reload automatically

### Debugging

- Press `j` in terminal to open Chrome DevTools
- Use `console.log()` to debug
- Check terminal for errors

### Building for Production

```bash
# iOS (requires Mac + Apple Developer account)
npx expo build:ios

# Android
npx expo build:android
```

## Project Structure

```
mobile/
├── app/              # Screens (Expo Router)
│   ├── (auth)/      # Login screen
│   ├── (officer)/   # Officer screens
│   └── (leader)/    # Team leader screens
├── components/       # Reusable UI components
├── lib/             # Core utilities
│   ├── database.ts  # Supabase queries
│   ├── offline.ts   # Offline sync
│   ├── types.ts     # TypeScript types
│   └── ...
└── utils/           # Helpers
    └── supabase.ts  # Supabase client
```

## Next Steps

- **Customize**: Modify colors in `constants/theme.ts`
- **Add Features**: Check `mobile/README.md` for pending features
- **Deploy**: Use EAS Build for production apps
- **Documentation**: See `/docs` folder for detailed guides

## Support

For issues or questions:
1. Check the troubleshooting section in `/docs/27-troubleshooting.md`
2. Review the FAQ in `/docs/28-faq.md`
3. Contact your system administrator

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [Leaflet Documentation](https://leafletjs.com/)
- [OpenStreetMap](https://www.openstreetmap.org/)
