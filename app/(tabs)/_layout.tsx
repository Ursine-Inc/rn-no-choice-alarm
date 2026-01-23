import { Tabs } from "expo-router";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { useActiveAlarm } from "@/hooks/useActiveAlarm";
import { AlarmStorage } from "../../data/AlarmStorage";

export default function TabLayout() {
  const { hasActiveAlarm } = useActiveAlarm();
  const savedAlarms = AlarmStorage.getAllAlarms();

  return (
    <Tabs
      screenOptions={{
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
          href: hasActiveAlarm ? "/(tabs)/active-alarm" : null,
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
