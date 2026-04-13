import { EllipseShapeFactory } from "./EllipseShapeFactory.js";
import { EllipseTopologyFactory } from "./EllipseTopologyFactory.js";
import { IEllipseShape } from "./IEllipseShape.js";
import { ILineShape } from "./ILineShape.js";
import { IPolygonShape } from "./IPolygonShape.js";
import { IPolylineShape } from "./IPolylineShape.js";
import { IRectangleShape } from "./IRectangleShape.js";
import { IShapeValidator } from "./IShapeValidator.js";
import { LineShapeFactory } from "./LineShapeFactory.js";
import { LineShapeValidator } from "./LineShapeValidator.js";
import { LineTopologyFactory } from "./LineTopologyFactory.js";
import { EllipseShapeValidator } from "./EllipseShapeValidator.js";

import { IShapeFactory } from "./IShapeFactory.js";
import { IEdgePointFactory } from "./IEdgePointFactory.js";
import { IShapeTopologyFactory } from "./IShapeTopologyFactory.js";
import { IRectangleInput } from "./IRectangleInput.js";
import { IPolygonInput } from "./IPolygonInput.js";
import { IPolylineInput } from "./IPolylineInput.js";
import { IEllipseInput } from "./IEllipseInput.js";
import { ILineInput } from "./ILineInput.js";
import { PolygonShapeFactory } from "./PolygonShapeFactory.js";
import { PolygonShapeValidator } from "./PolygonShapeValidator.js";
import { PolygonTopologyFactory } from "./PolygonTopologyFactory.js";
import { PolylineShapeFactory } from "./PolylineShapeFactory.js";
import { PolylineShapeValidator } from "./PolylineShapeValidator.js";
import { PolylineTopologyFactory } from "./PolylineTopologyFactory.js";
import { RectangleShapeFactory } from "./RectangleShapeFactory.js";
import { RectangleShapeValidator } from "./RectangleShapeValidator.js";
import { RectangleTopologyFactory } from "./RectangleTopologyFactory.js";
import { ShapeBuilder } from "./ShapeBuilder.js";
import { ShapeEdgePointFactory } from "./ShapeEdgePointFactory.js";

export interface ISemanticShapesComposition {
  readonly edgePointFactory: IEdgePointFactory;
  readonly shapeBuilder: ShapeBuilder;

  readonly rectangleTopologyFactory: IShapeTopologyFactory<IRectangleInput>;
  readonly polygonTopologyFactory: IShapeTopologyFactory<IPolygonInput>;
  readonly polylineTopologyFactory: IShapeTopologyFactory<IPolylineInput>;
  readonly lineTopologyFactory: IShapeTopologyFactory<ILineInput>;
  readonly ellipseTopologyFactory: IShapeTopologyFactory<IEllipseInput>;

  readonly rectangleValidator: IShapeValidator<IRectangleShape>;
  readonly polygonValidator: IShapeValidator<IPolygonShape>;
  readonly polylineValidator: IShapeValidator<IPolylineShape>;
  readonly lineValidator: IShapeValidator<ILineShape>;
  readonly ellipseValidator: IShapeValidator<IEllipseShape>;

  readonly rectangleFactory: IShapeFactory<IRectangleShape, IRectangleInput>;
  readonly polygonFactory: IShapeFactory<IPolygonShape, IPolygonInput>;
  readonly polylineFactory: IShapeFactory<IPolylineShape, IPolylineInput>;
  readonly lineFactory: IShapeFactory<ILineShape, ILineInput>;
  readonly ellipseFactory: IShapeFactory<IEllipseShape, IEllipseInput>;
}

export class SemanticShapesComposition implements ISemanticShapesComposition {
  public readonly edgePointFactory: IEdgePointFactory;
  public readonly shapeBuilder: ShapeBuilder;

  public readonly rectangleTopologyFactory: IShapeTopologyFactory<IRectangleInput>;
  public readonly polygonTopologyFactory: IShapeTopologyFactory<IPolygonInput>;
  public readonly polylineTopologyFactory: IShapeTopologyFactory<IPolylineInput>;
  public readonly lineTopologyFactory: IShapeTopologyFactory<ILineInput>;
  public readonly ellipseTopologyFactory: IShapeTopologyFactory<IEllipseInput>;

  public readonly rectangleValidator: IShapeValidator<IRectangleShape>;
  public readonly polygonValidator: IShapeValidator<IPolygonShape>;
  public readonly polylineValidator: IShapeValidator<IPolylineShape>;
  public readonly lineValidator: IShapeValidator<ILineShape>;
  public readonly ellipseValidator: IShapeValidator<IEllipseShape>;

  public readonly rectangleFactory: IShapeFactory<IRectangleShape, IRectangleInput>;
  public readonly polygonFactory: IShapeFactory<IPolygonShape, IPolygonInput>;
  public readonly polylineFactory: IShapeFactory<IPolylineShape, IPolylineInput>;
  public readonly lineFactory: IShapeFactory<ILineShape, ILineInput>;
  public readonly ellipseFactory: IShapeFactory<IEllipseShape, IEllipseInput>;

  public constructor() {
    this.edgePointFactory = new ShapeEdgePointFactory();
    this.shapeBuilder = new ShapeBuilder();

    this.rectangleTopologyFactory = new RectangleTopologyFactory(this.edgePointFactory);
    this.polygonTopologyFactory = new PolygonTopologyFactory(this.edgePointFactory);
    this.polylineTopologyFactory = new PolylineTopologyFactory(this.edgePointFactory);
    this.lineTopologyFactory = new LineTopologyFactory(this.edgePointFactory);
    this.ellipseTopologyFactory = new EllipseTopologyFactory(this.edgePointFactory);

    this.rectangleValidator = new RectangleShapeValidator();
    this.polygonValidator = new PolygonShapeValidator();
    this.polylineValidator = new PolylineShapeValidator();
    this.lineValidator = new LineShapeValidator();
    this.ellipseValidator = new EllipseShapeValidator();

    this.rectangleFactory = new RectangleShapeFactory(
      this.rectangleTopologyFactory,
      this.rectangleValidator,
      this.shapeBuilder
    );

    this.polygonFactory = new PolygonShapeFactory(
      this.polygonTopologyFactory,
      this.polygonValidator,
      this.shapeBuilder
    );

    this.polylineFactory = new PolylineShapeFactory(
      this.polylineTopologyFactory,
      this.polylineValidator,
      this.shapeBuilder
    );

    this.lineFactory = new LineShapeFactory(
      this.lineTopologyFactory,
      this.lineValidator,
      this.shapeBuilder
    );

    this.ellipseFactory = new EllipseShapeFactory(
      this.ellipseTopologyFactory,
      this.ellipseValidator,
      this.shapeBuilder
    );
  }
}
