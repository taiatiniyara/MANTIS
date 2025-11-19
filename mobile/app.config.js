import 'dotenv/config';

export default {
  expo: {
    name: "MANTIS Mobile",
    slug: "mantis-mobile",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "mantis",
    userInterfaceStyle: "automatic",
    description: "Mobile Infringement System for Field Officers",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.mantis.mobile",
      infoPlist: {
        NSCameraUsageDescription: "MANTIS needs camera access to capture evidence photos for infringements.",
        NSLocationWhenInUseUsageDescription: "MANTIS needs your location to record where infringements occur.",
        NSLocationAlwaysUsageDescription: "MANTIS needs background location access to track patrol routes.",
        NSFaceIDUsageDescription: "MANTIS uses Face ID for quick and secure sign in."
      },
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || "AIzaSyCxBaeoQ29I12mvbzseH7HxsSlDUT4Emd8"
      }
    },
    android: {
      package: "com.mantis.mobile",
      permissions: [
        "CAMERA",
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "ACCESS_BACKGROUND_LOCATION",
        "USE_BIOMETRIC",
        "USE_FINGERPRINT"
      ],
      adaptiveIcon: {
        backgroundColor: "#007AFF",
        foregroundImage: "./assets/images/android-icon-foreground.png"
      },
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY || "AIzaSyCxBaeoQ29I12mvbzseH7HxsSlDUT4Emd8"
        }
      }
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "MANTIS needs your location to record where infringements occur and track patrol routes.",
          locationWhenInUsePermission: "MANTIS needs your location to record where infringements occur."
        }
      ],
      [
        "expo-camera",
        {
          cameraPermission: "MANTIS needs camera access to capture evidence photos for infringements."
        }
      ],
      [
        "expo-local-authentication",
        {
          faceIDPermission: "MANTIS uses Face ID for quick and secure sign in."
        }
      ],
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#007AFF"
        }
      ]
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true
    },
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_KEY,
    }
  }
};
