import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Server } from 'net';

import { configApp } from './app';
import { AppModule } from './app.module';
import { CommonConfig, commonConfigObj } from './common/config';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<INestApplication<Server>>(AppModule);
  configApp(app);
  const { port } = <CommonConfig>app.get(commonConfigObj.KEY);
  await app.listen(port, () => {
    console.info(`listening on port ${port}`);
  });
}

bootstrap()
  .then(() => {
    // Notify the deployment platform that we're ready. This is used in PM2's
    // graceful startup process
    if (process.send) process.send('ready');
  })
  .catch((err: unknown) => {
    console.error(err, 'Server startup failed');
    process.exit(1);
  });
