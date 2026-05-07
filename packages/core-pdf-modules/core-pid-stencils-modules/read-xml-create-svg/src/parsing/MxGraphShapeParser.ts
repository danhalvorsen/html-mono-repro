import { DOMParser } from "@xmldom/xmldom";
import { MxGraphElementName } from "../domain/MxGraphElementName.js";
import type { MxGraphStencilDocument } from "../domain/MxGraphStencilDocument.js";
import type {
  MxGraphConnection,
  MxGraphDrawable,
  MxGraphEllipse,
  MxGraphFillStroke,
  MxGraphLineJoin,
  MxGraphPath,
  MxGraphPathCommand,
  MxGraphShape,
  MxGraphStroke
} from "../domain/MxGraphShape.js";
import type { IMxGraphRootNameNormalizer } from "../ports/IMxGraphRootNameNormalizer.js";
import type { IMxGraphShapeParser } from "../ports/IMxGraphShapeParser.js";
import { DomElementReader } from "./DomElementReader.js";

export class MxGraphShapeParser implements IMxGraphShapeParser {
  public constructor(
    private readonly reader: DomElementReader,
    private readonly rootNameNormalizer: IMxGraphRootNameNormalizer
  ) {}

  public getDocumentName(xml: string): string {
    const root = this.getRootElement(xml);
    this.assertRoot(root);

    return this.reader.getRequiredAttribute(root, "name");
  }

  public parse(xml: string): readonly MxGraphShape[] {
    return this.parseDocument(xml).shapes;
  }

  public parseDocument(xml: string): MxGraphStencilDocument {
    const root = this.getRootElement(xml);
    this.assertRoot(root);

    const sourceName = this.reader.getRequiredAttribute(root, "name");

    return {
      sourceName,
      rootName: this.rootNameNormalizer.normalize(sourceName),
      shapes: this.reader
        .children(root)
        .filter((child) => child.tagName === MxGraphElementName.Shape)
        .map((shapeElement) => this.parseShape(shapeElement))
    };
  }

  private getRootElement(xml: string): Element {
    const document = new DOMParser({
      errorHandler: {
        warning: () => undefined,
        error: (message) => {
          throw new Error(message);
        },
        fatalError: (message) => {
          throw new Error(message);
        }
      }
    }).parseFromString(xml, "application/xml");

    return document.documentElement;
  }

  private assertRoot(root: Element): void {
    if (root.tagName !== MxGraphElementName.Shapes) {
      throw new Error(`Expected root <${MxGraphElementName.Shapes}>.`);
    }
  }

  private parseShape(element: Element): MxGraphShape {
    return {
      name: this.reader.getRequiredAttribute(element, "name"),
      width: this.reader.getRequiredNumberAttribute(element, "w"),
      height: this.reader.getRequiredNumberAttribute(element, "h"),
      aspect: this.reader.getOptionalAttribute(element, "aspect", "variable"),
      strokeWidth: this.reader.getOptionalAttribute(
        element,
        "strokewidth",
        "inherit"
      ),
      connections: this.parseConnections(element),
      background: this.parseLayer(element, MxGraphElementName.Background),
      foreground: this.parseLayer(element, MxGraphElementName.Foreground)
    };
  }

  private parseConnections(shapeElement: Element): readonly MxGraphConnection[] {
    const connectionsElement = this.reader.firstChildElementByName(
      shapeElement,
      MxGraphElementName.Connections
    );

    if (!connectionsElement) {
      return [];
    }

    return this.reader
      .children(connectionsElement)
      .filter((child) => child.tagName === MxGraphElementName.Constraint)
      .map((constraintElement) => ({
        name: this.reader.getRequiredAttribute(constraintElement, "name"),
        x: this.reader.getRequiredNumberAttribute(constraintElement, "x"),
        y: this.reader.getRequiredNumberAttribute(constraintElement, "y"),
        perimeter: this.reader.getOptionalAttribute(
          constraintElement,
          "perimeter",
          "0"
        )
      }));
  }

  private parseLayer(
    shapeElement: Element,
    layerName: string
  ): readonly MxGraphDrawable[] {
    const layerElement = this.reader.firstChildElementByName(
      shapeElement,
      layerName
    );

    if (!layerElement) {
      return [];
    }

    return this.reader
      .children(layerElement)
      .map((child) => this.parseDrawable(child));
  }

  private parseDrawable(element: Element): MxGraphDrawable {
    switch (element.tagName) {
      case MxGraphElementName.Path:
        return this.parsePath(element);

      case MxGraphElementName.Ellipse:
        return this.parseEllipse(element);

      case MxGraphElementName.Stroke:
        return this.parseStroke();

      case MxGraphElementName.FillStroke:
        return this.parseFillStroke();

      case MxGraphElementName.LineJoin:
        return this.parseLineJoin(element);

      default:
        throw new Error(`Unsupported drawable element: <${element.tagName}>.`);
    }
  }

  private parsePath(element: Element): MxGraphPath {
    return {
      kind: "path",
      commands: this.reader
        .children(element)
        .map((child) => this.parsePathCommand(child))
    };
  }

  private parsePathCommand(element: Element): MxGraphPathCommand {
    switch (element.tagName) {
      case MxGraphElementName.Move:
        return {
          kind: "move",
          x: this.reader.getRequiredNumberAttribute(element, "x"),
          y: this.reader.getRequiredNumberAttribute(element, "y")
        };

      case MxGraphElementName.Line:
        return {
          kind: "line",
          x: this.reader.getRequiredNumberAttribute(element, "x"),
          y: this.reader.getRequiredNumberAttribute(element, "y")
        };

      case MxGraphElementName.Arc:
        return {
          kind: "arc",
          rx: this.reader.getRequiredNumberAttribute(element, "rx"),
          ry: this.reader.getRequiredNumberAttribute(element, "ry"),
          xAxisRotation: this.reader.getOptionalNumberAttribute(
            element,
            "x-axis-rotation",
            0
          ),
          largeArcFlag: this.reader.getRequiredNumberAttribute(
            element,
            "large-arc-flag"
          ),
          sweepFlag: this.reader.getRequiredNumberAttribute(
            element,
            "sweep-flag"
          ),
          x: this.reader.getRequiredNumberAttribute(element, "x"),
          y: this.reader.getRequiredNumberAttribute(element, "y")
        };

      case MxGraphElementName.Close:
        return { kind: "close" };

      default:
        throw new Error(`Unsupported path command: <${element.tagName}>.`);
    }
  }

  private parseEllipse(element: Element): MxGraphEllipse {
    return {
      kind: "ellipse",
      x: this.reader.getRequiredNumberAttribute(element, "x"),
      y: this.reader.getRequiredNumberAttribute(element, "y"),
      width: this.reader.getRequiredNumberAttribute(element, "w"),
      height: this.reader.getRequiredNumberAttribute(element, "h")
    };
  }

  private parseStroke(): MxGraphStroke {
    return { kind: "stroke" };
  }

  private parseFillStroke(): MxGraphFillStroke {
    return { kind: "fillstroke" };
  }

  private parseLineJoin(element: Element): MxGraphLineJoin {
    return {
      kind: "linejoin",
      join: this.reader.getRequiredAttribute(element, "join")
    };
  }
}