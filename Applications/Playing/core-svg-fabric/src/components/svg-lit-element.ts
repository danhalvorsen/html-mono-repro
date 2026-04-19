import { css, LitElement, type CSSResultGroup, type TemplateResult } from "lit";
import type { SvgNode, SvgNodeRenderer } from "../domain/svg-node.js";
import { litSvgNodeRenderer } from "../renderers/lit-svg-node-renderer.js";

/**
 * Lit adapter for the core SVG node model.
 *
 * Subclasses own node composition only. Rendering stays open for extension
 * through SvgNodeRenderer, so the same node tree can target Lit or another
 * renderer without changing product components.
 */
export abstract class SvgLitElement<TNode extends SvgNode = SvgNode> extends LitElement {
  public static override styles: CSSResultGroup = css`
    :host {
      display: inline-block;
      line-height: 0;
    }

    svg {
      display: block;
      overflow: visible;
    }
  `;

  protected readonly svgRenderer: SvgNodeRenderer<TNode, TemplateResult>;

  public constructor(
    svgRenderer: SvgNodeRenderer<TNode, TemplateResult> = litSvgNodeRenderer as SvgNodeRenderer<
      TNode,
      TemplateResult
    >,
  ) {
    super();
    this.svgRenderer = svgRenderer;
  }

  public abstract renderNode(): TNode;

  public override render(): TemplateResult {
    return this.svgRenderer.render(this.renderNode());
  }
}
