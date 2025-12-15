import { LitElement, html } from "lit";
import * as THREE from "three";

/* ============================================================
   CanvasWC.ts
   ============================================================ */
import { NoteEditorWC } from "./NoteEditorWC.js";
import { NoteSheetWC } from "./NoteSheetWC.js";
import { CommonResourceWC } from "./CommonResourceWC.js";

export type RendererReadyEvent = CustomEvent<THREE.WebGLRenderer>;

export class CanvasWC extends LitElement {
	renderer!: THREE.WebGLRenderer;

	firstUpdated() {
		const canvas = this.renderRoot.querySelector("canvas") as HTMLCanvasElement;
		this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
		this.dispatchEvent(new CustomEvent<THREE.WebGLRenderer>("renderer-ready", { detail: this.renderer }));
	}

	render() {
		return html`<canvas style="width:100%;height:100%"></canvas>`;
	}
}

// declare global tag mapping (placed after class definitions)
declare global {
	interface HTMLElementTagNameMap {
		"canvas-wc": CanvasWC;
		"common-resource-wc": CommonResourceWC;
		"note-sheet-wc": NoteSheetWC;
		"note-editor-wc": NoteEditorWC;
	}
}

// register elements safely (avoid "already defined" errors)
if (!customElements.get("canvas-wc")) customElements.define("canvas-wc", CanvasWC);
if (!customElements.get("common-resource-wc")) customElements.define("common-resource-wc", CommonResourceWC);
if (!customElements.get("note-sheet-wc")) customElements.define("note-sheet-wc", NoteSheetWC);
if (!customElements.get("note-editor-wc")) customElements.define("note-editor-wc", NoteEditorWC);
