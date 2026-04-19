import type { MeterModel } from "../../src/domain/meter-model.js";
import {
  createSvgNodeDefaults,
  SvgNodeKind,
  type SvgGroupNode,
  type SvgRectNode,
} from "../../src/domain/svg-node.js";
import type { SvgShapeTemplateFactory } from "../../src/factories/svg-shape-template-factory.js";

export interface RecordedRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly fill?: string;
  readonly stroke?: string;
  readonly strokeWidth?: number;
}

class RecordingRectBuilder {
  private rect: Partial<RecordedRect> = {};

  constructor(private readonly rectangles: RecordedRect[]) {}

  x(value: number): this {
    this.rect.x = value;
    return this;
  }

  y(value: number): this {
    this.rect.y = value;
    return this;
  }

  width(value: number): this {
    this.rect.width = value;
    return this;
  }

  height(value: number): this {
    this.rect.height = value;
    return this;
  }

  fill(value: string): this {
    this.rect.fill = value;
    return this;
  }

  stroke(value: string): this {
    this.rect.stroke = value;
    return this;
  }

  strokeWidth(value: number): this {
    this.rect.strokeWidth = value;
    return this;
  }

  buildNode(): SvgRectNode {
    this.rectangles.push(this.rect as RecordedRect);
    const rect = this.rect as RecordedRect;

    return {
      kind: SvgNodeKind.Rect,
      ...createSvgNodeDefaults(),
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      style: {
        ...(rect.fill !== undefined ? { fill: rect.fill } : {}),
        ...(rect.stroke !== undefined ? { stroke: rect.stroke } : {}),
        ...(rect.strokeWidth !== undefined ? { strokeWidth: rect.strokeWidth } : {}),
      },
    };
  }
}

class RecordingGroupBuilder {
  private childrenValue: SvgRectNode[] = [];

  children(...values: SvgRectNode[]): this {
    this.childrenValue = values;
    return this;
  }

  buildNode(): SvgGroupNode {
    return {
      kind: SvgNodeKind.Group,
      ...createSvgNodeDefaults(),
      children: this.childrenValue,
    };
  }
}

export function createMeterModelFixture(
  overrides: Partial<MeterModel> = {},
): MeterModel {
  return {
    id: "meter-main",
    geometry: {
      x: 10,
      y: 20,
      width: 40,
      height: 100,
    },
    style: {
      trackFill: "#101820",
      trackStroke: "#304050",
      levelFill: "#40c060",
    },
    value: {
      value: 75,
      min: 0,
      max: 100,
    },
    ...overrides,
  };
}

export function createRecordingShapeFactory(): {
  readonly factory: SvgShapeTemplateFactory;
  readonly rectangles: RecordedRect[];
} {
  const rectangles: RecordedRect[] = [];
  const factory = {
    rect: () => new RecordingRectBuilder(rectangles),
    group: () => new RecordingGroupBuilder(),
  };

  return {
    factory: factory as unknown as SvgShapeTemplateFactory,
    rectangles,
  };
}
