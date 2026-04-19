// Applications/audio/UI/vite-project/src/controllers/OnPointerHoldFillTangentReactiveController.ts

import type { ReactiveController, ReactiveControllerHost } from 'lit';

export interface IOnPointerHoldFillTangentHost extends ReactiveControllerHost {
  fillColor: string;
  baseFillColor: string;
  targetFillColor: string;
  fillDurationMs: number;

  addEventListener(type: string, listener: EventListener, options?: AddEventListenerOptions | boolean): void;
  removeEventListener(type: string, listener: EventListener, options?: EventListenerOptions | boolean): void;
  setPointerCapture?(pointerId: number): void;
  releasePointerCapture?(pointerId: number): void;
}

interface IRgbColor {
  readonly red: number;
  readonly green: number;
  readonly blue: number;
}

export class OnPointerHoldFillTangentReactiveController implements ReactiveController {
  private readonly host: IOnPointerHoldFillTangentHost;

  private animationFrameId: number | null = null;
  private pressStartedAtMs: number | null = null;
  private pointerId: number | null = null;

  private readonly onPointerDown = ((event: PointerEvent) => {
    this.pointerId = event.pointerId;
    this.pressStartedAtMs = null;
    this.stopAnimation();

    if (typeof this.host.setPointerCapture === 'function') {
      this.host.setPointerCapture(event.pointerId);
    }

    this.animationFrameId = window.requestAnimationFrame((timestampMs) => {
      this.tick(timestampMs);
    });
  }) as EventListener;

  private readonly onPointerUp = ((event: PointerEvent) => {
    if (!this.isCurrentPointer(event)) {
      return;
    }

    this.releasePointer(event.pointerId);
    this.resetToBaseColor();
  }) as EventListener;

  private readonly onPointerCancel = ((event: PointerEvent) => {
    if (!this.isCurrentPointer(event)) {
      return;
    }

    this.releasePointer(event.pointerId);
    this.resetToBaseColor();
  }) as EventListener;

  private readonly onLostPointerCapture = ((event: PointerEvent) => {
    if (!this.isCurrentPointer(event)) {
      return;
    }

    this.releasePointer(event.pointerId);
    this.resetToBaseColor();
  }) as EventListener;

  public constructor(host: IOnPointerHoldFillTangentHost) {
    this.host = host;
    this.host.addController(this);
  }

  public hostConnected(): void {
    this.host.addEventListener('pointerdown', this.onPointerDown);
    this.host.addEventListener('pointerup', this.onPointerUp);
    this.host.addEventListener('pointercancel', this.onPointerCancel);
    this.host.addEventListener('lostpointercapture', this.onLostPointerCapture);
  }

  public hostDisconnected(): void {
    this.host.removeEventListener('pointerdown', this.onPointerDown);
    this.host.removeEventListener('pointerup', this.onPointerUp);
    this.host.removeEventListener('pointercancel', this.onPointerCancel);
    this.host.removeEventListener('lostpointercapture', this.onLostPointerCapture);

    this.stopAnimation();
  }

  public hostUpdate(): void {
    // intentionally empty
  }

  public hostUpdated(): void {
    // intentionally empty
  }

  private tick(timestampMs: number): void {
    if (this.pressStartedAtMs === null) {
      this.pressStartedAtMs = timestampMs;
    }

    const durationMs = this.guardDuration(this.host.fillDurationMs);
    const elapsedMs = timestampMs - this.pressStartedAtMs;
    const progress = Math.min(elapsedMs / durationMs, 1);

    const from = Color.parseHex(this.host.baseFillColor);
    const to = Color.parseHex(this.host.targetFillColor);

    this.host.fillColor = Color.toHex(Color.lerp(from, to, progress));
    this.host.requestUpdate();

    if (progress >= 1) {
      this.animationFrameId = null;
      return;
    }

    this.animationFrameId = window.requestAnimationFrame((nextTimestampMs) => {
      this.tick(nextTimestampMs);
    });
  }

  private resetToBaseColor(): void {
    this.stopAnimation();
    this.host.fillColor = this.host.baseFillColor;
    this.host.requestUpdate();
  }

  private releasePointer(pointerId: number): void {
    if (this.pointerId !== pointerId) {
      return;
    }

    if (typeof this.host.releasePointerCapture === 'function') {
      this.host.releasePointerCapture(pointerId);
    }

    this.pointerId = null;
    this.pressStartedAtMs = null;
  }

  private isCurrentPointer(event: PointerEvent): boolean {
    return this.pointerId !== null && event.pointerId === this.pointerId;
  }

  private stopAnimation(): void {
    if (this.animationFrameId === null) {
      return;
    }

    window.cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = null;
  }

  private guardDuration(value: number): number {
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error('fillDurationMs must be greater than zero.');
    }

    return value;
  }
}

class Color {
  public static parseHex(value: string): IRgbColor {
    const normalized = value.trim().replace('#', '');

    if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
      throw new Error(`Unsupported color "${value}". Expected #RRGGBB.`);
    }

    return Object.freeze({
      red: Number.parseInt(normalized.slice(0, 2), 16),
      green: Number.parseInt(normalized.slice(2, 4), 16),
      blue: Number.parseInt(normalized.slice(4, 6), 16)
    });
  }

  public static toHex(value: IRgbColor): string {
    return `#${this.toHexByte(value.red)}${this.toHexByte(value.green)}${this.toHexByte(value.blue)}`;
  }

  public static lerp(from: IRgbColor, to: IRgbColor, progress: number): IRgbColor {
    const clamped = Math.max(0, Math.min(1, progress));

    return Object.freeze({
      red: from.red + ((to.red - from.red) * clamped),
      green: from.green + ((to.green - from.green) * clamped),
      blue: from.blue + ((to.blue - from.blue) * clamped)
    });
  }

  private static toHexByte(value: number): string {
    return Math.max(0, Math.min(255, Math.round(value)))
      .toString(16)
      .padStart(2, '0');
  }
}