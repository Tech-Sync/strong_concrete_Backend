const { Buffer } = require("buffer");

function encode(id) {
  const encoded = Buffer.from(id.toString()).toString("base64");
  return encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function decode(encoded) {
  while (encoded.length % 4) {
    encoded += "=";
  }

  const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
  const decoded = Buffer.from(base64, "base64").toString("utf8");
  const originalId = parseInt(decoded, 10);

  return originalId;
}

module.exports = { encode, decode };
