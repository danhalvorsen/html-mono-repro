import { Leaf } from '../core/leaf.js';

export class InputTextUI extends Leaf {
  constructor(public placeholder: string = '') {
    super('InputText');
  }

  createElement(): HTMLElement {
    const el = document.createElement('ui-input-text');
    el.setAttribute('placeholder', this.placeholder);
    return el;
  }
}
