import {
  createTranslationMatrix,
  freezeSvgNode,
  svgShapeTemplateFactory,
  type SvgGroupNode,
  type SvgNode,
  type SvgRootNode,
  type SvgStrokeFillStyle,
} from "@monorepo/core-svg-fabric";
import {
  type BoxShapeInput,
  type BoxTriangleShapeInput,
  type CircleShapeInput,
  type TriangleShapeInput,
} from "../domain/product-shape-contracts.js";
import {
  createBoxGeometry,
  createBoxTriangleGeometry,
  createCircleGeometry,
  createTriangleGeometry,
  type BoxGeometry,
  type TriangleGeometry,
} from "../domain/product-shape-geometry.js";
import { resolveProductShapeStyle } from "../style/product-shape-style-tokens.js";

const PRODUCT_SHAPE_VIEWPORT_ROLE = "img";
const PRODUCT_SHAPE_ARIA_HIDDEN = true;

function createProductShapeRootNode(
  width: number,
  height: number,
  child: SvgNode,
): SvgRootNode {
  return svgShapeTemplateFactory.svgNode(
    {
      width,
      height,
      role: PRODUCT_SHAPE_VIEWPORT_ROLE,
      ariaHidden: PRODUCT_SHAPE_ARIA_HIDDEN,
    },
    child,
  );
}

function translateGroup(node: SvgGroupNode, x: number, y: number): SvgGroupNode {
  return freezeSvgNode({
    ...node,
    transform: createTranslationMatrix(x, y),
  });
}

function createBoxGroupNode(
  geometry: BoxGeometry,
  style: SvgStrokeFillStyle,
): SvgGroupNode {
  const shape = svgShapeTemplateFactory
    .rect()
    .x(geometry.x)
    .y(geometry.y)
    .width(geometry.width)
    .height(geometry.height)
    .style(style)
    .buildNode();

  return svgShapeTemplateFactory.group().children(shape).buildNode();
}

function createTriangleGroupNode(
  geometry: TriangleGeometry,
  style: SvgStrokeFillStyle,
): SvgGroupNode {
  const shape = svgShapeTemplateFactory
    .polygon()
    .points(geometry.points)
    .style(style)
    .buildNode();

  return svgShapeTemplateFactory.group().children(shape).buildNode();
}

export function createCircleShapeRootNode(input: CircleShapeInput): SvgRootNode {
  const style = resolveProductShapeStyle(input.style);
  const geometry = createCircleGeometry(input.radius, style.strokeWidth ?? 0);
  const shape = svgShapeTemplateFactory
    .circle()
    .cx(geometry.center)
    .cy(geometry.center)
    .radius(geometry.radius)
    .style(style)
    .buildNode();

  return createProductShapeRootNode(
    geometry.size,
    geometry.size,
    svgShapeTemplateFactory.group().children(shape).buildNode(),
  );
}

export function createBoxShapeRootNode(input: BoxShapeInput): SvgRootNode {
  const style = resolveProductShapeStyle(input.style);
  const geometry = createBoxGeometry(
    input.width,
    input.height,
    style.strokeWidth ?? 0,
  );

  return createProductShapeRootNode(
    geometry.sizeWidth,
    geometry.sizeHeight,
    createBoxGroupNode(geometry, style),
  );
}

export function createTriangleShapeRootNode(
  input: TriangleShapeInput,
): SvgRootNode {
  const style = resolveProductShapeStyle(input.style);
  const geometry = createTriangleGeometry(input.side, style.strokeWidth ?? 0);

  return createProductShapeRootNode(
    geometry.size,
    geometry.size,
    createTriangleGroupNode(geometry, style),
  );
}

export function createBoxTriangleShapeRootNode(
  input: BoxTriangleShapeInput,
): SvgRootNode {
  const style = resolveProductShapeStyle(input.style);
  const geometry = createBoxTriangleGeometry(
    input.box.width,
    input.box.height,
    input.triangle.side,
    input.layout.gap,
    style.strokeWidth ?? 0,
  );
  const boxNode = translateGroup(
    createBoxGroupNode(geometry.box, style),
    0,
    geometry.boxOffsetY,
  );
  const triangleNode = translateGroup(
    createTriangleGroupNode(geometry.triangle, style),
    geometry.triangleOffsetX,
    geometry.triangleOffsetY,
  );

  return createProductShapeRootNode(
    geometry.width,
    geometry.height,
    svgShapeTemplateFactory.group().children(boxNode, triangleNode).buildNode(),
  );
}
