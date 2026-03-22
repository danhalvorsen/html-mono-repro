import type { IStyle, IStyleReference } from '@monorepo/core-style-system'

export class ShapeStylePolicy {
  public lineEndpointReference(
    vertexReference: Readonly<IStyleReference> | undefined,
    lineStyle: Readonly<IStyle>,
  ): IStyleReference | undefined {
    const lineColor = lineStyle.stroke?.color

    if (lineColor === undefined) {
      return vertexReference
    }

    if (vertexReference?.token === 'vertex' && vertexReference.overrides === undefined) {
      return {
        token: 'vertex',
        overrides: {
          stroke: { color: lineColor },
          fill: { color: lineColor },
        },
      }
    }

    return vertexReference
  }
}
