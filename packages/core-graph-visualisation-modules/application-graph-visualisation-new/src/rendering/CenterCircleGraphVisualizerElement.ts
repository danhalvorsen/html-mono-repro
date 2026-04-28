// CenterCircleGraphVisualizerElement: custom element for center-circle mode
// import { LitElement, html, css } from 'lit';
// import { renderSimpleGraphSceneSvg } from './SimpleGraphSceneSvgRenderer';

class CenterCircleGraphVisualizerElement extends HTMLElement {
  private sceneValue: any;
  set scene(val: any) {
    this.sceneValue = val;
    this.render();
  }
  get scene() { return this.sceneValue; }

  connectedCallback() { this.render(); }

  render() {
    if (!this.sceneValue) return;
    // Import directly instead of window
    // @ts-ignore
    const { renderSimpleGraphSceneSvg } = require('./SimpleGraphSceneSvgRenderer');
    this.innerHTML = renderSimpleGraphSceneSvg
      ? renderSimpleGraphSceneSvg(this.sceneValue)
      : '<!-- scene not available -->';
  }
}

customElements.define('mr-core-graph-center-circle-visualizer', CenterCircleGraphVisualizerElement);
