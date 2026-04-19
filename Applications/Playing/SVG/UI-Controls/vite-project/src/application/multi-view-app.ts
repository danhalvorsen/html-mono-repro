import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import '../features/dual-sector-shape/dual-sector-shape.js'
import '../features/circle-shape/circle-shape.js'
import '../features/rectangle-shape/rectangle-shape.js'
import '../features/triangle-shape/triangle-shape.js'
import '../features/line-shape/line-shape.js'
import '../features/knob-shape/knob-shape.js'
import '../features/triangle-indicator-knob/triangle-indicator-knob.js'
import '../features/property-panel/property-panel.js'
import '../features/web-card/web-card.js'
import '../features/svg-template-host/svg-template-host.js'
import '../features/label/label-feature.js'
import '../features/label/ui-label.js'
import '../features/view-menu/view-menu.js'
import '../features/current-view-presenter/current-view-presenter.js'
import '../features/distrbuted-distribution/distrbuted-distribution.js'
import '../features/circle-label-distribution/circle-label-distribution.js'
import '@monorepo/core-svg-fabric-products'
import { multiViewAppStyles } from './ui-style-module.js'
import type { MenuItem, ViewSource } from '../domain/view-navigation.js'

@customElement('multi-view-app')
export class MultiViewApp extends LitElement {
  private readonly menuItems: ReadonlyArray<MenuItem> = Object.freeze([
    { id: 'label-feature', label: 'Label Feature' },
    { id: 'circle-shape', label: 'Circle Shape' },
    { id: 'rectangle-shape', label: 'Rectangle Shape' },
    { id: 'triangle-shape', label: 'Triangle Shape' },
    { id: 'line-shape', label: 'Line Shape' },
    { id: 'knob-shape', label: 'Knob Shape' },
    { id: 'triangle-indicator-knob', label: 'Triangle Indicator Knob' },
    { id: 'property-panel', label: 'Property Panel' },
    { id: 'web-card', label: 'Web Card' },
    { id: 'dual-sector-shape', label: 'Dual Sector Shape' },
    { id: 'distrbuted-distribution', label: 'Path Distribution' },
    { id: 'combined-demo', label: 'Combined Demo' },
    { id: 'circle-label-distribution', label: 'Circle Label Distribution' },
    { id: 'svg-template-host', label: 'SVG Template Host' },
    { id: 'core-svg-fabric-products', label: 'Core SVG Fabric Products' },
  ])

  private readonly viewSources: ReadonlyArray<ViewSource> = Object.freeze([
    { id: 'label-feature', path: '/views/label-feature.html' },
    { id: 'circle-shape', path: '/views/circle-shape.html' },
    { id: 'rectangle-shape', path: '/views/rectangle-shape.html' },
    { id: 'triangle-shape', path: '/views/triangle-shape.html' },
    { id: 'line-shape', path: '/views/line-shape.html' },
    { id: 'knob-shape', path: '/views/knob-shape.html' },
    {
      id: 'triangle-indicator-knob',
      path: '/views/triangle-indicator-knob.html',
    },
    { id: 'property-panel', path: '/views/property-panel.html' },
    { id: 'web-card', path: '/views/web-card.html' },
    { id: 'dual-sector-shape', path: '/views/dual-sector-shape.html' },
    {
      id: 'distrbuted-distribution',
      path: '/views/distrbuted-distribution.html',
    },
    { id: 'combined-demo', path: '/views/combined-demo.html' },
    {
      id: 'circle-label-distribution',
      path: '/views/circle-label-distribution.html',
    },
    { id: 'svg-template-host', path: '/views/svg-template-host.html' },
    {
      id: 'core-svg-fabric-products',
      path: '/views/core-svg-fabric-products.html',
    },
  ])

  render() {
    return html`
      <main>
        <view-menu .items=${this.menuItems} active-view="label-feature">
          <current-view-presenter
            slot="presenter"
            .views=${this.viewSources}
            active-view="label-feature"
          ></current-view-presenter>
        </view-menu>
      </main>
    `
  }

  static styles = multiViewAppStyles
}

declare global {
  interface HTMLElementTagNameMap {
    'multi-view-app': MultiViewApp
  }
}
