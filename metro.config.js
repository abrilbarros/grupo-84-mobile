const { getDefaultConfig } = require("expo/metro-config");

const configuracionDeMetro = getDefaultConfig(__dirname);

configuracionDeMetro.resolver.assetExts.push("wasm");

module.exports = configuracionDeMetro;
