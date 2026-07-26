const { env } = require('./env');

const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const currentLevel = LEVELS[env.LOG_LEVEL] ?? LEVELS.info;

/**
 * Minimal structured console logger. Errors are written to stderr, error
 * details (`err`) are logged separately from the human-readable message so
 * both are easy to scan.
 */
function log(level, contextOrMessage, message) {
  if (LEVELS[level] > currentLevel) return;

  const hasContext = typeof contextOrMessage === 'object' && contextOrMessage !== null;
  const text = hasContext ? message : contextOrMessage;
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  const writer = level === 'error' ? console.error : console.log;

  if (hasContext) {
    writer(prefix, text, contextOrMessage);
  } else {
    writer(prefix, text);
  }
}

const logger = {
  error: (contextOrMessage, message) => log('error', contextOrMessage, message),
  warn: (contextOrMessage, message) => log('warn', contextOrMessage, message),
  info: (contextOrMessage, message) => log('info', contextOrMessage, message),
  debug: (contextOrMessage, message) => log('debug', contextOrMessage, message),
};

module.exports = { logger };
