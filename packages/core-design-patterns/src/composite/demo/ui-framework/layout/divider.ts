import { Leaf } from '../core/leaf.js';

export class DividerUI extends Leaf {
  constructor(public direction: 'horizontal' | 'vertical' = 'horizontal') {
    super('Divider');
  }

  createElement(): HTMLElement {
    const el = document.createElement('ui-divider');
    el.setAttribute('direction', this.direction);
    return el;
  }
}
