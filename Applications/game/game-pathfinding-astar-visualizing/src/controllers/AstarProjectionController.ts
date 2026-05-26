import type { ReactiveController, ReactiveControllerHost } from "lit";
import type {
  AstarEngineStepEvent,
  GridSnapshot,
} from "../contracts/AstarVisualizerContracts.js";
import {
  DefaultGridDiffApplier,
  type IGridDiffApplier,
} from "../projection/DefaultGridDiffApplier.js";
import {
  DefaultGridStepProjector,
  type IGridStepProjector,
} from "../projection/DefaultGridStepProjector.js";

export interface IAstarProjectionHost extends ReactiveControllerHost {
  readonly gridSnapshot: GridSnapshot;
  setGridSnapshot(snapshot: GridSnapshot): void;
}

export class AstarProjectionController implements ReactiveController {
  private readonly host: IAstarProjectionHost;
  private readonly projector: IGridStepProjector;
  private readonly diffApplier: IGridDiffApplier;

  public constructor(
    host: IAstarProjectionHost,
    projector?: IGridStepProjector,
    diffApplier?: IGridDiffApplier,
  ) {
    this.host = host;
    this.projector = projector ?? new DefaultGridStepProjector();
    this.diffApplier = diffApplier ?? new DefaultGridDiffApplier();

    this.host.addController(this);
  }

  public applyStep(step: AstarEngineStepEvent): void {
    const diff = this.projector.project(step);
    const nextSnapshot = this.diffApplier.apply(this.host.gridSnapshot, diff);

    this.host.setGridSnapshot(nextSnapshot);
  }

  public reset(snapshot: GridSnapshot): void {
    this.host.setGridSnapshot(snapshot);
  }

  hostConnected(): void {
    // Lifecycle hook when controller is connected to host
  }

  hostDisconnected(): void {
    // Lifecycle hook when controller is disconnected from host
  }
}
