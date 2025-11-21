import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { type Alarm, AlarmStorage } from "@/data/AlarmStorage";
import { useActiveAlarm } from "@/hooks/useActiveAlarm";
import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";

import { styles } from "@/themes/styles/alarms";

export const ENABLE_DELETE_ALL = __DEV__ && false;

export default function AlarmsScreen() {
  const { cancelAlarm } = useActiveAlarm();
  const [savedAlarms, setSavedAlarms] = useState<Alarm[]>([]);

  useFocusEffect(
    useCallback(() => {
      const alarms = AlarmStorage.getAllAlarms();
      setSavedAlarms(alarms);
    }, [])
  );

  const handleAlarmPress = (alarm: Alarm) => {
    const [hour, minutes] = alarm.time.split(":");
    const selectedAudio = alarm.trackIds[0];
    if (!selectedAudio) {
      alert("This alarm is missing a valid sound. Please edit or recreate it.");
      return;
    }
    router.push({
      pathname: "/active-alarm",
      params: {
        hour,
        minutes,
        day: alarm.day,
        isRecurring: alarm.recurring.toString(),
        selectedAudio,
      },
    });
  };

  const handleDeleteAll = () => {
    if (!ENABLE_DELETE_ALL) return;

    Alert.alert(
      "Delete all alarms",
      "This will permanently delete all alarms and reset the UI state.\n\nAre you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            try {
              AlarmStorage.deleteAll();
            } catch (e) {
              console.error("Error deleting alarms:", e);
            }
            try {
              setSavedAlarms([]);
            } catch (e) {
              console.error("Error updating local alarms state:", e);
            }
            try {
              cancelAlarm();
            } catch (e) {
              console.error("Error resetting active alarm state:", e);
            }
          },
        },
      ]
    );
  };

  const handleCreateNew = () => {
    router.push("/");
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/splash-screen_2025.jpg")}
          style={styles.headerImage}
          contentFit="cover"
          contentPosition="top"
        />
      }
      noPadding={true}
    >
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>
          My Alarms
        </ThemedText>

        {savedAlarms.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>
              No alarms yet. Create your first alarm!
            </ThemedText>
            <Pressable style={styles.createButton} onPress={handleCreateNew}>
              <Text style={styles.createButtonText}>Create Alarm</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.alarmsList}>
              {savedAlarms.map((alarm) => {
                const [hour, minutes] = alarm.time.split(":");
                return (
                  <Pressable
                    key={alarm.id}
                    style={[
                      styles.alarmCard,
                      !alarm.enabled && styles.alarmCardInactive,
                    ]}
                    onPress={() => handleAlarmPress(alarm)}
                  >
                    <View style={styles.alarmHeader}>
                      <Text
                        style={[
                          styles.alarmTime,
                          !alarm.enabled && styles.alarmTimeInactive,
                        ]}
                      >
                        {hour}:{minutes}
                      </Text>
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <View
                          style={[
                            styles.statusBadge,
                            alarm.enabled
                              ? styles.statusBadgeActive
                              : styles.statusBadgeInactive,
                          ]}
                        >
                          <Text style={styles.statusText}>
                            {alarm.enabled ? "Active" : "Inactive"}
                          </Text>
                        </View>

                        <Pressable
                          onPress={() => {
                            Alert.alert(
                              "Delete alarm",
                              "Permanently delete this alarm?",
                              [
                                { text: "Cancel", style: "cancel" },
                                {
                                  text: "Delete",
                                  style: "destructive",
                                  onPress: () => {
                                    try {
                                      AlarmStorage.deleteAlarm(alarm.id);
                                    } catch (e) {
                                      console.error("Error deleting alarm:", e);
                                    }
                                    try {
                                      setSavedAlarms((prev) =>
                                        prev.filter((a) => a.id !== alarm.id)
                                      );
                                    } catch (e) {
                                      console.error(
                                        "Error updating savedAlarms after delete:",
                                        e
                                      );
                                    }
                                    try {
                                      cancelAlarm();
                                    } catch (e) {
                                      // ignore
                                    }
                                  },
                                },
                              ]
                            );
                          }}
                          style={{
                            marginLeft: 10,
                            paddingVertical: 6,
                            paddingHorizontal: 10,
                            backgroundColor: "#F8D7DA",
                            borderRadius: 8,
                          }}
                        >
                          <Text style={{ color: "#B71C1C", fontWeight: "700" }}>
                            Delete
                          </Text>
                        </Pressable>
                      </View>
                    </View>

                    <View style={styles.alarmDetails}>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>📅</Text>
                        <Text style={styles.detailValue}>{alarm.day}</Text>
                      </View>

                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>🔁</Text>
                        <Text style={styles.detailValue}>
                          {alarm.recurring ? "Recurring" : "One-time"}
                        </Text>
                      </View>

                      {alarm.trackIds.length > 0 && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>🔊</Text>
                          <Text
                            style={styles.detailValue}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {alarm.trackIds[0]}
                          </Text>
                        </View>
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>
            <Pressable style={styles.createButton} onPress={handleCreateNew}>
              <Text style={styles.createButtonText}>+ New Alarm</Text>
            </Pressable>
            {ENABLE_DELETE_ALL && (
              <Pressable
                style={styles.deleteAllButton}
                onPress={handleDeleteAll}
                accessibilityRole="button"
                accessibilityLabel="Delete all alarms"
              >
                <Text style={styles.deleteAllLabel}>
                  Delete all alarms (dev)
                </Text>
              </Pressable>
            )}
          </>
        )}
      </ThemedView>
    </ParallaxScrollView>
  );
}
