import { Composite } from '../core/composite.js';

export class StackUI extends Composite {
  protected createHostElement(): HTMLElement {
    return document.createElement('ui-stack');
  }
}
