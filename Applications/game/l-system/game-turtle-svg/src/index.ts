import type {
  CirclePrimitive,
  LinePrimitive,
  PolygonPrimitive,
  PolylinePrimitive,
  StrokeStyle,
  TurtlePrimitive,
  Vector3,
} from "@monorepo/game-turtle-abstract";

export type SvgRenderOptions = {
  readonly width: number;
  readonly height: number;
  readonly viewBox?: string;
};

export interface ISvgMapperPipeline {
  mapPrimitive<TPrimitive extends TurtlePrimitive>(primitive: TPrimitive): TPrimitive;
}

export interface ISvgPrimitiveAdapter<
  TPrimitive extends TurtlePrimitive = TurtlePrimitive,
> {
  canRender(primitive: TurtlePrimitive): primitive is TPrimitive;
  render(primitive: TPrimitive): string;
}

export interface ISvgPrimitiveAdapterRegistry {
  resolve(primitive: TurtlePrimitive): ISvgPrimitiveAdapter<TurtlePrimitive>;
}

export class MissingAdapterError extends Error {
  public static readonly code = "MISSING_ADAPTER";

  public readonly code = MissingAdapterError.code;

  public constructor(primitiveKind: string) {
    super(`No SVG primitive adapter registered for primitive kind '${primitiveKind}'.`);
    this.name = "MissingAdapterError";
  }
}

export class SvgAttributeEscaper {
  public escape(value: string): string {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll('"', "&quot;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }
}

export class DefaultSvgPrimitiveAdapterRegistry
  implements ISvgPrimitiveAdapterRegistry
{
  public constructor(
    private readonly adapters: readonly ISvgPrimitiveAdapter[],
  ) {}

  public resolve(primitive: TurtlePrimitive): ISvgPrimitiveAdapter<TurtlePrimitive> {
    const adapter = this.adapters.find((candidate) => candidate.canRender(primitive));

    if (adapter === undefined) {
      throw new MissingAdapterError(primitive.kind);
    }

    return adapter;
  }
}

export class SvgLinePrimitiveAdapter implements ISvgPrimitiveAdapter<LinePrimitive> {
  private readonly escaper: SvgAttributeEscaper;

  public constructor(escaper: SvgAttributeEscaper = new SvgAttributeEscaper()) {
    this.escaper = escaper;
  }

  public canRender(primitive: TurtlePrimitive): primitive is LinePrimitive {
    return primitive.kind === "line";
  }

  public render(primitive: LinePrimitive): string {
    return createElement("line", [
      ["x1", formatNumber(primitive.from.x)],
      ["y1", formatNumber(primitive.from.y)],
      ["x2", formatNumber(primitive.to.x)],
      ["y2", formatNumber(primitive.to.y)],
      ["stroke", primitive.stroke.color],
      ["stroke-width", formatNumber(primitive.stroke.width)],
      ["fill", "none"],
      ...createMetadataAttributes(primitive.metadata?.id, this.escaper),
    ], this.escaper);
  }
}

export class SvgPolylinePrimitiveAdapter
  implements ISvgPrimitiveAdapter<PolylinePrimitive>
{
  private readonly escaper: SvgAttributeEscaper;

  public constructor(escaper: SvgAttributeEscaper = new SvgAttributeEscaper()) {
    this.escaper = escaper;
  }

  public canRender(primitive: TurtlePrimitive): primitive is PolylinePrimitive {
    return primitive.kind === "polyline";
  }

  public render(primitive: PolylinePrimitive): string {
    return createElement("polyline", [
      ["points", formatPoints(primitive.points)],
      ["stroke", primitive.stroke.color],
      ["stroke-width", formatNumber(primitive.stroke.width)],
      ["fill", "none"],
      ...createMetadataAttributes(primitive.metadata?.id, this.escaper),
    ], this.escaper);
  }
}

export class SvgCirclePrimitiveAdapter
  implements ISvgPrimitiveAdapter<CirclePrimitive>
{
  private readonly escaper: SvgAttributeEscaper;

  public constructor(escaper: SvgAttributeEscaper = new SvgAttributeEscaper()) {
    this.escaper = escaper;
  }

  public canRender(primitive: TurtlePrimitive): primitive is CirclePrimitive {
    return primitive.kind === "circle";
  }

  public render(primitive: CirclePrimitive): string {
    return createElement("circle", [
      ["cx", formatNumber(primitive.center.x)],
      ["cy", formatNumber(primitive.center.y)],
      ["r", formatNumber(primitive.radius)],
      ...createOptionalStrokeAttributes(primitive.stroke),
      ["fill", primitive.fill?.color ?? "none"],
      ...createMetadataAttributes(primitive.metadata?.id, this.escaper),
    ], this.escaper);
  }
}

export class SvgPolygonPrimitiveAdapter
  implements ISvgPrimitiveAdapter<PolygonPrimitive>
{
  private readonly escaper: SvgAttributeEscaper;

  public constructor(escaper: SvgAttributeEscaper = new SvgAttributeEscaper()) {
    this.escaper = escaper;
  }

  public canRender(primitive: TurtlePrimitive): primitive is PolygonPrimitive {
    return primitive.kind === "polygon";
  }

  public render(primitive: PolygonPrimitive): string {
    return createElement("polygon", [
      ["points", formatPoints(primitive.points)],
      ...createOptionalStrokeAttributes(primitive.stroke),
      ["fill", primitive.fill?.color ?? "none"],
      ...createMetadataAttributes(primitive.metadata?.id, this.escaper),
    ], this.escaper);
  }
}

export type DefaultSvgTurtleRendererOptions = {
  readonly adapterRegistry: ISvgPrimitiveAdapterRegistry;
  readonly mapperPipeline: ISvgMapperPipeline;
};

export class DefaultSvgTurtleRenderer {
  private readonly adapterRegistry: ISvgPrimitiveAdapterRegistry;
  private readonly mapperPipeline: ISvgMapperPipeline;
  private readonly escaper: SvgAttributeEscaper;

  public constructor(options: DefaultSvgTurtleRendererOptions) {
    this.adapterRegistry = options.adapterRegistry;
    this.mapperPipeline = options.mapperPipeline;
    this.escaper = new SvgAttributeEscaper();
  }

  public render(
    primitives: readonly TurtlePrimitive[],
    renderOptions: SvgRenderOptions,
  ): string {
    const viewBox = renderOptions.viewBox
      ?? `0 0 ${formatNumber(renderOptions.width)} ${formatNumber(renderOptions.height)}`;

    const body = primitives
      .map((primitive) => this.renderPrimitive(primitive))
      .join("\n  ");

    const opening = createElementStart("svg", [
      ["xmlns", "http://www.w3.org/2000/svg"],
      ["width", formatNumber(renderOptions.width)],
      ["height", formatNumber(renderOptions.height)],
      ["viewBox", viewBox],
    ], this.escaper);

    if (body.length === 0) {
      return `${opening}></svg>`;
    }

    return `${opening}>\n  ${body}\n</svg>`;
  }

  private renderPrimitive(primitive: TurtlePrimitive): string {
    const mappedPrimitive = this.mapperPipeline.mapPrimitive(primitive);
    const adapter = this.adapterRegistry.resolve(mappedPrimitive);

    return adapter.render(mappedPrimitive);
  }
}

function createElement(
  name: string,
  attributes: readonly (readonly [string, string])[],
  escaper: SvgAttributeEscaper,
): string {
  return `${createElementStart(name, attributes, escaper)} />`;
}

function createElementStart(
  name: string,
  attributes: readonly (readonly [string, string])[],
  escaper: SvgAttributeEscaper,
): string {
  const renderedAttributes = attributes
    .map(([key, value]) => `${key}="${escaper.escape(value)}"`)
    .join(" ");

  return `<${name}${renderedAttributes.length === 0 ? "" : ` ${renderedAttributes}`}`;
}

function createOptionalStrokeAttributes(
  stroke: StrokeStyle | undefined,
): readonly (readonly [string, string])[] {
  if (stroke === undefined) {
    return [];
  }

  return [
    ["stroke", stroke.color],
    ["stroke-width", formatNumber(stroke.width)],
  ];
}

function createMetadataAttributes(
  primitiveId: string | undefined,
  _escaper: SvgAttributeEscaper,
): readonly (readonly [string, string])[] {
  if (primitiveId === undefined) {
    return [];
  }

  return [["data-primitive-id", primitiveId]];
}

function formatPoints(points: readonly Vector3[]): string {
  return points
    .map((point) => `${formatNumber(point.x)},${formatNumber(point.y)}`)
    .join(" ");
}

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) {
    throw new Error(`Cannot format non-finite SVG number '${value}'.`);
  }

  const normalized = Object.is(value, -0) || Math.abs(value) < 1e-12 ? 0 : value;

  if (Number.isInteger(normalized)) {
    return normalized.toString();
  }

  return normalized
    .toFixed(12)
    .replace(/0+$/u, "")
    .replace(/\.$/u, "");
}