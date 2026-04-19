import { LitElement, css, html, type TemplateResult } from "lit";
import type { CanvasObjectKind } from "../canvas-object/value-objects/CanvasObjectKind.js";
import { CanvasObjectKinds } from "../canvas-object/value-objects/CanvasObjectKind.js";
import { MenuShapeCatalog, type IMenuShapeItem } from "../menu/MenuShapeCatalog.js";
import type { IDragPayloadCodec } from "../drag-drop/contracts/IDragPayloadCodec.js";
import type { IMenuShapeDragPayload } from "../drag-drop/codecs/DragPayloadCodec.js";
import { MenuShapeDragPayloadCodec } from "../drag-drop/codecs/DragPayloadCodec.js";

export class MyMenu extends LitElement {
    public static override readonly properties = {
        cellWidth: { type: Number, attribute: "cell-width" },
        cellHeight: { type: Number, attribute: "cell-height" },
        dragPayloadCodec: { attribute: false }
    };

    public cellWidth = 96;
    public cellHeight = 96;
    public dragPayloadCodec: IDragPayloadCodec<IMenuShapeDragPayload> = new MenuShapeDragPayloadCodec();

    protected override render(): TemplateResult {
        return html`
            <aside class="menu">
                <div class="menu-header">
                    <h2>Shapes</h2>
                </div>

                <ul class="menu-stack">
                    ${MenuShapeCatalog.map((item) => this.renderItem(item))}
                </ul>
            </aside>
        `;
    }

    private renderItem(item: IMenuShapeItem): TemplateResult {
        return html`
            <li
                class="menu-list-item"
                draggable="true"
                @dragstart=${(event: DragEvent) => this.handleDragStart(event, item.kind)}>
                <button class="menu-item" type="button" title="${item.title}">
                    <span class="icon-frame" style=${`width:${this.cellWidth}px;height:${this.cellHeight}px;`}>
                        ${this.renderIcon(item)}
                    </span>
                    <span class="label">${item.title}</span>
                </button>
            </li>
        `;
    }

    private renderIcon(item: IMenuShapeItem): TemplateResult {
        switch (item.kind) {
            case CanvasObjectKinds.rectangle:
                return html`
                    <svg viewBox="0 0 100 100" aria-hidden="true">
                        <rect x="18" y="28" width="64" height="44" fill="${item.fill}" stroke="#1f1f1f" stroke-width="4"></rect>
                    </svg>
                `;

            case CanvasObjectKinds.circle:
                return html`
                    <svg viewBox="0 0 100 100" aria-hidden="true">
                        <circle cx="50" cy="50" r="28" fill="${item.fill}" stroke="#1f1f1f" stroke-width="4"></circle>
                    </svg>
                `;

            case CanvasObjectKinds.triangle:
                return html`
                    <svg viewBox="0 0 100 100" aria-hidden="true">
                        <polygon points="50,16 84,80 16,80" fill="${item.fill}" stroke="#1f1f1f" stroke-width="4"></polygon>
                    </svg>
                `;

            case CanvasObjectKinds.diamond:
                return html`
                    <svg viewBox="0 0 100 100" aria-hidden="true">
                        <polygon points="50,14 84,50 50,86 16,50" fill="${item.fill}" stroke="#1f1f1f" stroke-width="4"></polygon>
                    </svg>
                `;
        }
    }

    private handleDragStart(event: DragEvent, kind: CanvasObjectKind): void {
        if (event.dataTransfer === null) {
            return;
        }

        const payload = this.dragPayloadCodec.serialize({
            kind: "menu-shape",
            shapeKind: kind
        });

        event.dataTransfer.effectAllowed = "copy";
        event.dataTransfer.dropEffect = "copy";
        event.dataTransfer.setData(this.dragPayloadCodec.mimeType, payload);
        event.dataTransfer.setData("text/plain", kind);
    }

    public static override styles = css`
        :host {
            display: block;
            width: 100%;
            height: 100%;
            min-width: 0;
            min-height: 0;
        }

        .menu {
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;
            min-width: 0;
            min-height: 0;
            background: rgba(15, 23, 42, 0.92);
        }

        .menu-header {
            flex: 0 0 auto;
            padding: 16px;
            border-bottom: 1px solid rgba(148, 163, 184, 0.18);
        }

        .menu-header h2 {
            margin: 0;
            color: #e2e8f0;
            font-size: 1rem;
            font-weight: 600;
        }

        .menu-stack {
            flex: 1 1 auto;
            min-height: 0;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 12px;
            padding: 16px;
            margin: 0;
            list-style: none;
        }

        .menu-list-item {
            display: block;
        }

        .menu-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 10px;
            width: 100%;
            padding: 14px 12px;
            border: 1px solid rgba(148, 163, 184, 0.25);
            border-radius: 12px;
            background: rgba(30, 41, 59, 0.85);
            cursor: grab;
        }

        .menu-item:hover {
            border-color: rgba(96, 165, 250, 0.7);
            background: rgba(37, 99, 235, 0.16);
        }

        .icon-frame {
            display: grid;
            place-items: center;
            flex: 0 0 auto;
            max-width: 100%;
        }

        .icon-frame svg {
            width: 70%;
            height: 70%;
            display: block;
        }

        .label {
            color: #cbd5e1;
            font-size: 0.92rem;
            font-weight: 500;
            text-align: center;
        }
    `;
}

if (!customElements.get("my-menu")) {
    customElements.define("my-menu", MyMenu);
}
