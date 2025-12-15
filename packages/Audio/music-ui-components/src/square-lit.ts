import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { ReactiveController } from "lit";

export class ShapeSquareLit extends LitElement {
	static styles = css`
		:host { display: block; }
		svg { display: block; }
	`;

	@property({ type: Number }) size = 100;
	@property({ type: String }) color = "black";

	addReactiveController(c: ReactiveController) {
		(LitElement.prototype as any).addController.call(this, c);
	}
	addController(c: ReactiveController) { this.addReactiveController(c); }

	render() {
		return html`<svg viewBox="0 0 ${this.size} ${this.size}" width="${this.size}" height="${this.size}"><rect width="${this.size}" height="${this.size}" fill="${this.color}"></rect></svg>`;
	}
}

export default ShapeSquareLit;