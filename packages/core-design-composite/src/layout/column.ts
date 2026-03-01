import { Composite } from '../core/composite.js';

export class ColumnUI extends Composite {
  protected createHostElement(): HTMLElement {
    return document.createElement('ui-column');
  }
}
