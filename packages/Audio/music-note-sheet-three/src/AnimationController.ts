import * as THREE from "three";

/* ============================================================
   AnimationController.ts
   ============================================================ */

export interface Animatable {
	update(dt: number): void;
}

export class AnimationController {
	private targets = new Set<Animatable>();
	private clock = new THREE.Clock();
	private rafId: number | null = null;
	private running = false;

	add(target: Animatable) {
		this.targets.add(target);
	}

	remove(target: Animatable) {
		this.targets.delete(target);
	}

	clear() {
		this.targets.clear();
	}

	start(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) {
		if (this.running) return;
		this.running = true;
		this.clock.getDelta(); // reset clock
		const loop = () => {
			if (!this.running) return;
			const dt = this.clock.getDelta();
			for (const t of this.targets) {
				try { t.update(dt); } catch (e) { /* swallow per-target errors */ }
			}
			renderer.render(scene, camera);
			this.rafId = requestAnimationFrame(loop);
		};
		this.rafId = requestAnimationFrame(loop);
	}

	stop() {
		if (!this.running) return;
		this.running = false;
		if (this.rafId !== null) {
			cancelAnimationFrame(this.rafId);
			this.rafId = null;
		}
	}

	dispose() {
		this.stop();
		this.clear();
	}
}
