import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";

@customElement("app-view-2")
export class AppView2 extends LitElement {
    @state()
    private items = [
        { id: 1, name: "Overview", description: "System overview and statistics" },
        { id: 2, name: "Analytics", description: "Performance metrics and analytics" },
        { id: 3, name: "Settings", description: "Configuration and preferences" },
    ];

    override render() {
        return html`
            <div class="container">
                <header class="header">
                    <h1>Dashboard</h1>
                    <p>Welcome to AppView2 - Pure View Component</p>
                </header>
                
                <section class="content">
                    <div class="cards">
                        ${this.items.map(
                            (item) => html`
                                <div class="card">
                                    <h3>${item.name}</h3>
                                    <p>${item.description}</p>
                                    <button @click=${() => this.onItemClick(item.id)}>
                                        Learn More
                                    </button>
                                </div>
                            `
                        )}
                    </div>
                </section>
            </div>
        `;
    }

    private onItemClick(id: number): void {
        console.log(`Clicked item: ${id}`);
    }

    static override styles = css`
        :host {
            display: block;
            width: 100%;
            height: 100%;
            color: #11243d;
            font-family: "Segoe UI", sans-serif;
        }

        .container {
            display: flex;
            flex-direction: column;
            height: 100%;
            padding: 0;
        }

        .header {
            padding: 32px;
            background: 
                radial-gradient(circle at top, rgba(210, 227, 243, 0.9), transparent 50%),
                linear-gradient(180deg, rgba(235, 244, 252, 0.95) 0%, rgba(219, 230, 239, 0.95) 100%);
            border-bottom: 1px solid rgba(76, 107, 143, 0.2);
            color: #11243d;
        }

        .header h1 {
            margin: 0 0 8px 0;
            font-size: 32px;
            font-weight: 600;
            color: #18385a;
        }

        .header p {
            margin: 0;
            color: #4c6b8f;
            font-size: 16px;
        }

        .content {
            flex: 1;
            padding: 32px;
            overflow-y: auto;
        }

        .cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
        }

        .card {
            background: rgba(255, 255, 255, 0.7);
            border-radius: 10px;
            padding: 24px;
            border: 1px solid rgba(76, 107, 143, 0.2);
            box-shadow: 0 2px 8px rgba(24, 56, 90, 0.08);
            transition: all 0.2s ease;
            backdrop-filter: blur(8px);
        }

        .card:hover {
            background: rgba(255, 255, 255, 0.9);
            border-color: rgba(76, 107, 143, 0.3);
            box-shadow: 0 8px 16px rgba(24, 56, 90, 0.12);
            transform: translateY(-2px);
        }

        .card h3 {
            margin: 0 0 8px 0;
            font-size: 20px;
            font-weight: 600;
            color: #18385a;
        }

        .card p {
            margin: 0 0 16px 0;
            color: #4c6b8f;
            font-size: 14px;
            line-height: 1.5;
        }

        .card button {
            padding: 10px 16px;
            background: linear-gradient(180deg, rgba(76, 107, 143, 0.8) 0%, rgba(60, 85, 115, 0.8) 100%);
            color: white;
            border: 1px solid rgba(76, 107, 143, 0.4);
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .card button:hover {
            background: linear-gradient(180deg, rgba(76, 107, 143, 1) 0%, rgba(60, 85, 115, 1) 100%);
            border-color: rgba(76, 107, 143, 0.6);
            box-shadow: 0 4px 8px rgba(24, 56, 90, 0.2);
        }

        .card button:active {
            transform: scale(0.98);
        }
    `;
}
