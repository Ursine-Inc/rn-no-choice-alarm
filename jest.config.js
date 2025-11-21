module.exports = {
  preset: "react-native",

  testEnvironment: "node",

  setupFilesAfterEnv: [
    "@testing-library/jest-native/extend-expect",
    "<rootDir>/jest.setup.js",
  ],

  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.test.json",
    },
  },

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "\\.(jpg|jpeg|png|gif|svg)$": "<rootDir>/__mocks__/fileMock.js",
    "\\.(mp3|wav|m4a)$": "<rootDir>/__mocks__/fileMock.js",
  },

  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },

  testPathIgnorePatterns: ["/node_modules/", "/android/", "/ios/"],

  collectCoverageFrom: [
    "app/**/*.{ts,tsx}",
    "!app/**/*.d.ts",
    "!app/**/_layout.tsx",
    "!app/**/+not-found.tsx",
  ],

  coverageThreshold: {
    global: {
      statements: 70,
      branches: 70,
      functions: 70,
      lines: 70,
    },
  },

  maxWorkers: "50%",

  clearMocks: true,

  transformIgnorePatterns: [
    "node_modules/(?!(react-native|@react-native|expo|@expo|@react-navigation|react-native-mmkv|@notifee)/)",
  ],
};
