import type { Turtle } from '@monorepo/core-composition-svg-turtle'
import type { Application } from '../Application'
import type { Viewport } from './types/Viewport'

export class CoordinateRenderContext {
  readonly application: Application
  readonly viewport: Viewport
  readonly turtle?: Turtle

  constructor(application: Application, viewport: Viewport, turtle?: Turtle) {
    this.application = application
    this.viewport = viewport
    this.turtle = turtle
  }
}

export abstract class ICoordinateFeature {
  abstract renderFeature(ctx: CoordinateRenderContext): void
}
