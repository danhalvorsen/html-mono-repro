import { Composite } from '../core/composite.js';
import type { Component } from '../core/component.js';

export class FocusableUI extends Composite {
    constructor(child: Component) { super('Focusable', [child]); }
    createElement(): HTMLElement { return document.createElement('ui-focusable'); }
}
