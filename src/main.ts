import { INestApplication, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Server } from 'net';

import { configApp } from './app';
import { AppModule } from './app.module';
import { CommonConfig, commonConfigObj } from './common/config';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<INestApplication<Server>>(AppModule);

  // Bật CORS an toàn: Cho phép Frontend gọi chéo origin và đính kèm token
  app.enableCors({
    origin: true,
    credentials: true,
  });

  configApp(app);

  const { port } = app.get<CommonConfig>(commonConfigObj.KEY);

  await app.listen(port, () => {
    Logger.log(`listening on port ${port}`, 'Bootstrap');
  });
}

bootstrap()
  .then(() => {
    if (process.send) process.send('ready');
  })
  .catch((err: unknown) => {
    // Ép kiểu an toàn để pass ESLint/TypeScript: Lấy stack trace nếu là Error, nếu không chuyển thành chuỗi
    const errorMessage = err instanceof Error ? err.stack : String(err);
    Logger.error('Server startup failed', errorMessage, 'Bootstrap');
    process.exit(1);
  });
