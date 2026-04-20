import { DashboardStateModel } from './dashboard-state-model.js';
 
export class DashboardApp {
  private readonly _model: DashboardStateModel;

  private readonly _rows: HTMLElement;
  private readonly _stat: HTMLElement;

  private readonly _maxRows: number;

  public constructor(maxRows: number) {
    this._model = new DashboardStateModel();

    this._rows = this.getRequired('requestRows');
    this._stat = this.getRequired('statRequests');

    this._maxRows = maxRows;
  }

  public async init(): Promise<void> {
    await this.loadInitial();
    this.startStream();
  }

  private async loadInitial(): Promise<void> {
    const res = await fetch('/api/request-log');
    const data = await res.json();

    const entries = Array.isArray(data?.data?.entries)
      ? data.data.entries
      : [];

    this.clearRows();
    this._model.reset();

    for (const e of entries) {
      this.prependRow(e, false);
    }

    this._model.setFromRowCount(this._rows.children.length);
    this.render();
  }

  private startStream(): void {
    const source = new EventSource('/api/request-stream');

    source.onmessage = (event) => {
      const parsed = JSON.parse(event.data);

      if (parsed?.type !== 'request' || !parsed?.entry) {
        return;
      }

      this.prependRow(parsed.entry, true);
    };
  }

  private prependRow(entry: unknown, increment: boolean): void {
    const e = this.normalize(entry);

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${e.receivedAt}</td>
      <td>${e.method}</td>
      <td>${e.path}</td>
      <td>${e.statusCode}</td>
    `;

    this._rows.prepend(row);

    while (this._rows.children.length > this._maxRows) {
      this._rows.removeChild(this._rows.lastElementChild as Node);
    }

    if (increment) {
      this._model.increment();
    }

    this.render();
  }

  private normalize(entry: unknown): {
    receivedAt: string;
    method: string;
    path: string;
    statusCode: string;
  } {
    const e = entry as any;

    return {
      receivedAt: String(e?.receivedAt ?? ''),
      method: String(e?.method ?? ''),
      path: String(e?.path ?? ''),
      statusCode: String(e?.statusCode ?? ''),
    };
  }

  private clearRows(): void {
    while (this._rows.children.length > 0) {
      this._rows.removeChild(this._rows.lastElementChild as Node);
    }
  }

  private render(): void {
    this._stat.textContent = String(this._model.requestCount);
  }

  private getRequired(id: string): HTMLElement {
    const el = document.getElementById(id);
    if (!el) {
      throw new Error(`Missing element: ${id}`);
    }
    return el;
  }
}

/* composition root */
const app = new DashboardApp(200);
void app.init();
