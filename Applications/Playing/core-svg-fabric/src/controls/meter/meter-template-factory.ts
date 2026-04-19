import { html, type TemplateResult } from "lit";
import type { MeterModel } from "../../domain/meter-model.js";
import { Range } from "../../domain/range.js";
import type { SvgNode } from "../../domain/svg-node.js";
import type { ValueActionHandler } from "../../application/value-actions.js";
import { SvgShapeTemplateFactory } from "../../factories/svg-shape-template-factory.js";
import { litSvgNodeRenderer } from "../../renderers/lit-svg-node-renderer.js";

export interface MeterActions {
  readonly onWheel: ValueActionHandler<WheelEvent>;
}

export class MeterTemplateFactory {
  // Reuse handlers per model/actions pair so Lit does not receive a new listener each render.
  private readonly wheelHandlers = new WeakMap<
    MeterModel,
    WeakMap<MeterActions, (event: WheelEvent) => void>
  >();

  constructor(private readonly shapes: SvgShapeTemplateFactory) {}

  create(model: MeterModel, actions: MeterActions): TemplateResult {
    const { geometry } = model;
    const meter = this.createNode(model);

    // The meter model's geometry is already expressed in SVG coordinates.
    return html`
      <svg
        viewBox="0 0 ${geometry.width} ${geometry.height}"
        @wheel=${this.getWheelHandler(model, actions)}
      >
        ${litSvgNodeRenderer.render(meter)}
      </svg>
    `;
  }

  createNode(model: MeterModel): SvgNode {
    const { geometry, style, value } = model;
    const normalizedValue = new Range(value.min, value.max).normalize(value.value);
    const levelHeight = geometry.height * normalizedValue;
    const levelY = geometry.y + (geometry.height - levelHeight);

    return this.shapes
      .group()
      .children(
        this.shapes
          .rect()
          .x(geometry.x)
          .y(geometry.y)
          .width(geometry.width)
          .height(geometry.height)
          .fill(style.trackFill)
          .stroke(style.trackStroke)
          .strokeWidth(2)
          .buildNode(),
        this.shapes
          .rect()
          .x(geometry.x + 3)
          .y(levelY + 3)
          .width(Math.max(0, geometry.width - 6))
          .height(Math.max(0, levelHeight - 6))
          .fill(style.levelFill)
          .buildNode(),
      )
      .buildNode();
  }

  private getWheelHandler(
    model: MeterModel,
    actions: MeterActions,
  ): (event: WheelEvent) => void {
    let actionHandlers = this.wheelHandlers.get(model);

    if (actionHandlers === undefined) {
      actionHandlers = new WeakMap<MeterActions, (event: WheelEvent) => void>();
      this.wheelHandlers.set(model, actionHandlers);
    }

    const existing = actionHandlers.get(actions);

    if (existing !== undefined) {
      return existing;
    }

    const handler = (event: WheelEvent): void => {
      event.preventDefault();
      actions.onWheel({
        id: model.id,
        event,
        value: model.value.value,
      });
    };

    actionHandlers.set(actions, handler);
    return handler;
  }
}
