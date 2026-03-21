// // Applications/app-core-math-colors-samples/src/NewGradientUI.ts

// import { LitElement, html, nothing } from "lit";
// import { customElement, property, state } from "lit/decorators.js";
// import type { IGradient } from "@monorepo/core-math-colors";
// import { componentStyles } from "../componentStyles.js";
// import type { IGradientRendererElement } from "../GradientRendererUI";

// @customElement("mr-new-gradient-ui")
// export class NewGradientUI extends LitElement {
//   public static override styles = componentStyles;

//   @property({ attribute: false })
//   public gradient: IGradient | null = null;

//   @property({ type: Number, attribute: "border-percent" })
//   public borderPercent = 24;

//   @property({ type: Number })
//   public height = 42;

//   @property({ type: Number, attribute: "corner-radius" })
//   public cornerRadius = 9;

//   @state()
//   private _background = "transparent";

//   protected override render() {
//     const borderPercent = this._normalizePercent(this.borderPercent);
//     const borderHeight = (this.height * borderPercent) / 100;
//     const triangleHeight = borderHeight / 2;
//     const radius = this._normalizeRadius(this.cornerRadius, this.height);

//     return html`
//       <slot name="renderer" @slotchange=${this._onRendererChanged}></slot>

//       <div
//         class="svg-gradient-host"
//         style=${`
//           --mr-gradient-height:${this.height}px;
//           --mr-gradient-border-height:${borderHeight}px;
//           --mr-gradient-triangle-height:${triangleHeight}px;
//           --mr-gradient-radius:${radius}px;
//         `}
//       >
//         <svg
//           class="svg-gradient-root"
//           viewBox=${`0 0 100 ${this.height}`}
//           width="100%"
//           height=${this.height}
//           preserveAspectRatio="none"
//           aria-hidden="true"
//         >
//           <defs>
//             ${this._renderBackgroundDefinition()}
//             <clipPath id=${this._clipPathId}>
//               <rect
//                 x="0.5"
//                 y="0.5"
//                 width="99"
//                 height=${Math.max(0, this.height - 1)}
//                 rx=${radius}
//                 ry=${radius}
//               ></rect>
//             </clipPath>
//           </defs>

//           <g clip-path=${`url(#${this._clipPathId})`}>
//             <rect
//               x="0"
//               y="0"
//               width="100"
//               height=${this.height}
//               fill=${`url(#${this._gradientId})`}
//             ></rect>

//             <rect
//               x="0"
//               y="0"
//               width="100"
//               height=${borderHeight}
//               fill="rgba(255,255,255,0.18)"
//             ></rect>

//             <rect
//               x="0"
//               y=${Math.max(0, this.height - borderHeight)}
//               width="100"
//               height=${borderHeight}
//               fill="rgba(255,255,255,0.18)"
//             ></rect>
//           </g>

//           <rect
//             x="0.5"
//             y="0.5"
//             width="99"
//             height=${Math.max(0, this.height - 1)}
//             rx=${radius}
//             ry=${radius}
//             fill="none"
//             stroke="rgba(17, 24, 39, 0.2)"
//             stroke-width="1"
//           ></rect>

//           ${borderHeight > 0
//             ? html`
//                 <line
//                   x1="0"
//                   y1=${borderHeight}
//                   x2="100"
//                   y2=${borderHeight}
//                   stroke="rgba(17, 24, 39, 0.12)"
//                   stroke-width="1"
//                 ></line>

//                 <line
//                   x1="0"
//                   y1=${this.height - borderHeight}
//                   x2="100"
//                   y2=${this.height - borderHeight}
//                   stroke="rgba(17, 24, 39, 0.12)"
//                   stroke-width="1"
//                 ></line>
//               `
//             : nothing}
//         </svg>

//         <div
//           class="svg-triangle-layer svg-triangle-layer-top"
//           aria-hidden="true"
//         >
//           <slot
//             name="triangle"
//             @slotchange=${this._onTriangleSlotChanged}
//           ></slot>
//         </div>

//         <div
//           class="svg-triangle-layer svg-triangle-layer-bottom"
//           aria-hidden="true"
//         >
//           <slot
//             name="triangle"
//             @slotchange=${this._onTriangleSlotChanged}
//           ></slot>
//         </div>
//       </div>
//     `;
//   }

//   protected override firstUpdated(): void {
//     this._refreshBackground();
//     this._syncTriangles();
//   }

//   protected override updated(
//     changedProperties: Map<PropertyKey, unknown>,
//   ): void {
//     if (changedProperties.has("gradient")) {
//       this._refreshBackground();
//     }

//     if (
//       changedProperties.has("borderPercent") ||
//       changedProperties.has("height")
//     ) {
//       this._syncTriangles();
//     }
//   }

//   private get _gradientId(): string {
//     return `mr-gradient-fill-${this.localName}`;
//   }

//   private get _clipPathId(): string {
//     return `mr-gradient-clip-${this.localName}`;
//   }

//   private _renderBackgroundDefinition() {
//     return html`
//       <linearGradient id=${this._gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
//         ${this._buildSvgStops(this._background).map(
//           (stop) => html`
//             <stop
//               offset=${stop.offset}
//               stop-color=${stop.color}
//               stop-opacity=${stop.opacity}
//             ></stop>
//           `,
//         )}
//       </linearGradient>
//     `;
//   }

//   private _buildSvgStops(background: string): readonly SvgGradientStop[] {
//     const trimmed = background.trim();

//     if (trimmed.length === 0 || trimmed === "transparent") {
//       return [
//         { offset: "0%", color: "#000000", opacity: "0" },
//         { offset: "100%", color: "#000000", opacity: "0" },
//       ];
//     }

//     const prefix = "linear-gradient(to right,";
//     if (!trimmed.startsWith(prefix) || !trimmed.endsWith(")")) {
//       return [
//         { offset: "0%", color: "#000000", opacity: "0" },
//         { offset: "100%", color: "#000000", opacity: "0" },
//       ];
//     }

//     const content = trimmed.slice(prefix.length, -1).trim();
//     const segments = this._splitGradientSegments(content);

//     return segments.length === 0
//       ? [
//           { offset: "0%", color: "#000000", opacity: "0" },
//           { offset: "100%", color: "#000000", opacity: "0" },
//         ]
//       : segments.map((segment) => this._parseGradientSegment(segment));
//   }

//   private _splitGradientSegments(value: string): readonly string[] {
//     const segments: string[] = [];
//     let start = 0;
//     let depth = 0;

//     for (let index = 0; index < value.length; index += 1) {
//       const character = value[index];

//       if (character === "(") {
//         depth += 1;
//       } else if (character === ")") {
//         depth -= 1;
//       } else if (character === "," && depth === 0) {
//         segments.push(value.slice(start, index).trim());
//         start = index + 1;
//       }
//     }

//     segments.push(value.slice(start).trim());

//     return segments.filter((segment) => segment.length > 0);
//   }

//   private _parseGradientSegment(segment: string): SvgGradientStop {
//     const lastSpaceIndex = segment.lastIndexOf(" ");

//     if (lastSpaceIndex <= 0) {
//       return { offset: "0%", color: segment, opacity: "1" };
//     }

//     const colorPart = segment.slice(0, lastSpaceIndex).trim();
//     const offsetPart = segment.slice(lastSpaceIndex + 1).trim();

//     const rgbaMatch = /^rgb\(\s*\d+\s+\d+\s+\d+\s*\/\s*([0-9.]+)\s*\)$/i.exec(
//       colorPart,
//     );
//     const opacity = rgbaMatch?.[1] ?? "1";
//     const color = colorPart.replace(/\s*\/\s*[0-9.]+\s*\)$/i, ")");

//     return {
//       offset: offsetPart,
//       color,
//       opacity,
//     };
//   }

//   private _onRendererChanged(): void {
//     this._refreshBackground();
//   }

//   private _onTriangleSlotChanged(): void {
//     this._syncTriangles();
//   }

//   private _refreshBackground(): void {
//     const renderer = this._getRenderer();

//     this._background =
//       renderer === null
//         ? "transparent"
//         : renderer.buildBackground(this.gradient);
//   }

//   private _getRenderer(): IGradientRendererElement | null {
//     const slot = this.renderRoot.querySelector('slot[name="renderer"]');

//     if (!(slot instanceof HTMLSlotElement)) {
//       return null;
//     }

//     const first = slot.assignedElements({ flatten: true })[0];

//     if (
//       first === undefined ||
//       !("buildBackground" in first) ||
//       typeof first.buildBackground !== "function"
//     ) {
//       return null;
//     }

//     return first as IGradientRendererElement;
//   }

//   private _syncTriangles(): void {
//     const slotElements = Array.from(
//       this.renderRoot.querySelectorAll('slot[name="triangle"]'),
//     );

//     const triangles = slotElements
//       .flatMap((slot) =>
//         slot instanceof HTMLSlotElement
//           ? slot.assignedElements({ flatten: true })
//           : [],
//       )
//       .filter(
//         (element, index, all): element is HTMLElement =>
//           element instanceof HTMLElement && all.indexOf(element) === index,
//       );

//     const triangleHeight =
//       (this.height * this._normalizePercent(this.borderPercent)) / 100 / 2;

//     for (const triangle of triangles) {
//       const placement = triangle.getAttribute("placement");

//       triangle.style.height = `${triangleHeight}px`;

//       if (placement === "bottom") {
//         triangle.style.bottom = "0";
//         triangle.style.top = "";
//       } else {
//         triangle.style.top = "0";
//         triangle.style.bottom = "";
//       }
//     }
//   }

//   private _normalizePercent(value: number): number {
//     if (!Number.isFinite(value)) {
//       return 0;
//     }

//     if (value < 0) {
//       return 0;
//     }

//     if (value > 50) {
//       return 50;
//     }

//     return value;
//   }

//   private _normalizeRadius(value: number, height: number): number {
//     if (!Number.isFinite(value) || value < 0) {
//       return 0;
//     }

//     return Math.min(value, height / 2);
//   }
// }

// interface SvgGradientStop {
//   readonly offset: string;
//   readonly color: string;
//   readonly opacity: string;
// }
