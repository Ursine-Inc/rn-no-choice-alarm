export const MUSIC_AUDIO_SOURCES = {
  "alarm1getyoass - Output - Stereo Out.m4a": require("../../assets/audio/music/alarm1getyoass - Output - Stereo Out.m4a"),
  "alarm2personalssitant - Output - Stereo Out.m4a": require("../../assets/audio/music/alarm2personalssitant - Output - Stereo Out.m4a"),
  "alarm3deathtoeverything - Output - Stereo Out.m4a": require("../../assets/audio/music/alarm3deathtoeverything - Output - Stereo Out.m4a"),
  "alarm4gilbert - Output - Stereo Out.m4a": require("../../assets/audio/music/alarm4gilbert - Output - Stereo Out.m4a"),
  "alarm5pete - Output - Stereo Out.m4a": require("../../assets/audio/music/alarm5pete - Output - Stereo Out.m4a"),
  "alarm6zizek - Output - Stereo Out.m4a": require("../../assets/audio/music/alarm6zizek - Output - Stereo Out.m4a"),
  "alarm7recovery - Output - Stereo Out.m4a": require("../../assets/audio/music/alarm7recovery - Output - Stereo Out.m4a"),
  "Easy Rock Morning - Output - Stereo Out.aac": require("../../assets/audio/music/Easy Rock Morning - Output - Stereo Out.aac"),
  "Hayden in the morning - Output - Stereo Out.aac": require("../../assets/audio/music/Hayden in the morning - Output - Stereo Out.aac"),
  "Smithering Smitters Doing a bit - Output - Stereo Out.aac": require("../../assets/audio/music/Smithering Smitters Doing a bit - Output - Stereo Out.aac"),
} as const;

export const SPEECH_AUDIO_SOURCES = {
  "BIG BOOK ESQE - Output - Stereo Out.aac": require("../../assets/audio/speech/BIG BOOK ESQE - Output - Stereo Out.aac"),
  "DEATH TO ALL - Output - Stereo Out.aac": require("../../assets/audio/speech/DEATH TO ALL - Output - Stereo Out.aac"),
  "JIVES THE BRITISH BUTLER - Output - Stereo Out.aac": require("../../assets/audio/speech/JIVES THE BRITISH BUTLER - Output - Stereo Out.aac"),
  "NOT SO SENSITIVE COACH - Output - Stereo Out.aac": require("../../assets/audio/speech/NOT SO SENSITIVE COACH - Output - Stereo Out.aac"),
  "SERENITY AND THIRD STEP - Output - Stereo Out.aac": require("../../assets/audio/speech/SSERENITY AND THIRD STEP - Output - Stereo Out.aac"),
  "THIS IS NOT GILBERT - Output - Stereo Out.aac": require("../../assets/audio/speech/THIS IS NOT GILBERT - Output - Stereo Out.aac"),
  "THIS IS NOT PETE - Output - Stereo Out.aac": require("../../assets/audio/speech/THIS IS NOT PETE - Output - Stereo Out.aac"),
  "THIS IS NOT ZIZEK - Output - Stereo Out.aac": require("../../assets/audio/speech/THIS IS NOT ZIZEK - Output - Stereo Out.aac"),
  "Anxieties - Output - Stereo Out.aac": require("../../assets/audio/speech/Anxieties - Output - Stereo Out.aac"),
  "PROJECTIVE IDENTIFICATION - Output - Stereo Out.aac": require("../../assets/audio/speech/PROJECTIVE IDENTIFICATION - Output - Stereo Out.aac"),
  "SENSITIVE COACH - Output - Stereo Out.aac": require("../../assets/audio/speech/SENSITIVE COACH - Output - Stereo Out.aac"),
  "Shulchan Aruch - Output - Stereo Out.aac": require("../../assets/audio/speech/Shulchan Aruch - Output - Stereo Out.aac"),
  "WHATSAP - Output - Stereo Out.aac": require("../../assets/audio/speech/WHATSAP - Output - Stereo Out.aac"),
  "big book strong version - Output - Stereo Out.aac": require("../../assets/audio/speech/big book strong version - Output - Stereo Out.aac"),
} as const;

export type AudioFileName =
  | keyof typeof MUSIC_AUDIO_SOURCES
  | keyof typeof SPEECH_AUDIO_SOURCES;
