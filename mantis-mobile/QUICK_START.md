# 🎯 MANTIS Mobile - Quick Start Guide

## Prerequisites

1. **Development Environment**
   - Node.js 18+ installed
   - Expo CLI installed: `npm install -g expo-cli`
   - iOS Simulator (Mac) or Android Emulator

2. **Backend Setup**
   - Supabase project URL and API key
   - Database schema deployed (see `../schema.sql`)
   - Test users created (see `../seed.sql`)

## Installation

```bash
cd mantis-mobile
npm install
```

## Configuration

Create `.env` file in the root of `mantis-mobile`:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_KEY=your_supabase_anon_key
```

## Running the App

### iOS (Mac only)
```bash
npm run ios
```

### Android
```bash
npm run android
```

### Web (for development)
```bash
npm run web
```

### Development Server
```bash
npm start
```

Then press:
- `i` for iOS simulator
- `a` for Android emulator
- `w` for web browser

## Test Credentials

### Officer (Police)
- Email: `officer1@police.gov.fj`
- Password: `password123`
- Role: Can create infringements

### Officer (LTA)
- Email: `officer1@lta.gov.fj`
- Password: `password123`
- Role: Can create infringements

### Citizen
- Email: `john.citizen@gmail.com`
- Password: `password123`
- Role: View own infringements only

### Central Admin
- Email: `admin@transport.gov.fj`
- Password: `password123`
- Role: Full access to all features

## Project Structure

```
mantis-mobile/
├── app/                          # Expo Router app directory
│   ├── _layout.tsx              # Root layout with auth protection
│   ├── login.tsx                # Login screen
│   └── (tabs)/                  # Tab navigation (protected)
│       ├── _layout.tsx          # Tab configuration
│       ├── index.tsx            # Dashboard
│       ├── profile.tsx          # User profile
│       ├── infringements.tsx    # Infringements list
│       └── create-infringement.tsx
├── contexts/
│   └── auth-context.tsx         # Authentication state management
├── components/                   # Shared UI components
├── supabase/
│   └── config.ts                # Supabase client setup
├── hooks/                        # Custom React hooks
├── constants/                    # Theme, colors, etc.
└── assets/                       # Images, fonts, etc.
```

## Key Features (Current)

### ✅ Implemented
- Email/password authentication
- Session persistence (AsyncStorage)
- Role-based navigation
- Protected routes
- User profile display
- Logout functionality
- Dashboard with user info
- Modern UI with SF Symbols icons

### 🚧 In Progress
- Create infringement form
- Infringements list
- Camera integration
- Location picker

### 📋 Planned
- Offline support
- Google Maps integration
- Push notifications
- Biometric authentication

## Common Tasks

### Add a New Screen

1. Create file in `app/` or `app/(tabs)/`:
```tsx
// app/(tabs)/new-screen.tsx
import { View, Text } from 'react-native';

export default function NewScreen() {
  return (
    <View>
      <Text>New Screen</Text>
    </View>
  );
}
```

2. Add to tab navigation in `app/(tabs)/_layout.tsx`:
```tsx
<Tabs.Screen
  name="new-screen"
  options={{
    title: 'New',
    tabBarIcon: ({ color }) => <IconSymbol name="icon.name" size={28} color={color} />,
  }}
/>
```

### Use Authentication

```tsx
import { useAuth } from '@/contexts/auth-context';

export default function MyComponent() {
  const { profile, hasRole, hasPermission } = useAuth();
  
  if (!profile) return <Text>Loading...</Text>;
  
  return (
    <View>
      <Text>Welcome, {profile.full_name}</Text>
      {hasRole('officer') && <Button title="Officer Action" />}
      {hasPermission('create_infringement') && <Button title="Create" />}
    </View>
  );
}
```

### Make API Calls

```tsx
import { supabase } from '@/supabase/config';

// Fetch data
const { data, error } = await supabase
  .from('infringements')
  .select('*')
  .eq('status', 'issued');

// Insert data
const { data, error } = await supabase
  .from('infringements')
  .insert({
    registration_number: 'AB1234',
    // ... other fields
  });

// Update data
const { data, error } = await supabase
  .from('infringements')
  .update({ status: 'paid' })
  .eq('id', infringementId);
```

## Debugging

### View Console Logs
- Logs appear in the terminal where `npm start` is running
- Use `console.log()`, `console.error()`, etc.

### React Native Debugger
1. Install: `brew install --cask react-native-debugger`
2. Open: Press `Cmd+D` (iOS) or `Cmd+M` (Android)
3. Select "Debug Remote JS"

### Inspect Element
- Press `Cmd+D` (iOS) or `Cmd+M` (Android)
- Select "Show Element Inspector"

## Troubleshooting

### App won't start
```bash
# Clear cache
npm start -- --clear

# or
expo start -c
```

### Auth not working
1. Check `.env` file exists with correct values
2. Check Supabase project is running
3. Check database has user_profiles table
4. Check user exists in auth.users and user_profiles

### Can't login
1. Verify credentials match seed data
2. Check Supabase Auth is enabled
3. Check RLS policies allow access
4. Look for errors in terminal

### Navigation issues
1. Clear AsyncStorage: 
   ```tsx
   import AsyncStorage from '@react-native-async-storage/async-storage';
   await AsyncStorage.clear();
   ```
2. Restart app
3. Check auth session is valid

## Performance Tips

1. **Use React.memo** for expensive components
2. **Optimize images**: Compress before shipping
3. **Lazy load** screens not immediately needed
4. **Profile** with React DevTools
5. **Enable Hermes**: Already enabled in Expo 54

## Testing

### Run Tests
```bash
npm test
```

### E2E Tests
```bash
# Coming soon
```

## Building for Production

### Android APK
```bash
eas build --platform android --profile preview
```

### iOS IPA
```bash
eas build --platform ios --profile preview
```

### Submit to Stores
```bash
eas submit --platform ios
eas submit --platform android
```

## Resources

- **Expo Docs**: https://docs.expo.dev/
- **React Native**: https://reactnative.dev/
- **Supabase**: https://supabase.com/docs
- **Expo Router**: https://expo.github.io/router/
- **SF Symbols**: https://developer.apple.com/sf-symbols/

## Support

- **Issues**: Create GitHub issue
- **Questions**: Contact tech lead
- **Emergency**: Contact on-call developer

---

**Version**: 1.0.0  
**Last Updated**: October 13, 2025  
**Maintainer**: MANTIS Development Team
