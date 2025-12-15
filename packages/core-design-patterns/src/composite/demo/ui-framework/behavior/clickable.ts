import { Composite } from '../core/composite.js';
import type { Component } from '../core/component.js';

export class ClickableUI extends Composite {
    constructor(child: Component) { super('Clickable', [child]); }
    createElement(): HTMLElement { return document.createElement('ui-clickable'); }
}
