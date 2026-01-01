import * as THREE from 'three';

export type ThreeCanvasOptions = Readonly<{
  antialias?: boolean;
  background?: THREE.ColorRepresentation;
  dpr?: number;
}>;

export type LineStyle = Readonly<{
  color?: THREE.ColorRepresentation;
  opacity?: number;
}>;

export type Point2Like = Readonly<{ x: number; y: number }>;

export class ThreeCanvas {
  public readonly renderer: THREE.WebGLRenderer;
  public readonly scene: THREE.Scene;
  public readonly camera: THREE.OrthographicCamera;

  private readonly root: THREE.Group;
  private rafId: number | null = null;

  constructor(
    canvas: HTMLCanvasElement,
    { antialias = true, background = 0x000000, dpr }: ThreeCanvasOptions = {},
  ) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias,
      alpha: false,
    });

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(background);

    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10_000);
    this.camera.position.set(0, 0, 1000);
    this.camera.lookAt(0, 0, 0);

    this.root = new THREE.Group();
    this.scene.add(this.root);

    this.setDpr(dpr);
  }

  public setDpr(dpr?: number): void {
    const next = dpr ?? Math.min(2, window.devicePixelRatio || 1);
    this.renderer.setPixelRatio(next);
  }

  public resize(width: number, height: number): void {
    this.renderer.setSize(width, height, false);
    this.camera.left = -width / 2;
    this.camera.right = width / 2;
    this.camera.top = height / 2;
    this.camera.bottom = -height / 2;
    this.camera.updateProjectionMatrix();
  }

  public clear(): void {
    for (const child of [...this.root.children]) {
      child.removeFromParent();
      this.disposeObject(child);
    }
  }

  public drawLine(a: Point2Like, b: Point2Like, style: LineStyle = {}): THREE.Line {
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(a.x, a.y, 0),
      new THREE.Vector3(b.x, b.y, 0),
    ]);

    const material = new THREE.LineBasicMaterial({
      color: style.color ?? 0xffffff,
      transparent: style.opacity !== undefined && style.opacity < 1,
      opacity: style.opacity ?? 1,
    });

    const line = new THREE.Line(geometry, material);
    this.root.add(line);
    return line;
  }

  public render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  public start(): void {
    if (this.rafId !== null) return;

    const tick = () => {
      this.render();
      this.rafId = window.requestAnimationFrame(tick);
    };

    this.rafId = window.requestAnimationFrame(tick);
  }

  public stop(): void {
    if (this.rafId === null) return;
    window.cancelAnimationFrame(this.rafId);
    this.rafId = null;
  }

  public dispose(): void {
    this.stop();
    this.clear();
    this.renderer.dispose();
  }

  private disposeObject(object: THREE.Object3D): void {
    object.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      const anyObj = obj as unknown as { geometry?: unknown; material?: unknown };

      if (anyObj.geometry && anyObj.geometry instanceof THREE.BufferGeometry) {
        anyObj.geometry.dispose();
      }

      if (mesh.material) {
        const material = mesh.material as THREE.Material | THREE.Material[];
        if (Array.isArray(material)) material.forEach((m) => m.dispose());
        else material.dispose();
      }
    });
  }
}

