import { Composite } from '../core/composite.js';

export class StackUI extends Composite {
  createElement(): HTMLElement {
    return document.createElement('ui-stack');
  }
}
