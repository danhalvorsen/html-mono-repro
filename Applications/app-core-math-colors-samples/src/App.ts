import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { componentStyles } from "./componentStyles";
import "./RgbaInput";
import "./RgbaList";
import "./GradientRendererUI";
import { sunriseWarmGradient } from "./samples/sunriseWarmGradient.js";

@customElement("mr-app")
export class App extends LitElement {
  public static override styles = componentStyles;

  protected override render() {
    return html`
      <div class="app-shell">
        <mr-rgba-input>
          <mr-rgba-list slot="list"></mr-rgba-list>
        </mr-rgba-input>
        <mr-gradient-renderer-ui .gradient=${sunriseWarmGradient}></mr-gradient-renderer-ui>
      </div>
    `;
  }
}
