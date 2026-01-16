import { AudioFileName, MUSIC_AUDIO_SOURCES, SPEECH_AUDIO_SOURCES } from "@/data/tracks";
import { cleanFileName } from "@/utils/helpers";
import { createContext, useContext, useMemo } from "react";

interface AudioMapping {
  fullFileName: AudioFileName;
  cleanName: string;
  source: any;
}

type AudioMapType = Map<string, AudioMapping>;

interface AudioContextType {
    audioFiles: AudioFileName[];
  audioMap: AudioMapType;
  audioCollections: Map<string, Map<string, AudioMapping>>;
  getAudioSource: (cleanName: string) => any | null;
  getAudioCollection: (cleanName: string) => string | null;
}

interface AudioProviderProps {
    children: React.ReactNode;
    }
    
    export function useAudio() {
      const context = useContext(AudioContext);
      if (context === undefined) {
        throw new Error(
          "useAudio must be used within an AudioProvider"
        );
      }
      return context;
    }

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: AudioProviderProps) {
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
          return mapping.source;
        }
        return null;
      };
    
      const getAudioCollection = (cleanName: string) => {
        for (const [collectionName, map] of collectionsMap.entries()) {
          if (map.has(cleanName)) return collectionName;
        }
        return null;
      };

  return (
    <AudioContext.Provider
      value={{
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
    </AudioContext.Provider>
  );
}