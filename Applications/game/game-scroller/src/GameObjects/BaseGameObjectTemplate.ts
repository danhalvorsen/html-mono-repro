import { html, type TemplateResult } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import type { BaseGameObjectOptions } from "./BaseGameObjectOptions.js";
import { BaseGameObjectSlots } from "./BaseGameObjectSlots.js";

export class BaseGameObjectTemplate {
  public render(
    positionX: number,
    positionY: number,
    options: BaseGameObjectOptions,
    shapeTemplate: TemplateResult,
    childrenSlotChangeHandler: (event: Event) => void,
  ): TemplateResult {
    return html`
      <div
        class="world"
        style=${styleMap({
          "--world-width": `${options.width}px`,
          "--world-height": `${options.height}px`,
        })}
      >
        <div
          class="transform"
          style=${styleMap({
            left: `${positionX}px`,
            top: `${positionY}px`,
            transform: `translate(-50%, -50%) rotate(${options.rotationRadians}rad)`,
          })}
        >
          <div class="visual">
            ${shapeTemplate}
          </div>

          <div class="children">
            <slot
              name=${BaseGameObjectSlots.Children}
              @slotchange=${childrenSlotChangeHandler}
            ></slot>
          </div>
        </div>
      </div>
    `;
  }
}
