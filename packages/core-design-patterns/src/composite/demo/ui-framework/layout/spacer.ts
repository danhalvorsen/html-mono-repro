import { Leaf } from '../core/leaf.js';

export class SpacerUI extends Leaf {
  constructor(public size: number = 8) {
    super('Spacer');
  }

  createElement(): HTMLElement {
    const el = document.createElement('ui-spacer');
    el.setAttribute('size', String(this.size));
    return el;
  }
}
