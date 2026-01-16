import DateTimePicker from "@react-native-community/datetimepicker";
import { StyleSheet } from "react-native";

interface IOSTimePickerProps {
  hour: number | null;
  minutes: number | null;
  onTimeChange: (hour: number, minutes: number) => void;
}

export function IOSTimePicker({
  hour,
  minutes,
  onTimeChange,
}: IOSTimePickerProps) {
  // Convert hour/minutes to Date object, defaulting to current time if null
  const getDateValue = () => {
    const now = new Date();
    if (hour !== null && minutes !== null) {
      now.setHours(hour, minutes, 0, 0);
    }
    return now;
  };

  const handleChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      const hours = selectedDate.getHours();
      const mins = selectedDate.getMinutes();
      onTimeChange(hours, mins);
    }
  };

  return (
    <DateTimePicker
      value={getDateValue()}
      mode="time"
      is24Hour={true}
      display="compact"
      onChange={handleChange}
    />
  );
}

const styles = StyleSheet.create({});
