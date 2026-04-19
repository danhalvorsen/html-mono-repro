import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import { ViewManager, type ViewEntry } from "./views/ViewManager";
import { AppView1 } from "./views/AppView1/AppView1";
import { AppView2 } from "./views/AppView2/AppView2";

@customElement("graph-visualization-app")
export class MultiViewApp extends LitElement {
    private viewManager: ViewManager = new ViewManager();
    
    @state()
    private availableViews: ViewEntry[] = [];
    
    @state()
    private activeViewId: string = "";

    constructor() {
        super();
        this.initializeViews();
        this.viewManager.subscribe(() => this.updateActiveView());
    }

    private initializeViews(): void {
        const views: ViewEntry[] = [
            {
                id: "app-view-1",
                label: "Graph Visualization",
                component: AppView1,
            },
            {
                id: "app-view-2",
                label: "Dashboard",
                component: AppView2,
            },
        ];

        views.forEach(view => this.viewManager.registerView(view));
        this.availableViews = this.viewManager.getAllViews();

        // Set first view as default
        if (this.availableViews.length > 0) {
            this.viewManager.setActiveView(this.availableViews[0].id);
        }
    }

    private updateActiveView(): void {
        const activeView = this.viewManager.getActiveView();
        if (activeView) {
            this.activeViewId = activeView.id;
        }
        this.requestUpdate();
    }

    override render() {
        const activeView = this.viewManager.getActiveView();

        if (!activeView) {
            return html`<div>No view selected</div>`;
        }

        return html`
            <div class="multiview-container">
                <aside class="view-sidebar">
                    <div class="sidebar-header">Views</div>
                    <nav class="view-selector">
                        ${this.availableViews.map((view) =>
                            html`
                                <button
                                    class="view-button ${view.id === this.activeViewId ? "active" : ""}"
                                    @click=${() => this.viewManager.setActiveView(view.id)}
                                >
                                    ${view.label}
                                </button>
                            `
                        )}
                    </nav>
                </aside>
                <main class="view-content">
                    ${this.renderActiveView(activeView.id)}
                </main>
            </div>
        `;
    }

    private renderActiveView(activeViewId: string) {
        switch (activeViewId) {
            case "app-view-1":
                return html`<app-view-1></app-view-1>`;
            case "app-view-2":
                return html`<app-view-2></app-view-2>`;
            default:
                return html`<div>Unknown view: ${activeViewId}</div>`;
        }
    }

    static override styles = css`
        :host {
            display: block;
            height: 100%;
            width: 100%;
            color: #11243d;
            font-family: "Segoe UI", sans-serif;
        }

        .multiview-container {
            display: flex;
            flex-direction: row;
            height: 100%;
            width: 100%;
        }

        .view-sidebar {
            display: flex;
            flex-direction: column;
            width: 240px;
            background: rgba(255, 255, 255, 0.5);
            border-right: 1px solid rgba(76, 107, 143, 0.2);
            backdrop-filter: blur(8px);
            overflow-y: auto;
        }

        .sidebar-header {
            padding: 16px;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.16em;
            text-transform: uppercase;
            color: #4c6b8f;
            border-bottom: 1px solid rgba(76, 107, 143, 0.15);
        }

        .view-selector {
            display: flex;
            flex-direction: column;
            gap: 2px;
            padding: 8px;
        }

        .view-button {
            padding: 12px 16px;
            border: 1px solid rgba(76, 107, 143, 0.2);
            background: transparent;
            color: #24476f;
            cursor: pointer;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s ease;
            text-align: left;
            margin: 2px 0;
        }

        .view-button:hover {
            background: rgba(76, 107, 143, 0.08);
            border-color: rgba(76, 107, 143, 0.3);
        }

        .view-button.active {
            background: linear-gradient(180deg, rgba(210, 227, 243, 0.6) 0%, rgba(180, 210, 240, 0.5) 100%);
            color: #18385a;
            border-color: rgba(76, 107, 143, 0.4);
            font-weight: 600;
            box-shadow: inset 0 1px 2px rgba(76, 107, 143, 0.1);
        }

        .view-content {
            flex: 1;
            overflow: auto;
            display: flex;
        }

        .view-content > * {
            flex: 1;
            width: 100%;
        }
    `;
}
