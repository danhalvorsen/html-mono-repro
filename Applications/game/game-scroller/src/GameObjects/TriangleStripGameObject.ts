import type { ProgressiveTriangleStripResult } from '@monorepo/game-feature-cave';
import {
  css,
  html,
  type CSSResultGroup,
  type PropertyValues,
  type TemplateResult,
} from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { BaseGameObject } from './BaseGameObject.js';
import { TriangleStripGameObjectShapeTemplate } from './TriangleStripGameObjectShapeTemplate.js';

@customElement('triangle-strip-game-object')
export class TriangleStripGameObject extends BaseGameObject {
  public static override styles: CSSResultGroup = [
    BaseGameObject.styles ?? [],
    css`
      :host {
        position: absolute;
        inset: 0;
        display: block;
        pointer-events: none;
      }
    `,
  ];

  @property({ attribute: false })
  public triangleStrip: ProgressiveTriangleStripResult | null = null;

  @property({ type: Number })
  public worldWidth = 500;

  @property({ type: Number })
  public worldHeight = 300;

  @property({ type: Boolean, reflect: true })
  public visible = true;

  protected override willUpdate(changed: PropertyValues<this>): void {
    super.willUpdate(changed);

    if (
      changed.has('triangleStrip') ||
      changed.has('worldWidth') ||
      changed.has('worldHeight')
    ) {
      this.rebuildShapeTemplate();
    }
  }

  protected override render(): TemplateResult {
    if (!this.visible || this.triangleStrip === null) {
      return html``;
    }

    return super.render();
  }

  private rebuildShapeTemplate(): void {
    if (this.triangleStrip === null) {
      return;
    }

    this.shapeTemplate = new TriangleStripGameObjectShapeTemplate({
      triangleStrip: this.triangleStrip,
      width: this.worldWidth,
      height: this.worldHeight,
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'triangle-strip-game-object': TriangleStripGameObject;
  }
}
