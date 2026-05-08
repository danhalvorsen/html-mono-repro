import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { DefaultWaterfallColumnLayout } from "../application/DefaultWaterfallColumnLayout";
import { DefaultFallingColumnMapper } from "../application/DefaultFallingColumnMapper";
import {
  PianoEventName,
  type TangentHoldEndDetail,
  type TangentHoldStartDetail
} from "../application/PianoEventContracts";
import "./piano-waterfall-column";
import "./falling-note-wc";

type LiveFallingNote = {
  id: string;
  column: number;
  startedAtMs: number;
  releasedAtMs?: number;
  holdMs?: number;
  topPx?: number;
  heightPx?: number;
};

type HoldStartEvent = CustomEvent<TangentHoldStartDetail>;
type HoldEndEvent = CustomEvent<TangentHoldEndDetail>;

@customElement("piano-waterfall")
export class PianoWaterfall extends LitElement {
  private readonly columnMapper = new DefaultFallingColumnMapper();
  private readonly columnLayout = new DefaultWaterfallColumnLayout();
  private readonly lastEventAtByColumn = new Map<number, number>();
  private lastGlobalEventAtMs = 0;
  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }

    .waterfall {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: linear-gradient(to bottom, rgba(18, 24, 38, 0.82), rgba(18, 24, 38, 0.2));
      border: 1px solid rgba(180, 190, 210, 0.35);
      border-radius: 8px 8px 0 0;
    }

    .columns {
      position: absolute;
      inset: 0;
      display: grid;
      height: 100%;
      width: 100%;
    }

  `;

  @property({ type: Number })
  octaves = 4;

  @property({ type: Number })
  noteFallMs = 9000;

  @property({ type: Number })
  minColumnEventGapMs = 90;

  @property({ type: Number })
  minGlobalEventGapMs = 12;

  @property({ attribute: false })
  liveNotes: LiveFallingNote[] = [];

  private rafId: number | null = null;
  private eventSource: EventTarget | null = null;
  private readonly onHoldStart = (event: Event) => {
    const now = performance.now();
    if (now - this.lastGlobalEventAtMs < this.minGlobalEventGapMs) return;

    const custom = event as HoldStartEvent;
    const note = custom.detail?.note;
    const octaveIndex = custom.detail?.octaveIndex;
    const holdId = custom.detail?.holdId;
    if (!note || octaveIndex === undefined || !holdId) return;
    const column = this.columnMapper.toColumn(note, octaveIndex);
    if (column === null) return;
    const columnRatios = this.columnLayout.getColumnWidthRatios(this.octaves);
    const columns = columnRatios.length;
    if (column >= columns) return;

    const lastColumnAt = this.lastEventAtByColumn.get(column) ?? -Infinity;
    if (now - lastColumnAt < this.minColumnEventGapMs) return;

    this.lastGlobalEventAtMs = now;
    this.lastEventAtByColumn.set(column, now);
    this.startHold(holdId, column);
  };
  private readonly onHoldEnd = (event: Event) => {
    const custom = event as HoldEndEvent;
    const holdId = custom.detail?.holdId;
    const holdMs = custom.detail?.holdMs ?? 0;
    if (!holdId) return;
    this.endHold(holdId, holdMs);
  };

  public startHold(id: string, column: number): void {
    this.liveNotes = [
      ...this.liveNotes.filter((n) => n.id !== id),
      { id, column, startedAtMs: performance.now() }
    ];
    this.ensureAnimationLoop();
  }

  public endHold(id: string, holdMs: number): void {
    this.liveNotes = this.liveNotes.map((n) =>
      n.id === id
        ? {
            ...n,
            holdMs,
            releasedAtMs: performance.now()
          }
        : n
    );
    this.ensureAnimationLoop();
  }

  private ensureAnimationLoop(): void {
    if (this.rafId !== null) return;
    const step = () => {
      this.requestUpdate();
      this.liveNotes = this.liveNotes.filter((n) => (n.topPx ?? -1) < 1_000_000);
      if (this.liveNotes.length > 0) {
        this.rafId = window.requestAnimationFrame(step);
      } else {
        this.rafId = null;
      }
    };
    this.rafId = window.requestAnimationFrame(step);
  }

  disconnectedCallback(): void {
    if (this.eventSource) {
      this.eventSource.removeEventListener(
        PianoEventName.TangentHoldStart,
        this.onHoldStart as EventListener
      );
      this.eventSource.removeEventListener(
        PianoEventName.TangentHoldEnd,
        this.onHoldEnd as EventListener
      );
      this.eventSource = null;
    }
    if (this.rafId !== null) {
      window.cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    super.disconnectedCallback();
  }

  connectedCallback(): void {
    super.connectedCallback();
    const source = this.closest("piano-root") ?? window;
    source.addEventListener(
      PianoEventName.TangentHoldStart,
      this.onHoldStart as EventListener
    );
    source.addEventListener(
      PianoEventName.TangentHoldEnd,
      this.onHoldEnd as EventListener
    );
    this.eventSource = source;
  }

  render() {
    const columnWidthRatios = this.columnLayout.getColumnWidthRatios(this.octaves);
    const columns = columnWidthRatios.length;
    const templateColumns = columnWidthRatios
      .map((ratio) => `${ratio * 100}%`)
      .join(" ");

    const now = performance.now();
    const waterfallHeight = this.getBoundingClientRect().height || 1;
    const speedPxPerMs = waterfallHeight / Math.max(1, this.noteFallMs);

    return html`
      <div class="waterfall" style="--columns:${columns}">
        <div class="columns" style="grid-template-columns: ${templateColumns}">
          ${Array.from(
            { length: columns },
            (_, index) =>
              html`<column-wc .index=${index}></column-wc>`
          )}
        </div>

        ${this.liveNotes.map((note) => {
          const elapsedMs = Math.max(0, now - note.startedAtMs);
          const elapsed = note.holdMs ?? Math.max(0, now - note.startedAtMs);
          const dynamicHeight = Math.max(10, (elapsed / 1000) * 120);
          const topPx = elapsedMs * speedPxPerMs;
          const leftRatio =
            this.columnLayout.getColumnStartRatio(note.column, this.octaves) ?? 0;
          const widthRatio =
            this.columnLayout.getColumnWidthRatio(note.column, this.octaves) ?? 0;
          const leftPercent = leftRatio * 100;
          const widthPercent = widthRatio * 100;

          note.topPx = topPx;
          note.heightPx = dynamicHeight;
          if (topPx >= waterfallHeight + dynamicHeight) {
            note.topPx = 1_000_000;
          }
          return html`
            <falling-note-wc
              .leftPercent=${leftPercent}
              .widthPercent=${widthPercent}
              .topPx=${topPx}
              .heightPx=${dynamicHeight}
            ></falling-note-wc>
          `;
        })}
      </div>
    `;
  }
}
