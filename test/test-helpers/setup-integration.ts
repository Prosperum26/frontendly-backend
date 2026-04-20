/* eslint-disable import/order */
/* eslint-disable import/first */
/* eslint-disable import/no-mutable-exports */

/**
 * Create module for integration tests, which makes some modifications to
 * out-of-process dependencies. Managed dependencies (e.g database, cache) are
 * replaced with Docker containers, while unmanaged dependencies (e.g external
 * services) are replaced with mocks.
 */
import { config } from 'dotenv';
import { resolve } from 'path';

// Has to happen before any other imports
config({ path: resolve(__dirname, '../../.env.integration'), override: true });

import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OAuth2Client } from 'google-auth-library';

import { clearDatabase } from './db';
import { configApp } from '@/app';
import { AppModule } from '@/app.module';

import { Server } from 'net';

// Unmanaged dependencies
let oauth2Client: DeepMocked<OAuth2Client>;

let testModule: TestingModule;
let testApp: INestApplication<Server>;

beforeAll(async () => {
  // Mock all unmanaged dependencies
  oauth2Client = createMock<OAuth2Client>();

  testModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(OAuth2Client)
    .useValue(oauth2Client)
    .compile();
  testApp = testModule.createNestApplication();
  configApp(testApp);
  await testApp.init();
});

beforeEach(async () => {
  await clearDatabase(testModule);
  jest.clearAllMocks();
  jest.clearAllTimers();
  jest.useRealTimers();
});

afterAll(async () => {
  await testApp.close();
});

// Give some extra time for containers to spin up
jest.setTimeout(300000);

export { testApp, testModule };
