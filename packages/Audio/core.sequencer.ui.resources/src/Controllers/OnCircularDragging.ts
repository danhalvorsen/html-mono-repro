import { type ReactiveController, type ReactiveControllerHost } from "lit";

export type CircularDragDirection = "cw" | "ccw" | "none";

export interface IPoint2D {
  readonly x: number;
  readonly y: number;
}

export interface ICircularDragSample {
  readonly isDragging: boolean;
  readonly direction: CircularDragDirection;
  readonly angleRadians: number;
  readonly deltaRadians: number;
  readonly angularVelocity: number;
  readonly normalizedSpeed: number;
  readonly radius: number;
  readonly pointer: IPoint2D;
  readonly center: IPoint2D;
  readonly timestamp: number;
}

export interface IOnCircularDraggingOptions {
  readonly getCenter?: () => IPoint2D;
  readonly minRadius?: number;
  readonly maxAngularVelocity?: number;
  readonly onStart?: (sample: ICircularDragSample) => void;
  readonly onChange?: (sample: ICircularDragSample) => void;
  readonly onEnd?: (sample: ICircularDragSample) => void;
}

type ReactivePointerHost = ReactiveControllerHost & EventTarget & {
  readonly getBoundingClientRect?: () => DOMRect;
  readonly setPointerCapture?: (pointerId: number) => void;
  readonly releasePointerCapture?: (pointerId: number) => void;
};

const defaultCenter = Object.freeze({ x: 0, y: 0 });
const angularEpsilon = 1e-6;
const defaultMaxAngularVelocity = Math.PI * 4;

export class OnCircularDraggingController implements ReactiveController {
  private readonly host: ReactivePointerHost;
  private readonly options: IOnCircularDraggingOptions;
  private activePointerId: number | null = null;
  private lastAngleRadians: number | null = null;
  private lastTimestamp: number | null = null;
  private lastSample: ICircularDragSample = Object.freeze({
    isDragging: false,
    direction: "none",
    angleRadians: 0,
    deltaRadians: 0,
    angularVelocity: 0,
    normalizedSpeed: 0,
    radius: 0,
    pointer: defaultCenter,
    center: defaultCenter,
    timestamp: 0,
  });

  public constructor(
    host: ReactivePointerHost,
    options: IOnCircularDraggingOptions = {},
  ) {
    this.host = host;
    this.options = options;
    this.host.addController(this);
  }

  public get isDragging(): boolean {
    return this.lastSample.isDragging;
  }

  public get sample(): ICircularDragSample {
    return this.lastSample;
  }

  public hostConnected(): void {
    this.host.addEventListener("pointerdown", this.handlePointerDown as EventListener);
  }

  public hostDisconnected(): void {
    this.detachWindowListeners();
    this.host.removeEventListener("pointerdown", this.handlePointerDown as EventListener);
  }

  private readonly handlePointerDown = (event: PointerEvent): void => {
    if (this.activePointerId !== null) {
      return;
    }

    const pointerId = this.readPointerId(event);
    this.activePointerId = pointerId;
    this.host.setPointerCapture?.(pointerId);

    const sample = this.createSample(event, true);
    this.lastAngleRadians = sample.angleRadians;
    this.lastTimestamp = sample.timestamp;
    this.lastSample = sample;
    this.attachWindowListeners();
    this.options.onStart?.(sample);
    this.host.requestUpdate();
  };

  private readonly handlePointerMove = (event: PointerEvent): void => {
    if (this.activePointerId === null || this.readPointerId(event) !== this.activePointerId) {
      return;
    }

    const sample = this.createSample(event, true);
    this.lastAngleRadians = sample.angleRadians;
    this.lastTimestamp = sample.timestamp;
    this.lastSample = sample;
    this.options.onChange?.(sample);
    this.host.requestUpdate();
  };

  private readonly handlePointerUp = (event: PointerEvent): void => {
    if (this.activePointerId === null || this.readPointerId(event) !== this.activePointerId) {
      return;
    }

    const sample = this.createSample(event, false);
    this.lastSample = sample;
    this.options.onEnd?.(sample);
    this.host.releasePointerCapture?.(this.activePointerId);
    this.activePointerId = null;
    this.lastAngleRadians = null;
    this.lastTimestamp = null;
    this.detachWindowListeners();
    this.host.requestUpdate();
  };

  private attachWindowListeners(): void {
    window.addEventListener("pointermove", this.handlePointerMove);
    window.addEventListener("pointerup", this.handlePointerUp);
    window.addEventListener("pointercancel", this.handlePointerUp);
  }

  private detachWindowListeners(): void {
    window.removeEventListener("pointermove", this.handlePointerMove);
    window.removeEventListener("pointerup", this.handlePointerUp);
    window.removeEventListener("pointercancel", this.handlePointerUp);
  }

  private createSample(event: PointerEvent, isDragging: boolean): ICircularDragSample {
    const center = this.resolveCenter();
    const pointer = Object.freeze({
      x: event.clientX,
      y: event.clientY,
    });
    const dx = pointer.x - center.x;
    const dy = pointer.y - center.y;
    const radius = Math.sqrt((dx * dx) + (dy * dy));
    const angleRadians = Math.atan2(dy, dx);
    const previousAngle = this.lastAngleRadians ?? angleRadians;
    const previousTimestamp = this.lastTimestamp ?? this.readTimestamp(event);
    const timestamp = this.readTimestamp(event);
    const deltaRadians = this.normalizeAngle(angleRadians - previousAngle);
    const deltaSeconds = Math.max((timestamp - previousTimestamp) / 1000, 1 / 1000);
    const angularVelocity = Math.abs(deltaRadians) / deltaSeconds;
    const normalizedSpeed = this.normalizeSpeed(
      radius >= (this.options.minRadius ?? 0) ? angularVelocity : 0,
    );

    return Object.freeze({
      isDragging,
      direction: this.resolveDirection(deltaRadians, radius),
      angleRadians,
      deltaRadians,
      angularVelocity,
      normalizedSpeed,
      radius,
      pointer,
      center,
      timestamp,
    });
  }

  private resolveCenter(): IPoint2D {
    const explicitCenter = this.options.getCenter?.();
    if (explicitCenter) {
      return Object.freeze({ x: explicitCenter.x, y: explicitCenter.y });
    }

    const rect = this.host.getBoundingClientRect?.();
    if (!rect) {
      return defaultCenter;
    }

    return Object.freeze({
      x: rect.left + (rect.width / 2),
      y: rect.top + (rect.height / 2),
    });
  }

  private resolveDirection(
    deltaRadians: number,
    radius: number,
  ): CircularDragDirection {
    if (radius < (this.options.minRadius ?? 0) || Math.abs(deltaRadians) <= angularEpsilon) {
      return "none";
    }

    return deltaRadians > 0 ? "cw" : "ccw";
  }

  private normalizeSpeed(angularVelocity: number): number {
    const maxAngularVelocity = this.options.maxAngularVelocity ?? defaultMaxAngularVelocity;
    if (!Number.isFinite(maxAngularVelocity) || maxAngularVelocity <= 0) {
      return 0;
    }

    return Math.max(0, Math.min(1, angularVelocity / maxAngularVelocity));
  }

  private normalizeAngle(value: number): number {
    if (value > Math.PI) {
      return value - (Math.PI * 2);
    }

    if (value < -Math.PI) {
      return value + (Math.PI * 2);
    }

    return value;
  }

  private readPointerId(event: PointerEvent): number {
    return typeof event.pointerId === "number" ? event.pointerId : 1;
  }

  private readTimestamp(event: PointerEvent): number {
    return typeof event.timeStamp === "number" && Number.isFinite(event.timeStamp)
      ? event.timeStamp
      : performance.now();
  }
}

export class OnCircularDragging extends OnCircularDraggingController {}

export class OnCircularGestures extends OnCircularDraggingController {}
