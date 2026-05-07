import type {
  SvgElement,
  SvgShape,
  SvgShapeConnection
} from "../domain/SvgShape.js";
import type { ISvgFileSerializer } from "../ports/ISvgFileSerializer.js";
import { XmlEscaper } from "./XmlEscaper.js";

const SvgNamespace = "http://www.w3.org/2000/svg";
const BackgroundLayerName = "background";
const ForegroundLayerName = "foreground";

export class SvgFileSerializer implements ISvgFileSerializer {
  public constructor(private readonly escaper: XmlEscaper) {}

  public serialize(shape: SvgShape): string {
    const lines: string[] = [
      `<?xml version="1.0" encoding="UTF-8"?>`,
      `<svg xmlns="${SvgNamespace}" viewBox="0 0 ${shape.width} ${shape.height}" width="${shape.width}" height="${shape.height}" data-root-name="${this.escaper.attribute(shape.rootName)}" data-shape-name="${this.escaper.attribute(shape.name)}" data-aspect="${this.escaper.attribute(shape.aspect)}" data-strokewidth="${this.escaper.attribute(shape.strokeWidth)}">`,
      `  <title>${this.escaper.text(shape.name)}</title>`,
      `  <metadata>`,
      `    <mxgraph-shape root-name="${this.escaper.attribute(shape.rootName)}" name="${this.escaper.attribute(shape.name)}" w="${shape.width}" h="${shape.height}" aspect="${this.escaper.attribute(shape.aspect)}" strokewidth="${this.escaper.attribute(shape.strokeWidth)}">`,
      ...this.serializeConnections(shape.connections),
      `    </mxgraph-shape>`,
      `  </metadata>`,
      `  <g data-layer="${BackgroundLayerName}">`,
      ...shape.background.flatMap((element) => this.serializeElement(element, 4)),
      `  </g>`,
      `  <g data-layer="${ForegroundLayerName}">`,
      ...shape.foreground.flatMap((element) => this.serializeElement(element, 4)),
      `  </g>`,
      `</svg>`
    ];

    return `${lines.join("\n")}\n`;
  }

  private serializeConnections(
    connections: readonly SvgShapeConnection[]
  ): readonly string[] {
    if (connections.length === 0) {
      return [];
    }

    return [
      `      <connections>`,
      ...connections.map(
        (connection) =>
          `        <constraint name="${this.escaper.attribute(connection.name)}" perimeter="${this.escaper.attribute(connection.perimeter)}" x="${connection.x}" y="${connection.y}" />`
      ),
      `      </connections>`
    ];
  }

  private serializeElement(
    element: SvgElement,
    indent: number
  ): readonly string[] {
    const pad = " ".repeat(indent);
    const lineJoin = this.optionalAttribute(
      "stroke-linejoin",
      element.strokeLineJoin
    );

    switch (element.kind) {
      case "path":
        return [
          `${pad}<path d="${this.escaper.attribute(element.d)}" fill="${this.escaper.attribute(element.fill)}" stroke="${this.escaper.attribute(element.stroke)}" stroke-width="${this.escaper.attribute(element.strokeWidth)}"${lineJoin} />`
        ];

      case "ellipse":
        return [
          `${pad}<ellipse cx="${element.cx}" cy="${element.cy}" rx="${element.rx}" ry="${element.ry}" fill="${this.escaper.attribute(element.fill)}" stroke="${this.escaper.attribute(element.stroke)}" stroke-width="${this.escaper.attribute(element.strokeWidth)}"${lineJoin} />`
        ];
    }
  }

  private optionalAttribute(name: string, value: string | undefined): string {
    return value === undefined
      ? ""
      : ` ${name}="${this.escaper.attribute(value)}"`;
  }
}