import type { ReactiveController, ReactiveControllerHost, TemplateResult } from "lit";
import { svg } from "lit";
import { CORE_PLOT_THEME } from "../styles/core-plot-style-system.js";

export interface GridLineModel {
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
  readonly emphasis?: boolean;
}

export class GridController implements ReactiveController {
  private readonly host: ReactiveControllerHost;
  private spacing = 32;

  public constructor(host: ReactiveControllerHost) {
    this.host = host;
    this.host.addController(this);
  }

  public hostConnected(): void {}

  public hostDisconnected(): void {}

  public setSpacing(spacing: number): void {
    this.spacing = spacing;
    this.host.requestUpdate();
  }

  public render(width: number, height: number): TemplateResult {
    const lines: TemplateResult[] = [];

    for (let x = 0; x <= width; x += this.spacing) {
      lines.push(svg`<line x1=${x} y1="0" x2=${x} y2=${height}></line>`);
    }

    for (let y = 0; y <= height; y += this.spacing) {
      lines.push(svg`<line x1="0" y1=${y} x2=${width} y2=${y}></line>`);
    }

    return svg`<g data-role="grid">${lines}</g>`;
  }

  public renderLines(lines: readonly GridLineModel[]): TemplateResult {
    return svg`
      <g data-role="grid">
        ${lines.map(
          (line) => svg`
            <line
              x1=${line.x1}
              y1=${line.y1}
              x2=${line.x2}
              y2=${line.y2}
              stroke=${line.emphasis === true ? CORE_PLOT_THEME.colors.gridEmphasis : CORE_PLOT_THEME.colors.grid}
              stroke-width=${line.emphasis === true
                ? CORE_PLOT_THEME.metrics.gridEmphasisStrokeWidth
                : CORE_PLOT_THEME.metrics.gridStrokeWidth}
            ></line>
          `,
        )}
      </g>
    `;
  }
}
