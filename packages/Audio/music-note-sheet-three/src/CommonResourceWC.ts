import { LitElement, html } from "lit";
import * as THREE from "three";

/* ============================================================
   common-resource-wc.ts
   ============================================================ */

export class CommonResourceWC extends LitElement {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, 1, 0.1, 2000);
    renderer?: THREE.WebGLRenderer;

    connectedCallback() {
        super.connectedCallback();
        this.addEventListener("renderer-ready", (e: any) => {
            this.renderer = e.detail;
            this.dispatchEvent(new CustomEvent("resources-ready", {
                detail: { scene: this.scene, camera: this.camera, renderer: this.renderer }
            }));
        });
    }

    render() {
        return html`<canvas-wc></canvas-wc>`;
    }
}
