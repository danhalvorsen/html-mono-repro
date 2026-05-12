import { html, LitElement } from "lit";
import { SlotValidator } from "./Base/SlotValidator.ts";
import { BaseGameObjectMatcher } from "./Base/BaseGameObjectMatcher.ts";

type LinearTarget = Element & {
  positionX: number;
  positionY: number;
  options: unknown;
  shapeTemplate: unknown;
  getChildren: () => readonly Element[];
};

/**
 * Animates validated slotted targets along a line using velocity and acceleration.
 */
export class LinearAnimation extends LitElement {
  public static readonly tagName = "linear-animation";

  static properties = {
    startX: { type: Number },
    startY: { type: Number },
    endX: { type: Number },
    endY: { type: Number },
    initialVelocity: { type: Number },
    acceleration: { type: Number },
  };

  declare startX: number;
  declare startY: number;
  declare endX: number;
  declare endY: number;
  declare initialVelocity: number;
  declare acceleration: number;

  private targets: readonly LinearTarget[];
  private readonly slotValidator: SlotValidator<LinearTarget>;
  private startTimeSeconds: number | null;

  public constructor() {
    super();
    this.startX = 40;
    this.startY = 40;
    this.endX = 280;
    this.endY = 180;
    this.initialVelocity = 40;
    this.acceleration = 0;
    this.targets = [];
    this.startTimeSeconds = null;
    this.slotValidator = new SlotValidator(
      new BaseGameObjectMatcher(
        (element): element is LinearTarget =>
          "positionX" in element &&
          "positionY" in element &&
          "options" in element &&
          "shapeTemplate" in element &&
          "getChildren" in element &&
          typeof (element as { getChildren?: unknown }).getChildren === "function",
      ),
      "linear-animation slots only accept BaseGameObject elements.",
    );
  }

  public override connectedCallback(): void {
    super.connectedCallback();
    this.refreshTargets();
  }

  public onTimer(timeMs: number): void {
    const targetCount = this.targets.length;
    if (targetCount === 0) {
      return;
    }

    const timeSeconds = timeMs / 1000;
    if (this.startTimeSeconds === null) {
      this.startTimeSeconds = timeSeconds;
    }

    const elapsed = Math.max(0, timeSeconds - this.startTimeSeconds);
    const deltaX = this.endX - this.startX;
    const deltaY = this.endY - this.startY;
    const segmentLength = Math.hypot(deltaX, deltaY);

    if (segmentLength <= 0.000001) {
      for (const target of this.targets) {
        target.positionX = this.startX;
        target.positionY = this.startY;
      }
      return;
    }

    const traveledDistance =
      this.initialVelocity * elapsed + 0.5 * this.acceleration * elapsed * elapsed;
    const pathDistance = Math.max(0, traveledDistance);

    const cycleLength = segmentLength * 2;
    const distanceInCycle = pathDistance % cycleLength;
    const distanceAlongSegment =
      distanceInCycle <= segmentLength
        ? distanceInCycle
        : cycleLength - distanceInCycle;
    const ratio = distanceAlongSegment / segmentLength;

    const positionX = this.startX + deltaX * ratio;
    const positionY = this.startY + deltaY * ratio;

    for (const target of this.targets) {
      target.positionX = positionX;
      target.positionY = positionY;
    }
  }

  protected override render() {
    return html`
      <slot @slotchange=${this.onSlotChange}></slot>
      <slot name="children" @slotchange=${this.onSlotChange}></slot>
    `;
  }

  private readonly onSlotChange = (): void => {
    this.refreshTargets();
  };

  private refreshTargets(): void {
    const defaultSlot = this.renderRoot.querySelector(
      "slot:not([name])",
    ) as HTMLSlotElement | null;
    const childrenSlot = this.renderRoot.querySelector(
      'slot[name="children"]',
    ) as HTMLSlotElement | null;
    const defaultElements = defaultSlot
      ? defaultSlot.assignedElements({ flatten: true })
      : [];
    const childrenElements = childrenSlot
      ? childrenSlot.assignedElements({ flatten: true })
      : [];

    this.targets = this.slotValidator.validateAndGetTargets([
      ...defaultElements,
      ...childrenElements,
    ]);
  }
}

if (!customElements.get(LinearAnimation.tagName)) {
  customElements.define(LinearAnimation.tagName, LinearAnimation);
}
