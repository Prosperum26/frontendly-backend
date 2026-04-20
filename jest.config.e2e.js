const baseConfig = require('./jest.config');

/**
 * @type {import('jest').Config}
 */
const config = {
  ...baseConfig,
  testMatch: ['<rootDir>/test/e2e/**/*.spec.ts'],
};

module.exports = config;
