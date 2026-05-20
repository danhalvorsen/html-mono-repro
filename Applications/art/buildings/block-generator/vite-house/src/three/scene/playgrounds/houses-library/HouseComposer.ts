import * as THREE from "three";
import { HouseElements } from "./HouseElements.ts";
import type { IHousePalette } from "./HousePalette.ts";

type HouseVariant = "flat" | "gable35" | "gable45" | "stacked";
export type HouseStyleVariant =
  | "modern-peaked"
  | "modern-butterfly"
  | "modern-flat"
  | "modern-sloped"
  | "modern-flat-sloped-out"
  | "modern-flat-sloped-in"
  | "ranch-open-gable"
  | "ranch-overlaid-hip"
  | "ranch-intersecting-hip"
  | "ranch-cross-hipped"
  | "ranch-hipped"
  | "ranch-open-gable-hip-wings";

export class HouseComposer {
  public create(
    variant: HouseStyleVariant,
    palette: IHousePalette,
    seed: number,
  ): THREE.Group {
    const elements = new HouseElements(palette);
    const house = new THREE.Group();
    house.name = `house-${variant}-${seed}`;

    const w = 3 + ((seed % 4) * 0.7);
    const d = 2.7 + (((seed + 2) % 4) * 0.55);
    const h = 1.9 + (((seed + 1) % 3) * 0.45);
    const slab = elements.baseSlab(w + 1.2, d + 1.2);
    house.add(slab);

    const body = elements.boxMass(w, h, d, variant.startsWith("ranch-") && (seed % 2 === 0));
    house.add(body);
    const top = h + 0.24;

    switch (variant) {
      case "modern-peaked":
        house.add(elements.pitchedRoof(w * 1.08, d * 1.2, top, 35));
        break;
      case "modern-butterfly":
        house.add(this.butterflyRoof(elements, w, d, top));
        break;
      case "modern-flat":
        house.add(elements.flatRoof(w * 1.06, d * 1.06, top));
        break;
      case "modern-sloped":
        house.add(this.singleSlopeRoof(elements, w, d, top, 28, false));
        break;
      case "modern-flat-sloped-out":
        house.add(elements.flatRoof(w * 1.03, d * 0.7, top));
        house.add(this.singleSlopeRoof(elements, w * 1.02, d * 0.55, top + 0.05, 24, false));
        break;
      case "modern-flat-sloped-in":
        house.add(elements.flatRoof(w * 1.03, d * 0.74, top));
        house.add(this.singleSlopeRoof(elements, w * 1.02, d * 0.58, top + 0.04, 24, true));
        break;
      case "ranch-open-gable":
        house.add(elements.pitchedRoof(w * 1.06, d * 1.14, top, 32));
        break;
      case "ranch-overlaid-hip":
        house.add(elements.pitchedRoof(w * 1.06, d * 1.1, top, 28));
        house.add(elements.pitchedRoof(w * 0.58, d * 0.58, top + 0.12, 20));
        break;
      case "ranch-intersecting-hip":
        house.add(elements.pitchedRoof(w * 1.04, d * 1.08, top, 26));
        house.add(this.crossHip(elements, w, d, top + 0.04));
        break;
      case "ranch-cross-hipped":
        house.add(elements.pitchedRoof(w * 1.04, d * 1.08, top, 24));
        house.add(this.crossHip(elements, w * 0.9, d * 0.7, top + 0.08));
        break;
      case "ranch-hipped":
        house.add(elements.pitchedRoof(w * 1.03, d * 1.05, top, 22));
        break;
      case "ranch-open-gable-hip-wings":
        house.add(elements.pitchedRoof(w * 0.72, d * 1.14, top + 0.06, 34));
        house.add(elements.pitchedRoof(w * 0.44, d * 0.82, top, 22));
        break;
      default:
        house.add(elements.flatRoof(w * 1.04, d * 1.04, top));
        break;
    }

    const ranch = variant.startsWith("ranch-");
    this.addFacadeOpenings(house, elements, w, d, h, ranch ? 3 : 5);
    this.addPorchAndStairs(house, elements, w, d);

    return house;
  }

  private addFacadeOpenings(
    house: THREE.Group,
    elements: HouseElements,
    w: number,
    d: number,
    h: number,
    windowCount: number,
  ): void {
    const zFront = (d * 0.5) + 0.02;
    const yBase = 0.86;

    house.add(elements.door(w * 0.24, 0.68, zFront));

    const step = w / (windowCount + 1);
    for (let i = 1; i <= windowCount; i += 1) {
      const x = -(w * 0.5) + (step * i);
      house.add(elements.window(x, yBase, zFront, 0.46, 0.3));
    }

    const upperY = Math.min(yBase + 0.72, h + 0.06);
    for (let i = 1; i <= Math.max(2, windowCount - 2); i += 1) {
      const x = -(w * 0.45) + ((w * 0.9) * (i / (Math.max(2, windowCount - 2) + 1)));
      house.add(elements.window(x, upperY, -(d * 0.5) - 0.02, 0.38, 0.24));
    }
  }

  private addPorchAndStairs(house: THREE.Group, elements: HouseElements, w: number, d: number): void {
    const porch = new THREE.Mesh(
      new THREE.BoxGeometry(Math.max(1.4, w * 0.44), 0.12, 0.9),
      new THREE.MeshStandardMaterial({ color: "#e6d6c2", roughness: 0.82, metalness: 0.01 }),
    );
    porch.position.set(0, 0.30, (d * 0.5) + 0.52);
    porch.receiveShadow = true;
    house.add(porch);

    const stairs = elements.stairs(Math.max(0.8, w * 0.25), 3, 0.08, 0.22);
    stairs.position.set(0, 0.24, (d * 0.5) + 0.86);
    house.add(stairs);
  }

  private butterflyRoof(elements: HouseElements, w: number, d: number, topY: number): THREE.Object3D {
    const group = new THREE.Group();
    const left = elements.pitchedRoof(w * 0.54, d * 1.06, topY, -22);
    left.position.x = -(w * 0.23);
    const right = elements.pitchedRoof(w * 0.54, d * 1.06, topY, 22);
    right.position.x = w * 0.23;
    group.add(left, right);
    return group;
  }

  private singleSlopeRoof(
    elements: HouseElements,
    w: number,
    d: number,
    topY: number,
    degrees: number,
    inward: boolean,
  ): THREE.Object3D {
    const roof = elements.pitchedRoof(w, d, topY, inward ? -degrees : degrees);
    return roof;
  }

  private crossHip(elements: HouseElements, w: number, d: number, topY: number): THREE.Object3D {
    const group = new THREE.Group();
    const main = elements.pitchedRoof(w * 0.8, d * 0.46, topY, 22);
    main.rotation.y = Math.PI * 0.5;
    const cross = elements.pitchedRoof(w * 0.46, d * 0.8, topY, 22);
    group.add(main, cross);
    return group;
  }
}
