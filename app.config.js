
/** @type {import('expo/config').ExpoConfig} */
const config = {
  name: "Resolve Ai",
  slug: "resolveAi",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/tabIcons/splash-icon.png",
  scheme: "resolveai",
  userInterfaceStyle: "automatic",
  ios: {
    icon: "./assets/images/tabIcons/splash-icon.png",
    bundleIdentifier: "com.anonymous.resolveAi",
    config: {
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
    },
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#FFFFFF",
      foregroundImage: "./assets/images/tabIcons/splash-icon.png",
      monochromeImage: "./assets/images/tabIcons/splash-icon.png",
    },
    predictiveBackGestureEnabled: false,
    permissions: [
      "android.permission.USE_BIOMETRIC",
      "android.permission.USE_FINGERPRINT",
    ],
    package: "com.anonymous.resolveAi",
    config: {
      googleMaps: {
        apiKey: process.env.GOOGLE_MAPS_API_KEY,
      },
    },
  },
  web: {
    output: "static",
    favicon: "./assets/images/tabIcons/splash-icon.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        backgroundColor: "#FFFFFF",
        image: "./assets/images/tabIcons/splash-icon.png",
        resizeMode: "contain",
        imageWidth: 105,
        android: {
          image: "./assets/images/tabIcons/splash-icon.png",
          resizeMode: "contain",
          imageWidth: 105,
        },
        ios: {
          image: "./assets/images/tabIcons/splash-icon.png",
          imageWidth: 105,
        },
      },
    ],
    [
      "expo-local-authentication",
      {
        faceIDPermission: "Permita que o app use Face ID para entrar.",
      },
    ],
    "expo-font",
    "expo-web-browser",
    "expo-secure-store",
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
};

module.exports = { expo: config };
