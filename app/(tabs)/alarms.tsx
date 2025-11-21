import { type Alarm, AlarmStorage } from "@/data/AlarmStorage";
import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import ParallaxScrollView from "../../components/ParallaxScrollView";
import { ThemedText } from "../../components/ThemedText";
import { ThemedView } from "../../components/ThemedView";

export default function AlarmsScreen() {
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
          </>
        )}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  headerImage: {
    width: "100%",
    height: 260,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
  },
  title: {
    textAlign: "center",
    marginBottom: 30,
    fontSize: 28,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    opacity: 0.6,
  },
  alarmsList: {
    gap: 15,
    marginBottom: 20,
  },
  alarmCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  alarmCardInactive: {
    opacity: 0.6,
    borderLeftColor: "#999",
  },
  alarmHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  alarmTime: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  alarmTimeInactive: {
    color: "#999",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeActive: {
    backgroundColor: "#E8F5E9",
  },
  statusBadgeInactive: {
    backgroundColor: "#f0f0f0",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
  alarmDetails: {
    gap: 10,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  detailLabel: {
    fontSize: 16,
    width: 24,
  },
  detailValue: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  createButton: {
    backgroundColor: "#4CAF50",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
