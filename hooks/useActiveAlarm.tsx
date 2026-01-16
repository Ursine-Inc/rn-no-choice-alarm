import { createContext, ReactNode, useContext, useState } from "react";

interface ActiveAlarmContextType {
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
  undefined
);

export function ActiveAlarmProvider({ children }: { children: ReactNode }) {
  const [hasActiveAlarm, setHasActiveAlarm] = useState(false);
  const [isAlarmKilled, setIsAlarmKilled] = useState(false);
  const [isAlarmCancelled, setIsAlarmCancelled] = useState(false);
  const [isAlarmCountdownPaused, setIsAlarmCountdownPaused] = useState(false);

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
      "useActiveAlarm must be used within an ActiveAlarmProvider"
    );
  }
  return context;
}
