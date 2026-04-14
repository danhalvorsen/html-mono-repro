import { ArrowBuilder } from "../builders/arrow-builder.js";
import { LineBuilder } from "../builders/line-builder.js";
import { CORE_PLOT_THEME } from "../styles/core-plot-style-system.js";
import { TickSvg } from "../svg/tick-svg.js";
import type { SvgArrow } from "../svg/svg-arrow.js";
import type { SvgLine } from "../svg/svg-line.js";

export interface AxisVisual {
  readonly line: SvgLine;
  readonly arrows: readonly SvgArrow[];
  readonly ticks: readonly TickSvg[];
}

export interface AxisVisualInput {
  readonly orientation: "horizontal" | "vertical";
  readonly startX: number;
  readonly startY: number;
  readonly endX: number;
  readonly endY: number;
  readonly zeroX: number;
  readonly zeroY: number;
  readonly tickValues: readonly number[];
  readonly rangeMin: number;
  readonly rangeMax: number;
  readonly highlighted: boolean;
}

export class AxisVisualFactory {
  public create(input: AxisVisualInput): AxisVisual {
    const axisStyle = Object.freeze({
      stroke: input.highlighted
        ? CORE_PLOT_THEME.colors.routeActive
        : CORE_PLOT_THEME.colors.textPrimary,
      strokeWidth: input.highlighted ? 3 : 2,
      state: input.highlighted ? ("highlighted" as const) : ("normal" as const),
    });

    const line = new LineBuilder()
      .withPoints(input.startX, input.startY, input.endX, input.endY)
      .withStyle(axisStyle)
      .build();

    const arrows = input.orientation === "horizontal"
      ? [
          new ArrowBuilder()
            .withPoints(
              input.startX,
              input.startY,
              input.startX + 12,
              input.startY - 7,
              input.startX + 12,
              input.startY + 7,
            )
            .withStyle(axisStyle)
            .build(),
          new ArrowBuilder()
            .withPoints(
              input.endX,
              input.endY,
              input.endX - 12,
              input.endY - 7,
              input.endX - 12,
              input.endY + 7,
            )
            .withStyle(axisStyle)
            .build(),
        ]
      : [
          new ArrowBuilder()
            .withPoints(
              input.startX,
              input.startY,
              input.startX - 7,
              input.startY + 12,
              input.startX + 7,
              input.startY + 12,
            )
            .withStyle(axisStyle)
            .build(),
          new ArrowBuilder()
            .withPoints(
              input.endX,
              input.endY,
              input.endX - 7,
              input.endY - 12,
              input.endX + 7,
              input.endY - 12,
            )
            .withStyle(axisStyle)
            .build(),
        ];

    const ticks = input.tickValues.map((value) => {
      if (input.orientation === "horizontal") {
        const x =
          input.startX +
          ((value - input.rangeMin) / (input.rangeMax - input.rangeMin)) * (input.endX - input.startX);
        const tickLine = new LineBuilder()
          .withPoints(x, input.zeroY - 7, x, input.zeroY + 7)
          .withStyle({
            stroke: value === 0 && input.highlighted
              ? CORE_PLOT_THEME.colors.routeActive
              : CORE_PLOT_THEME.colors.textSecondary,
            strokeWidth: value === 0 && input.highlighted ? 1.8 : 1.2,
            state: value === 0 ? "highlighted" : "normal",
          })
          .build();
        return new TickSvg(
          tickLine,
          x,
          input.zeroY + 24,
          String(value),
          "middle",
          value === 0 && input.highlighted
            ? CORE_PLOT_THEME.colors.routeActive
            : CORE_PLOT_THEME.colors.textSecondary,
          CORE_PLOT_THEME.typography.fontFamily.ui,
        );
      }

      const y =
        input.endY -
        ((value - input.rangeMin) / (input.rangeMax - input.rangeMin)) * (input.endY - input.startY);
      const tickLine = new LineBuilder()
        .withPoints(input.zeroX - 7, y, input.zeroX + 7, y)
        .withStyle({
          stroke: value === 0 && input.highlighted
            ? CORE_PLOT_THEME.colors.routeActive
            : CORE_PLOT_THEME.colors.textSecondary,
          strokeWidth: value === 0 && input.highlighted ? 1.8 : 1.2,
          state: value === 0 ? "highlighted" : "normal",
        })
        .build();
      return new TickSvg(
        tickLine,
        input.zeroX - 14,
        y + 4,
        String(value),
        "end",
        value === 0 && input.highlighted
          ? CORE_PLOT_THEME.colors.routeActive
          : CORE_PLOT_THEME.colors.textSecondary,
        CORE_PLOT_THEME.typography.fontFamily.ui,
      );
    });

    return {
      line,
      arrows,
      ticks,
    };
  }
}
