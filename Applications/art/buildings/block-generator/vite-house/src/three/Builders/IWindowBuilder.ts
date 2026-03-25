
import * as THREE from "three";

import type { IMaterialFactory } from "../Materials/IMaterialFactory.js";
import type { MaterialToken } from "../Materials/MaterialToken.js";
import { type Rectangle2 } from '@monorepo/core-math';

export interface IWindowBuilder {
  reset(): void;
  withFrame(rect: Rectangle2, material: MaterialToken): IWindowBuilder;
  withGlass(material: MaterialToken, inset?: number): IWindowBuilder;
  build(): THREE.Object3D;
}

// ====================================================================================
// FILE: composition/WindowBuilder.ts
// ====================================================================================

type State = Readonly<{
  frame: {
    rect: Rectangle2;
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

  public withFrame(rect: Rectangle2, material: MaterialToken): WindowBuilder {
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
    const frameDepth = 0.1;
    const requestedInset = this.state.glass?.inset ?? Math.min(rect.width, rect.height) * 0.12;
    const frameThickness = Math.max(0.04, Math.min(requestedInset, Math.min(rect.width, rect.height) * 0.45));

    // Frame
    const frameMaterial = this.materialFactory.create(frameToken);
    const top = new THREE.Mesh(
      new THREE.BoxGeometry(rect.width, frameThickness, frameDepth),
      frameMaterial,
    );
    top.position.set(rect.x, rect.y + ((rect.height - frameThickness) / 2), 0);

    const bottom = new THREE.Mesh(
      new THREE.BoxGeometry(rect.width, frameThickness, frameDepth),
      frameMaterial,
    );
    bottom.position.set(rect.x, rect.y - ((rect.height - frameThickness) / 2), 0);

    const sideHeight = Math.max(rect.height - (frameThickness * 2), 0.02);

    const left = new THREE.Mesh(
      new THREE.BoxGeometry(frameThickness, sideHeight, frameDepth),
      frameMaterial,
    );
    left.position.set(rect.x - ((rect.width - frameThickness) / 2), rect.y, 0);

    const right = new THREE.Mesh(
      new THREE.BoxGeometry(frameThickness, sideHeight, frameDepth),
      frameMaterial,
    );
    right.position.set(rect.x + ((rect.width - frameThickness) / 2), rect.y, 0);

    group.add(top, bottom, left, right);

    // Glass
    if (this.state.glass) {
      const { material: glassToken } = this.state.glass;

      const glassMaterial = this.materialFactory.create(glassToken);

      const glassWidth = Math.max(rect.width - (frameThickness * 2), 0.02);
      const glassHeight = Math.max(rect.height - (frameThickness * 2), 0.02);

      const glass = new THREE.Mesh(
        new THREE.BoxGeometry(
          glassWidth,
          glassHeight,
          frameDepth * 0.5,
        ),
        glassMaterial,
      );

      glass.position.set(rect.x, rect.y, 0.01); // slight offset to avoid z-fighting
      group.add(glass);
    }

    return group;
  }
}