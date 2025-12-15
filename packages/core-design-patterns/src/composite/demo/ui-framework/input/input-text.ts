import { Composite } from '../core/composite.js';

export class InputTextUI extends Composite {
  constructor(public placeholder: string = '') {
    super('InputText');
  }

  createElement(): HTMLElement {
    const el = document.createElement('ui-input-text');
    el.setAttribute('placeholder', this.placeholder);
    return el;
  }
}
