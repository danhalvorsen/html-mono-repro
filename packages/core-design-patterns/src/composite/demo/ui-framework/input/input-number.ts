import { Composite } from '../core/composite.js';
import { LitElement } from 'lit';
export class InputNumberUI extends Composite {
  constructor(public placeholder: string = '') {
    super('InputNumber');
  }

  createElement(): HTMLElement {
    const el = document.createElement('ui-input-number');
    el.setAttribute('placeholder', this.placeholder);
    return el;
  }
}
