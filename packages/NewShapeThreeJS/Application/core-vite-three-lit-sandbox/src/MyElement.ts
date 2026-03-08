import { createThreeShapesModule, type IThreeDrawContext, type IThreeShape } from "@monorepo/core-shapes-threejs";
import { ThreeDrawableShapeFactory } from '@monorepo/core-shapes-threejs-intergration';
import { LitElement, html } from "lit";
// ============================================================================
// packages/NewShapeThreeJS/Application/core-vite-three-lit-sandbox/src/my-element.ts
// ============================================================================
import { css } from "lit";
import { customElement } from "lit/decorators.js";
import { WebGLRenderer, Scene, PerspectiveCamera, AmbientLight, Color, Mesh, BoxGeometry, MeshNormalMaterial } from "three";

@customElement("my-element")
export class MyElement extends LitElement {
  private readonly threeShapes = createThreeShapesModule();

  private renderer?: WebGLRenderer;
  private scene?: Scene;
  private camera?: PerspectiveCamera;
  private shape?: IThreeShape;
  private ambientLight?: AmbientLight;
  private shapeFactory?: ThreeDrawableShapeFactory ;
  private canvas:
  private threeDrawContext?: IThreeDrawContext;

  private frameId?: number;
  private resizeObserver?: ResizeObserver;

  protected render() {
    return html`
      <div id="canvasHost"></div>
    `;
  }

  protected firstUpdated(): void {
    const host = this.getCanvasHost();

    const renderer = new WebGLRenderer({ antialias: true });
    const scene = new Scene();
    const camera = new PerspectiveCamera(60, 1, 0.1, 100);
    const ambientLight = new AmbientLight(0xffffff, 1.25);

    scene.background = new Color(0x202020);
    camera.position.set(0, 0, 4);
    scene.add(ambientLight);

    this.
    this.shapeFactory = new ThreeDrawableShapeFactory("FooFighter", {
      build: (mesh: Mesh) => mesh
    });

    const factory = this.shapeFactory;
    
    const mesh = new Mesh(
      new BoxGeometry(1.25, 1.25, 1.25),
      new MeshNormalMaterial()
    );

    const shape = this.threeShapes.shapeFactory.create("box", mesh);
    shape.draw({ scene });

    host.appendChild(renderer.domElement);

    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.ambientLight = ambientLight;
    this.shape = shape;

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(host);

    this.resize();
    this.startLoop();
  }

  public override disconnectedCallback(): void {
    super.disconnectedCallback();

    if (this.frameId !== undefined) {
      window.cancelAnimationFrame(this.frameId);
      this.frameId = undefined;
    }

    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;

    this.shape?.dispose();
    this.shape = undefined;

    this.renderer?.dispose();
    this.renderer = undefined;
    this.scene = undefined;
    this.camera = undefined;
    this.ambientLight = undefined;
  }

  private startLoop(): void {
    const tick = (): void => {
      const renderer = this.renderer;
      const scene = this.scene;
      const camera = this.camera;
      const shape = this.shape;

      if (!renderer || !scene || !camera || !shape) {
        return;
      }

      const object = shape.getObject3D();
      object.rotation.x += 0.01;
      object.rotation.y += 0.02;

      renderer.render(scene, camera);
      this.frameId = window.requestAnimationFrame(tick);
    };

    this.frameId = window.requestAnimationFrame(tick);
  }

  private resize(): void {
    const renderer = this.renderer;
    const camera = this.camera;
    const host = this.getCanvasHost();

    if (!renderer || !camera) {
      return;
    }

    const width = Math.max(1, host.clientWidth);
    const height = Math.max(1, host.clientHeight);

    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  private getCanvasHost(): HTMLDivElement {
    const host = this.renderRoot.querySelector("#canvasHost");

    if (!(host instanceof HTMLDivElement)) {
      throw new Error("Canvas host element was not found.");
    }

    return host;
  }

  public static override styles = css`
    :host {
      display: block;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      background: #111;
    }

    #canvasHost {
      width: 100%;
      height: 100%;
    }

    #canvasHost canvas {
      display: block;
      width: 100%;
      height: 100%;
    }
  `;
}
