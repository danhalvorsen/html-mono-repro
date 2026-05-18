// // src/components/mr-grid-toggle.ts
// import { LitElement, html } from "lit";
// import { customElement, property } from "lit/decorators.js";
// import { GRID_TOGGLE_EVENT, type GridToggleDetail } from "../../../../events/grid-events.js";

// @customElement("mr-grid-toggle")
// export class MrGridToggle extends LitElement {
//   @property({ type: Boolean, reflect: true })
//   enabled = true;

//   readonly #groupName =
//     `mr-grid-${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;

//   render() {
//     return html`
//       <fieldset style="border:0; padding:0; margin:0;">
//         <legend style="font-weight:600;">Grid</legend>

//         <label>
//           <input
//             type="radio"
//             name=${this.#groupName}
//             .checked=${this.enabled}
//             @change=${this.#onOn}
//           />
//           On
//         </label>

//         <label style="margin-left:12px;">
//           <input
//             type="radio"
//             name=${this.#groupName}
//             .checked=${!this.enabled}
//             @change=${this.#onOff}
//           />
//           Off
//         </label>
//       </fieldset>
//     `;
//   }

//   readonly #onOn = () => this.#set(true);
//   readonly #onOff = () => this.#set(false);

//   #set(enabled: boolean) {
//     if (this.enabled === enabled) return;
//     this.enabled = enabled;

//     const detail: GridToggleDetail = { enabled };

//     // NOTE: dispatching on window makes this work even when the canvas is a sibling element.
//     window.dispatchEvent(
//       new CustomEvent<GridToggleDetail>(GRID_TOGGLE_EVENT, {
//         detail,
//       }),
//     );
//   }
// }

// declare global {
//   interface HTMLElementTagNameMap {
//     "mr-grid-toggle": MrGridToggle;
//   }
// }