// eslint-disable-next-line @typescript-eslint/naming-convention
export class JSDOM {
  window: any;

  constructor() {
    this.window = <any>{
      document: {
        querySelector: () => null,
        querySelectorAll: () => [],
        createElement: () => ({ style: {}, appendChild: () => {} }),
        body: { appendChild: () => {} },
        head: { appendChild: () => {} },
        close: () => {},
      },
      close: () => {},
    };
  }
}

export const VirtualConsole = class {};
