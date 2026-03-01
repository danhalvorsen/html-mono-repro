import { Composite } from '../core/composite.js';

export class SurfaceUI extends Composite {
  createElement(): HTMLElement {
    return document.createElement('ui-surface');
  }
}
