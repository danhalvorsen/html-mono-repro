import type { ReactiveController, ReactiveControllerHost } from "lit";
import type {
  AstarEngineStepEvent,
  AstarStatus,
  GridSnapshot,
} from "../contracts/AstarVisualizerContracts.js";
import type { IAstarEnginePort } from "../ports/IAstarEnginePort.js";

export type PlaybackHandle = ReturnType<typeof setInterval>;

export interface IPlaybackScheduler {
  start(millisecondsPerStep: number, tick: () => void): PlaybackHandle;
  stop(handle: PlaybackHandle): void;
}

export class IntervalPlaybackScheduler implements IPlaybackScheduler {
  public start(millisecondsPerStep: number, tick: () => void): PlaybackHandle {
    return setInterval(tick, millisecondsPerStep);
  }

  public stop(handle: PlaybackHandle): void {
    clearInterval(handle);
  }
}

export interface IAstarPlaybackHost extends ReactiveControllerHost {
  readonly millisecondsPerStep: number;

  applyEngineStep(step: AstarEngineStepEvent): void;
  setStatus(status: AstarStatus): void;
}

export class AstarPlaybackController implements ReactiveController {
  private readonly host: IAstarPlaybackHost;
  private readonly scheduler: IPlaybackScheduler;
  private enginePort: IAstarEnginePort | null = null;
  private handle: PlaybackHandle | null = null;

  public constructor(
    host: IAstarPlaybackHost,
    scheduler?: IPlaybackScheduler,
  ) {
    this.host = host;
    this.scheduler = scheduler ?? new IntervalPlaybackScheduler();

    this.host.addController(this);
  }

  public setEnginePort(enginePort: IAstarEnginePort | null): void {
    this.enginePort = enginePort;
  }

  public play(): void {
    if (this.enginePort === null || this.handle !== null) {
      return;
    }

    this.host.setStatus("running");

    this.handle = this.scheduler.start(this.host.millisecondsPerStep, () => {
      this.step();
    });
  }

  public pause(): void {
    this.stopTimer();
    this.host.setStatus("paused");
  }

  public step(): void {
    if (this.enginePort === null) {
      this.stopTimer();
      this.host.setStatus("idle");
      return;
    }

    const step = this.enginePort.next();

    if (step === null) {
      this.stopTimer();
      this.host.setStatus("completed");
      return;
    }

    this.host.applyEngineStep(step);

    if (step.kind === "path-found" || step.kind === "no-path") {
      this.stopTimer();
    }
  }

  public reset(snapshot: GridSnapshot): void {
    this.stopTimer();
    this.enginePort?.reset(snapshot);
    this.host.setStatus("idle");
  }

  public setMillisecondsPerStep(): void {
    if (this.handle === null) {
      return;
    }

    this.stopTimer();

    this.handle = this.scheduler.start(this.host.millisecondsPerStep, () => {
      this.step();
    });
  }

  public hostDisconnected(): void {
    this.stopTimer();
  }

  private stopTimer(): void {
    if (this.handle === null) {
      return;
    }

    this.scheduler.stop(this.handle);
    this.handle = null;
  }
}
