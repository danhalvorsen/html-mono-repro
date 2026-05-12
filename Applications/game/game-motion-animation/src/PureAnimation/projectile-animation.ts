import { html, LitElement } from "lit";
import { SlotValidator } from "./Base/SlotValidator.ts";
import { BaseGameObjectMatcher } from "./Base/BaseGameObjectMatcher.ts";

type ProjectileTarget = Element & {
  positionX: number;
  positionY: number;
  options: unknown;
  shapeTemplate: unknown;
  getChildren: () => readonly Element[];
};

/**
 * Animates slotted targets using projectile motion decomposition:
 * x(t) = startX + v0*cos(theta)*t
 * y(t) = startY - (v0*sin(theta)*t - 0.5*g*t^2)
 */
export class ProjectileAnimation extends LitElement {
  public static readonly tagName = "projectile-animation";

  static properties = {
    startX: { type: Number },
    startY: { type: Number },
    v0: { type: Number },
    angle: { type: Number },
    g: { type: Number },
    resetYAtOrBelowStart: { type: Boolean },
  };

  declare startX: number;
  declare startY: number;
  declare v0: number;
  declare angle: number;
  declare g: number;
  declare resetYAtOrBelowStart: boolean;

  private targets: readonly ProjectileTarget[];
  private readonly slotValidator: SlotValidator<ProjectileTarget>;
  private startedAtSeconds: number | null;

  public constructor() {
    super();
    this.startX = 40;
    this.startY = 220;
    this.v0 = 50;
    this.angle = 45;
    this.g = 9.81;
    this.resetYAtOrBelowStart = true;
    this.targets = [];
    this.startedAtSeconds = null;
    this.slotValidator = new SlotValidator(
      new BaseGameObjectMatcher(
        (element): element is ProjectileTarget =>
          "positionX" in element &&
          "positionY" in element &&
          "options" in element &&
          "shapeTemplate" in element &&
          "getChildren" in element &&
          typeof (element as { getChildren?: unknown }).getChildren === "function",
      ),
      "projectile-animation slots only accept BaseGameObject elements.",
    );
  }

  public override connectedCallback(): void {
    super.connectedCallback();
    this.refreshTargets();
  }

  public onTimer(timeMs: number): void {
    if (this.targets.length === 0) {
      return;
    }

    const nowSeconds = timeMs / 1000;
    if (this.startedAtSeconds === null) {
      this.startedAtSeconds = nowSeconds;
    }

    const elapsed = Math.max(0, nowSeconds - this.startedAtSeconds);
    const theta = (this.angle * Math.PI) / 180;
    const v0x = this.v0 * Math.cos(theta);
    const v0y = this.v0 * Math.sin(theta);

    const x = this.startX + v0x * elapsed;
    const yDisplacementUp = v0y * elapsed - 0.5 * this.g * elapsed * elapsed;
    const y = this.startY - yDisplacementUp;

    if (this.resetYAtOrBelowStart && y >= this.startY) {
      for (const target of this.targets) {
        target.positionX = this.startX;
        target.positionY = this.startY;
      }
      this.startedAtSeconds = nowSeconds;
      return;
    }

    for (const target of this.targets) {
      target.positionX = x;
      target.positionY = y;
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

if (!customElements.get(ProjectileAnimation.tagName)) {
  customElements.define(ProjectileAnimation.tagName, ProjectileAnimation);
}
