import { Injectable } from '@nestjs/common';
import { JSDOM } from 'jsdom';

@Injectable()
export class SandBox {
  createSandBox(html: string, css: string, javascript: string): string {
    try {
      const HTML = new JSDOM(html?.trim(), {
        runScripts: 'dangerously',
        url: 'https://example.com',
      });
      const { document } = HTML.window;

      if (css || css.trim() !== '') {
        const style = document.createElement('style');
        style.innerHTML = css?.trim();
        document.head.appendChild(style);
      }
      if (javascript || javascript.trim() !== '') {
        const js = document.createElement('script');
        js.innerHTML = javascript?.trim();
        document.body.appendChild(js);
      }
      return HTML.serialize();
    } catch (error) {
      console.error('Lỗi tạo sandbox:', error);
      throw new Error('Lỗi sandbox');
    }
  }
}
