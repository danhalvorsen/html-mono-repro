import { Composite } from '../core/composite.js';
import type { Component } from '../core/component.js';

export class ValidatableUI extends Composite {
    constructor(child: Component) { super('Validatable', [child]); }
    createElement(): HTMLElement { return document.createElement('ui-validatable'); }
}
