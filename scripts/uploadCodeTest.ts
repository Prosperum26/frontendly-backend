import { NestFactory } from '@nestjs/core';

import { AppModule } from '../src/app.module';
import { VisualRegressionService } from '../src/editor/editor_service/visual_regression.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  try {
    const visualService = app.get(VisualRegressionService);
    await visualService.uploadTargetUrls();
    console.log('Successfully generate target urls');
  } catch (error: any) {
    console.error('[Error]', error.message);
  } finally {
    await app.close();
  }
}
void bootstrap();
