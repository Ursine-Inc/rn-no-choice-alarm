const PATH_TO_MUSIC = "../assets/audio/music/";
const PATH_TO_SPEECH = "../assets/audio/speech/";

export type AudioFileName =
  | keyof typeof MUSIC_AUDIO_SOURCES
  | keyof typeof SPEECH_AUDIO_SOURCES;

export const MUSIC_AUDIO_SOURCES = {
  "ALARM CLOCK 1 - Output - Stereo Out.aac": require(PATH_TO_MUSIC +
    "ALARM CLOCK 1 - Output - Stereo Out.aac"),
  "ALARM CLOCK 2 - Output - Stereo Out.aac": require(PATH_TO_MUSIC +
    "ALARM CLOCK 2 - Output - Stereo Out.aac"),
  "ALARM CLOCK 3 - Output - Stereo Out.aac": require(PATH_TO_MUSIC +
    "ALARM CLOCK 3 - Output - Stereo Out.aac"),
  "ALARM CLOCK 4 - Output - Stereo Out.aac": require(PATH_TO_MUSIC +
    "ALARM CLOCK 4 - Output - Stereo Out.aac"),
  "ALARM CLOCK 5 - Output - Stereo Out.aac": require(PATH_TO_MUSIC +
    "ALARM CLOCK 5 - Output - Stereo Out.aac"),
  "ALARM CLOCK 6 - Output - Stereo Out.aac": require(PATH_TO_MUSIC +
    "ALARM CLOCK 6 - Output - Stereo Out.aac"),
  "ALARM CLOCK 7 - Output - Stereo Out.aac": require(PATH_TO_MUSIC +
    "ALARM CLOCK 7 - Output - Stereo Out.aac"),
  "ALARM CLOCK 8 - Output - Stereo Out.aac": require(PATH_TO_MUSIC +
    "ALARM CLOCK 8 - Output - Stereo Out.aac"),
  "Easy Rock Morning - Output - Stereo Out.aac": require(PATH_TO_MUSIC +
    "Easy Rock Morning - Output - Stereo Out.aac"),
  "Hayden in the morning - Output - Stereo Out.aac": require(PATH_TO_MUSIC +
    "Hayden in the morning - Output - Stereo Out.aac"),
  "Smithering Smitters Doing a bit - Output - Stereo Out.aac": require(PATH_TO_MUSIC +
    "Smithering Smitters Doing a bit - Output - Stereo Out.aac"),
} as const;

export const SPEECH_AUDIO_SOURCES = {
  "Anxieties - Output - Stereo Out.aac": require(PATH_TO_SPEECH +
    "Anxieties - Output - Stereo Out.aac"),
  "big book strong version - Output - Stereo Out.aac": require(PATH_TO_SPEECH +
    "big book strong version - Output - Stereo Out.aac"),
  "DEATH TO ALL - Output - Stereo Out.aac": require(PATH_TO_SPEECH +
    "DEATH TO ALL - Output - Stereo Out.aac"),
  "JIVES THE BRITISH BUTLER - Output - Stereo Out.aac": require(PATH_TO_SPEECH +
    "JIVES THE BRITISH BUTLER - Output - Stereo Out.aac"),
  "NOT SO SENSITIVE COACH - Output - Stereo Out.aac": require(PATH_TO_SPEECH +
    "NOT SO SENSITIVE COACH - Output - Stereo Out.aac"),
  "PROJECTIVE IDENTIFICATION - Output - Stereo Out.aac": require(PATH_TO_SPEECH +
    "PROJECTIVE IDENTIFICATION - Output - Stereo Out.aac"),
  "SERENITY AND THIRD STEP - Output - Stereo Out.aac": require(PATH_TO_SPEECH +
    "SSERENITY AND THIRD STEP - Output - Stereo Out.aac"),
  "Shulchan Aruch - Output - Stereo Out.aac": require(PATH_TO_SPEECH +
    "Shulchan Aruch - Output - Stereo Out.aac"),
  "MORTY NYC - Output - Stereo Out.aac": require(PATH_TO_SPEECH +
    "MORTY NYC - Output - Stereo Out.aac"),
  "THIS IS NOT GILBERT - Output - Stereo Out.aac": require(PATH_TO_SPEECH +
    "THIS IS NOT GILBERT - Output - Stereo Out.aac"),
  "THIS IS NOT PETE - Output - Stereo Out.aac": require(PATH_TO_SPEECH +
    "THIS IS NOT PETE - Output - Stereo Out.aac"),
  "THIS IS NOT ZIZEK - Output - Stereo Out.aac": require(PATH_TO_SPEECH +
    "THIS IS NOT ZIZEK - Output - Stereo Out.aac"),
  "SENSITIVE COACH - Output - Stereo Out.aac": require(PATH_TO_SPEECH +
    "SENSITIVE COACH - Output - Stereo Out.aac"),
  "WHATSAPP! - Output - Stereo Out.aac": require(PATH_TO_SPEECH +
    "WHATSAP - Output - Stereo Out.aac"),
} as const;
