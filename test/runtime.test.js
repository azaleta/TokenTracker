const assert = require("node:assert/strict");
const { test } = require("node:test");

const {
  isWindows,
  nodeCommandParts,
  nodeCommandString,
  nodeCommandArray,
  shellQuote,
  shellQuotePosix,
  shellQuoteWindows,
} = require("../src/lib/runtime");

test("isWindows reflects process.platform", () => {
  assert.equal(isWindows(), process.platform === "win32");
});

test("nodeCommandParts returns unix /usr/bin/env form on non-windows", () => {
  if (process.platform === "win32") return;
  assert.deepEqual(nodeCommandParts("/tmp/notify.cjs"), [
    "/usr/bin/env",
    "node",
    "/tmp/notify.cjs",
  ]);
  assert.deepEqual(nodeCommandParts("/tmp/notify.cjs", "claude"), [
    "/usr/bin/env",
    "node",
    "/tmp/notify.cjs",
    "--source=claude",
  ]);
});

test("nodeCommandParts returns plain node form on windows", () => {
  if (process.platform !== "win32") return;
  assert.deepEqual(nodeCommandParts("C:\\Users\\me\\notify.cjs"), [
    "node",
    "C:\\Users\\me\\notify.cjs",
  ]);
  assert.deepEqual(nodeCommandParts("C:\\notify.cjs", "claude"), [
    "node",
    "C:\\notify.cjs",
    "--source=claude",
  ]);
});

test("nodeCommandParts omits --source when source is empty", () => {
  const parts = nodeCommandParts("/tmp/n.cjs", "");
  assert.ok(!parts.some((p) => p.startsWith("--source=")));
});

test("nodeCommandString produces a single shell line", () => {
  const out = nodeCommandString("/tmp/notify.cjs", "gemini");
  assert.equal(typeof out, "string");
  assert.ok(out.includes("notify.cjs"));
  if (process.platform !== "win32") {
    assert.ok(out.startsWith("/usr/bin/env node "));
    assert.ok(out.endsWith(" --source=gemini"));
  } else {
    assert.ok(out.startsWith("node "));
    assert.ok(out.endsWith(" --source=gemini"));
  }
});

test("nodeCommandString preserves every part in the resulting line", () => {
  const arr = nodeCommandArray("/tmp/notify.cjs", "codebuddy");
  const str = nodeCommandString("/tmp/notify.cjs", "codebuddy");
  for (const part of arr) {
    assert.ok(str.includes(part), `expected string to contain ${part}: ${str}`);
  }
});

test("shellQuotePosix passes through simple paths and quotes specials", () => {
  assert.equal(shellQuotePosix("/tmp/notify.cjs"), "/tmp/notify.cjs");
  assert.equal(shellQuotePosix(""), '""');
  assert.equal(shellQuotePosix("/path with space/n.cjs"), "'/path with space/n.cjs'");
  assert.equal(shellQuotePosix("/O'Brien/n.cjs"), "'/O'\\''Brien/n.cjs'");
});

test("shellQuoteWindows wraps paths with backslashes in double quotes", () => {
  const out = shellQuoteWindows("C:\\Users\\me\\notify.cjs");
  assert.equal(out, '"C:\\Users\\me\\notify.cjs"');
  assert.equal(shellQuoteWindows("plain"), "plain");
  assert.equal(shellQuoteWindows(""), '""');
});
