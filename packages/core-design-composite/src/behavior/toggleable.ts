import { Composite } from '../core/composite.js';
import type { Component } from '../core/component.js';

export class ToggleableUI extends Composite {
  constructor(child: Component, public defaultState: boolean = false) {
    super('Toggleable', [child]);
  }

  createElement(): HTMLElement {
    const el = document.createElement('ui-toggleable') as any;
    el.state = this.defaultState; // ← correct property binding
    return el;
  }
}
