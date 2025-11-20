<div align="center">
  <img src="assets/images/splash-screen_2025.jpg" alt="KooM! Splash Screen" width="300">
  
  # KooM!
  
  ### An alarm app with no mercy
  
  A React Native alarm app with a snooze option you have to work for. Get up or suffer the consequences!
  
  [![Expo](https://img.shields.io/badge/Expo-SDK%2053-000020.svg?style=flat&logo=expo)](https://expo.dev/)
  [![React Native](https://img.shields.io/badge/React%20Native-0.79-61DAFB.svg?style=flat&logo=react)](https://reactnative.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg?style=flat&logo=typescript)](https://www.typescriptlang.org/)
  
  ### Version Info
  
  | Platform | Version | Build |
  |----------|---------|-------|
  | iOS      | 1.0.0   | 2025.11.20.1 |
  | Android  | 1.0.0   | 202511201 |
  
</div>

---

## 🛠️ Tech Stack

- **React Native** with Expo SDK ~53
- **Expo Router** for file-based navigation
- **expo-av** for audio playback
- **TypeScript** for type safety

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Installation

```bash
# Install dependencies
pnpm install

# Start the development server
pnpm expo start
```

### Platform-specific commands

```bash
# Run on iOS
pnpm expo start --ios

# Run on Android
pnpm expo start --android
```

## 🔧 Version Management

### iOS Build Number

> **⚠️ IMPORTANT:** When updating the iOS build number for TestFlight, you must update ALL THREE files:

| File | Property                  | Direct Link                                                                |
| ---- | ------------------------- | -------------------------------------------------------------------------- |
| 1️⃣   | `expo.ios.buildNumber`    | [`app.json`](app.json)                                                     |
| 2️⃣   | `CFBundleVersion`         | [`ios/KooM/Info.plist`](ios/KooM/Info.plist)                               |
| 3️⃣   | `CURRENT_PROJECT_VERSION` | [`ios/KooM.xcodeproj/project.pbxproj`](ios/KooM.xcodeproj/project.pbxproj) |

**Why?** The Xcode project file (`project.pbxproj`) takes precedence during builds. If you only update `app.json`, EAS will still use the value from `project.pbxproj`.

### Android Version Code

> **⚠️ IMPORTANT:** When updating the Android version code, you must update BOTH files:

| File | Property                   | Direct Link                                            |
| ---- | -------------------------- | ------------------------------------------------------ |
| 1️⃣   | `expo.android.versionCode` | [`app.json`](app.json)                                 |
| 2️⃣   | `versionCode`              | [`android/app/build.gradle`](android/app/build.gradle) |

**Why?** The Gradle build file (`build.gradle`) is the source of truth for Android builds. Both must be kept in sync.

---

## 📄 License

Copyright © 2025 Ursine Enterprises and Tzori Brickner. All rights reserved.

This software is proprietary and confidential. See [LICENSE](LICENSE) for details.

---

<div align="center">
  <sub>Built with ☕ and determination to wake up on time</sub>
</div>
