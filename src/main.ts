import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Server } from 'net';

import { configApp } from './app';
import { AppModule } from './app.module';
import { CommonConfig, commonConfigObj } from './common/config';
import { databaseConnect } from './editor/db_schemas/database_test';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<INestApplication<Server>>(AppModule);
  configApp(app);
  await databaseConnect();
  const { port } = <CommonConfig>app.get(commonConfigObj.KEY);
  await app.listen(port, () => {
    /* eslint no-console: ["error", { allow: ["warn", "error", "log"] }] */
    console.log(`listening on port ${port}`);
  });
}

bootstrap()
  .then(() => {
    // Notify the deployment platform that we're ready. This is used in PM2's
    // graceful startup process
    if (process.send) process.send('ready');
  })
  .catch((err: unknown) => {
    /* eslint no-console: ["error", { allow: ["warn", "error", "log"] }] */
    console.error(err, 'Server startup failed');
    process.exit(1);
  });
