import "react-native-gesture-handler/jestSetup";

const mockStores = new Map();

jest.mock("react-native-mmkv", () => {
  class MockMMKV {
    constructor(config) {
      const id = config?.id || "default";
      this.store = new Map();
      mockStores.set(id, this.store);
    }

    set(key, value) {
      this.store.set(key, value);
    }

    getString(key) {
      return this.store.get(key);
    }

    getNumber(key) {
      return this.store.get(key);
    }

    getBoolean(key) {
      return this.store.get(key);
    }

    remove(key) {
      this.store.delete(key);
    }

    delete(key) {
      this.store.delete(key);
    }

    getAllKeys() {
      return Array.from(this.store.keys());
    }

    clearAll() {
      this.store.clear();
    }

    contains(key) {
      return this.store.has(key);
    }
  }

  return {
    MMKV: MockMMKV,
  };
});

global.clearMockMMKV = (id) => {
  if (id && mockStores.has(id)) {
    mockStores.get(id).clear();
  } else {
    mockStores.forEach((store) => store.clear());
  }
};

// Mock Firebase Storage
// jest.mock("@react-native-firebase/storage", () => ({
//   __esModule: true,
//   default: jest.fn(() => ({
//     ref: jest.fn(() => ({
//       getDownloadURL: jest.fn(() =>
//         Promise.resolve("https://mock-url.com/track.mp3")
//       ),
//     })),
//   })),
// }));

// Mock react-native-track-player or expo-av if you're using them
// jest.mock("react-native-track-player", () => ({
//   setupPlayer: jest.fn(),
//   add: jest.fn(),
//   play: jest.fn(),
//   pause: jest.fn(),
//   stop: jest.fn(),
// }));

global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};

afterEach(() => {
  jest.clearAllMocks();
});
