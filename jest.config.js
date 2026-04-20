/**
 * Global Jest configuration
 * @type {import('jest').Config}
 */
const baseConfig = {
  verbose: true,
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  rootDir: '.',
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  // Map the aliases defined in tsconfig.json
  moduleNameMapper: {
    '@/(.*)': '<rootDir>/src/$1',
    '@test-helpers/(.*)': '<rootDir>/test/test-helpers/$1',
  },
  testEnvironment: 'node',
  maxWorkers: 1,
  moduleFileExtensions: ['ts', 'js', 'json'],
};

module.exports = baseConfig;
