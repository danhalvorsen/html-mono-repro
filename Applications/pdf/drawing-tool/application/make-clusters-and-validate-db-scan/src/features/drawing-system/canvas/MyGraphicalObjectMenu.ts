import { LitElement, css, html, type TemplateResult } from "lit";
import type { CanvasObjectKind } from "../canvas-object/value-objects/CanvasObjectKind.js";
import { CanvasObjectKinds } from "../canvas-object/value-objects/CanvasObjectKind.js";
import { GraphicalMenuCatalog, type IGraphicalMenuItem } from "../menu/GraphicalMenuCatalog.js";
import type { IDragPayloadCodec } from "../drag-drop/contracts/IDragPayloadCodec.js";
import type { IMenuShapeDragPayload } from "../drag-drop/codecs/DragPayloadCodec.js";
import { MenuShapeDragPayloadCodec } from "../drag-drop/codecs/DragPayloadCodec.js";

export class MyGraphicalObjectMenu extends LitElement {
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
            <section class="menu-group">
                <h3 class="menu-group-title">Graphical Objects</h3>
                <ul class="menu-grid">
                    ${GraphicalMenuCatalog.map((item) => this.renderItem(item))}
                </ul>
            </section>
        `;
    }

    private renderItem(item: IGraphicalMenuItem): TemplateResult {
        return html`
            <li class="menu-grid-item" draggable="true" @dragstart=${(event: DragEvent) => this.handleDragStart(event, item.kind)}>
                <button
                    class="menu-item"
                    type="button"
                    title="${item.title}">
                    <span class="icon-frame">
                        ${this.renderIcon(item)}
                    </span>
                </button>
            </li>
        `;
    }

    private renderIcon(item: IGraphicalMenuItem): TemplateResult {
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

            case CanvasObjectKinds.text:
                return html`
                    <svg viewBox="0 0 100 100" aria-hidden="true">
                        <rect x="16" y="16" width="68" height="68" fill="none" stroke="${item.fill}" stroke-width="4"></rect>
                        <text
                            x="50"
                            y="52"
                            fill="${item.fill}"
                            text-anchor="middle"
                            dominant-baseline="middle"
                            font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                            font-size="24"
                            font-weight="700">T</text>
                    </svg>
                `;

            default:
                return html``;
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
        }

        .menu-group {
            display: block;
        }

        .menu-group-title {
            margin: 0 0 6px 0;
            color: #e2e8f0;
            font-size: 0.85rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.04em;
        }

        .menu-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 4%;
            margin: 0;
            padding: 0;
            list-style: none;
        }

        .menu-grid-item {
            display: block;
            min-width: 0;
        }

        .menu-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 0;
            width: 100%;
            aspect-ratio: 1 / 1;
            padding: 0;
            border: 1px solid rgba(148, 163, 184, 0.25);
            border-radius: 6px;
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
            width: 84%;
            height: 84%;
            max-width: 100%;
            max-height: 100%;
        }

        .icon-frame svg {
            width: 100%;
            height: 100%;
            display: block;
        }
    `;
}

if (!customElements.get("my-graphical-object-menu")) {
    customElements.define("my-graphical-object-menu", MyGraphicalObjectMenu);
}
