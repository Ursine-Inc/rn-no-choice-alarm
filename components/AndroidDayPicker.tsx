import { Picker } from "@react-native-picker/picker";
import { StyleSheet, View } from "react-native";

interface AndroidDayPickerProps {
  day: string | null;
  daysOfWeek: string[];
  onDayChange: (day: string | null) => void;
}

export function AndroidDayPicker({
  day,
  daysOfWeek,
  onDayChange,
}: AndroidDayPickerProps) {
  return (
    <View style={styles.container}>
      <Picker
        selectedValue={day ?? ""}
        onValueChange={(itemValue: string) =>
          onDayChange(itemValue === "" ? null : itemValue)
        }
        style={styles.picker}
        itemStyle={styles.pickerItem}
      >
        <Picker.Item key="empty-day-android" label="--" value="" />
        {daysOfWeek.map((dayName) => (
          <Picker.Item
            key={dayName}
            label={dayName}
            value={dayName}
          />
        ))}
      </Picker>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    overflow: "hidden",
  },
  picker: {
    width: 229,
    height: 50,
    overflow: "hidden",
  },
  pickerItem: {
    height: 50,
    fontSize: 16,
  },
});
