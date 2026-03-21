import { Composite } from '../core/composite.js';

export class InputNumberUI extends Composite {
  constructor(public placeholder: string = '') {
    super('InputNumber');
  }

  protected createHostElement(): HTMLElement {
    const el = document.createElement('ui-input-number');
    el.setAttribute('placeholder', this.placeholder);
    return el;
  }
}
