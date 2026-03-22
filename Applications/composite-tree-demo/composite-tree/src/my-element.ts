import type { CartesianCanvas } from './Shapes/Canvas/CartesianCanvas.js'
import type { CoordinateSystem } from './Shapes/CoordinateSystem/CoordinateSystem.js'
import type { Axis } from './Shapes/CoordinateSystem/Axis/Axis.js'
import type { Circle } from './Shapes/Circle/Circle.js'
import type { Grid } from './Shapes/Grid/Grid.js'
import type { Line } from './Shapes/Line/Line.js'
import type { Rectangle } from './Shapes/Rectangle/Rectangle.js'
import type { Vertex } from './Shapes/Vertex//Vertex.js'

import './Shapes/Canvas/CartesianCanvas.js'
import './Shapes/CoordinateSystem/CoordinateSystem.js'
import './Shapes/CoordinateSystem/Axis/Axis.js'
import './Shapes/Circle/Circle.js'
import './Shapes/Grid/Grid.js'
import './Shapes/Line/Line.js'
import './Shapes/Rectangle/Rectangle.js'
import './Shapes/Vertex/Vertex.js'
import { appDesignPolicy } from './design-system/AppDesignPolicy'

appDesignPolicy.applyGlobalStyle({ token: 'canvas' })

declare global {
  interface HTMLElementTagNameMap {
    'cartesian-canvas': CartesianCanvas
    'coordinate-system': CoordinateSystem
    'axis-primitive': Axis
    'circle-primitive': Circle
    'grid-primitive': Grid
    'line-primitive': Line
    'rectangle-primitive': Rectangle
    'vertex-primitive': Vertex
  }
}
