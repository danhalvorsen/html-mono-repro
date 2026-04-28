// SimpleGraphVisualizationCanvas: renders the graph using the center-circle visualizer
// import { html, LitElement } from 'lit';
// import { CenterCircleGraphVisualizerElement } from '../rendering/CenterCircleGraphVisualizerElement';

class SimpleGraphVisualizationCanvas extends HTMLElement {
  private sceneValue: any;
  set scene(val: any) {
    this.sceneValue = val;
    this.render();
  }
  get scene() { return this.sceneValue; }

  connectedCallback() { this.render(); }

  render() {
    if (!this.sceneValue) return;
    const visualizer = document.createElement('mr-core-graph-center-circle-visualizer') as any;
    visualizer.scene = this.sceneValue;
    this.innerHTML = '';
    this.appendChild(visualizer);
  }
}

customElements.define('simple-graph-visualization-canvas', SimpleGraphVisualizationCanvas);