import { LitElement, css, html, type TemplateResult } from "lit";
import type { IDrawingSystemServices } from "../composition/DrawingSystemServices.js";
import { createDrawingSystemServices } from "../composition/createDrawingSystemServices.js";
import "./MyCanvas.js";

export class MyDrawingSystem extends LitElement {
    private readonly services: IDrawingSystemServices;

    public constructor() {
        super();
        this.services = createDrawingSystemServices();
    }

    protected override render(): TemplateResult {
        return html`
            <my-canvas
                .cellWidth=${96}
                .cellHeight=${96}
                .services=${this.services}>
            </my-canvas>
        `;
    }

    public static override styles = css`
        :host {
            display: block;
            width: 100vw;
            height: 100vh;
            margin: 0;
            padding: 0;
            overflow: hidden;
            color: #e5e7eb;
            box-sizing: border-box;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        my-canvas {
            display: block;
            width: 100%;
            height: 100%;
        }
    `;
}

if (!customElements.get("my-drawing-system")) {
    customElements.define("my-drawing-system", MyDrawingSystem);
}
