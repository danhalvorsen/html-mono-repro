
import type { ShapeCartesianCanvasElement } from './ShapeCartesianCanvasElement.js'
import type { Canvas } from './Canvas.js'
import type { CoordinateSystemElement } from './CoordinateSystemElement.js'
import type { CircleShapeElement } from './CircleShapeElement.js'

import './ShapeCartesianCanvasElement.js'
import './Canvas.js'
import './CoordinateSystemElement.js'
import './CircleShapeElement.js'
import { applyAppGlobalStyle } from './app-global-style'

applyAppGlobalStyle()

declare global {
  interface HTMLElementTagNameMap {
    'shape-canvas': Canvas
    'shape-cartesian-canvas': ShapeCartesianCanvasElement
    'coordinate-system': CoordinateSystemElement
    'circle-shape': CircleShapeElement
  }
}
