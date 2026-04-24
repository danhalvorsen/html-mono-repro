import { LitElement, css, html, type TemplateResult } from "lit";
import { type DrawingOperation, OperationMenuCatalog, type IOperationMenuItem } from "../menu/OperationMenuCatalog.js";

export class MyOperationsMenu extends LitElement {
    public static override readonly properties = {
        cellWidth: { type: Number, attribute: "cell-width" },
        cellHeight: { type: Number, attribute: "cell-height" }
    };

    public cellWidth = 96;
    public cellHeight = 96;

    protected override render(): TemplateResult {
        return html`
            <section class="menu-group">
                <h3 class="menu-group-title">Operations</h3>
                <ul class="menu-grid">
                    ${OperationMenuCatalog.map((item) => this.renderItem(item))}
                </ul>
            </section>
        `;
    }

    private renderItem(item: IOperationMenuItem): TemplateResult {
        return html`
            <li class="menu-grid-item">
                <button
                    class="menu-item"
                    type="button"
                    title="${item.title}"
                    @click=${(event: MouseEvent) => this.handleOperationClick(event, item.operation)}>
                    <span class="icon-frame">
                        ${this.renderIcon(item)}
                    </span>
                </button>
            </li>
        `;
    }

    private renderIcon(item: IOperationMenuItem): TemplateResult {
        return html`
            <svg viewBox="0 0 100 100" aria-hidden="true">
                <rect x="14" y="30" width="72" height="40" rx="4" fill="${item.fill}" stroke="#1f1f1f" stroke-width="4"></rect>
                <text
                    x="50"
                    y="54"
                    fill="#0f172a"
                    text-anchor="middle"
                    dominant-baseline="middle"
                    font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                    font-size="16"
                    font-weight="700">${item.title}</text>
            </svg>
        `;
    }

    private handleOperationClick(event: MouseEvent, operation: DrawingOperation): void {
        event.stopPropagation();
        this.dispatchEvent(new CustomEvent("operation-invoked", {
            bubbles: true,
            composed: true,
            detail: {
                operation
            }
        }));
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
            cursor: pointer;
        }

        .menu-item:hover {
            border-color: rgba(74, 222, 128, 0.7);
            background: rgba(34, 197, 94, 0.16);
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

if (!customElements.get("my-operations-menu")) {
    customElements.define("my-operations-menu", MyOperationsMenu);
}
