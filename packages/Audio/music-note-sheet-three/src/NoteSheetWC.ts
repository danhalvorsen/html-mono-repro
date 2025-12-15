import { LitElement, html } from "lit";
import * as THREE from "three";

/* ============================================================
   note-sheet-wc.ts
   ============================================================ */

export class NoteSheetWC extends LitElement {
    scene?: THREE.Scene;
    camera?: THREE.Camera;
    renderer?: THREE.WebGLRenderer;

    firstUpdated() {
        const res = this.renderRoot.querySelector("common-resource-wc")!;
        res.addEventListener("resources-ready", (e: any) => {
            this.scene = e.detail.scene;
            this.camera = e.detail.camera;
            this.renderer = e.detail.renderer;
            this.dispatchEvent(new Event("sheet-ready"));
        });
    }

    render() {
        return html`
      <common-resource-wc></common-resource-wc>
      <slot name="geometry"></slot>
      <slot name="logic"></slot>
      <slot name="ui"></slot>
      <slot name="children"></slot>
    `;
    }
}
