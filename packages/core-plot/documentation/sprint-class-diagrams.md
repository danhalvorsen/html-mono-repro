# `@monorepo/core-plot`

## Sprint Class Diagrams

This document provides one class diagram per sprint.

It is intended to sit with the specification set and support staged implementation from:

* `master.spsification.txt`
* `backlog.4-sprints.md`
* `technical-implementation-plan.md`

---

# Sprint 1: Canvas Foundation

## Scope

This sprint establishes:

* the composition root
* canvas object registration
* rendering
* hit testing
* core interaction controllers

```mermaid
classDiagram

namespace CorePlot.Contracts {
  class ICanvasObject {
    <<interface>>
    +id: string
    +render(context) RenderOutput
    +hitTest(context) boolean
  }
}

namespace CorePlot.Canvas {
  class PlotCanvasElement {
    -registry: CanvasObjectRegistry
    -mouseController: MouseController
    -dragController: DragController
    -gridController: GridController
    -snapController: SnapController
    -clickController: OnClickController
    -doubleClickController: OnDoubleClickController
    -scaleController: OnScaleController
    +registerObject(obj)
    +render()
    +performHitTest(point)
  }

  class CanvasObject {
    <<abstract>>
    +id: string
    +render(context) RenderOutput
    +hitTest(context) boolean
  }

  class CanvasObjectRegistry {
    -objects: CanvasObject[*]
    +register(obj)
    +remove(id)
    +getAll() CanvasObject[*]
    +hitTest(point) CanvasObject[*]
  }

  class RenderContext
  class HitTestContext
}

namespace CorePlot.Controllers {
  class MouseController {
    +currentPointerPosition
    +buttonState
  }

  class DragController {
    +activeTarget
    +startDrag()
    +updateDrag()
    +endDrag()
  }

  class GridController
  class SnapController
  class OnClickController
  class OnDoubleClickController
  class OnScaleController
}

CorePlot.Canvas.CanvasObject ..|> CorePlot.Contracts.ICanvasObject
CorePlot.Canvas.PlotCanvasElement --> CorePlot.Canvas.CanvasObjectRegistry
CorePlot.Canvas.PlotCanvasElement --> CorePlot.Controllers.MouseController
CorePlot.Canvas.PlotCanvasElement --> CorePlot.Controllers.DragController
CorePlot.Canvas.PlotCanvasElement --> CorePlot.Controllers.GridController
CorePlot.Canvas.PlotCanvasElement --> CorePlot.Controllers.SnapController
CorePlot.Canvas.PlotCanvasElement --> CorePlot.Controllers.OnClickController
CorePlot.Canvas.PlotCanvasElement --> CorePlot.Controllers.OnDoubleClickController
CorePlot.Canvas.PlotCanvasElement --> CorePlot.Controllers.OnScaleController
CorePlot.Canvas.CanvasObjectRegistry --> CorePlot.Canvas.CanvasObject
CorePlot.Controllers.DragController --> CorePlot.Controllers.MouseController
CorePlot.Controllers.OnClickController --> CorePlot.Canvas.CanvasObjectRegistry
CorePlot.Controllers.OnDoubleClickController --> CorePlot.Canvas.CanvasObjectRegistry
CorePlot.Controllers.OnScaleController --> CorePlot.Canvas.CanvasObjectRegistry
```

---

# Sprint 2: Coordinate System Core

## Scope

This sprint introduces:

* `CoordinateSystem`
* `Axis`
* `Point` as a domain object
* `MappingController`
* axis range interaction

```mermaid
classDiagram

namespace CorePlot.Canvas {
  class CanvasObject {
    <<abstract>>
    +id: string
    +render(context) RenderOutput
    +hitTest(context) boolean
  }

  class PlotCanvasElement
}

namespace CorePlot.Coordinates {
  class CoordinateSystem {
    -horizontalAxis: Axis
    -verticalAxis: Axis
    -pointContainer: CoordinateContainer
    -mappingController: MappingController
    +render(context) RenderOutput
    +addPoint(point)
  }

  class Axis {
    -orientation: AxisOrientation
    -range: AxisRange
    +render(context) RenderOutput
    +hitTest(context) boolean
  }

  class AxisRange {
    +min: number
    +max: number
    +isValid() boolean
  }

  class AxisOrientation {
    <<enumeration>>
    Horizontal
    Vertical
  }

  class CoordinateContainer {
    -points: Point[*]
    +add(point)
    +getAll() Point[*]
  }

  class TickModel
}

namespace CorePlot.Domain {
  class Point {
    +x: number
    +y: number
  }
}

namespace CorePlot.Controllers {
  class MappingController {
    +mapToSvg(point)
    +mapToCartesian(point)
  }

  class OnRangeChangeController {
    +startRangeChange()
    +updateRangeChange()
    +finishRangeChange()
  }

  class DragController
  class MouseController
}

CorePlot.Coordinates.CoordinateSystem --|> CorePlot.Canvas.CanvasObject
CorePlot.Coordinates.Axis --|> CorePlot.Canvas.CanvasObject
CorePlot.Canvas.PlotCanvasElement --> CorePlot.Coordinates.CoordinateSystem
CorePlot.Coordinates.CoordinateSystem --> CorePlot.Coordinates.Axis
CorePlot.Coordinates.CoordinateSystem --> CorePlot.Coordinates.CoordinateContainer
CorePlot.Coordinates.CoordinateSystem --> CorePlot.Controllers.MappingController
CorePlot.Coordinates.CoordinateContainer --> CorePlot.Domain.Point
CorePlot.Coordinates.Axis --> CorePlot.Coordinates.AxisRange
CorePlot.Coordinates.Axis --> CorePlot.Coordinates.TickModel
CorePlot.Controllers.OnRangeChangeController --> CorePlot.Controllers.DragController
CorePlot.Controllers.OnRangeChangeController --> CorePlot.Controllers.MouseController
CorePlot.Controllers.OnRangeChangeController --> CorePlot.Coordinates.Axis
```

---

# Sprint 3: SVG Composition and Styling

## Scope

This sprint standardizes:

* primitive SVG components
* builders
* factories
* token-based styling
* composition rules

```mermaid
classDiagram

namespace CorePlot.Patterns {
  class Builder~T~ {
    +build() T
  }

  class Factory~T~ {
    +create() T
  }
}

namespace CorePlot.Svg {
  class SvgLineElement
  class SvgCircleElement
  class SvgRectangleElement
  class SvgArrowElement
  class TickSvg
  class CurvePathSvg
}

namespace CorePlot.Builders {
  class LineBuilder
  class CircleBuilder
  class RectangleBuilder
  class ArrowBuilder
  class PathBuilder
}

namespace CorePlot.Factories {
  class AxisFactory {
    +create() AxisVisual
  }

  class CoordinateSystemFactory {
    +create() CoordinateSystemVisual
  }

  class RectangleVisualFactory {
    +create() RectangleVisual
  }

  class CurveVisualFactory {
    +create() CurveVisual
  }
}

namespace CorePlot.Styling {
  class StyleResolver {
    +resolve(tokenKey, state)
  }

  class StyleToken

  class StyleState {
    <<enumeration>>
    Normal
    Highlighted
  }

  class SvgStyleModel
}

namespace CorePlot.Coordinates {
  class Axis
  class CoordinateSystem
}

CorePlot.Builders.LineBuilder ..|> CorePlot.Patterns.Builder
CorePlot.Builders.CircleBuilder ..|> CorePlot.Patterns.Builder
CorePlot.Builders.RectangleBuilder ..|> CorePlot.Patterns.Builder
CorePlot.Builders.ArrowBuilder ..|> CorePlot.Patterns.Builder
CorePlot.Builders.PathBuilder ..|> CorePlot.Patterns.Builder

CorePlot.Factories.AxisFactory ..|> CorePlot.Patterns.Factory
CorePlot.Factories.CoordinateSystemFactory ..|> CorePlot.Patterns.Factory
CorePlot.Factories.RectangleVisualFactory ..|> CorePlot.Patterns.Factory
CorePlot.Factories.CurveVisualFactory ..|> CorePlot.Patterns.Factory

CorePlot.Builders.LineBuilder --> CorePlot.Svg.SvgLineElement
CorePlot.Builders.CircleBuilder --> CorePlot.Svg.SvgCircleElement
CorePlot.Builders.RectangleBuilder --> CorePlot.Svg.SvgRectangleElement
CorePlot.Builders.ArrowBuilder --> CorePlot.Svg.SvgArrowElement

CorePlot.Factories.AxisFactory --> CorePlot.Coordinates.Axis
CorePlot.Factories.CoordinateSystemFactory --> CorePlot.Coordinates.CoordinateSystem
CorePlot.Factories.AxisFactory --> CorePlot.Svg.TickSvg
CorePlot.Factories.CurveVisualFactory --> CorePlot.Svg.CurvePathSvg

CorePlot.Styling.StyleResolver --> CorePlot.Styling.StyleToken
CorePlot.Styling.StyleResolver --> CorePlot.Styling.StyleState
CorePlot.Svg.SvgLineElement --> CorePlot.Styling.SvgStyleModel
CorePlot.Svg.SvgCircleElement --> CorePlot.Styling.SvgStyleModel
CorePlot.Svg.SvgRectangleElement --> CorePlot.Styling.SvgStyleModel
CorePlot.Svg.SvgArrowElement --> CorePlot.Styling.SvgStyleModel
```

---

# Sprint 4: Geometry and Advanced Plotting

## Scope

This sprint adds:

* interpolation
* rectangles
* reusable geometry types
* geometry-driven hit testing

```mermaid
classDiagram

namespace CorePlot.Domain {
  class Point {
    +x: number
    +y: number
  }

  class RectangleModel
  class CurveModel
}

namespace CorePlot.Geometry {
  class Point2D
  class Vector2D
  class Bounds
  class Size2D
  class Transform2D
  class PathSegment
  class Polyline
  class Polygon
  class BezierCurve {
    +pointAt(t)
    +tangentAt(t)
    +normalAt(t)
    +length()
  }
  class Arc
  class GeometryHitTester {
    +hitTest(shape, point, tolerance)
  }
}

namespace CorePlot.Coordinates {
  class CoordinateSystem {
    +interpolate(points)
    +renderRectangle(model)
    +renderCurve(model)
  }
}

namespace CorePlot.Controllers {
  class MappingController {
    +mapToSvg(point)
    +mapToCartesian(point)
  }
}

namespace CorePlot.Builders {
  class PathBuilder {
    +build()
  }
}

namespace CorePlot.Factories {
  class RectangleVisualFactory
  class CurveVisualFactory
}

namespace CorePlot.Svg {
  class SvgRectangleElement
  class CurvePathSvg
}

CorePlot.Coordinates.CoordinateSystem --> CorePlot.Domain.Point
CorePlot.Coordinates.CoordinateSystem --> CorePlot.Domain.RectangleModel
CorePlot.Coordinates.CoordinateSystem --> CorePlot.Domain.CurveModel
CorePlot.Coordinates.CoordinateSystem --> CorePlot.Controllers.MappingController
CorePlot.Coordinates.CoordinateSystem --> CorePlot.Factories.RectangleVisualFactory
CorePlot.Coordinates.CoordinateSystem --> CorePlot.Factories.CurveVisualFactory

CorePlot.Builders.PathBuilder --> CorePlot.Geometry.PathSegment
CorePlot.Builders.PathBuilder --> CorePlot.Geometry.Polyline
CorePlot.Builders.PathBuilder --> CorePlot.Geometry.BezierCurve
CorePlot.Factories.RectangleVisualFactory --> CorePlot.Svg.SvgRectangleElement
CorePlot.Factories.CurveVisualFactory --> CorePlot.Svg.CurvePathSvg

CorePlot.Domain.CurveModel --> CorePlot.Geometry.BezierCurve
CorePlot.Domain.RectangleModel --> CorePlot.Geometry.Bounds
CorePlot.Geometry.GeometryHitTester --> CorePlot.Geometry.Bounds
CorePlot.Geometry.GeometryHitTester --> CorePlot.Geometry.BezierCurve
CorePlot.Geometry.GeometryHitTester --> CorePlot.Geometry.Polygon
```

---

# Recommended Usage

Use these diagrams together:

* Sprint 1 diagram for platform and controller wiring
* Sprint 2 diagram for coordinate-system implementation
* Sprint 3 diagram for rendering architecture and styling
* Sprint 4 diagram for geometry and advanced plotting

If you want, I can also convert these into:

* PlantUML
* one image per sprint
* one consolidated namespace diagram for the whole product
