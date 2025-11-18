const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push("ogg", "mp3", "wav", "m4a", "aac");

config.resolver.alias = {
  "@": path.resolve(__dirname, "."),
  "@/assets": path.resolve(__dirname, "assets"),
  "@/app": path.resolve(__dirname, "app"),
  "@/hooks": path.resolve(__dirname, "app/hooks"),
  "@/constants": path.resolve(__dirname, "app/constants"),
  "@/components": path.resolve(__dirname, "app/components"),
};

module.exports = config;
