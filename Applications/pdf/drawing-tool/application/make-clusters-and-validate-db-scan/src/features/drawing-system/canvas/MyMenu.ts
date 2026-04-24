import { LitElement, css, html, type TemplateResult } from "lit";
import type { IDragPayloadCodec } from "../drag-drop/contracts/IDragPayloadCodec.js";
import type { IMenuShapeDragPayload } from "../drag-drop/codecs/DragPayloadCodec.js";
import { MenuShapeDragPayloadCodec } from "../drag-drop/codecs/DragPayloadCodec.js";
import { DrawingOperations, type DrawingOperation } from "../menu/OperationMenuCatalog.js";
import "./MyGraphicalObjectMenu.js";
import "./MyOperationsMenu.js";

type OperationInvokedEvent = CustomEvent<{
    operation?: DrawingOperation;
}>;

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
                    <h2>Menu</h2>
                </div>

                <div class="menu-content">
                    <my-graphical-object-menu
                        .cellWidth=${this.cellWidth}
                        .cellHeight=${this.cellHeight}
                        .dragPayloadCodec=${this.dragPayloadCodec}>
                    </my-graphical-object-menu>

                    <div class="menu-divider" role="separator" aria-label="Menu section divider"></div>

                    <my-operations-menu
                        .cellWidth=${this.cellWidth}
                        .cellHeight=${this.cellHeight}
                        @operation-invoked=${this.handleOperationInvoked}>
                    </my-operations-menu>
                </div>
            </aside>
        `;
    }

    private handleOperationInvoked(event: OperationInvokedEvent): void {
        event.stopPropagation();
        const operation = event.detail?.operation;
        if (operation === undefined) {
            return;
        }

        this.dispatchEvent(new CustomEvent("menu-operation-selected", {
            bubbles: true,
            composed: true,
            detail: {
                operation
            }
        }));

        if (operation === DrawingOperations.save) {
            this.dispatchEvent(new CustomEvent("save-menu-clicked", {
                bubbles: true,
                composed: true
            }));
            return;
        }

        if (operation === DrawingOperations.load) {
            this.dispatchEvent(new CustomEvent("load-menu-clicked", {
                bubbles: true,
                composed: true
            }));
            return;
        }

        if (operation === DrawingOperations.delete) {
            this.dispatchEvent(new CustomEvent("delete-menu-clicked", {
                bubbles: true,
                composed: true
            }));
        }
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
            padding: 10px 12px;
            border-bottom: 1px solid rgba(148, 163, 184, 0.18);
        }

        .menu-header h2 {
            margin: 0;
            color: #e2e8f0;
            font-size: 0.95rem;
            font-weight: 600;
        }

        .menu-content {
            flex: 1 1 auto;
            min-height: 0;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 4%;
            padding: 4%;
        }

        .menu-divider {
            height: 1px;
            width: 100%;
            background: linear-gradient(
                90deg,
                rgba(148, 163, 184, 0),
                rgba(148, 163, 184, 0.75),
                rgba(148, 163, 184, 0)
            );
        }
    `;
}

if (!customElements.get("my-menu")) {
    customElements.define("my-menu", MyMenu);
}
