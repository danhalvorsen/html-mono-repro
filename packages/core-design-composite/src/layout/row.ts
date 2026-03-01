import { Composite } from '../core/composite.js';

export class RowUI extends Composite {
  protected createHostElement(): HTMLElement {
    return document.createElement('ui-row');
  }
}
