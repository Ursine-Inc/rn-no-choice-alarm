import { Tabs } from "expo-router";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useActiveAlarm } from "@/hooks/useActiveAlarm";
import { useColorScheme } from "@/hooks/useColorScheme";
import { AlarmStorage } from "../../data/AlarmStorage";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { hasActiveAlarm } = useActiveAlarm();
  const savedAlarms = AlarmStorage.getAllAlarms();
  const hasSavedAlarms = savedAlarms.length > 0 || hasActiveAlarm;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          position: "absolute",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="active-alarm"
        options={{
          title: "Active Alarm",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="alarm.fill" color={color} />
          ),
          href: hasSavedAlarms ? "/(tabs)/active-alarm" : null,
        }}
      />
      <Tabs.Screen
        name="alarms"
        options={{
          title: "Alarms",
          href: "/(tabs)/alarms",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="list.bullet" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
