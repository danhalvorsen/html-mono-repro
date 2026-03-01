import { Composite } from '../core/composite.js';

export class RowUI extends Composite {
  createElement(): HTMLElement {
    return document.createElement('ui-row');
  }
}
