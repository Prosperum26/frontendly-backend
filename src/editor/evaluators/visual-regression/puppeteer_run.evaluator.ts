import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import puppeteer, { Browser } from 'puppeteer';

@Injectable()
export class PuppeteerEvaluator implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PuppeteerEvaluator.name);
  private browser: Browser | null = null;

  async onModuleInit() {
    // Start trình duyệt ngầm trên server 1 lần và dùng hoài
    try {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--no-zygote',
        ],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      });
      this.logger.log('Puppeteer browser launched successfully');
    } catch (error) {
      this.logger.warn(
        'Failed to launch Puppeteer browser - visual regression testing will be disabled',
      );
      this.logger.warn(error);
      // Continue without browser - visual regression will fail gracefully
    }
  }

  async onModuleDestroy() {
    // Stop trình duyệt khi server tắt
    if (this.browser) {
      await this.browser.close();
      this.logger.log('Puppeteer browser closed');
    }
  }

  getBrowser(): Browser {
    if (!this.browser) {
      throw new Error('Puppeteer browser not initialized');
    }
    return this.browser;
  }
}
