import { createContext, ReactNode, useContext, useMemo, useState } from "react";

const MUSIC_AUDIO_SOURCES = {
  "alarm1getyoass - Output - Stereo Out.m4a": require("../assets/audio/music/alarm1getyoass - Output - Stereo Out.m4a"),
  "alarm2personalssitant - Output - Stereo Out.m4a": require("../assets/audio/music/alarm2personalssitant - Output - Stereo Out.m4a"),
  "alarm3deathtoeverything - Output - Stereo Out.m4a": require("../assets/audio/music/alarm3deathtoeverything - Output - Stereo Out.m4a"),
  "alarm4gilbert - Output - Stereo Out.m4a": require("../assets/audio/music/alarm4gilbert - Output - Stereo Out.m4a"),
  "alarm5pete - Output - Stereo Out.m4a": require("../assets/audio/music/alarm5pete - Output - Stereo Out.m4a"),
  "alarm6zizek - Output - Stereo Out.m4a": require("../assets/audio/music/alarm6zizek - Output - Stereo Out.m4a"),
  "alarm7recovery - Output - Stereo Out.m4a": require("../assets/audio/music/alarm7recovery - Output - Stereo Out.m4a"),
} as const;

const SPEECH_AUDIO_SOURCES = {
  "BIG BOOK ESQE - Output - Stereo Out.aac": require("../assets/audio/speech/BIG BOOK ESQE - Output - Stereo Out.aac"),
  "DEATH TO ALL - Output - Stereo Out.aac": require("../assets/audio/speech/DEATH TO ALL - Output - Stereo Out.aac"),
  "JIVES THE BRITISH BUTLER - Output - Stereo Out.aac": require("../assets/audio/speech/JIVES THE BRITISH BUTLER - Output - Stereo Out.aac"),
  "NOT SO SENSITIVE COACH - Output - Stereo Out.aac": require("../assets/audio/speech/NOT SO SENSITIVE COACH - Output - Stereo Out.aac"),
  "SERENITY AND THIRD STEP - Output - Stereo Out.aac": require("../assets/audio/speech/SSERENITY AND THIRD STEP - Output - Stereo Out.aac"),
  "THIS IS NOT GILBERT - Output - Stereo Out.aac": require("../assets/audio/speech/THIS IS NOT GILBERT - Output - Stereo Out.aac"),
  "THIS IS NOT PETE - Output - Stereo Out.aac": require("../assets/audio/speech/THIS IS NOT PETE - Output - Stereo Out.aac"),
  "THIS IS NOT ZIZEK - Output - Stereo Out.aac": require("../assets/audio/speech/THIS IS NOT ZIZEK - Output - Stereo Out.aac"),
} as const;

type AudioFileName =
  | keyof typeof MUSIC_AUDIO_SOURCES
  | keyof typeof SPEECH_AUDIO_SOURCES;

const cleanFileName = (fileName: string): string => {
  const regex = new RegExp(" - Output - Stereo Out\\.(m4a|aac)$");
  let cleaned = fileName.replace(regex, "");

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

type AudioMapType = Map<string, AudioMapping>;
interface ActiveAlarmContextType {
  hasActiveAlarm: boolean;
  setHasActiveAlarm: (hasAlarm: boolean) => void;
  isAlarmKilled: boolean;
  setIsAlarmKilled: (killed: boolean) => void;
  killAlarm: () => void;
  audioFiles: AudioFileName[];
  audioMap: AudioMapType;
  audioCollections: Map<string, Map<string, AudioMapping>>;
  getAudioSource: (cleanName: string) => any | null;
  getAudioCollection: (cleanName: string) => string | null;
}

const ActiveAlarmContext = createContext<ActiveAlarmContextType | undefined>(
  undefined
);

export function ActiveAlarmProvider({ children }: { children: ReactNode }) {
  const [hasActiveAlarm, setHasActiveAlarm] = useState(false);
  const [isAlarmKilled, setIsAlarmKilled] = useState(false);

  const { combinedMap, collectionsMap } = useMemo(() => {
    const combined = new Map<string, AudioMapping>();

    const speechMap = new Map<string, AudioMapping>();
    const musicMap = new Map<string, AudioMapping>();

    (
      Object.keys(SPEECH_AUDIO_SOURCES) as (keyof typeof SPEECH_AUDIO_SOURCES)[]
    ).forEach((fileName) => {
      const cleanName = cleanFileName(fileName);
      const mapping: AudioMapping = {
        fullFileName: fileName,
        cleanName,
        source: SPEECH_AUDIO_SOURCES[fileName],
      };
      combined.set(cleanName, mapping);
      speechMap.set(cleanName, mapping);
    });

    (
      Object.keys(MUSIC_AUDIO_SOURCES) as (keyof typeof MUSIC_AUDIO_SOURCES)[]
    ).forEach((fileName) => {
      const cleanName = cleanFileName(fileName);
      const mapping: AudioMapping = {
        fullFileName: fileName,
        cleanName,
        source: MUSIC_AUDIO_SOURCES[fileName],
      };
      combined.set(cleanName, mapping);
      musicMap.set(cleanName, mapping);
    });

    const collections = new Map<string, Map<string, AudioMapping>>([
      ["SPEECH", speechMap],
      ["MUSIC", musicMap],
    ]);

    return { combinedMap: combined, collectionsMap: collections };
  }, []);

  const getAudioSource = (cleanName: string) => {
    const mapping = (combinedMap as Map<string, AudioMapping>).get(cleanName);
    if (mapping) {
      console.log(
        'Found audio source for "' + cleanName + '":',
        mapping.fullFileName
      );
      return mapping.source;
    }
    console.error('No audio source found for clean name: "' + cleanName + '"');
    return null;
  };

  const getAudioCollection = (cleanName: string) => {
    for (const [collectionName, map] of collectionsMap.entries()) {
      if (map.has(cleanName)) return collectionName;
    }
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
        audioFiles: Array.from(
          (combinedMap as Map<string, AudioMapping>).values()
        ).map((m) => m.fullFileName) as AudioFileName[],
        audioMap: combinedMap,
        audioCollections: collectionsMap,
        getAudioSource,
        getAudioCollection,
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
