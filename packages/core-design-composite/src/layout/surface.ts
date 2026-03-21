import { Composite } from '../core/composite.js';

export class SurfaceUI extends Composite {
  protected createHostElement(): HTMLElement {
    return document.createElement('ui-surface');
  }
}
