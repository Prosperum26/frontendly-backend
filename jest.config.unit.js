const baseConfig = require('./jest.config');

/**
 * @type {import('jest').Config}
 */
const config = {
  ...baseConfig,
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  coverageDirectory: '<rootDir>/coverage',
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
  /**
   * We intentionally leave coverage thresholds low, so each project can
   * define their own thresholds.
   */
  coverageThreshold: {
    // Aggregate coverage thresholds
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
    // Per-file coverage thresholds
    './src/**/*.ts': {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
};

module.exports = config;
