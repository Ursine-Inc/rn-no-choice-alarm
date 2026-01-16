import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface AndroidTimePickerProps {
  hour: number | null;
  minutes: number | null;
  onTimeChange: (hour: number, minutes: number) => void;
}

export function AndroidTimePicker({
  hour,
  minutes,
  onTimeChange,
}: AndroidTimePickerProps) {
  const [showPicker, setShowPicker] = useState(false);

  // Convert hour/minutes to Date object, defaulting to current time if null
  const getDateValue = () => {
    const now = new Date();
    if (hour !== null && minutes !== null) {
      now.setHours(hour, minutes, 0, 0);
    }
    return now;
  };

  const handleChange = (event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (event.type === "set" && selectedDate) {
      const hours = selectedDate.getHours();
      const mins = selectedDate.getMinutes();
      onTimeChange(hours, mins);
    }
  };

  const displayTime =
    hour === null || minutes === null
      ? "--:--"
      : `${String(hour).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

  return (
    <View>
      <Pressable style={styles.button} onPress={() => setShowPicker(true)}>
        <Text style={styles.buttonText}>{displayTime}</Text>
        <Text style={styles.buttonArrow}>▼</Text>
      </Pressable>

      {showPicker && (
        <DateTimePicker
          value={getDateValue()}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={handleChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minWidth: 150,
    height: 44,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    color: "#000",
  },
  buttonArrow: {
    fontSize: 12,
    color: "#666",
  },
});
