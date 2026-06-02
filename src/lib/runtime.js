const os = require("node:os");

function isWindows() {
  return process.platform === "win32";
}

function nodeCommandParts(notifyPath, source) {
  const target = typeof notifyPath === "string" ? notifyPath : "";
  const parts = isWindows() ? ["node", target] : ["/usr/bin/env", "node", target];
  if (typeof source === "string" && source.length > 0) {
    parts.push(`--source=${source}`);
  }
  return parts;
}

function shellQuotePosix(value) {
  const v = typeof value === "string" ? value : "";
  if (!v) return '""';
  if (/^[A-Za-z0-9_\-./:@=]+$/.test(v)) return v;
  return `'${v.replace(/'/g, "'\\''")}'`;
}

function shellQuoteWindows(value) {
  const v = typeof value === "string" ? value : "";
  if (!v) return '""';
  if (/^[A-Za-z0-9_\-./:@=]+$/.test(v)) return v;
  return `"${v.replace(/"/g, '\\"')}"`;
}

function shellQuote(value) {
  return isWindows() ? shellQuoteWindows(value) : shellQuotePosix(value);
}

function nodeCommandString(notifyPath, source) {
  return nodeCommandParts(notifyPath, source).map(shellQuote).join(" ");
}

function nodeCommandArray(notifyPath, source) {
  return nodeCommandParts(notifyPath, source);
}

module.exports = {
  isWindows,
  nodeCommandParts,
  nodeCommandString,
  nodeCommandArray,
  shellQuote,
  shellQuotePosix,
  shellQuoteWindows,
};
