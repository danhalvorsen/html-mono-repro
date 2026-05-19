
import * as THREE from "three";

import type { IMaterialFactory } from "@monorepo/core-threejs-app-framework/src/Materials/IMaterialFactory.js";
import type { MaterialToken } from "@monorepo/core-threejs-app-framework/src/Materials/MaterialToken.js";
import { type Rectangle2 } from '@monorepo/core-math';

export interface IWindowBuilder {
  build(configuration: IWindow): THREE.Object3D;
}

// ====================================================================================
// FILE: composition/WindowBuilder.ts
// ====================================================================================

export interface IWindowFrame {
  readonly rect: Rectangle2;
  readonly material: MaterialToken;
}

export interface IWindowGlass {
  readonly material: MaterialToken;
  readonly inset: number;
}

export interface IWindow {
  readonly frame: IWindowFrame;
  readonly glass?: IWindowGlass;
}

export class Window implements IWindow {
  public readonly frame: IWindowFrame;
  public readonly glass?: IWindowGlass;

  public constructor(
    frame: IWindowFrame,
    glass?: Partial<IWindowGlass> & Pick<IWindowGlass, "material">,
  ) {
    this.assertRect(frame.rect);

    const normalizedFrame = Object.freeze({
      rect: Object.freeze({
        x: frame.rect.x,
        y: frame.rect.y,
        width: frame.rect.width,
        height: frame.rect.height,
      }) as Rectangle2,
      material: frame.material,
    });

    const normalizedGlass = glass
      ? Object.freeze({
          material: glass.material,
          inset: glass.inset ?? 0.05,
        })
      : undefined;

    if (normalizedGlass && (!Number.isFinite(normalizedGlass.inset) || normalizedGlass.inset < 0)) {
      throw new Error("glass inset must be >= 0");
    }

    this.frame = normalizedFrame;
    this.glass = normalizedGlass;

    Object.freeze(this);
  }

  private assertRect(rect: Rectangle2): void {
    if (!Number.isFinite(rect.x) || !Number.isFinite(rect.y)) {
      throw new Error("frame rect position must be finite");
    }

    if (!Number.isFinite(rect.width) || rect.width <= 0) {
      throw new Error("frame rect width must be > 0");
    }

    if (!Number.isFinite(rect.height) || rect.height <= 0) {
      throw new Error("frame rect height must be > 0");
    }
  }
}

export class WindowBuilder implements IWindowBuilder {
  public constructor(
    private readonly materialFactory: IMaterialFactory,
  ) {
  }

  public build(configuration: IWindow): THREE.Group {
    const group = new THREE.Group();
    group.name = "window";

    const { rect, material: frameToken } = configuration.frame;
    const frameDepth = 0.1;
    const requestedInset = configuration.glass?.inset ?? Math.min(rect.width, rect.height) * 0.12;
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
    if (configuration.glass) {
      const { material: glassToken } = configuration.glass;

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
