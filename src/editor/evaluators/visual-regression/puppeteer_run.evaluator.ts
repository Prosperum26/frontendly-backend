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
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });
    this.logger.log('Puppeteer browser launched');
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
