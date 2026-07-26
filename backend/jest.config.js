module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  setupFiles: ['<rootDir>/tests/env.setup.js'],
  // mongodb-memory-server downloads a mongod binary on its first run in a
  // fresh environment, which can take longer than Jest's 5s default.
  testTimeout: 60_000,
  verbose: true,
};
