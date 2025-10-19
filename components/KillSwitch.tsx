import { useActiveAlarm } from "@/hooks/useActiveAlarm";
import { Pressable, StyleSheet, Text, View } from "react-native";

// Feature flag - set to true to enable kill switch in staging
const ENABLE_KILL_SWITCH_IN_STAGING = true;

export function KillSwitch() {
  const { hasActiveAlarm, killAlarm } = useActiveAlarm();

  // Only show in development or if feature flag is enabled
  const isDev = __DEV__;
  const isStaging = ENABLE_KILL_SWITCH_IN_STAGING;

  if (!isDev && !isStaging) {
    return null;
  }

  // Only show if there's an active alarm
  if (!hasActiveAlarm) {
    return null;
  }

  const handleKillSwitch = () => {
    console.log("🔴 KILL SWITCH ACTIVATED - Alarm disabled");
    killAlarm();
    // TODO: Add additional alarm cancellation logic here
    // (stop sound, clear notifications, etc.)
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [styles.badge, pressed && styles.badgePressed]}
        onPress={handleKillSwitch}
      >
        <Text style={styles.icon}>🔴</Text>
        <Text style={styles.text}>KILL</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 50,
    left: 0,
    zIndex: 9999,
  },
  badge: {
    backgroundColor: "#ff4444",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    shadowColor: "#000",
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
    borderWidth: 2,
    borderLeftWidth: 0,
    borderColor: "#cc0000",
  },
  badgePressed: {
    backgroundColor: "#cc0000",
    transform: [{ scale: 0.95 }],
  },
  icon: {
    fontSize: 16,
  },
  text: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1,
  },
});
