import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { ReactiveController } from "lit";

export interface ISvgRectangleObject {
	readonly x?: number;
	readonly y?: number;
	readonly width: number;
	readonly height: number;
	readonly fill?: string;
	readonly stroke?: string;
	readonly strokeWidth?: number;
	readonly rx?: number;
	readonly ry?: number;
	readonly viewBox?: string;
}

@customElement("shape-rectangle-lit")
export class ShapeRectangleLit extends LitElement {
	static styles = css`:host{display:inline-block}`;
	@property({ type: Number }) width = 160;
	@property({ type: Number }) height = 90;
	@property({ type: String }) color = "#007acc";
	@property({ attribute: false }) rectangle?: ISvgRectangleObject;
	addReactiveController(c: ReactiveController) {
		(LitElement.prototype as any).addController.call(this, c);
	}
	addController(c: ReactiveController) { this.addReactiveController(c); }

 	render() {
		const rectangle = this.rectangle;
		const width = rectangle?.width ?? this.width;
		const height = rectangle?.height ?? this.height;
		const x = rectangle?.x ?? 0;
		const y = rectangle?.y ?? 0;
		const fill = rectangle?.fill ?? this.color;
		const stroke = rectangle?.stroke;
		const strokeWidth = rectangle?.strokeWidth;
		const rx = rectangle?.rx;
		const ry = rectangle?.ry;
		const viewBox = rectangle?.viewBox ?? `0 0 ${width} ${height}`;

		return html`<svg viewBox="${viewBox}" width="${width}" height="${height}"><rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}" stroke="${stroke ?? "none"}" stroke-width="${strokeWidth ?? 0}" rx="${rx ?? 0}" ry="${ry ?? 0}"></rect></svg>`;
 	}
 }
 export default ShapeRectangleLit;
