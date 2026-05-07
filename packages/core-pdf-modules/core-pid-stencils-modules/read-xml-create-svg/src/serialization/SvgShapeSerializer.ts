import { SvgShapeElementName } from "../domain/SvgShapeElementName.js";
import type {
  SvgElement,
  SvgShape,
  SvgShapeConnection,
  SvgShapeDocument
} from "../domain/SvgShape.js";
import type { ISvgShapeSerializer } from "../ports/ISvgShapeSerializer.js";
import { XmlEscaper } from "./XmlEscaper.js";

export class SvgShapeSerializer implements ISvgShapeSerializer {
  public constructor(private readonly escaper: XmlEscaper) {}

  public serialize(document: SvgShapeDocument): string {
    const lines: string[] = [
      `<?xml version="1.0" encoding="UTF-8"?>`,
      `<${SvgShapeElementName.SvgShapes} name="${this.escaper.attribute(document.name)}" root-name="${this.escaper.attribute(document.rootName)}">`
    ];

    for (const shape of document.shapes) {
      lines.push(...this.serializeShape(shape));
    }

    lines.push(`</${SvgShapeElementName.SvgShapes}>`);

    return `${lines.join("\n")}\n`;
  }

  private serializeShape(shape: SvgShape): readonly string[] {
    return [
      `  <${SvgShapeElementName.SvgShape} root-name="${this.escaper.attribute(shape.rootName)}" name="${this.escaper.attribute(shape.name)}" w="${shape.width}" h="${shape.height}" aspect="${this.escaper.attribute(shape.aspect)}" strokewidth="${this.escaper.attribute(shape.strokeWidth)}">`,
      ...this.serializeConnections(shape.connections),
      `    <${SvgShapeElementName.Svg} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${shape.width} ${shape.height}" width="${shape.width}" height="${shape.height}">`,
      `      <${SvgShapeElementName.Group} data-layer="background">`,
      ...shape.background.flatMap((element) => this.serializeElement(element, 8)),
      `      </${SvgShapeElementName.Group}>`,
      `      <${SvgShapeElementName.Group} data-layer="foreground">`,
      ...shape.foreground.flatMap((element) => this.serializeElement(element, 8)),
      `      </${SvgShapeElementName.Group}>`,
      `    </${SvgShapeElementName.Svg}>`,
      `  </${SvgShapeElementName.SvgShape}>`
    ];
  }

  private serializeConnections(
    connections: readonly SvgShapeConnection[]
  ): readonly string[] {
    if (connections.length === 0) {
      return [];
    }

    return [
      `    <${SvgShapeElementName.Connections}>`,
      ...connections.map(
        (connection) =>
          `      <${SvgShapeElementName.Constraint} name="${this.escaper.attribute(connection.name)}" perimeter="${this.escaper.attribute(connection.perimeter)}" x="${connection.x}" y="${connection.y}" />`
      ),
      `    </${SvgShapeElementName.Connections}>`
    ];
  }

  private serializeElement(element: SvgElement, indent: number): readonly string[] {
    const pad = " ".repeat(indent);
    const lineJoin = this.optionalAttribute(
      "stroke-linejoin",
      element.strokeLineJoin
    );

    switch (element.kind) {
      case "path":
        return [
          `${pad}<${SvgShapeElementName.Path} d="${this.escaper.attribute(element.d)}" fill="${this.escaper.attribute(element.fill)}" stroke="${this.escaper.attribute(element.stroke)}" stroke-width="${this.escaper.attribute(element.strokeWidth)}"${lineJoin} />`
        ];

      case "ellipse":
        return [
          `${pad}<${SvgShapeElementName.Ellipse} cx="${element.cx}" cy="${element.cy}" rx="${element.rx}" ry="${element.ry}" fill="${this.escaper.attribute(element.fill)}" stroke="${this.escaper.attribute(element.stroke)}" stroke-width="${this.escaper.attribute(element.strokeWidth)}"${lineJoin} />`
        ];
    }
  }

  private optionalAttribute(name: string, value: string | undefined): string {
    return value === undefined
      ? ""
      : ` ${name}="${this.escaper.attribute(value)}"`;
  }
}