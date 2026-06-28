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
    // Mock JSDOM and related packages to avoid ES module issues
    '^jsdom$': '<rootDir>/test/mocks/jsdom.mock.ts',
    '^stylelint$': '<rootDir>/test/mocks/stylelint.mock.ts',
    '^pixelmatch$': '<rootDir>/test/mocks/pixelmatch.mock.ts',
    '^pngjs$': '<rootDir>/test/mocks/pngjs.mock.ts',
    '^puppeteer$': '<rootDir>/test/mocks/puppeteer.mock.ts',
  },
  testEnvironment: 'node',
  maxWorkers: 1,
  moduleFileExtensions: ['ts', 'js', 'json'],
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
};

module.exports = baseConfig;
