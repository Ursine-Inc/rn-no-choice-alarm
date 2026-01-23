const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push("ogg", "mp3", "wav", "m4a", "aac");

config.resolver.alias = {
  "@": path.resolve(__dirname, "."),
  "@/app": path.resolve(__dirname, "app"),
  "@/assets": path.resolve(__dirname, "assets"),
  "@/hooks": path.resolve(__dirname, "hooks"),
  "@/constants": path.resolve(__dirname, "constants"),
  "@/components": path.resolve(__dirname, "components"),
  "@/data": path.resolve(__dirname, "data"),
  "@/themes": path.resolve(__dirname, "themes"),
  "@/types": path.resolve(__dirname, "types"),
};

module.exports = config;
