export type Alarm = {
  id: string;
  time: string;
  day: string;
  enabled: boolean;
  trackIds: string[];
  recurring: boolean;
  hour?: string;
  minutes?: string;
  isRecurring: string;
  selectedAudio: string;
};
