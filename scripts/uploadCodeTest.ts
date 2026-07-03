import { NestFactory } from '@nestjs/core';

import { AppModule } from '../src/app.module';
import { VisualRegressionService } from '../src/editor/editor_service/visual_regression.service';

async function bootstrap() {
  console.log('📤 Uploading target images to Cloudinary...');
  const app = await NestFactory.createApplicationContext(AppModule);
  try {
    const visualService = app.get(VisualRegressionService);
    await visualService.uploadTargetUrls();
    console.log('✅ Successfully generated target URLs');
    console.log('\n✨ Target image upload completed successfully!');
  } catch (error: any) {
    console.error('[Error]', error.message);
    console.warn('⚠️  Target image upload failed.');
    console.warn(
      '⚠️  This is usually due to Puppeteer/Chrome not being installed or configured.',
    );
    process.exit(1);
  } finally {
    await app.close();
  }
  process.exit(0);
}

void bootstrap();
