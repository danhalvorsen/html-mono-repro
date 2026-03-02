import { Composite } from '../core/composite.js';

export class RectangleUI extends Composite {
  protected createHostElement(): HTMLElement {
    return document.createElement('ui-rectangle');
  }
}
