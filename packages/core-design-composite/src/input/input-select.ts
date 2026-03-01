import { Composite } from '../core/composite.js';

export class InputSelectUI extends Composite {
  constructor(public options: string[]) {
    super('InputSelect');
  }

  createElement(): HTMLElement {
    const el = document.createElement('ui-input-select') as any;
    el.options = this.options; // ← property binding (correct for Lit)
    return el;
  }
}
