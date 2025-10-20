const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Add support for audio files
config.resolver.assetExts.push("ogg", "mp3", "wav", "m4a", "aac");

module.exports = config;
