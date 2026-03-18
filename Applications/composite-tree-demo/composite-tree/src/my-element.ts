import type { CartesianCanvas } from './WebComponets/CartesianCanvas.js'
import type { CoordinateSystem } from './WebComponets/CoordinateSystem.js'
import type { Axis } from './WebComponets/Axis.js'
import type { Circle } from './WebComponets/Circle.js'
import type { Grid } from './Shapes/Grid/Grid.js'
import type { Line } from './WebComponets/Line.js'
import type { Rectangle } from './Shapes/Rectangle/Rectangle.js'
import type { Vertex } from './WebComponets/Vertex.js'

import './WebComponets/CartesianCanvas.js'
import './WebComponets/CoordinateSystem.js'
import './WebComponets/Axis.js'
import './WebComponets/Circle.js'
import './Shapes/Grid/Grid.js'
import './WebComponets/Line.js'
import './Shapes/Rectangle/Rectangle.js'
import './WebComponets/Vertex.js'
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
