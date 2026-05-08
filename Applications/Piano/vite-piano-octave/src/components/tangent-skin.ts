// // src/components/tangent-skin.ts
// import { LitElement, css, html, type TemplateResult } from "lit";
// import { customElement, property } from "lit/decorators.js";

// export type TangentSkinTemplate = "none" | "identifier" | "debug";

// @customElement("tangent-skin")
// export class TangentSkin extends LitElement {
//   public static override styles = css`
//     :host {
//       display: block;
//       width: 100%;
//       height: 100%;
//       box-sizing: border-box;
//       pointer-events: none;
//       user-select: none;
//       container-type: size;
//       font-family: system-ui, sans-serif;
//     }

//     :host([hidden]) {
//       display: none;
//     }

//     .label {
//       position: absolute;
//       left: 50%;
//       bottom: 10%;
//       transform: translateX(-50%);
//       color: #111;
//       font-size: clamp(10px, min(28cqw, 22cqh), 28px);
//       font-weight: 700;
//       line-height: 1;
//       white-space: nowrap;
//     }

//     .debug-frame {
//       position: absolute;
//       left: 10%;
//       top: 5%;
//       width: 80%;
//       height: 90%;
//       box-sizing: border-box;
//       border: 1px solid rgba(255, 0, 180, 0.75);
//     }

//     :host([key-type="black"]) .label {
//       bottom: 16%;
//       padding: 2px 5px;
//       border-radius: 4px;
//       background: rgba(255, 255, 255, 0.78);
//     }
//   `;

//   @property({ type: String, attribute: "tangent-id" })
//   public tangentId = "";

//   @property({ type: String })
//   public template: TangentSkinTemplate = "identifier";

//   @property({ type: Boolean, reflect: true })
//   public hidden = false;

//   @property({ type: String, attribute: "key-type", reflect: true })
//   public keyType: "white" | "black" = "white";

//   protected override render(): TemplateResult {
//     if (this.hidden || this.template === "none") {
//       return html``;
//     }

//     if (this.template === "debug") {
//       return html`
//         <div class="debug-frame"></div>
//         <span class="label">${this.tangentId}</span>
//       `;
//     }

//     return html`<span class="label">${this.tangentId}</span>`;
//   }
// }

// declare global {
//   interface HTMLElementTagNameMap {
//     "tangent-skin": TangentSkin;
//   }
// }