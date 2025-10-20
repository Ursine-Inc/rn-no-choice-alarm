import { createContext, ReactNode, useContext, useMemo, useState } from "react";

// Audio source mapping - single source of truth
const AUDIO_SOURCES = {
  "alarm1getyoass - Output - Stereo Out.m4a": require("../assets/audio/alarm1getyoass - Output - Stereo Out.m4a"),
  "alarm2personalssitant - Output - Stereo Out.m4a": require("../assets/audio/alarm2personalssitant - Output - Stereo Out.m4a"),
  "alarm3deathtoeverything - Output - Stereo Out.m4a": require("../assets/audio/alarm3deathtoeverything - Output - Stereo Out.m4a"),
  "alarm4gilbert - Output - Stereo Out.m4a": require("../assets/audio/alarm4gilbert - Output - Stereo Out.m4a"),
  "alarm5pete - Output - Stereo Out.m4a": require("../assets/audio/alarm5pete - Output - Stereo Out.m4a"),
  "alarm6zizek - Output - Stereo Out.m4a": require("../assets/audio/alarm6zizek - Output - Stereo Out.m4a"),
  "alarm7recovery - Output - Stereo Out.m4a": require("../assets/audio/alarm7recovery - Output - Stereo Out.m4a"),
} as const;

type AudioFileName = keyof typeof AUDIO_SOURCES;

// Function to clean up audio file names for display
const cleanFileName = (fileName: string): string => {
  // Remove the file extension
  let cleaned = fileName.replace(" - Output - Stereo Out.m4a", "");
  // Remove "alarm" followed by a number at the beginning
  cleaned = cleaned.replace(/^alarm\d+/i, "");
  // Remove everything from the first hyphen onwards
  cleaned = cleaned.split("-")[0].trim();
  // Convert to sentence case (first letter uppercase, rest lowercase)
  cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
  return cleaned;
};

interface AudioMapping {
  fullFileName: AudioFileName;
  cleanName: string;
  source: any;
}

interface ActiveAlarmContextType {
  hasActiveAlarm: boolean;
  setHasActiveAlarm: (hasAlarm: boolean) => void;
  isAlarmKilled: boolean;
  setIsAlarmKilled: (killed: boolean) => void;
  killAlarm: () => void;
  audioFiles: AudioFileName[];
  audioMap: Map<string, AudioMapping>;
  getAudioSource: (cleanName: string) => any | null;
}

const ActiveAlarmContext = createContext<ActiveAlarmContextType | undefined>(
  undefined
);

export function ActiveAlarmProvider({ children }: { children: ReactNode }) {
  const [hasActiveAlarm, setHasActiveAlarm] = useState(false);
  const [isAlarmKilled, setIsAlarmKilled] = useState(false);

  // Create audio mapping on mount
  const audioMap = useMemo(() => {
    const map = new Map<string, AudioMapping>();

    (Object.keys(AUDIO_SOURCES) as AudioFileName[]).forEach((fileName) => {
      const cleanName = cleanFileName(fileName);
      map.set(cleanName, {
        fullFileName: fileName,
        cleanName,
        source: AUDIO_SOURCES[fileName],
      });
    });

    console.log("Audio map created:", Array.from(map.keys()));
    return map;
  }, []);

  const getAudioSource = (cleanName: string) => {
    const mapping = audioMap.get(cleanName);
    if (mapping) {
      console.log(
        `Found audio source for "${cleanName}":`,
        mapping.fullFileName
      );
      return mapping.source;
    }
    console.error(`No audio source found for clean name: "${cleanName}"`);
    console.log("Available clean names:", Array.from(audioMap.keys()));
    return null;
  };

  const killAlarm = () => {
    setIsAlarmKilled(true);
  };

  return (
    <ActiveAlarmContext.Provider
      value={{
        hasActiveAlarm,
        setHasActiveAlarm,
        isAlarmKilled,
        setIsAlarmKilled,
        killAlarm,
        audioFiles: Object.keys(AUDIO_SOURCES) as AudioFileName[],
        audioMap,
        getAudioSource,
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
