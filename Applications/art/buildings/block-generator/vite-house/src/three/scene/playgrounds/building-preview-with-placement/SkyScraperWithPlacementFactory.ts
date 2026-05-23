import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { Vector2Gpu } from "@monorepo/core-math-gpu";
import { BoxCompositionRoot, type IBoxModule } from "@monorepo/core-math-rectangle";
import {
  type IOccupiedPlacement,
  type IPlacementCandidate,
  type IPlacementZone,
  type IRectangleKind,
} from "@monorepo/core-rectangle-placement";
import type { IMaterialFactory } from "@monorepo/core-threejs-app-framework/src/Materials/IMaterialFactory.js";
import { WindowRegionPlacementValidator } from "../Placement/spesifications/WindowRegionPlacementValidator.ts";

const WINDOW_KIND: IRectangleKind = { value: "window" };
const BALCONY_KIND: IRectangleKind = { value: "balcony" };
type FacadeId = "front" | "back" | "left" | "right";

interface IFacadePalette {
  readonly body: string;
  readonly roof: string;
  readonly crownRing: string;
  readonly crownCore: string;
  readonly crownSpire: string;
  readonly windowFrame: string;
  readonly windowGlass: string;
  readonly balcony: string;
}

const NICE_PALETTES: readonly IFacadePalette[] = Object.freeze([
  {
    // User palette A
    body: "#C4E2F5",
    roof: "#2C5EAD",
    crownRing: "#4BB8FA",
    crownCore: "#1591DC",
    crownSpire: "#2C5EAD",
    windowFrame: "#2C5EAD",
    windowGlass: "#4BB8FA",
    balcony: "#1591DC",
  },
  {
    // User palette B
    body: "#FFE8BE",
    roof: "#427AB5",
    crownRing: "#F7DD7D",
    crownCore: "#406AAF",
    crownSpire: "#427AB5",
    windowFrame: "#406AAF",
    windowGlass: "#FFE8BE",
    balcony: "#F7DD7D",
  },
  {
    // User palette C (blue-yellow-orange-red neon rainbow kids)
    body: "#F8DE22",
    roof: "#03AED2",
    crownRing: "#F45B26",
    crownCore: "#D12052",
    crownSpire: "#03AED2",
    windowFrame: "#D12052",
    windowGlass: "#03AED2",
    balcony: "#F45B26",
  },
]);

const ALL_COLORS: readonly string[] = Object.freeze(
  Array.from(
    new Set(
      NICE_PALETTES.flatMap((palette) => [
        palette.body,
        palette.roof,
        palette.crownRing,
        palette.crownCore,
        palette.crownSpire,
        palette.windowFrame,
        palette.windowGlass,
        palette.balcony,
      ]),
    ),
  ),
);

export class SkyScraperWithPlacementFactory {
  private readonly boxModule: IBoxModule;
  private static readonly sharedMaterialCache = new Map<string, THREE.Material>();
  private static readonly usedPaletteKeys = new Set<string>();

  public constructor(
    private readonly materialFactory: IMaterialFactory,
    private readonly paletteIndexSeed: number = Math.floor(Math.random() * 1_000_000),
    boxModule?: IBoxModule,
  ) {
    this.boxModule = boxModule ?? new BoxCompositionRoot();
  }

  public create(): THREE.Group {
    const width = this.randomRange(3.6, 8.4);
    const depth = this.randomRange(3.2, 7.6);
    const levels = this.randomInt(10, 60);
    const levelHeight = this.randomRange(1.0, 1.5);
    const bodyHeight = levels * levelHeight;
    const palette = this.pickPalette();

    const group = new THREE.Group();
    group.name = "building-preview-with-placement";

    group.add(this.createBody(width, depth, bodyHeight, palette));
    group.add(this.createRoof(width, depth, bodyHeight, palette));
    group.add(this.createCrown(width, depth, bodyHeight, palette));
    this.addFacadePlacementObjects(group, "front", width, depth, bodyHeight, levels, levelHeight, palette);
    this.addFacadePlacementObjects(group, "back", width, depth, bodyHeight, levels, levelHeight, palette);
    this.addFacadePlacementObjects(group, "left", depth, width, bodyHeight, levels, levelHeight, palette);
    this.addFacadePlacementObjects(group, "right", depth, width, bodyHeight, levels, levelHeight, palette);

    return this.mergeStaticMeshes(group);
  }

  private createBody(width: number, depth: number, bodyHeight: number, palette: IFacadePalette): THREE.Mesh {
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(width, bodyHeight, depth),
      this.createSolidMaterial(palette.body),
    );
    body.position.set(0, bodyHeight * 0.5, 0);
    body.castShadow = true;
    body.receiveShadow = true;
    return body;
  }

  private createRoof(width: number, depth: number, bodyHeight: number, palette: IFacadePalette): THREE.Mesh {
    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(width * 0.92, 0.16, depth * 0.92),
      this.createSolidMaterial(palette.roof),
    );
    roof.position.set(0, bodyHeight + 0.16, 0);
    roof.castShadow = true;
    roof.receiveShadow = true;
    return roof;
  }

  private createCrown(width: number, depth: number, bodyHeight: number, palette: IFacadePalette): THREE.Object3D {
    const crown = new THREE.Group();
    crown.name = "skyscraper-crown";

    const baseY = bodyHeight + 0.3;

    const ring = new THREE.Mesh(
      new THREE.BoxGeometry(width * 0.72, 0.22, depth * 0.72),
      this.createSolidMaterial(palette.crownRing),
    );
    ring.position.set(0, baseY, 0);
    ring.castShadow = true;
    ring.receiveShadow = true;
    crown.add(ring);

    const core = new THREE.Mesh(
      new THREE.BoxGeometry(width * 0.38, 0.7, depth * 0.38),
      this.createSolidMaterial(palette.crownCore),
    );
    core.position.set(0, baseY + 0.42, 0);
    core.castShadow = true;
    core.receiveShadow = true;
    crown.add(core);

    const spire = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.08, 0.85, 10),
      this.createSolidMaterial(palette.crownSpire),
    );
    spire.position.set(0, baseY + 1.12, 0);
    spire.castShadow = true;
    spire.receiveShadow = true;
    crown.add(spire);

    return crown;
  }

  private addFacadePlacementObjects(
    root: THREE.Group,
    facadeId: FacadeId,
    facadeWidth: number,
    facadeDepth: number,
    bodyHeight: number,
    levels: number,
    levelHeight: number,
    palette: IFacadePalette,
  ): void {
    const facade = this.createFacadeGroup(facadeId, facadeWidth, facadeDepth);
    root.add(facade);

    const hostBounds = this.boxModule.createAabb2(
      new Vector2Gpu(-(facadeWidth * 0.5) + 0.25, 0.35),
      new Vector2Gpu((facadeWidth * 0.5) - 0.25, bodyHeight - 0.3),
    );

    const zones = this.createZones(hostBounds, bodyHeight, facadeId);
    const candidates = this.createCandidates(hostBounds, levels, levelHeight, facadeId);
    const validator = new WindowRegionPlacementValidator(hostBounds, zones, 0.12, this.boxModule);
    const occupied: IOccupiedPlacement[] = [];

    for (const regionalCandidate of candidates) {
      const result = validator.validate(regionalCandidate, occupied);
      if (!result.isValid || result.acceptedPlan === null) {
        continue;
      }

      const accepted = result.acceptedPlan.reservation.candidate;
      if (accepted.kind.value === WINDOW_KIND.value) {
        facade.add(this.createWindowMesh(accepted, palette));
      } else {
        facade.add(this.createBalconyMesh(accepted, palette));
      }

      occupied.push({ candidate: accepted });
    }
  }

  private createFacadeGroup(facadeId: FacadeId, width: number, depth: number): THREE.Group {
    const group = new THREE.Group();
    group.name = `facade-${facadeId}`;

    if (facadeId === "front") {
      group.position.set(0, 0, depth * 0.5);
      return group;
    }

    if (facadeId === "back") {
      group.position.set(0, 0, -(depth * 0.5));
      group.rotation.y = Math.PI;
      return group;
    }

    if (facadeId === "left") {
      group.position.set(-(depth * 0.5), 0, 0);
      group.rotation.y = -(Math.PI * 0.5);
      return group;
    }

    group.position.set(depth * 0.5, 0, 0);
    group.rotation.y = Math.PI * 0.5;
    return group;
  }

  private createZones(
    hostBounds: ReturnType<IBoxModule["createAabb2"]>,
    bodyHeight: number,
    facadeId: FacadeId,
  ): readonly IPlacementZone[] {
    const windowZone: IPlacementZone = {
      id: { value: `windows-${facadeId}` },
      bounds: this.boxModule.createAabb2(
        new Vector2Gpu(hostBounds.center().x - (hostBounds.width() * 0.5), 0.6),
        new Vector2Gpu(hostBounds.center().x + (hostBounds.width() * 0.5), bodyHeight - 0.6),
      ),
      allowedKinds: [WINDOW_KIND],
    };

    const balconyZone: IPlacementZone = {
      id: { value: `balcony-${facadeId}` },
      bounds: this.boxModule.createAabb2(
        new Vector2Gpu(hostBounds.center().x - (hostBounds.width() * 0.35), 0.9),
        new Vector2Gpu(hostBounds.center().x + (hostBounds.width() * 0.35), bodyHeight - 2.0),
      ),
      allowedKinds: [BALCONY_KIND],
    };

    return [windowZone, balconyZone];
  }

  private createCandidates(
    hostBounds: ReturnType<IBoxModule["createAabb2"]>,
    levels: number,
    levelHeight: number,
    facadeId: FacadeId,
  ): readonly { regionId: string; candidate: IPlacementCandidate }[] {
    const list: { regionId: string; candidate: IPlacementCandidate }[] = [];
    const left = hostBounds.center().x - (hostBounds.width() * 0.5);
    const columns = 4;

    for (let floor = 0; floor < levels; floor += 1) {
      const baseY = 0.45 + floor * levelHeight;
      const step = hostBounds.width() / (columns + 1);
      const windowWidth = Math.min(0.62, step * 0.62);
      const windowHeight = 0.74;

      for (let column = 1; column <= columns; column += 1) {
        const xCenter = left + (step * column);
        const centerX = THREE.MathUtils.clamp(
          xCenter,
          left + windowWidth * 0.5,
          left + hostBounds.width() - windowWidth * 0.5,
        );
        const minX = centerX - windowWidth * 0.5;
        const maxX = centerX + windowWidth * 0.5;
        const minY = baseY;
        const maxY = baseY + windowHeight;

        list.push({
          regionId: `windows-${facadeId}`,
          candidate: {
            kind: WINDOW_KIND,
            bounds: this.boxModule.createAabb2(new Vector2Gpu(minX, minY), new Vector2Gpu(maxX, maxY)),
          },
        });
      }

      if (floor > 0 && floor < levels - 1 && Math.random() < 0.4) {
        const w = 1.4 + Math.random() * 0.5;
        const h = 0.28;
        const minX = -w * 0.5;
        const maxX = w * 0.5;
        const minY = baseY - 0.12;
        const maxY = minY + h;

        list.push({
          regionId: `balcony-${facadeId}`,
          candidate: {
            kind: BALCONY_KIND,
            bounds: this.boxModule.createAabb2(new Vector2Gpu(minX, minY), new Vector2Gpu(maxX, maxY)),
          },
        });
      }
    }

    return list.sort(() => Math.random() - 0.5);
  }

  private createWindowMesh(candidate: IPlacementCandidate, palette: IFacadePalette): THREE.Object3D {
    const bounds = candidate.bounds;
    const center = bounds.center();
    const window = this.createWindowObject(bounds.width(), bounds.height(), palette);

    window.position.set(center.x, center.y, 0.08);
    return window;
  }

  private createBalconyMesh(candidate: IPlacementCandidate, palette: IFacadePalette): THREE.Object3D {
    const bounds = candidate.bounds;
    const center = bounds.center();
    const width = bounds.width();
    const height = bounds.height();
    const group = new THREE.Group();
    group.name = "balcony";

    const slabDepth = 0.55;
    const slab = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, slabDepth),
      this.createSolidMaterial(palette.balcony),
    );
    slab.position.set(0, 0, 0);
    slab.castShadow = true;
    slab.receiveShadow = true;
    group.add(slab);

    const wallHeight = 0.32;
    const wallThickness = 0.06;
    const sideWallDepth = slabDepth - 0.02;

    const frontWall = new THREE.Mesh(
      new THREE.BoxGeometry(width, wallHeight, wallThickness),
      this.createSolidMaterial(palette.windowFrame),
    );
    frontWall.position.set(0, (height * 0.5) + (wallHeight * 0.5), (slabDepth * 0.5) - (wallThickness * 0.5));
    frontWall.castShadow = true;
    frontWall.receiveShadow = true;
    group.add(frontWall);

    const leftWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallThickness, wallHeight, sideWallDepth),
      this.createSolidMaterial(palette.windowFrame),
    );
    leftWall.position.set(-(width * 0.5) + (wallThickness * 0.5), (height * 0.5) + (wallHeight * 0.5), 0);
    leftWall.castShadow = true;
    leftWall.receiveShadow = true;
    group.add(leftWall);

    const rightWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallThickness, wallHeight, sideWallDepth),
      this.createSolidMaterial(palette.windowFrame),
    );
    rightWall.position.set((width * 0.5) - (wallThickness * 0.5), (height * 0.5) + (wallHeight * 0.5), 0);
    rightWall.castShadow = true;
    rightWall.receiveShadow = true;
    group.add(rightWall);

    group.position.set(center.x, center.y, (slabDepth * 0.5) + 0.04);
    return group;
  }

  private pickPalette(): IFacadePalette {
    const roleOffsets = Object.freeze({
      body: 0,
      roof: 3,
      crownRing: 5,
      crownCore: 7,
      crownSpire: 11,
      windowFrame: 13,
      windowGlass: 17,
      balcony: 19,
    });
    const total = ALL_COLORS.length;
    const base = this.paletteIndexSeed % total;

    const palette = {
      body: ALL_COLORS[(base + roleOffsets.body) % total],
      roof: ALL_COLORS[(base + roleOffsets.roof) % total],
      crownRing: ALL_COLORS[(base + roleOffsets.crownRing) % total],
      crownCore: ALL_COLORS[(base + roleOffsets.crownCore) % total],
      crownSpire: ALL_COLORS[(base + roleOffsets.crownSpire) % total],
      windowFrame: ALL_COLORS[(base + roleOffsets.windowFrame) % total],
      windowGlass: ALL_COLORS[(base + roleOffsets.windowGlass) % total],
      balcony: ALL_COLORS[(base + roleOffsets.balcony) % total],
    } satisfies IFacadePalette;

    const key = [
      palette.body,
      palette.roof,
      palette.crownRing,
      palette.crownCore,
      palette.crownSpire,
      palette.windowFrame,
      palette.windowGlass,
      palette.balcony,
    ].join("|");

    if (!SkyScraperWithPlacementFactory.usedPaletteKeys.has(key)) {
      SkyScraperWithPlacementFactory.usedPaletteKeys.add(key);
      return palette;
    }

    // Resolve collisions deterministically by stepping the seed.
    for (let step = 1; step < total; step += 1) {
      const shiftedBase = (base + step) % total;
      const shifted = {
        body: ALL_COLORS[(shiftedBase + roleOffsets.body) % total],
        roof: ALL_COLORS[(shiftedBase + roleOffsets.roof) % total],
        crownRing: ALL_COLORS[(shiftedBase + roleOffsets.crownRing) % total],
        crownCore: ALL_COLORS[(shiftedBase + roleOffsets.crownCore) % total],
        crownSpire: ALL_COLORS[(shiftedBase + roleOffsets.crownSpire) % total],
        windowFrame: ALL_COLORS[(shiftedBase + roleOffsets.windowFrame) % total],
        windowGlass: ALL_COLORS[(shiftedBase + roleOffsets.windowGlass) % total],
        balcony: ALL_COLORS[(shiftedBase + roleOffsets.balcony) % total],
      } satisfies IFacadePalette;
      const shiftedKey = [
        shifted.body,
        shifted.roof,
        shifted.crownRing,
        shifted.crownCore,
        shifted.crownSpire,
        shifted.windowFrame,
        shifted.windowGlass,
        shifted.balcony,
      ].join("|");
      if (!SkyScraperWithPlacementFactory.usedPaletteKeys.has(shiftedKey)) {
        SkyScraperWithPlacementFactory.usedPaletteKeys.add(shiftedKey);
        return shifted;
      }
    }

    return palette;
  }

  private randomRange(min: number, max: number): number {
    return min + (Math.random() * (max - min));
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * ((max - min) + 1)) + min;
  }

  private createWindowObject(width: number, height: number, palette: IFacadePalette): THREE.Object3D {
    const group = new THREE.Group();
    const frameThickness = Math.max(0.05, Math.min(width, height) * 0.14);
    const frameDepth = 0.09;
    const frameMat = this.createSolidMaterial(palette.windowFrame);

    const top = new THREE.Mesh(new THREE.BoxGeometry(width, frameThickness, frameDepth), frameMat);
    top.position.set(0, (height - frameThickness) * 0.5, 0);
    const bottom = new THREE.Mesh(new THREE.BoxGeometry(width, frameThickness, frameDepth), frameMat);
    bottom.position.set(0, -(height - frameThickness) * 0.5, 0);

    const sideHeight = Math.max(height - (frameThickness * 2), 0.02);
    const left = new THREE.Mesh(new THREE.BoxGeometry(frameThickness, sideHeight, frameDepth), frameMat);
    left.position.set(-(width - frameThickness) * 0.5, 0, 0);
    const right = new THREE.Mesh(new THREE.BoxGeometry(frameThickness, sideHeight, frameDepth), frameMat);
    right.position.set((width - frameThickness) * 0.5, 0, 0);

    const glass = new THREE.Mesh(
      new THREE.BoxGeometry(
        Math.max(width - (frameThickness * 2), 0.02),
        Math.max(height - (frameThickness * 2), 0.02),
        frameDepth * 0.5,
      ),
      this.createGlassMaterial(palette.windowGlass),
    );
    glass.position.set(0, 0, 0.01);

    group.add(top, bottom, left, right, glass);
    group.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
    return group;
  }

  private createSolidMaterial(hexColor: string): THREE.Material {
    const key = `solid:${hexColor.toLowerCase()}`;
    const cached = SkyScraperWithPlacementFactory.sharedMaterialCache.get(key);
    if (cached !== undefined) {
      return cached;
    }

    const created = new THREE.MeshStandardMaterial({ color: hexColor, roughness: 0.56, metalness: 0.08 });
    SkyScraperWithPlacementFactory.sharedMaterialCache.set(key, created);
    return created;
  }

  private createGlassMaterial(hexColor: string): THREE.Material {
    const key = `glass:${hexColor.toLowerCase()}`;
    const cached = SkyScraperWithPlacementFactory.sharedMaterialCache.get(key);
    if (cached !== undefined) {
      return cached;
    }

    const created = new THREE.MeshStandardMaterial({
      color: hexColor,
      transparent: true,
      opacity: 0.55,
      roughness: 0.2,
      metalness: 0.15,
    });
    SkyScraperWithPlacementFactory.sharedMaterialCache.set(key, created);
    return created;
  }

  private mergeStaticMeshes(root: THREE.Group): THREE.Group {
    root.updateMatrixWorld(true);

    const rootInverse = root.matrixWorld.clone().invert();
    const grouped = new Map<THREE.Material, THREE.BufferGeometry[]>();

    root.traverse((node) => {
      if (!(node instanceof THREE.Mesh)) {
        return;
      }

      if (!(node.geometry instanceof THREE.BufferGeometry)) {
        return;
      }

      if (Array.isArray(node.material)) {
        return;
      }

      const geometry = node.geometry.clone();
      const localMatrix = rootInverse.clone().multiply(node.matrixWorld);
      geometry.applyMatrix4(localMatrix);

      const bucket = grouped.get(node.material);
      if (bucket === undefined) {
        grouped.set(node.material, [geometry]);
      } else {
        bucket.push(geometry);
      }
    });

    root.clear();

    for (const [material, geometries] of grouped.entries()) {
      const merged = mergeGeometries(geometries, false);
      if (merged === null) {
        continue;
      }

      const mesh = new THREE.Mesh(merged, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      root.add(mesh);
    }

    return root;
  }
}
