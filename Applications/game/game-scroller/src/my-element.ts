import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement("my-element")
export class MyElement extends LitElement {
  /**
   * The number of times the button has been clicked.
   */

  render() {
    return html`
      <section id="center">
        <game-application>
          <game-screen> 
            <game-canvas>
            </game-canvas>
          </game-screen>
        </game-application>
      </section>

      <div class="ticks"></div>
      <section id="spacer"></section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "my-element": MyElement;
  }
}
