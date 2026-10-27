// Small leveled logger.
//
// debug: development detail. Printed when NODE_ENV isn't "production", or
//        when LOG_LEVEL=debug.
// info:  things worth seeing in every environment (startup, connections).
// warn / error: always printed.
//
// Never log secrets (passwords, tokens, one-time codes) at any level.

const debugEnabled =
  process.env.LOG_LEVEL === "debug" || process.env.NODE_ENV !== "production";

const log = {
  debug: (...args) => {
    if (debugEnabled) console.log(...args);
  },
  info: (...args) => console.log(...args),
  warn: (...args) => console.warn(...args),
  error: (...args) => console.error(...args),
};

module.exports = log;
