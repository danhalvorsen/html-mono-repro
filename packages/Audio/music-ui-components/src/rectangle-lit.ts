import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { ReactiveController } from "lit";

export class ShapeRectangleLit extends LitElement {
	static styles = css`:host{display:inline-block}`;
	@property({ type: Number }) width = 160;
	@property({ type: Number }) height = 90;
	@property({ type: String }) color = "#007acc";
	addReactiveController(c: ReactiveController) {
		(LitElement.prototype as any).addController.call(this, c);
	}
	addController(c: ReactiveController) { this.addReactiveController(c); }

 	render() {
 		return html`<svg viewBox="0 0 ${this.width} ${this.height}" width="${this.width}" height="${this.height}"><rect width="${this.width}" height="${this.height}" fill="${this.color}"></rect></svg>`;
 	}
 }
 export default ShapeRectangleLit;
