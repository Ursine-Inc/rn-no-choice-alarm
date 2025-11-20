import { AlarmStorage } from "@/data/AlarmStorage";

describe("AlarmStorage", () => {
  beforeEach(() => {
    AlarmStorage.__clearAll();
  });

  it("returns all alarms", () => {
    AlarmStorage.saveAlarm({
      id: "1",
      time: "07:00",
      day: "Monday",
      enabled: true,
      trackIds: [],
      recurring: false,
    });
    AlarmStorage.saveAlarm({
      id: "2",
      time: "08:00",
      day: "Tuesday",
      enabled: false,
      trackIds: [],
      recurring: true,
    });

    const alarms = AlarmStorage.getAllAlarms();

    expect(alarms).toHaveLength(2);
  });

  it("saves and retrieves an alarm", () => {});

  it("deletes an alarm", () => {
    AlarmStorage.saveAlarm({
      id: "1",
      time: "07:00",
      day: "Monday",
      enabled: true,
      trackIds: [],
      recurring: false,
    });
    AlarmStorage.deleteAlarm("1");

    expect(AlarmStorage.getAlarm("1")).toBeNull();
  });
});
