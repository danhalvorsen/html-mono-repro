 
import { IDimensions, IShape } from '@my-graphics/types-abstract';
import * as THREE from 'three';
import { ThreeAdapter } from './adapter.js';

export class WebGLRenderer {
  canvas: HTMLCanvasElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private shapeMap = new Map<string, THREE.Mesh>();

  private animationId: number | null = null;
  private running = false;
  private tickCallback: (() => void) | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      canvas.width / canvas.height,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer({ canvas });
    this.camera.position.z = 5;
  }

  render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  clear(): void {
    this.scene.clear();
  }

  drawShape(shape: IShape): void {
    const pos = shape.getLocation().getPosition();
    const width = shape.getWidth();
    const height = shape.getHeight();
    const rotation = shape.getRotation();

    const geometry = new THREE.BoxGeometry(width, height, 1);
    const material = new THREE.MeshPhysicalMaterial({
      color: 0x0000ff,
      roughness: 0.3,
      metalness: 0.6,
      clearcoat: 0.5,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(ThreeAdapter.toVector3(pos));
    mesh.applyMatrix4(ThreeAdapter.toMatrix4(rotation));

    this.scene.add(mesh);
  }

  startLoop(tick: () => void): void {
    if (this.running) return;
    this.running = true;
    this.tickCallback = tick;

    const animate = () => {
      this.tickCallback?.();
      this.render();
      this.animationId = requestAnimationFrame(animate);
    };

    this.animationId = requestAnimationFrame(animate);
  }

  stopLoop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.running = false;
    this.tickCallback = null;
  }

  isLoopRunning(): boolean {
    return this.running;
  }
}
