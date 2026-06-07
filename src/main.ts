import { INestApplication, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Server } from 'net';

import { configApp } from './app';
import { AppModule } from './app.module';
import { CommonConfig, commonConfigObj } from './common/config';

const logger = new Logger('Bootstrap');

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<INestApplication<Server>>(AppModule);

  // THÊM DÒNG NÀY: Bật CORS để cho phép Frontend gọi API
  app.enableCors();

  configApp(app);

  // --- TẠM THỜI: Xóa index 'id_1' bị lỗi trong DB ---
  try {
    const connection = app.get<Connection>(getConnectionToken());
    await connection.collection('users').dropIndex('id_1');
    logger.log('Successfully dropped problematic index id_1');
  } catch (error: unknown) {
    logger.debug(
      error instanceof Error
        ? `Index id_1 cleanup check finished: ${error.message}`
        : 'Index id_1 cleanup check finished.',
    );
  }
  // -----------------------------------------------

  const { port } = <CommonConfig>app.get(commonConfigObj.KEY);
  await app.listen(port, () => {
    logger.log(`listening on port ${port}`);
  });
}

bootstrap()
  .then(() => {
    // Notify the deployment platform that we're ready. This is used in PM2's
    // graceful startup process
    if (process.send) process.send('ready');
  })
  .catch((err: unknown) => {
    logger.error(err, 'Server startup failed');
    process.exit(1);
  });
