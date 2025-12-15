import { Composite } from '../core/composite.js';

export class ColumnUI extends Composite {
  createElement(): HTMLElement {
    return document.createElement('ui-column');
  }
}
