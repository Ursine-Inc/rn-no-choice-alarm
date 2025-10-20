import { createContext, ReactNode, useContext, useMemo, useState } from "react";

const MUSIC_AUDIO_SOURCES = {
  "alarm1getyoass - Output - Stereo Out.m4a": require("../assets/audio/alarm1getyoass - Output - Stereo Out.m4a"),
  "alarm2personalssitant - Output - Stereo Out.m4a": require("../assets/audio/alarm2personalssitant - Output - Stereo Out.m4a"),
  "alarm3deathtoeverything - Output - Stereo Out.m4a": require("../assets/audio/alarm3deathtoeverything - Output - Stereo Out.m4a"),
  "alarm4gilbert - Output - Stereo Out.m4a": require("../assets/audio/alarm4gilbert - Output - Stereo Out.m4a"),
  "alarm5pete - Output - Stereo Out.m4a": require("../assets/audio/alarm5pete - Output - Stereo Out.m4a"),
  "alarm6zizek - Output - Stereo Out.m4a": require("../assets/audio/alarm6zizek - Output - Stereo Out.m4a"),
  "alarm7recovery - Output - Stereo Out.m4a": require("../assets/audio/alarm7recovery - Output - Stereo Out.m4a"),
} as const;

const SPEECH_AUDIO_SOURCES = {
  "alarm1getyoass - Output - Stereo Out.m4a": require("../assets/audio/alarm1getyoass - Output - Stereo Out.m4a"),
  "alarm2personalssitant - Output - Stereo Out.m4a": require("../assets/audio/alarm2personalssitant - Output - Stereo Out.m4a"),
  "alarm3deathtoeverything - Output - Stereo Out.m4a": require("../assets/audio/alarm3deathtoeverything - Output - Stereo Out.m4a"),
  "alarm4gilbert - Output - Stereo Out.m4a": require("../assets/audio/alarm4gilbert - Output - Stereo Out.m4a"),
  "alarm5pete - Output - Stereo Out.m4a": require("../assets/audio/alarm5pete - Output - Stereo Out.m4a"),
  "alarm6zizek - Output - Stereo Out.m4a": require("../assets/audio/alarm6zizek - Output - Stereo Out.m4a"),
  "alarm7recovery - Output - Stereo Out.m4a": require("../assets/audio/alarm7recovery - Output - Stereo Out.m4a"),
} as const;

type AudioFileName =
  | keyof typeof MUSIC_AUDIO_SOURCES
  | keyof typeof SPEECH_AUDIO_SOURCES;

const cleanFileName = (fileName: string): string => {
  let cleaned = fileName.replace(" - Output - Stereo Out.m4a", "");

  cleaned = cleaned.replace(/^alarm\d+/i, "");

  cleaned = cleaned.split("-")[0].trim();

  cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
  return cleaned;
};

interface AudioMapping {
  fullFileName: AudioFileName;
  cleanName: string;
  source: any;
}

type AudioMapType = Map<string, Map<string, AudioMapping>>;
interface ActiveAlarmContextType {
  hasActiveAlarm: boolean;
  setHasActiveAlarm: (hasAlarm: boolean) => void;
  isAlarmKilled: boolean;
  setIsAlarmKilled: (killed: boolean) => void;
  killAlarm: () => void;
  audioFiles: AudioFileName[];
  audioMap: AudioMapType;
  getAudioSource: (collectionName: string, cleanName: string) => any | null;
}

const ActiveAlarmContext = createContext<ActiveAlarmContextType | undefined>(
  undefined
);

export function ActiveAlarmProvider({ children }: { children: ReactNode }) {
  const [hasActiveAlarm, setHasActiveAlarm] = useState(false);
  const [isAlarmKilled, setIsAlarmKilled] = useState(false);

  const audioMap = useMemo(() => {
    const map = new Map<string, AudioMapping>();

    const speechMap = new Map<string, AudioMapping>();
    const musicMap = new Map<string, AudioMapping>();

    (Object.keys(SPEECH_AUDIO_SOURCES) as AudioFileName[]).forEach(
      (fileName) => {
        const cleanName = cleanFileName(fileName);
        map.set(cleanName, {
          fullFileName: fileName,
          cleanName,
          source: SPEECH_AUDIO_SOURCES[fileName],
        });
      }
    );

    (Object.keys(MUSIC_AUDIO_SOURCES) as AudioFileName[]).forEach(
      (fileName) => {
        const cleanName = cleanFileName(fileName);
        map.set(cleanName, {
          fullFileName: fileName,
          cleanName,
          source: MUSIC_AUDIO_SOURCES[fileName],
        });
      }
    );

    const audioMap = new Map<string, Map<string, AudioMapping>>([
      ["SPEECH", speechMap],
      ["MUSIC", musicMap],
    ]);

    console.log("Audio map created:", Array.from(audioMap.keys()));

    return audioMap;
  }, []);

  const getAudioSource = (collectionName: string, cleanName: string) => {
    const mapping = audioMap.get(collectionName)?.get(cleanName);
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
        audioFiles: Object.keys(audioMap) as AudioFileName[],
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
