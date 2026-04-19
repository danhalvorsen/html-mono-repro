import { nothing, svg, type TemplateResult } from "lit";
import {
  formatSvgMatrix,
  isIdentityMatrix3x3,
  type Matrix3x3,
} from "../domain/matrix3x3.js";
import {
  SvgNodeKind,
  type SvgCircleNode,
  type SvgGroupNode,
  type SvgNode,
  type SvgNodeRenderer,
  type SvgPolygonNode,
  type SvgRectNode,
  type SvgRootNode,
  type SvgStrokeFillStyle,
  type SvgTextNode,
} from "../domain/svg-node.js";

export class LitSvgNodeRenderer implements SvgNodeRenderer<SvgNode, TemplateResult> {
  public render(node: SvgNode): TemplateResult {
    switch (node.kind) {
      case SvgNodeKind.Svg:
        return this.renderSvg(node);
      case SvgNodeKind.Group:
        return this.renderGroup(node);
      case SvgNodeKind.Rect:
        return this.renderRect(node);
      case SvgNodeKind.Circle:
        return this.renderCircle(node);
      case SvgNodeKind.Polygon:
        return this.renderPolygon(node);
      case SvgNodeKind.Text:
        return this.renderText(node);
    }
  }

  private renderSvg(node: SvgRootNode): TemplateResult {
    return svg`
      <svg
        viewBox="0 0 ${node.viewport.width} ${node.viewport.height}"
        width=${node.viewport.width}
        height=${node.viewport.height}
        role=${node.viewport.role ?? nothing}
        aria-hidden=${node.viewport.ariaHidden ?? nothing}
        transform=${this.transform(node.transform)}
      >
        ${node.children.map((child) => this.render(child))}
      </svg>
    `;
  }

  private renderGroup(node: SvgGroupNode): TemplateResult {
    return svg`
      <g transform=${this.transform(node.transform)}>
        ${node.children.map((child) => this.render(child))}
      </g>
    `;
  }

  private renderRect(node: SvgRectNode): TemplateResult {
    return svg`
      <rect
        x=${node.x}
        y=${node.y}
        width=${node.width}
        height=${node.height}
        fill=${this.styleFill(node.style)}
        stroke=${this.styleStroke(node.style)}
        stroke-width=${this.styleStrokeWidth(node.style)}
        stroke-dasharray=${this.styleStrokeDasharray(node.style)}
        opacity=${this.styleOpacity(node.style)}
        rx=${node.rx ?? nothing}
        ry=${node.ry ?? nothing}
        transform=${this.transform(node.transform)}
      ></rect>
    `;
  }

  private renderCircle(node: SvgCircleNode): TemplateResult {
    return svg`
      <circle
        cx=${node.cx}
        cy=${node.cy}
        r=${node.radius}
        fill=${this.styleFill(node.style)}
        stroke=${this.styleStroke(node.style)}
        stroke-width=${this.styleStrokeWidth(node.style)}
        stroke-dasharray=${this.styleStrokeDasharray(node.style)}
        opacity=${this.styleOpacity(node.style)}
        transform=${this.transform(node.transform)}
      ></circle>
    `;
  }

  private renderPolygon(node: SvgPolygonNode): TemplateResult {
    return svg`
      <polygon
        points=${node.points}
        fill=${this.styleFill(node.style)}
        stroke=${this.styleStroke(node.style)}
        stroke-width=${this.styleStrokeWidth(node.style)}
        stroke-dasharray=${this.styleStrokeDasharray(node.style)}
        opacity=${this.styleOpacity(node.style)}
        transform=${this.transform(node.transform)}
      ></polygon>
    `;
  }

  private renderText(node: SvgTextNode): TemplateResult {
    return svg`
      <text
        x=${node.x}
        y=${node.y}
        fill=${this.styleFill(node.style)}
        opacity=${this.styleOpacity(node.style)}
        font-size=${node.fontSize}
        text-anchor=${node.textAnchor}
        dominant-baseline=${node.baseline}
        transform=${this.transform(node.transform)}
      >
        ${node.value}
      </text>
    `;
  }

  private styleFill(style: SvgStrokeFillStyle | undefined): string | typeof nothing {
    return style?.fill ?? nothing;
  }

  private styleStroke(style: SvgStrokeFillStyle | undefined): string | typeof nothing {
    return style?.stroke ?? nothing;
  }

  private styleStrokeWidth(
    style: SvgStrokeFillStyle | undefined,
  ): number | typeof nothing {
    return style?.strokeWidth ?? nothing;
  }

  private styleStrokeDasharray(
    style: SvgStrokeFillStyle | undefined,
  ): string | typeof nothing {
    return style?.strokeDasharray ?? nothing;
  }

  private styleOpacity(
    style: SvgStrokeFillStyle | undefined,
  ): number | typeof nothing {
    return style?.opacity ?? nothing;
  }

  private transform(matrix: Matrix3x3): string | typeof nothing {
    return isIdentityMatrix3x3(matrix) ? nothing : formatSvgMatrix(matrix);
  }
}

export const litSvgNodeRenderer = new LitSvgNodeRenderer();
