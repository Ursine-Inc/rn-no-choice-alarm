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

import { PreviewAnimation } from "@/components/player/preview-animation";
import styles from "../index-styles";

export default function HomeScreen() {
  const touch = Gesture.Tap();
  const {
    setHasActiveAlarm,
    setIsAlarmKilled,
    audioMap,
    audioCollections,
    getAudioSource,
    getAudioCollection,
  } = useActiveAlarm();
  const [hour, setHour] = useState("");
  const [minutes, setMinutes] = useState("");
  const [day, setDay] = useState("Monday");
  const [isRecurring, setIsRecurring] = useState(false);
  const [isSpeechExpanded, setIsSpeechExpanded] = useState(false);
  const [isMusicExpanded, setIsMusicExpanded] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState("");
  const [playingPreview, setPlayingPreview] = useState<string | null>(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [previewProgress, setPreviewProgress] = useState(0);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [previewTimeout, setPreviewTimeout] = useState<number | null>(null);

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const selectedCollection = selectedAudio
    ? getAudioCollection(selectedAudio)
    : null;
  const selectedBelongsToMusic = selectedCollection === "MUSIC";
  const selectedBelongsToSpeech = selectedCollection === "SPEECH";

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      if (previewTimeout) {
        clearTimeout(previewTimeout);
      }
    };
  }, [sound, previewTimeout]);

  const cleanupPreview = async () => {
    if (previewTimeout) {
      clearTimeout(previewTimeout);
      setPreviewTimeout(null);
    }
    if (sound) {
      try {
        await sound.stopAsync();
        await sound.unloadAsync();
      } catch (error) {
        console.error("Error cleaning up sound:", error);
      }
      setSound(null);
    }
    setPlayingPreview(null);
    setIsPreviewPlaying(false);
    setPreviewProgress(0);
  };

  const stopPreview = async () => {
    await cleanupPreview();
  };

  const playPreview = async (cleanName: string) => {
    try {
      await cleanupPreview();

      setPlayingPreview(cleanName);
      setIsPreviewPlaying(true);

      const audioSource = getAudioSource(cleanName);
      if (!audioSource) {
        console.error("Audio source not found for:", cleanName);
        setPlayingPreview(null);
        setIsPreviewPlaying(false);
        return;
      }

      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      const { sound: newSound } = await Audio.Sound.createAsync(
        audioSource,
        {
          shouldPlay: true,
          positionMillis: 5000,
        },
        (status) => {
          if (status.isLoaded && status.didJustFinish) {
            setPlayingPreview(null);
            setIsPreviewPlaying(false);
          }
        }
      );

      setSound(newSound);

      // Update progress every 100ms
      const startTime = Date.now();
      const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / 11000, 1); // 11 seconds total (10s play + 1s fade)
        setPreviewProgress(progress);
      }, 100);

      const timeout = setTimeout(async () => {
        try {
          const fadeSteps = 20;
          const fadeInterval = 1000 / fadeSteps;

          for (let i = fadeSteps; i >= 0; i--) {
            const volume = i / fadeSteps;
            await newSound.setVolumeAsync(volume);
            await new Promise((resolve) => setTimeout(resolve, fadeInterval));
          }
        } catch (error) {
          console.log("Error during fadeout:", error);
        }

        clearInterval(progressInterval);
        await cleanupPreview();
      }, 10000);

      setPreviewTimeout(timeout);
    } catch (error) {
      console.error("Error playing preview:", error);
      setPlayingPreview(null);
      setIsPreviewPlaying(false);
      alert(`Error playing audio: ${error}`);
    }
  };

  const handleSave = () => {
    if (!hour || !minutes) {
      alert("Please set hour and minutes!");
      return;
    }

    if (!selectedAudio) {
      alert("Please select an alarm sound!");
      return;
    }

    setIsAlarmKilled(false);
    setHasActiveAlarm(true);

    const cleanName = selectedAudio;
    if (!audioMap.get(cleanName)) {
      alert("Selected audio not found");
      return;
    }

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
            </View>
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
              {selectedAudio ? (
                <View style={styles.selectedBadgeRow}>
                  <View
                    style={[
                      styles.selectedBadge,
                      selectedBelongsToMusic && styles.selectedBadgeMusic,
                      selectedBelongsToSpeech && styles.selectedBadgeSpeech,
                    ]}
                  >
                    <Text style={styles.selectedBadgeText}>
                      {selectedBelongsToMusic
                        ? "Music"
                        : selectedBelongsToSpeech
                        ? "Speech"
                        : "Other"}
                    </Text>
                  </View>
                  <Text style={styles.audioLabel}>{selectedAudio}</Text>
                </View>
              ) : null}
              {(() => {
                const selectedBelongsToMusic = selectedAudio
                  ? audioCollections.get("MUSIC")?.has(selectedAudio) ?? false
                  : false;
                const selectedBelongsToSpeech = selectedAudio
                  ? audioCollections.get("SPEECH")?.has(selectedAudio) ?? false
                  : false;

                return (
                  <>
                    <Pressable
                      style={[
                        styles.optionsButton,
                        isMusicExpanded && styles.optionsButtonSelectedMusic,
                        selectedBelongsToMusic &&
                          styles.optionsButtonSelectedMusic,
                      ]}
                      onPress={() => setIsMusicExpanded(!isMusicExpanded)}
                    >
                      <Text style={styles.label}>
                        Music {isMusicExpanded ? "▲" : "▼"}
                      </Text>
                    </Pressable>
                    {isMusicExpanded && (
                      <ScrollView
                        style={styles.audioList}
                        nestedScrollEnabled={true}
                      >
                        {Array.from(
                          audioCollections.get("MUSIC")?.values() ?? []
                        ).map((mapping) => {
                          const cleanName =
                            mapping &&
                            typeof mapping === "object" &&
                            "cleanName" in mapping
                              ? // @ts-ignore
                                mapping.cleanName
                              : String(mapping);

                          return (
                            <View
                              key={cleanName}
                              style={[
                                styles.audioItem,
                                selectedAudio === cleanName &&
                                  styles.audioItemSelected,
                              ]}
                            >
                              <Pressable
                                style={styles.audioItemContent}
                                onPress={() => {
                                  setSelectedAudio(cleanName);
                                  setIsMusicExpanded(false);
                                }}
                              >
                                <Text
                                  style={[
                                    styles.audioLabel,
                                    selectedAudio === cleanName &&
                                      styles.audioLabelSelected,
                                  ]}
                                >
                                  {cleanName}
                                </Text>
                              </Pressable>
                              <View style={{ position: "relative" }}>
                                <Pressable
                                  style={styles.previewButton}
                                  onPress={() => {
                                    if (
                                      playingPreview === cleanName &&
                                      isPreviewPlaying
                                    ) {
                                      stopPreview();
                                    } else {
                                      playPreview(cleanName);
                                    }
                                  }}
                                >
                                  <Text style={styles.previewButtonText}>
                                    {playingPreview === cleanName &&
                                    isPreviewPlaying
                                      ? "⏸"
                                      : "▶️"}
                                  </Text>
                                </Pressable>
                                {playingPreview === cleanName &&
                                  isPreviewPlaying && (
                                    <PreviewAnimation
                                      previewProgress={previewProgress}
                                    />
                                  )}
                              </View>
                            </View>
                          );
                        })}
                      </ScrollView>
                    )}

                    <Pressable
                      style={[
                        styles.optionsButton,
                        selectedBelongsToSpeech &&
                          styles.optionsButtonSelectedSpeech,
                      ]}
                      onPress={() => setIsSpeechExpanded(!isSpeechExpanded)}
                    >
                      <Text style={styles.label}>
                        Speech {isSpeechExpanded ? "▲" : "▼"}
                      </Text>
                    </Pressable>
                  </>
                );
              })()}
              {isSpeechExpanded && (
                <ScrollView style={styles.audioList} nestedScrollEnabled={true}>
                  {Array.from(
                    audioCollections.get("SPEECH")?.values() ?? []
                  ).map((mapping) => {
                    const cleanName =
                      mapping &&
                      typeof mapping === "object" &&
                      "cleanName" in mapping
                        ? // @ts-ignore
                          mapping.cleanName
                        : String(mapping);

                    return (
                      <View
                        key={cleanName}
                        style={[
                          styles.audioItem,
                          selectedAudio === cleanName &&
                            styles.audioItemSelected,
                        ]}
                      >
                        <Pressable
                          style={styles.audioItemContent}
                          onPress={() => {
                            setSelectedAudio(cleanName);
                            setIsSpeechExpanded(false);
                          }}
                        >
                          <Text
                            style={[
                              styles.audioLabel,
                              selectedAudio === cleanName &&
                                styles.audioLabelSelected,
                            ]}
                          >
                            {cleanName}
                          </Text>
                        </Pressable>
                        <View style={{ position: "relative" }}>
                          <Pressable
                            style={styles.previewButton}
                            onPress={() => {
                              if (
                                playingPreview === cleanName &&
                                isPreviewPlaying
                              ) {
                                stopPreview();
                              } else {
                                playPreview(cleanName);
                              }
                            }}
                          >
                            <Text style={styles.previewButtonText}>
                              {playingPreview === cleanName && isPreviewPlaying
                                ? "⏸"
                                : "▶️"}
                            </Text>
                          </Pressable>
                          {playingPreview === cleanName && isPreviewPlaying && (
                            <PreviewAnimation
                              previewProgress={previewProgress}
                            />
                          )}
                        </View>
                      </View>
                    );
                  })}
                </ScrollView>
              )}{" "}
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
