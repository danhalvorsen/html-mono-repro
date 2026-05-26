import { LitElement, css, html } from "lit";
import { AstarDomEventNames } from "../contracts/AstarVisualizerContracts.js";
import { dispatchAstarEvent } from "../events/dispatchAstarEvent.js";

export class AstarToolboxElement extends LitElement {
  public static override readonly styles = css`
    :host {
      display: block;
      font-family: "Segoe UI", Tahoma, sans-serif;
    }

    .panel {
      display: grid;
      gap: 0.5rem;
      padding: 0.625rem;
      border: 1px solid #cfd8ea;
      border-radius: 10px;
      background: linear-gradient(180deg, #f9fbff 0%, #f2f6ff 100%);
      box-shadow: 0 1px 2px rgba(20, 34, 66, 0.08);
      min-width: 250px;
    }

    .title {
      font-size: 0.8rem;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: #405171;
      font-weight: 700;
    }

    .toolbox {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      flex-wrap: wrap;
    }

    .tool {
      font: inherit;
      border: 1px solid transparent;
      border-radius: 8px;
      padding: 0.45rem 0.65rem;
      cursor: grab;
      font-weight: 700;
      user-select: none;
      transition: transform 120ms ease, box-shadow 120ms ease, filter 120ms ease;
      box-shadow: 0 1px 2px rgba(15, 25, 50, 0.12);
    }

    .tool:active {
      cursor: grabbing;
      transform: scale(0.98);
    }

    .tool:hover {
      filter: brightness(1.02);
      box-shadow: 0 3px 8px rgba(15, 25, 50, 0.18);
    }

    .start {
      color: #0b4720;
      background: #b9f7c8;
      border-color: #74d88d;
    }

    .goal {
      color: #5e1115;
      background: #ffc1c1;
      border-color: #f08f93;
    }

    .wall {
      color: #f3f6ff;
      background: #2e3a52;
      border-color: #44506b;
    }

    .wall-25 {
      color: #0d0d0d;
      background: #e5e5e5;
      border-color: #cfcfcf;
    }

    .wall-50 {
      color: #111111;
      background: #b8b8b8;
      border-color: #9d9d9d;
    }

    .wall-75 {
      color: #f0f0f0;
      background: #7a7a7a;
      border-color: #646464;
    }

    .wall-100 {
      color: #f7f7f7;
      background: #3a3a3a;
      border-color: #2e2e2e;
    }
  `;

  protected override render() {
    return html`
      <div class="panel">
        <div class="title">Drag To Grid</div>
        <div class="toolbox">
          <button class="tool start" type="button" draggable="true" @dragstart=${this.onDragStart("start")}>Start</button>
          <button class="tool goal" type="button" draggable="true" @dragstart=${this.onDragStart("goal")}>Goal</button>
          <button class="tool wall-25" type="button" draggable="true" @dragstart=${this.onDragStart("wall-25")}>Wall 25</button>
          <button class="tool wall-50" type="button" draggable="true" @dragstart=${this.onDragStart("wall-50")}>Wall 50</button>
          <button class="tool wall-75" type="button" draggable="true" @dragstart=${this.onDragStart("wall-75")}>Wall 75</button>
          <button class="tool wall-100" type="button" draggable="true" @dragstart=${this.onDragStart("wall-100")}>Wall 100</button>
        </div>
      </div>
    `;
  }

  private onDragStart = (obstacleType: string) => (event: DragEvent): void => {

    if (event.dataTransfer !== null) {
      event.dataTransfer.setData("text/plain", obstacleType);
    }

    dispatchAstarEvent(this, AstarDomEventNames.ObstacleTypeSelected, {
      obstacleType,
    });
  };
}

if (!customElements.get("astar-toolbox")) {
  customElements.define("astar-toolbox", AstarToolboxElement);
}

declare global {
  interface HTMLElementTagNameMap {
    "astar-toolbox": AstarToolboxElement;
  }
}
