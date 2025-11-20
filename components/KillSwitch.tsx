import { Image } from "expo-image";
import { useRef, useState } from "react";
import { Pressable, Text as RNText, StyleSheet, View } from "react-native";
import Svg, {
  Circle,
  ClipPath,
  Defs,
  LinearGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { useActiveAlarm } from "../hooks/useActiveAlarm";

export function KillSwitch() {
  const {
    hasActiveAlarm,
    killAlarm,
    pauseAlarmCountdown,
    resumeAlarmCountdown,
  } = useActiveAlarm();
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const holdTimerRef = useRef<number | null>(null);
  const holdStartTimeRef = useRef<number | null>(null);

  const HOLD_DURATION_MS = 8000; // 8 seconds

  if (!hasActiveAlarm) {
    return null;
  }

  const remainingSeconds = Math.ceil(
    (HOLD_DURATION_MS - holdProgress * HOLD_DURATION_MS) / 1000
  );

  const handlePressIn = () => {
    setIsHolding(true);
    pauseAlarmCountdown();
    holdStartTimeRef.current = Date.now();
    setHoldProgress(0.01); // Show overlay immediately on first press

    holdTimerRef.current = setInterval(() => {
      if (holdStartTimeRef.current) {
        const elapsed = Date.now() - holdStartTimeRef.current;
        const progress = Math.min(elapsed / HOLD_DURATION_MS, 1);
        setHoldProgress(progress);

        if (progress >= 1) {
          handleKillSwitch();
          clearHoldTimer();
        }
      }
    }, 50);
  };

  const handlePressOut = () => {
    setIsHolding(false);
    resumeAlarmCountdown();
    clearHoldTimer();
    setHoldProgress(0);
    holdStartTimeRef.current = null;
  };

  const clearHoldTimer = () => {
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  const handleKillSwitch = () => {
    console.log("🔴 KILL SWITCH ACTIVATED - Alarm disabled");
    killAlarm();
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [
          styles.imageButton,
          pressed && styles.imageButtonPressed,
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Image
          source={require("@/assets/images/kill-switch-2025.png")}
          style={styles.image}
          contentFit="contain"
        />
        <Svg
          width={100}
          height={100}
          style={styles.progressOverlay}
          pointerEvents="none"
        >
          <Defs>
            <LinearGradient id="holdGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#ff4444" stopOpacity={0.8} />
              <Stop
                offset={`${holdProgress * 100}%`}
                stopColor="#FF6B35"
                stopOpacity={0.8}
              />
              <Stop
                offset={`${holdProgress * 100}%`}
                stopColor="#ff4444"
                stopOpacity={0.8}
              />
              <Stop offset="100%" stopColor="#ff4444" stopOpacity={0.8} />
            </LinearGradient>
            <ClipPath id="circleClip">
              <Circle cx={50} cy={50} r={50} />
            </ClipPath>
          </Defs>
          <Rect
            x={0}
            y={0}
            width={100}
            height={100}
            fill={holdProgress > 0 ? "url(#holdGradient)" : "transparent"}
            clipPath="url(#circleClip)"
          />
        </Svg>
      </Pressable>
      {isHolding && (
        <View style={styles.counterContainer}>
          <RNText style={styles.counterText}>
            Hold for {remainingSeconds}s more!
          </RNText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  imageButton: {
    width: 100,
    height: 100,
    position: "relative",
  },
  imageButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  image: {
    width: "100%",
    height: "100%",
  },
  progressOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  counterContainer: {
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#FF6B35",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  counterText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
});
