import { MMKV } from "react-native-mmkv";

export const ALARMS_STORAGE_KEY = "alarms";

const storage = new MMKV({ id: ALARMS_STORAGE_KEY });

export type Alarm = {
  id: string;
  time: string;
  day: string;
  enabled: boolean;
  trackIds: string[];
  recurring: boolean;
};

export const AlarmStorage = {
  getAlarm: (id: string): Alarm | null => {
    const alarmString = storage.getString(`alarm_${id}`);
    if (alarmString) {
      return JSON.parse(alarmString);
    }
    return null;
  },
  getAllAlarms: () => {
    const keys = storage.getAllKeys().filter((k) => k.startsWith("alarm_"));
    return keys.map((k) => JSON.parse(storage.getString(k)!)).sort();
  },
  saveAlarm(alarm: Alarm) {
    storage.set(`alarm_${alarm.id}`, JSON.stringify(alarm));
  },
  deleteAlarm: (id: string) => {
    storage.delete(`alarm_${id}`);
  },
  deleteAll: () => {
    const keys = storage.getAllKeys().filter((k) => k.startsWith("alarm_"));
    for (const k of keys) {
      storage.delete(k);
    }
  },
  __clearAll: () => {
    if (process.env.NODE_ENV === "test") {
      storage.clearAll();
    }
  },
};
