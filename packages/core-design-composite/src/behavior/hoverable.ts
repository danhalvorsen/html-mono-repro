import { Composite } from '../core/composite.js';
import type { Component } from '../core/component.js';

export class HoverableUI extends Composite {
    constructor(child: Component) { super('Hoverable', [child]); }
    protected createHostElement(): HTMLElement { return document.createElement('ui-hoverable'); }
}
