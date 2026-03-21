import { Composite } from '../core/composite.js';

export class BoxUI extends Composite {
  protected createHostElement(): HTMLElement {
    return document.createElement('ui-box');
  }
}
