# KooM!

A React Native alarm app with no snooze option. Get up or suffer the consequences.

## Features

- Set alarms with custom audio files
- No snooze button - you're getting up
- Recurring alarms by day
- Real-time countdown to alarm time
- Audio plays on loop until you kill it
- Dev-only kill switch for testing

## Tech Stack

- React Native with Expo SDK ~53
- Expo Router for file-based navigation
- expo-av for audio playback
- TypeScript

## Getting Started

```bash
# Install dependencies
pnpm install

# Start the development server
pnpm expo start

# Run on iOS
pnpm expo start --ios

# Run on Android
pnpm expo start --android
```

## Project Structure

```
app/
  (tabs)/
    index.tsx          # Main alarm setup screen
    active-alarm.tsx   # Active alarm with countdown
    alarms.tsx         # List of saved alarms
hooks/
  useActiveAlarm.tsx   # Global alarm state & audio mapping
assets/
  audio/               # M4A alarm audio files
```
