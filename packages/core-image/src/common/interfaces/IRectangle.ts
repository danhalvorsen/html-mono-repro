// packages/core-image/src/interfaces/IRectangle.ts

export interface IRectangle {

  readonly x: number
  readonly y: number

  readonly width: number
  readonly height: number

  readonly left: number
  readonly top: number
  readonly right: number
  readonly bottom: number

  contains(x: number, y: number): boolean

  intersects(other: IRectangle): boolean

  intersection(other: IRectangle): IRectangle | null
}