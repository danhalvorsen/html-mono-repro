import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import type { Component } from './component.js';

export abstract class UIElement<T extends Component = Component> extends LitElement {
  @property({ attribute: false })
  model!: T;

  protected renderChildren() {
    return this.model.children.map(child => {
      const el = child.createElement();
      (el as any).model = child;
      return el;
    });
  }
}
