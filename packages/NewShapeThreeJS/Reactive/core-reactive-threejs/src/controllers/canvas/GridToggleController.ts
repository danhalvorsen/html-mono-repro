import type {
  IEventReactiveHost,
  IReactiveController
} from "@monorepo/core-reactive-abstract";
import type { SvgCanvas } from "../../canvas/svgCanvas.js";
import type { GridToggleDetail } from "./GridToggleDetail.js";

export const GRID_TOGGLE_EVENT = "grid:toggle";

export class GridToggleController
  implements IReactiveController<IEventReactiveHost<unknown>> {

  private latestEnabled: boolean | undefined;

  private readonly onToggle = (e: Event): void => {
    const ev = e as CustomEvent<GridToggleDetail>;
    const enabled = ev.detail?.enabled;

    if (typeof enabled !== "boolean") {
      return;
    }

    this.latestEnabled = enabled;

    const canvas = this.getCanvas();
    if (!canvas) {
      return;
    }

    canvas.grid.setEnabled(enabled);
    this.host.requestUpdate();
  };

  public constructor(
    private readonly host: IEventReactiveHost<unknown>,
    private readonly getCanvas: () => SvgCanvas | undefined
  ) {
    this.host.addController(this);
  }

  public hostConnected(): void {
    this.host.addEventListener(GRID_TOGGLE_EVENT, this.onToggle as EventListener);
  }

  public hostDisconnected(): void {
    this.host.removeEventListener(GRID_TOGGLE_EVENT, this.onToggle as EventListener);
  }

  public applyBufferedState(): void {
    const canvas = this.getCanvas();
    if (!canvas) {
      return;
    }

    canvas.grid.setEnabled(this.latestEnabled ?? true);
  }
}