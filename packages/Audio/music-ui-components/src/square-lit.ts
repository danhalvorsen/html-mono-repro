import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { ReactiveController } from "lit";

export interface ISvgSquareObject {
	readonly x?: number;
	readonly y?: number;
	readonly size: number;
	readonly fill?: string;
	readonly stroke?: string;
	readonly strokeWidth?: number;
	readonly rx?: number;
	readonly ry?: number;
	readonly viewBox?: string;
}

@customElement("shape-square-lit")
export class ShapeSquareLit extends LitElement {
	static styles = css`
		:host { display: inline-block; }
		svg { display: block; }
	`;

	@property({ type: Number }) size = 100;
	@property({ type: String }) color = "black";
	@property({ attribute: false }) square?: ISvgSquareObject;

	addReactiveController(c: ReactiveController) {
		(LitElement.prototype as any).addController.call(this, c);
	}
	addController(c: ReactiveController) { this.addReactiveController(c); }

	render() {
		const square = this.square;
		const size = square?.size ?? this.size;
		const x = square?.x ?? 0;
		const y = square?.y ?? 0;
		const fill = square?.fill ?? this.color;
		const stroke = square?.stroke;
		const strokeWidth = square?.strokeWidth;
		const rx = square?.rx;
		const ry = square?.ry;
		const viewBox = square?.viewBox ?? `0 0 ${size} ${size}`;

		return html`<svg viewBox="${viewBox}" width="${size}" height="${size}"><rect x="${x}" y="${y}" width="${size}" height="${size}" fill="${fill}" stroke="${stroke ?? "none"}" stroke-width="${strokeWidth ?? 0}" rx="${rx ?? 0}" ry="${ry ?? 0}"></rect></svg>`;
	}
}

export default ShapeSquareLit;