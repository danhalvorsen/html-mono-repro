import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { ReactiveController } from "lit";

@customElement("shape-triangle-lit")
export class ShapeTriangleLit extends LitElement {
	static styles = css`:host{display:inline-block}`;
	@property({ type: Number }) size = 120;
	@property({ type: String }) color = "#22aa44";
	addReactiveController(c: ReactiveController) {
		(LitElement.prototype as any).addController.call(this, c);
	}
	addController(c: ReactiveController) { this.addReactiveController(c); }

 	render() {
 		const s = this.size;
 		const h = (Math.sqrt(3) / 2) * s;
 		const p1 = `${s/2},0`;
 		const p2 = `0,${h}`;
 		const p3 = `${s},${h}`;
 		return html`<svg viewBox="0 0 ${s} ${h}" width="${s}" height="${h}"><polygon points="${p1} ${p2} ${p3}" fill="${this.color}"></polygon></svg>`;
 	}
 }
 export default ShapeTriangleLit;
