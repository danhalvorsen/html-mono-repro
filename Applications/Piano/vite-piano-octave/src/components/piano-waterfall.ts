import { LitElement, css, html, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import {
  DefaultWaterfallColumnLayout,
  type WaterfallColumnLayoutItem
} from "../application/DefaultWaterfallColumnLayout";
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
  public static override styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      pointer-events: none;
      box-sizing: border-box;
    }

    .waterfall {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      box-sizing: border-box;
      background: linear-gradient(
        to bottom,
        rgba(18, 24, 38, 0.82),
        rgba(18, 24, 38, 0.2)
      );
      border: 1px solid rgba(180, 190, 210, 0.35);
      border-radius: 8px 8px 0 0;
    }

    .columns {
      position: absolute;
      inset: 0;
      height: 100%;
      width: 100%;
    }

    column-wc {
      position: absolute;
      top: 0;
      height: 100%;
    }
  `;

  @property({ type: Number })
  public octaves = 4;

  @property({ type: Number })
  public noteFallMs = 9000;

  @property({ type: Number })
  public minColumnEventGapMs = 90;

  @property({ type: Number })
  public minGlobalEventGapMs = 12;

  @property({ attribute: false })
  public liveNotes: LiveFallingNote[] = [];

  private readonly columnMapper = new DefaultFallingColumnMapper();
  private readonly columnLayout = new DefaultWaterfallColumnLayout();
  private readonly lastEventAtByColumn = new Map<number, number>();
  private lastGlobalEventAtMs = 0;
  private rafId: number | null = null;
  private eventSource: EventTarget | null = null;

  private readonly onHoldStart = (event: Event): void => {
    const now = performance.now();

    if (now - this.lastGlobalEventAtMs < this.minGlobalEventGapMs) {
      return;
    }

    const custom = event as HoldStartEvent;
    const note = custom.detail?.note;
    const octaveIndex = custom.detail?.octaveIndex;
    const holdId = custom.detail?.holdId;

    if (!note || octaveIndex === undefined || !holdId) {
      return;
    }

    const column = this.columnMapper.toColumn(note, octaveIndex);

    if (column === null) {
      return;
    }

    if (this.columnLayout.getColumnLayoutItem(column, this.octaves) === null) {
      return;
    }

    const lastColumnAt = this.lastEventAtByColumn.get(column) ?? -Infinity;

    if (now - lastColumnAt < this.minColumnEventGapMs) {
      return;
    }

    this.lastGlobalEventAtMs = now;
    this.lastEventAtByColumn.set(column, now);
    this.startHold(holdId, column);
  };

  private readonly onHoldEnd = (event: Event): void => {
    const custom = event as HoldEndEvent;
    const holdId = custom.detail?.holdId;
    const holdMs = custom.detail?.holdMs ?? 0;

    if (!holdId) {
      return;
    }

    this.endHold(holdId, holdMs);
  };

  public override connectedCallback(): void {
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

  public override disconnectedCallback(): void {
    if (this.eventSource !== null) {
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

  public startHold(id: string, column: number): void {
    this.liveNotes = [
      ...this.liveNotes.filter((note) => note.id !== id),
      { id, column, startedAtMs: performance.now() }
    ];

    this.ensureAnimationLoop();
  }

  public endHold(id: string, holdMs: number): void {
    this.liveNotes = this.liveNotes.map((note) =>
      note.id === id
        ? {
            ...note,
            holdMs,
            releasedAtMs: performance.now()
          }
        : note
    );

    this.ensureAnimationLoop();
  }

  protected override render(): TemplateResult {
    const columnItems = this.columnLayout.getColumnLayoutItems(this.octaves);
    const now = performance.now();
    const waterfallHeight = this.getBoundingClientRect().height || 1;
    const speedPxPerMs = waterfallHeight / Math.max(1, this.noteFallMs);

    return html`
      <div class="waterfall">
        <div class="columns">
          ${columnItems.map((item) => this.renderColumn(item))}
        </div>

        ${this.liveNotes.map((note) =>
          this.renderFallingNote(note, now, waterfallHeight, speedPxPerMs)
        )}
      </div>
    `;
  }

  private renderColumn(item: WaterfallColumnLayoutItem): TemplateResult {
    return html`
      <column-wc
        style="
          left: ${item.leftPercent}%;
          width: ${item.widthPercent}%;
        "
        .index=${item.column}
      ></column-wc>
    `;
  }

  private renderFallingNote(
    note: LiveFallingNote,
    now: number,
    waterfallHeight: number,
    speedPxPerMs: number
  ): TemplateResult {
    const elapsedMs = Math.max(0, now - note.startedAtMs);
    const elapsed = note.holdMs ?? elapsedMs;
    const dynamicHeight = Math.max(10, (elapsed / 1000) * 120);
    const topPx = elapsedMs * speedPxPerMs;

    const item = this.columnLayout.getColumnLayoutItem(note.column, this.octaves);
    const leftPercent = item?.leftPercent ?? 0;
    const widthPercent = item?.widthPercent ?? 0;

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
  }

  private ensureAnimationLoop(): void {
    if (this.rafId !== null) {
      return;
    }

    const step = (): void => {
      this.requestUpdate();
      this.liveNotes = this.liveNotes.filter((note) => (note.topPx ?? -1) < 1_000_000);

      if (this.liveNotes.length > 0) {
        this.rafId = window.requestAnimationFrame(step);
        return;
      }

      this.rafId = null;
    };

    this.rafId = window.requestAnimationFrame(step);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "piano-waterfall": PianoWaterfall;
  }
}