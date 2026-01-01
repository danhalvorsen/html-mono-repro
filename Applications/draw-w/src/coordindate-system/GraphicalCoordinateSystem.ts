import { CenteredCartesianMapper } from '@monorepo/core-composition-svg-turtle'
import type { Point2 } from '@monorepo/core-math'
import { Viewport } from './types/Viewport'

export class GraphicalCoordinateSystem {
  #viewport: Viewport
  #mapper: CenteredCartesianMapper
  #svgInput = false

  constructor(viewport: Viewport) {
    this.#viewport = viewport
    this.#mapper = new CenteredCartesianMapper(viewport.toData())
  }

  get viewport(): Viewport {
    return this.#viewport
  }

  useSvgInput(): void {
    this.#svgInput = true
  }

  useCartesianInput(): void {
    this.#svgInput = false
  }

  updateViewport(viewport: Viewport): void {
    this.#viewport = viewport
    this.#mapper = new CenteredCartesianMapper(viewport.toData())
  }

  toCartesian(p: Point2): Point2 {
    return this.#svgInput ? this.#mapper.fromSvg(p) : p
  }

  toSvg(p: Point2): Point2 {
    return this.#mapper.toSvg(p)
  }
}
