import { Picker } from "@react-native-picker/picker";
import { StyleSheet } from "react-native";

interface IOSDayPickerProps {
  day: string | null;
  daysOfWeek: string[];
  onDayChange: (day: string | null) => void;
}

export function IOSDayPicker({
  day,
  daysOfWeek,
  onDayChange,
}: IOSDayPickerProps) {
  return (
    <Picker
      selectedValue={day ?? ""}
      onValueChange={(itemValue: string) =>
        onDayChange(itemValue === "" ? null : itemValue)
      }
      style={styles.picker}
      itemStyle={styles.pickerItem}
    >
      <Picker.Item key="empty-day" label="--" value="" />
      {daysOfWeek.map((dayName) => (
        <Picker.Item key={dayName} label={dayName} value={dayName} />
      ))}
    </Picker>
  );
}

const styles = StyleSheet.create({
  picker: {
    width: 150,
    height: 150,
  },
  pickerItem: {
    height: 100,
    fontSize: 16,
  },
});
