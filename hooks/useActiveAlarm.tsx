import { AlarmStorage } from "@/data/AlarmStorage";
import { Alarm } from "@/types/alarms";
import { createContext, ReactNode, useContext, useState } from "react";
import { useAlarmStorage } from "./useAlarmStorage";

interface ActiveAlarmContextType {
  activeAlarm: Alarm | null;
  setActiveAlarm: (alarm: Alarm | null) => void;
  createNewAlarm: (payload: Alarm) => void;
  selectedAudio: string;
  setSelectedAudio: (audio: string) => void;
  turnOffAlarm: (id: string) => void;
  hasActiveAlarm: boolean;
  setHasActiveAlarm: (hasAlarm: boolean) => void;
  isAlarmKilled: boolean;
  setIsAlarmKilled: (killed: boolean) => void;
  killAlarm: () => void;
  isAlarmCancelled: boolean;
  setIsAlarmCancelled: (cancelled: boolean) => void;
  cancelAlarm: () => void;
  isAlarmCountdownPaused: boolean;
  pauseAlarmCountdown: () => void;
  resumeAlarmCountdown: () => void;
}

const ActiveAlarmContext = createContext<ActiveAlarmContextType | undefined>(
  undefined,
);

export function ActiveAlarmProvider({ children }: { children: ReactNode }) {
  const { getAlarm, saveAlarm } = useAlarmStorage();
  const [hasActiveAlarm, setHasActiveAlarm] = useState(false);
  const [isAlarmKilled, setIsAlarmKilled] = useState(false);
  const [isAlarmCancelled, setIsAlarmCancelled] = useState(false);
  const [isAlarmCountdownPaused, setIsAlarmCountdownPaused] = useState(false);
  const [activeAlarm, setActiveAlarm] = useState<Alarm | null>(null);
  const [selectedAudio, setSelectedAudio] = useState<string>("");

  const turnOffAlarm = (id: string) => {
    const alarm = getAlarm(id);
    if (alarm) {
      alarm.enabled = false;
      saveAlarm(alarm);
    }
  };

  const createNewAlarm = (payload: Alarm) => {
    AlarmStorage.saveAlarm(payload);
    setActiveAlarm(payload);
    setHasActiveAlarm(true);
  };

  const killAlarm = () => {
    setIsAlarmKilled(true);
  };

  const cancelAlarm = () => {
    setHasActiveAlarm(false);
    setIsAlarmCancelled(true);
  };

  const pauseAlarmCountdown = () => {
    setIsAlarmCountdownPaused(true);
  };

  const resumeAlarmCountdown = () => {
    setIsAlarmCountdownPaused(false);
  };

  return (
    <ActiveAlarmContext.Provider
      value={{
        activeAlarm,
        setActiveAlarm,
        createNewAlarm,
        selectedAudio,
        setSelectedAudio,
        turnOffAlarm,
        hasActiveAlarm,
        setHasActiveAlarm,
        isAlarmKilled,
        setIsAlarmKilled,
        killAlarm,
        isAlarmCancelled,
        setIsAlarmCancelled,
        cancelAlarm,
        isAlarmCountdownPaused,
        pauseAlarmCountdown,
        resumeAlarmCountdown,
      }}
    >
      {children}
    </ActiveAlarmContext.Provider>
  );
}

export function useActiveAlarm() {
  const context = useContext(ActiveAlarmContext);
  if (context === undefined) {
    throw new Error(
      "useActiveAlarm must be used within an ActiveAlarmProvider",
    );
  }
  return context;
}
