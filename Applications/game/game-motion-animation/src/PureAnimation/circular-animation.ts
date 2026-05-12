import { html, LitElement } from "lit";
import { BaseGameObjectMatcher } from "./Base/BaseGameObjectMatcher.ts";
import { SlotValidator } from "./Base/SlotValidator.ts";

type CircularTarget = Element & {
  positionX: number;
  positionY: number;
  options: unknown;
  shapeTemplate: unknown;
  getChildren: () => readonly Element[];
};

/**
 * Animates validated slotted targets on a circular path using scheduler time ticks.
 */
export class CircularAnimation extends LitElement {
  public static readonly tagName = "circular-animation";

  static properties = {
    centerX: { type: Number },
    centerY: { type: Number },
    radius: { type: Number },
    frequencyHz: { type: Number },
  };

  declare centerX: number;
  declare centerY: number;
  declare radius: number;
  declare frequencyHz: number;
  private targets: readonly CircularTarget[];
  private readonly slotValidator: SlotValidator<CircularTarget>;

  constructor() {
    super();
    this.centerX = 120;
    this.centerY = 120;
    this.radius = 70;
    this.frequencyHz = 0.5;
    this.targets = [];
    this.slotValidator = new SlotValidator(
      new BaseGameObjectMatcher(
        (element): element is CircularTarget =>
          "positionX" in element &&
          "positionY" in element &&
          "options" in element &&
          "shapeTemplate" in element &&
          "getChildren" in element &&
          typeof (element as { getChildren?: unknown }).getChildren === "function",
      ),
      "circular-animation slots only accept BaseGameObject elements.",
    );
  }

  public override connectedCallback(): void {
    super.connectedCallback();
    this.refreshTargets();
  }

  public onTimer(time: number): void {
    const count = this.targets.length;
    if (count === 0) {
      return;
    }

    const timeSeconds = time / 1000;
    const angularVelocity = 2 * Math.PI * this.frequencyHz;

    for (let index = 0; index < count; index += 1) {
      const target = this.targets[index];
      if (target === undefined) {
        continue;
      }

      const phaseOffset = (index / count) * (2 * Math.PI);
      const angle = timeSeconds * angularVelocity + phaseOffset;

      target.positionX = this.centerX + this.radius * Math.cos(angle);
      target.positionY = this.centerY + this.radius * Math.sin(angle);
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

if (!customElements.get(CircularAnimation.tagName)) {
  customElements.define(CircularAnimation.tagName, CircularAnimation);
}
