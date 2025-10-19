import { Image } from "expo-image";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useActiveAlarm } from "@/hooks/useActiveAlarm";
import { Picker } from "@react-native-picker/picker";
import { Audio } from "expo-av";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import styles from "../index-styles";

export default function HomeScreen() {
  const touch = Gesture.Tap();
  const { setHasActiveAlarm, setIsAlarmKilled, audioFiles, audioMap } =
    useActiveAlarm();
  const [hour, setHour] = useState("");
  const [minutes, setMinutes] = useState("");
  const [day, setDay] = useState("Monday");
  const [isRecurring, setIsRecurring] = useState(false);
  const [isSpeechExpanded, setIsSpeechExpanded] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState(""); // Stores full filename
  const [playingPreview, setPlayingPreview] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [showDayPicker, setShowDayPicker] = useState(false);

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // Cleanup sound on unmount
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const playPreview = async (fileName: string) => {
    try {
      // Stop current sound if playing
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
      }

      setPlayingPreview(fileName);

      // Get the audio source from context
      const audioMapping = audioMap.get(fileName);
      if (!audioMapping) {
        console.error("Audio source not found for:", fileName);
        alert("Audio file not found");
        setPlayingPreview(null);
        return;
      }

      // Set audio mode for playback
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      // Load and play the audio
      const { sound: newSound } = await Audio.Sound.createAsync(
        audioMapping.source,
        { shouldPlay: true },
        (status: any) => {
          // Handle playback status updates
          if (status.isLoaded && status.didJustFinish) {
            setPlayingPreview(null);
            newSound.unloadAsync();
            setSound(null);
          }
        }
      );

      setSound(newSound);

      // Stop after 15 seconds
      setTimeout(async () => {
        if (newSound) {
          try {
            await newSound.stopAsync();
            await newSound.unloadAsync();
            setPlayingPreview(null);
            setSound(null);
          } catch {
            console.log("Sound already stopped");
          }
        }
      }, 15000);
    } catch (error) {
      console.error("Error playing preview:", error);
      setPlayingPreview(null);
      alert(`Error playing audio: ${error}`);
    }
  };

  const handleSave = () => {
    // Validate inputs
    if (!hour || !minutes) {
      alert("Please set hour and minutes!");
      return;
    }

    if (!selectedAudio) {
      alert("Please select an alarm sound!");
      return;
    }

    console.log("Saving alarm:", {
      hour,
      minutes,
      day,
      isRecurring,
      selectedAudio,
    });

    // Reset alarm killed state and set active alarm state to show the tab
    setIsAlarmKilled(false);
    setHasActiveAlarm(true);

    // selectedAudio is the full filename, get the clean name from audioMap
    // audioMap is keyed by clean name, so we need to find it
    const cleanName =
      Array.from(audioMap.values()).find(
        (mapping) => mapping.fullFileName === selectedAudio
      )?.cleanName || "";

    console.log("Passing clean name to active-alarm:", cleanName);

    // Navigate to active alarm screen with parameters
    router.push({
      pathname: "/active-alarm",
      params: {
        hour,
        minutes,
        day,
        isRecurring: isRecurring.toString(),
        selectedAudio: cleanName,
      },
    });
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/header-image.jpg")}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView>
        <GestureDetector gesture={touch}>
          <ThemedView>
            <View style={styles.alarm}>
              <ThemedText type="subtitle">Hour</ThemedText>
              <TextInput
                style={styles.alarmInput}
                placeholder="00"
                keyboardType="number-pad"
                returnKeyType="done"
                value={hour}
                onChangeText={setHour}
                maxLength={2}
              />
              <ThemedText type="subtitle">Minutes</ThemedText>
              <TextInput
                style={styles.alarmInput}
                placeholder="00"
                keyboardType="number-pad"
                returnKeyType="done"
                value={minutes}
                onChangeText={setMinutes}
                maxLength={2}
              />
              {/* Hidden + button - keeping code for later */}
              {false && (
                <Pressable
                  style={({ pressed }) => [
                    {
                      backgroundColor: pressed ? "rgb(169, 236, 169)" : "white",
                    },
                    styles.wrapperCustom,
                    styles.addButton,
                  ]}
                >
                  <ThemedText type="link" style={styles.addButtonLabel}>
                    +
                  </ThemedText>
                </Pressable>
              )}
            </View>

            {/* Day dropdown */}
            <View style={styles.dayContainer}>
              <ThemedText type="subtitle">Day</ThemedText>
              {Platform.OS === "ios" ? (
                <>
                  <Pressable
                    style={styles.dayButton}
                    onPress={() => setShowDayPicker(true)}
                  >
                    <Text style={styles.dayButtonText}>{day}</Text>
                    <Text style={styles.dayButtonArrow}>▼</Text>
                  </Pressable>

                  <Modal
                    visible={showDayPicker}
                    transparent={true}
                    animationType="slide"
                  >
                    <Pressable
                      style={styles.modalOverlay}
                      onPress={() => setShowDayPicker(false)}
                    >
                      <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                          <ThemedText type="subtitle">Select Day</ThemedText>
                          <Pressable onPress={() => setShowDayPicker(false)}>
                            <Text style={styles.doneButton}>Done</Text>
                          </Pressable>
                        </View>
                        <Picker
                          selectedValue={day}
                          onValueChange={(itemValue: string) =>
                            setDay(itemValue)
                          }
                          style={styles.picker}
                          itemStyle={styles.pickerItem}
                        >
                          {daysOfWeek.map((dayName) => (
                            <Picker.Item
                              key={dayName}
                              label={dayName}
                              value={dayName}
                            />
                          ))}
                        </Picker>
                      </View>
                    </Pressable>
                  </Modal>
                </>
              ) : (
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={day}
                    onValueChange={(itemValue: string) => setDay(itemValue)}
                    style={styles.picker}
                  >
                    {daysOfWeek.map((dayName) => (
                      <Picker.Item
                        key={dayName}
                        label={dayName}
                        value={dayName}
                      />
                    ))}
                  </Picker>
                </View>
              )}
            </View>

            {/* Recurring toggle */}
            <View style={styles.recurringContainer}>
              <ThemedText type="subtitle">Recurring</ThemedText>
              <Switch
                value={isRecurring}
                onValueChange={setIsRecurring}
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={isRecurring ? "#4CAF50" : "#f4f3f4"}
              />
            </View>

            <View style={styles.options}>
              <ThemedText type="subheading">Select soundtrack</ThemedText>
              {/* Hidden Music button - keeping code for later */}
              {false && (
                <Pressable style={styles.optionsButton}>
                  <Text style={styles.label}>Music</Text>
                </Pressable>
              )}
              {/* Speech button with accordion */}
              <Pressable
                style={[
                  styles.optionsButton,
                  selectedAudio && styles.optionsButtonSelected,
                ]}
                onPress={() => setIsSpeechExpanded(!isSpeechExpanded)}
              >
                <Text style={styles.label}>
                  Speech {isSpeechExpanded ? "▲" : "▼"}
                </Text>
              </Pressable>
              {/* Audio files accordion */}
              {isSpeechExpanded && (
                <ScrollView style={styles.audioList} nestedScrollEnabled={true}>
                  {audioFiles.map((file, index) => {
                    // Find the clean name for this full filename
                    const mapping = Array.from(audioMap.values()).find(
                      (m) => m.fullFileName === file
                    );
                    const cleanName = mapping?.cleanName || file;

                    return (
                      <View
                        key={index}
                        style={[
                          styles.audioItem,
                          selectedAudio === file && styles.audioItemSelected,
                        ]}
                      >
                        <Pressable
                          style={styles.audioItemContent}
                          onPress={() => {
                            setSelectedAudio(file);
                            setIsSpeechExpanded(false);
                          }}
                        >
                          <Text
                            style={[
                              styles.audioLabel,
                              selectedAudio === file &&
                                styles.audioLabelSelected,
                            ]}
                          >
                            {cleanName}
                          </Text>
                        </Pressable>
                        <Pressable
                          style={styles.previewButton}
                          onPress={() => playPreview(file)}
                          disabled={playingPreview === file}
                        >
                          <Text style={styles.previewButtonText}>
                            {playingPreview === file ? "⏸" : "▶️"}
                          </Text>
                        </Pressable>
                      </View>
                    );
                  })}
                </ScrollView>
              )}{" "}
              {/* Save button */}
              <Pressable style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonLabel}>Save Alarm</Text>
              </Pressable>
            </View>
          </ThemedView>
        </GestureDetector>
      </ThemedView>
    </ParallaxScrollView>
  );
}
