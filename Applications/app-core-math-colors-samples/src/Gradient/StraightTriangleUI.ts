// // Applications/app-core-math-colors-samples/src/StraightTriangleUI.ts

// import { LitElement, svg } from "lit";
// import { customElement, property } from "lit/decorators.js";

// type TrianglePlacement = "top" | "bottom";

// @customElement("mr-straight-triangle-ui")
// export class StraightTriangleUI extends LitElement {
//   @property({ type: String })
//   public placement: TrianglePlacement = "top";

//   @property({ type: String })
//   public fill = "rgba(17, 24, 39, 0.18)";

//   protected override render() {
//     const points =
//       this.placement === "top"
//         ? "0,100 50,0 100,100"
//         : "0,0 50,100 100,0";

//     return svg`
//       <svg
//         viewBox="0 0 100 100"
//         preserveAspectRatio="none"
//         width="100%"
//         height="100%"
//         part="root"
//       >
//         <polygon
//           points=${points}
//           fill=${this.fill}
//         ></polygon>
//       </svg>
//     `;
//   }
// }