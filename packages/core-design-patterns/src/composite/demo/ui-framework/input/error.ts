import { Leaf } from '../core/leaf.js';

export class ErrorMessageUI extends Leaf {
  constructor(message: string) {
    super(message);
  }

  createElement(): HTMLElement {
    const el = document.createElement('ui-error');
    el.setAttribute('message', this.name);
    return el;
  }
}
