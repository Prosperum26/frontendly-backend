import { NestFactory } from '@nestjs/core';

import { seed } from './seed';
import { AppModule } from '../src/app.module';
import { VisualRegressionService } from '../src/editor/editor_service/visual_regression.service';

async function bootstrap() {
  // Step 1: Run seed to populate database
  console.log('🌱 Running seed script first...');
  await seed();

  // Step 2: Upload target images to Cloudinary
  console.log('📤 Uploading target images to Cloudinary...');
  const app = await NestFactory.createApplicationContext(AppModule);
  try {
    const visualService = app.get(VisualRegressionService);
    await visualService.uploadTargetUrls();
    console.log('✅ Successfully generated target URLs');
    console.log('\n✨ All tasks completed successfully!');
  } catch (error: any) {
    console.error('[Error]', error.message);
    console.warn(
      '⚠️  Target image upload failed, but database seeding completed successfully.',
    );
    console.warn(
      '⚠️  This is usually due to Puppeteer/Chrome not being installed or configured.',
    );
    console.warn(
      '⚠️  You can run target image upload separately later when Puppeteer is available.',
    );
  } finally {
    await app.close();
  }
  process.exit(0);
}

void bootstrap();
