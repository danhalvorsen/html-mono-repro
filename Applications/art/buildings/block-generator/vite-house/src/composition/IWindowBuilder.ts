
import * as THREE from "three";
import type { Rectangle } from "../domain/geometry/Rectangle.js";
import type { IMaterialFactory } from "./Materials/IMaterialFactory.js";
import type { MaterialToken } from "./Materials/MaterialToken.js";

export interface IWindowBuilder {
  reset(): void;
  withFrame(rect: Rectangle, material: MaterialToken): IWindowBuilder;
  withGlass(material: MaterialToken, inset?: number): IWindowBuilder;
  build(): THREE.Object3D;
}

// ====================================================================================
// FILE: composition/WindowBuilder.ts
// ====================================================================================

type State = Readonly<{
  frame: {
    rect: Rectangle;
    material: MaterialToken;
  } | null;

  glass: {
    material: MaterialToken;
    inset: number;
  } | null;
}>;

export class WindowBuilder implements IWindowBuilder {
  private readonly state: State;

  private constructor(
    private readonly materialFactory: IMaterialFactory,
    state: State,
  ) {
    this.state = state;
  }

  public static create(materialFactory: IMaterialFactory): WindowBuilder {
    return new WindowBuilder(materialFactory, {
      frame: null,
      glass: null,
    });
  }

  public reset(): WindowBuilder {
    return new WindowBuilder(this.materialFactory, {
      frame: null,
      glass: null,
    });
  }

  public withFrame(rect: Rectangle, material: MaterialToken): WindowBuilder {
    return new WindowBuilder(this.materialFactory, {
      ...this.state,
      frame: { rect, material },
    });
  }

  public withGlass(material: MaterialToken, inset = 0.05): WindowBuilder {
    return new WindowBuilder(this.materialFactory, {
      ...this.state,
      glass: { material, inset },
    });
  }

  public build(): THREE.Group {
    if (!this.state.frame) {
      throw new Error("Frame must be defined.");
    }

    const group = new THREE.Group();
    group.name = "window";

    const { rect, material: frameToken } = this.state.frame;

    // Frame
    const frameMaterial = this.materialFactory.create(frameToken);

    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(rect.width, rect.height, rect.depth ?? 0.1),
      frameMaterial,
    );

    frame.position.set(rect.x, rect.y, 0);
    group.add(frame);

    // Glass
    if (this.state.glass) {
      const { material: glassToken, inset } = this.state.glass;

      const glassMaterial = this.materialFactory.create(glassToken);

      const glass = new THREE.Mesh(
        new THREE.BoxGeometry(
          rect.width - inset * 2,
          rect.height - inset * 2,
          (rect.depth ?? 0.1) * 0.5,
        ),
        glassMaterial,
      );

      glass.position.set(rect.x, rect.y, 0.01); // slight offset to avoid z-fighting
      group.add(glass);
    }

    return group;
  }
}