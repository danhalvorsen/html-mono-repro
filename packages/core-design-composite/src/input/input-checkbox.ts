import { Leaf } from '../core/leaf.js';

export class InputCheckboxUI extends Leaf {
  constructor(label: string) {
    super(label);
  }

  createElement(): HTMLElement {
    const el = document.createElement('ui-input-checkbox');
    el.setAttribute('label', this.name);
    return el;
  }
}
