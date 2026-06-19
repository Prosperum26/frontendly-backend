import { INestApplication, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Server } from 'net';

import { configApp } from './app';
import { AppModule } from './app.module';
import { CommonConfig, commonConfigObj } from './common/config';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<INestApplication<Server>>(AppModule);

  configApp(app);

  const { port } = app.get<CommonConfig>(commonConfigObj.KEY);

  await app.listen(port, () => {
    logger.log(`listening on port ${port}`);
  });
}

bootstrap()
  .then(() => {
    if (process.send) process.send('ready');
  })
  .catch((err: unknown) => {
    const logger = new Logger('Bootstrap');
    logger.error(err, 'Server startup failed');
    process.exit(1);
  });
