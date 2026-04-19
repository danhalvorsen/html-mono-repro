import { LitElement, html, svg } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { CartesianToSvgMapper } from '../../domain/cartesian-to-svg-mapper.js'
import {
  distrbutedDistributionStyles,
  distrbutedDistributionTheme,
} from '../../application/ui-style-module.js'
import {
  buildPolylinePath,
  computePlacements,
  parsePointsInput,
} from './distribution-engine.js'
import { createBoundingBox, type Placement } from '../../domain/geometry.js'

type SourceType =
  | 'rectangle-shape'
  | 'dual-sector-shape'
  | 'existing-svg-object'
  | 'scene-object'
type PathMode = 'closed' | 'open'
type RotationMode = 'path' | 'fixed'

@customElement('distrbuted-distribution')
export class DistrbutedDistribution extends LitElement {
  @property({ type: String })
  points = '0,0 100,0 100,100 0,100'

  @property({ type: Boolean })
  closed = true

  @property({ type: String, attribute: 'path-mode' })
  pathMode?: PathMode

  @property({ type: Number, attribute: 'shape-count' })
  shapeCount = 6

  @property({ type: Boolean, attribute: 'rotate-with-path' })
  rotateWithPath = true

  @property({ type: String, attribute: 'rotation-mode' })
  rotationMode?: RotationMode

  @property({ type: Number, attribute: 'start-offset' })
  startOffset = 0

  @property({ type: Number, attribute: 'end-offset' })
  endOffset = 0

  @property({ type: String, attribute: 'source-type' })
  sourceType: SourceType = 'rectangle-shape'

  @property({ type: String, attribute: 'source-ref-id' })
  sourceRefId = ''

  @property({ type: Number, attribute: 'object-size' })
  objectSize = 18

  @property({ type: Number, attribute: 'rotation-offset' })
  rotationOffset = 0

  private get pointsList() {
    return parsePointsInput(this.points)
  }

  private get isClosedPath() {
    if (this.pathMode === 'open') {
      return false
    }
    if (this.pathMode === 'closed') {
      return true
    }
    return this.closed
  }

  private get alignToPath() {
    if (this.rotationMode === 'fixed') {
      return false
    }
    if (this.rotationMode === 'path') {
      return true
    }
    return this.rotateWithPath
  }

  private get placements() {
    return computePlacements({
      points: this.pointsList,
      closed: this.isClosedPath,
      shapeCount: this.shapeCount,
      startOffset: this.startOffset,
      endOffset: this.endOffset,
    })
  }

  private get viewBox() {
    const points = this.pointsList
    if (points.length === 0) {
      return '0 0 120 120'
    }

    const padding = Math.max(24, this.objectSize * 1.5)
    const box = createBoundingBox(points, padding)
    return `${box.minX} ${box.minY} ${box.width} ${box.height}`
  }

  private renderInstance(placement: Placement) {
    const angle = this.alignToPath
      ? placement.angleDeg + this.rotationOffset
      : this.rotationOffset

    return svg`
      <g transform=${`translate(${placement.x} ${placement.y}) rotate(${angle})`}>
        ${this.renderSourceShape()}
      </g>
    `
  }

  private renderSourceShape() {
    const size = Math.max(2, this.objectSize)
    const half = size / 2

    if (this.sourceType === 'dual-sector-shape') {
      const outer = size * 0.8
      const inner = size * 0.4
      const start = -80
      const end = 140
      const path = this.buildDualSectorPath(inner, outer, start, end)
      return svg`
        <path
          d=${path}
          fill=${distrbutedDistributionTheme.sourceFill}
          stroke=${distrbutedDistributionTheme.sourceStroke}
          stroke-width=${distrbutedDistributionTheme.sourceStrokeWidth}
        ></path>
      `
    }

    if (
      this.sourceType === 'existing-svg-object' ||
      this.sourceType === 'scene-object'
    ) {
      if (this.sourceRefId.trim() !== '') {
        return svg`
          <use
            href=${`#${this.sourceRefId}`}
            transform=${`translate(${-half} ${-half}) scale(${size / 100})`}
          ></use>
        `
      }
    }

    return svg`
      <rect
        x=${-half}
        y=${-half}
        width=${size}
        height=${size}
        rx=${Math.max(2, size * 0.15)}
        ry=${Math.max(2, size * 0.15)}
        fill=${distrbutedDistributionTheme.sourceFill}
        stroke=${distrbutedDistributionTheme.sourceStroke}
        stroke-width=${distrbutedDistributionTheme.sourceStrokeWidth}
      ></rect>
    `
  }

  private buildDualSectorPath(
    radiusMin: number,
    radiusMax: number,
    startDeg: number,
    endDeg: number,
  ): string {
    const startOuter = this.pointAt(radiusMax, startDeg)
    const endOuter = this.pointAt(radiusMax, endDeg)
    const startInner = this.pointAt(radiusMin, startDeg)
    const endInner = this.pointAt(radiusMin, endDeg)
    const largeArc = Math.abs(endDeg - startDeg) > 180 ? 1 : 0
    const sweepOuter = endDeg >= startDeg ? 1 : 0
    const sweepInner = sweepOuter === 1 ? 0 : 1

    return [
      `M ${startOuter.x} ${startOuter.y}`,
      `A ${radiusMax} ${radiusMax} 0 ${largeArc} ${sweepOuter} ${endOuter.x} ${endOuter.y}`,
      `L ${endInner.x} ${endInner.y}`,
      `A ${radiusMin} ${radiusMin} 0 ${largeArc} ${sweepInner} ${startInner.x} ${startInner.y}`,
      'Z',
    ].join(' ')
  }

  private pointAt(radius: number, angleDeg: number) {
    const mapper = new CartesianToSvgMapper(0, 0, 0, 'clockwise')
    return mapper.mapPolarToSvg(radius, angleDeg)
  }

  render() {
    const polylinePath = buildPolylinePath(this.pointsList, this.isClosedPath)

    return html`
      <svg
        viewBox=${this.viewBox}
        role="img"
        aria-label="Distributed SVG object instances along a polygon path"
      >
        <defs>
          <symbol id="distribution-rect-source" viewBox="0 0 100 100">
            <rect
              x="8"
              y="8"
              width="84"
              height="84"
              rx="14"
              ry="14"
              fill=${distrbutedDistributionTheme.sourceFill}
              stroke=${distrbutedDistributionTheme.sourceStroke}
              stroke-width=${distrbutedDistributionTheme.sourceStrokeWidth}
            ></rect>
          </symbol>
        </defs>

        <path
          d=${polylinePath}
          fill="none"
          stroke=${distrbutedDistributionTheme.pathStroke}
          stroke-width=${distrbutedDistributionTheme.pathStrokeWidth}
        ></path>

        ${this.placements.map((placement) => this.renderInstance(placement))}
      </svg>
    `
  }

  static styles = distrbutedDistributionStyles
}

declare global {
  interface HTMLElementTagNameMap {
    'distrbuted-distribution': DistrbutedDistribution
  }
}
