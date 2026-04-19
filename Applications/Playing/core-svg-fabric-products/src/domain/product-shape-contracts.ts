import type { IStyleReference } from "@monorepo/core-style-system";

export enum ProductShapeKind {
  Circle = "circle",
  Box = "box",
  Triangle = "triangle",
  BoxTriangle = "box-triangle",
}

export enum ProductShapeElementTag {
  Circle = "svg-fabric-circle",
  Box = "svg-fabric-box",
  Triangle = "svg-fabric-triangle",
  BoxTriangle = "svg-fabric-box-triangle",
}

export interface ProductShapeStyleReference extends IStyleReference {}

export interface StyledProductShapeDto {
  readonly style: ProductShapeStyleReference;
}

export interface CircleShapeGeometryDto {
  readonly radius: number;
}

export interface BoxShapeGeometryDto {
  readonly width: number;
  readonly height: number;
}

export interface TriangleShapeGeometryDto {
  readonly side: number;
}

export interface BoxTriangleLayoutDto {
  readonly gap: number;
}

export interface CircleShapeInput
  extends CircleShapeGeometryDto,
    StyledProductShapeDto {}

export interface BoxShapeInput
  extends BoxShapeGeometryDto,
    StyledProductShapeDto {}

export interface TriangleShapeInput
  extends TriangleShapeGeometryDto,
    StyledProductShapeDto {}

export interface BoxTriangleShapeInput extends StyledProductShapeDto {
  readonly box: BoxShapeGeometryDto;
  readonly triangle: TriangleShapeGeometryDto;
  readonly layout: BoxTriangleLayoutDto;
}
