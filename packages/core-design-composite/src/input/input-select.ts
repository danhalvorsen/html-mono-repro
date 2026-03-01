import { Composite } from '../core/composite.js';

export class InputSelectUI extends Composite {
  constructor(public options: string[]) {
    super('InputSelect');
  }

  protected createHostElement(): HTMLElement {
    const el = document.createElement('ui-input-select') as any;
    el.options = this.options;
    return el;
  }
}
