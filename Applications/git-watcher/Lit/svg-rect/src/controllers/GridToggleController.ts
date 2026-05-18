import type { ReactiveController, LitElement } from "lit";
import { GRID_TOGGLE_EVENT, type GridToggleDetail } from "../events/grid-events";
import type { SvgCanvas } from "../svgs/SvgCanvas";

export class GridToggleController implements ReactiveController {
  private latestEnabled: boolean | undefined;

  public constructor(
    private readonly host: LitElement,
    private readonly getCanvas: () => SvgCanvas | undefined
  ) {
    host.addController(this);
  }

  hostConnected(): void {
    window.addEventListener(GRID_TOGGLE_EVENT, this.onToggle as EventListener);
  }

  hostDisconnected(): void {
    window.removeEventListener(GRID_TOGGLE_EVENT, this.onToggle as EventListener);
  }

  public applyBufferedState(): void {
    const canvas = this.getCanvas();
    if (!canvas) return;
    canvas.grid.setEnabled(this.latestEnabled ?? true);
  }

  private readonly onToggle = (e: Event) => {
    const ev = e as CustomEvent<GridToggleDetail>;
    const enabled = ev.detail?.enabled;
    if (typeof enabled !== "boolean") return;

    this.latestEnabled = enabled;

    const canvas = this.getCanvas();
    if (canvas) {
      canvas.grid.setEnabled(enabled);
      this.host.requestUpdate();
    }
  };
}
