import * as THREE from "three";
export interface IFoo {
  readonly width: number;
  readonly height: number;
  readonly depth: number;
  readonly position: THREE.Vector3;
}

export interface IFooOptions {
  readonly position?: THREE.Vector3;
}

export class Foo implements IFoo {
  public readonly position: THREE.Vector3;

  public constructor(
    public readonly width: number = 1,
    public readonly height: number = 1,
    public readonly depth: number = 1,
    options: IFooOptions = {},
  ) {
    this.ensurePositive(width, "width");
    this.ensurePositive(height, "height");
    this.ensurePositive(depth, "depth");

    const position = options.position ?? new THREE.Vector3(0, 0, 0);

    if (
      !Number.isFinite(position.x) ||
      !Number.isFinite(position.y) ||
      !Number.isFinite(position.z)
    ) {
      throw new Error("position must be finite");
    }

    this.position = position.clone();
    Object.freeze(this);
  }

  private ensurePositive(value: number, name: string): void {
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error(`${name} must be > 0`);
    }
  }
}

export class FooBuilder {
  public buildExampleResponse(): THREE.Object3D<THREE.Object3DEventMap> {
    return this.build(new Foo(1, 1, 1));
  }

  public build(configuration: IFoo): THREE.Object3D {
    const geometry = new THREE.BoxGeometry(
      configuration.width,
      configuration.height,
      configuration.depth,
    );

    const mesh = new THREE.Mesh(
      geometry,
      new THREE.MeshStandardMaterial({ color: 0xffffff }),
    );
    mesh.position.copy(configuration.position);

    return mesh;
  }
}
