import { Composite } from '../core/composite.js';

export class BoxUI extends Composite {
  createElement(): HTMLElement {
    return document.createElement('ui-box');
  }
}
