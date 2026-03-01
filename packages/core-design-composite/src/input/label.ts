import { Leaf } from '../core/leaf.js';

export class LabelUI extends Leaf {
  constructor(text: string) {
    super(text);
  }

  createElement(): HTMLElement {
    const el = document.createElement('ui-label');
    el.textContent = this.name; // correct for <slot> content
    return el;
  }
}
