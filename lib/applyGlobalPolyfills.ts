const TextEncodingPolyfill = require("text-encoding");
const crypto = require("expo-crypto");
import "react-native-get-random-values";
import "react-native-url-polyfill/auto";
const Buffer = require("@craftzdog/react-native-buffer").Buffer;

const applyGlobalPolyfills = () => {
  Object.assign(global, {
    TextEncoder: TextEncodingPolyfill.TextEncoder,
    TextDecoder: TextEncodingPolyfill.TextDecoder,
    crypto,
    Buffer,
  });
};

applyGlobalPolyfills();
