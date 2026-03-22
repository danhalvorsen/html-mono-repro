import { SvgStyleAdapter } from '../../src/rendering/SvgStyleAdapter.js'
import { ShapeStylePolicy } from '../../src/rendering/ShapeStylePolicy.js'
import { SvgShapeRenderer } from '../../src/rendering/SvgShapeRenderer.js'
import { AxisShape } from '../../src/Shapes/CoordinateSystem/Axis/AxisShape.js'
import { LineShape } from '../../src/Shapes/Line/LineShape.js'
import { VertexShape } from '../../src/shape-model.js'
import { appDesignPolicy } from '../../src/design-system/AppDesignPolicy.js'

export class SvgShapeRendererFixture {
  public createRenderer(): SvgShapeRenderer {
    return new SvgShapeRenderer(
      appDesignPolicy.getShapeStyleResolver(),
      new SvgStyleAdapter(),
      new ShapeStylePolicy(),
    )
  }

  public createAxisX(): AxisShape {
    return new AxisShape(
      'x',
      new LineShape(
        { x: -50, y: 0 },
        { x: 50, y: 0 },
        { token: 'line' },
        new VertexShape({ x: -50, y: 0 }, 'arrow', 8, 180, { token: 'vertex' }),
        new VertexShape({ x: 50, y: 0 }, 'arrow', 8, 0, { token: 'vertex' }),
      ),
      { token: 'axis-x' },
      'axis-test',
    )
  }
}
