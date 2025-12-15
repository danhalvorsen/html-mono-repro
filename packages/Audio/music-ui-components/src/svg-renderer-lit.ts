import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import type { ReactiveController } from "lit";

@customElement("svg-renderer-lit")
export class SvgRendererLit extends LitElement {
	static styles = css`
		:host { display: block; }
		.container { width: 100%; height: 100%; overflow: visible; }
		svg { width: 100%; height: 100%; display: block; }
	`;

	// svg content as string (raw <svg ...>...</svg>)
	@property({ type: String }) svg = "";

	// render in shadow, but expose inner svg container via part
	render() {
		// if svg is provided render it, otherwise render slot
		return html`
			<div class="container" part="svg-container">
				${this.svg ? unsafeHTML(this.svg) : html`<slot></slot>`}
			</div>
		`;
	}

	// programmatic setter
	setSvg(svgContent: string) {
		this.svg = svgContent;
	}

	// Expose adding ReactiveController from external code
	addController(controller: ReactiveController) {
		// LitElement implements ReactiveControllerHost.addController
		// call the host API to register the controller
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore - addController exists on LitElement
		if (typeof (this as any).addController === "function") {
			(this as any).addController(controller);
		} else {
			// fallback: call lifecycle methods if available
			if (controller.hostConnected) controller.hostConnected?.();
		}
	}

	// helper to expose the rendered svg element (first svg inside)
	get svgElement(): SVGSVGElement | null {
		const container = this.renderRoot.querySelector(".container");
		if (!container) return null;
		return container.querySelector("svg");
	}
}

export default SvgRendererLit;
