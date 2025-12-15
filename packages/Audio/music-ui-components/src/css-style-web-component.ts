import { LitElement, html, PropertyValues } from 'lit';
import type { ReactiveController } from 'lit';

export abstract class CssStyleWebComponent extends LitElement {
	// Generic reactive property for incoming data (module-agnostic)
	// Consumers can set `.incoming = {...}` to feed data into the component
	// attribute: false keeps it non-serialized to HTML.
	static override properties = {
		incoming: { attribute: false }
	};
	incoming: Record<string, any> = {};

	// Inject raw CSS text into the component's shadow root.
	// Works in node/happy-dom and browsers (no adoptedStyleSheets reliance).
	protected pushCss(cssText: string) {
		if (!this.renderRoot) return;
		const style = document.createElement('style');
		style.textContent = cssText;
		this.renderRoot.appendChild(style);
		return style;
	}

	// If authors pass a <slot name="styles"> with <style> children in light DOM,
	// this helper moves style nodes into the shadow root on first update.
	protected moveStylesFromLightDom() {
		const slot = this.querySelector('slot[name="styles"]') as HTMLSlotElement | null;
		if (!slot) return;
		// move any <style> children into shadowRoot
		const styles = Array.from(slot.childNodes).filter(n => n.nodeName === 'STYLE') as HTMLStyleElement[];
		for (const s of styles) {
			this.renderRoot.appendChild(s.cloneNode(true));
			s.remove();
		}
	}

	// Wrapper so consumers can call AddController(controller) (requested shape).
	AddController(controller: ReactiveController) {
		// LitElement implements ReactiveControllerHost.addController but the type may differ;
		// cast to any for compatibility.
		(this as any).addController?.(controller);
	}

	// Allow derived classes to hook into firstUpdated for moving styles
	protected override firstUpdated(_changed: PropertyValues) {
		super.firstUpdated?.(_changed);
		this.moveStylesFromLightDom();
	}
}
