import { createContext, ReactNode, useContext } from "react";

import { MMKV } from "react-native-mmkv";
import { Alarm } from "../types/alarms";

export const ALARMS_STORAGE_KEY = "alarms";

const storage = new MMKV({ id: ALARMS_STORAGE_KEY });

interface AlarmStorageContextType {
  getAlarm: (id: string) => Alarm | null;
  getAllAlarms: () => Alarm[];
  saveAlarm: (alarm: Alarm) => void;
  deleteAlarm: (id: string) => void;
  deleteAll: () => void;
  __clearAll: () => void;
}

const AlarmStorageContext = createContext<AlarmStorageContextType | undefined>(
  undefined,
);

export function useAlarmStorage() {
  const context = useContext(AlarmStorageContext);
  if (context === undefined) {
    throw new Error(
      "useAlarmStorage must be used within an AlarmStorageProvider",
    );
  }
  return context;
}

export function AlarmStorageProvider({ children }: { children: ReactNode }) {
  const getAlarm = (id: string): Alarm | null => {
    const alarmString = storage.getString(`alarm_${id}`);
    if (alarmString) {
      return JSON.parse(alarmString);
    }
    return null;
  };
  const getAllAlarms = () => {
    const keys = storage.getAllKeys().filter((k) => k.startsWith("alarm_"));
    return keys.map((k) => JSON.parse(storage.getString(k)!)).sort();
  };
  const saveAlarm = (alarm: Alarm) => {
    storage.set(`alarm_${alarm.id}`, JSON.stringify(alarm));
  };
  const deleteAlarm = (id: string) => {
    storage.delete(`alarm_${id}`);
  };
  const deleteAll = () => {
    const keys = storage.getAllKeys().filter((k) => k.startsWith("alarm_"));
    for (const k of keys) {
      storage.delete(k);
    }
  };
  const __clearAll = () => {
    if (process.env.NODE_ENV === "test") {
      storage.clearAll();
    }
  };

  return (
    <AlarmStorageContext.Provider
      value={{
        getAlarm,
        getAllAlarms,
        saveAlarm,
        deleteAlarm,
        deleteAll,
        __clearAll,
      }}
    >
      {children}
    </AlarmStorageContext.Provider>
  );
}

export default useAlarmStorage;
