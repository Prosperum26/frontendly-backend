const baseConfig = require('./jest.config');

/**
 * @type {import('jest').Config}
 */
const config = {
  ...baseConfig,
  testMatch: ['<rootDir>/test/integration/**/*.spec.ts'],
  // We use a shared Docker database for integration tests, so we need to run
  // them serially
  maxWorkers: 1,
  setupFilesAfterEnv: ['<rootDir>/test/test-helpers/setup-integration.ts'],
};

module.exports = config;
