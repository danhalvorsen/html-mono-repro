import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { ReactiveController } from "lit";

@customElement("shape-circle-lit")
export class ShapeCircleLit extends LitElement {
	static styles = css`:host{display:inline-block}`;
	@property({ type: Number }) size = 100;
	@property({ type: String }) color = "#ff0000";
	addReactiveController(c: ReactiveController) {
		// delegate to LitElement's addController implementation on the prototype to avoid recursion
		(LitElement.prototype as any).addController.call(this, c);
	}
	// public alias
	addController(c: ReactiveController) { this.addReactiveController(c); }
	render() {
		const s = this.size;
		const r = s / 2;
		return html`<svg viewBox="0 0 ${s} ${s}" width="${s}" height="${s}"><circle cx="${r}" cy="${r}" r="${r}" fill="${this.color}"></circle></svg>`;
	}
}
export default ShapeCircleLit;
