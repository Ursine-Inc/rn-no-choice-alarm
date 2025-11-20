import {
  AudioFileName,
  MUSIC_AUDIO_SOURCES,
  SPEECH_AUDIO_SOURCES,
} from "@/data/tracks";
import { cleanFileName } from "@/utils/helpers";
import { createContext, ReactNode, useContext, useMemo, useState } from "react";
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
  isAlarmCountdownPaused: boolean;
  pauseAlarmCountdown: () => void;
  resumeAlarmCountdown: () => void;
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
  const [isAlarmCountdownPaused, setIsAlarmCountdownPaused] = useState(false);

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
        isAlarmCountdownPaused,
        pauseAlarmCountdown,
        resumeAlarmCountdown,
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
