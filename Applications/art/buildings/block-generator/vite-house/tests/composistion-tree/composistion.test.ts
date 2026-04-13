// ====================================================================================
// FILE: tests/fixtures/primitive-composition-tree.fixture.ts
// ====================================================================================

import * as THREE from "three";
import { describe, expect, it } from "vitest";

import type { IPrimitiveNode } from "../../../../../../../packages/core-design-pattern-composite-tree-threejs/src/IPrimitiveNode.js";
import type { IPrimitiveCompositeNode } from "../../../../../../../packages/core-design-pattern-composite-tree-threejs/src/IPrimitiveCompositeNode.js";
import { PrimitiveTreeSearch } from "../../../../../../../packages/core-design-pattern-composite-tree-threejs/src/PrimitiveTreeSearch.js";
import { PrimitiveNodeFactory } from "../../src/three/PrimitiveNodeFactory.js";
import { Box } from "../../src/three/Builders/Box/box.js";
import { Cylinder } from "../../src/three/Builders/Cylinder/Cylinder.js";
import { HalfSphere } from "../../src/three/Builders/HalfSphere/HalfSphere.js";

export interface IPrimitiveCompositionFixture {
  readonly scene: THREE.Scene;
  readonly nodeFactory: PrimitiveNodeFactory;
  readonly library: IPrimitiveCompositeNode;
  readonly templates: IPrimitiveCompositeNode;
  readonly primitives: IPrimitiveCompositeNode;
}
export interface IPrimitiveCompositionFixture {
  readonly scene: THREE.Scene;
  readonly nodeFactory: PrimitiveNodeFactory;
  readonly library: IPrimitiveCompositeNode;
  readonly templates: IPrimitiveCompositeNode;
  readonly primitives: IPrimitiveCompositeNode;
}

export class PrimitiveCompositionFixture implements IPrimitiveCompositionFixture {
  public readonly scene: THREE.Scene;
  public readonly nodeFactory: PrimitiveNodeFactory;
  public readonly library: IPrimitiveCompositeNode;
  public readonly templates: IPrimitiveCompositeNode;
  public readonly primitives: IPrimitiveCompositeNode;

  public constructor() {
    this.scene = new THREE.Scene();
    this.nodeFactory = new PrimitiveNodeFactory();

    this.library = this.nodeFactory.createGroup("Library");
    this.primitives = this.nodeFactory.createGroup("Primitives");
    this.templates = this.nodeFactory.createGroup("Templates");

    this.buildPrimitiveLibrary();
    this.buildTemplates();

    this.library.add(this.primitives);
    this.library.add(this.templates);
  }

  public createSceneRoot(name: string = "SceneRoot"): IPrimitiveCompositeNode {
    return this.nodeFactory.createGroup(name);
  }

  public addInstantiatedToScene(root: IPrimitiveNode): THREE.Object3D {
    const object3d = root.instantiate();
    this.scene.add(object3d);
    return object3d;
  }

  private buildPrimitiveLibrary(): void {
    this.primitives.add(this.nodeFactory.box("Box.Small", new Box(1, 1, 1)));
    this.primitives.add(this.nodeFactory.halfSphere("HalfSphere.Small", new HalfSphere(0.5, 16)));
    this.primitives.add(this.nodeFactory.cylinder("Cylinder.Column", new Cylinder(0.25, 0.25, 2, 16)));
    this.primitives.add(this.nodeFactory.box("Roof.Block", new Box(2, 1, 2)));
  }

  private buildTemplates(): void {
    const house = this.nodeFactory.createGroup("Template.House");

    house.add(this.nodeFactory.box("Body", new Box(4, 2, 3)));
    house.add(this.nodeFactory.box("Roof", new Box(4.5, 1.5, 3.5)));

    const tower = this.nodeFactory.createGroup("Template.Tower");

    tower.add(this.nodeFactory.cylinder("Core", new Cylinder(0.75, 0.75, 5, 20)));
    tower.add(this.nodeFactory.halfSphere("Cap", new HalfSphere(0.9, 20)));

    const block = this.nodeFactory.createGroup("Template.Block");

    block.add(house.cloneNode());
    block.add(house.cloneNode());
    block.add(tower.cloneNode());

    this.templates.add(house);
    this.templates.add(tower);
    this.templates.add(block);
  }
}
 
describe("Primitive composition tree integration", () => {
  it("should build a reusable primitive library and find a template by name", () => {
    const fixture = new PrimitiveCompositionFixture();

    const found = PrimitiveTreeSearch.findByName(fixture.library, "Template.House");

    expect(found).not.toBeNull();
    expect(found?.name).toBe("Template.House");
    expect(found?.getChildren()).toHaveLength(2);
  });

  it("should clone a composition subtree and keep source and clone isolated at domain level", () => {
    const fixture = new PrimitiveCompositionFixture();

    const found = PrimitiveTreeSearch.findByName(fixture.library, "Template.House");
    expect(found).not.toBeNull();

    const original = found as IPrimitiveNode;
    const clone = original.cloneNode();

    expect(clone).not.toBe(original);
    expect(clone.name).toBe(original.name);
    expect(clone.getChildren()).toHaveLength(original.getChildren().length);
    expect(clone.getChildren()[0]).not.toBe(original.getChildren()[0]);
  });

  it("should instantiate a primitive composition into a Three.js object hierarchy", () => {
    const fixture = new PrimitiveCompositionFixture();

    const found = PrimitiveTreeSearch.findByName(fixture.library, "Template.House");
    expect(found).not.toBeNull();

    const sceneRoot = fixture.createSceneRoot();
    sceneRoot.add((found as IPrimitiveNode).cloneNode());

    const object3d = sceneRoot.instantiate();

    expect(object3d).toBeInstanceOf(THREE.Group);
    expect(object3d.name).toBe("SceneRoot");
    expect(object3d.children).toHaveLength(1);

    const houseGroup = object3d.children[0];
    expect(houseGroup).toBeInstanceOf(THREE.Group);
    expect(houseGroup.name).toBe("Template.House");
    expect(houseGroup.children).toHaveLength(2);

    expect(houseGroup.children[0]).toBeInstanceOf(THREE.Object3D);
    expect(houseGroup.children[1]).toBeInstanceOf(THREE.Object3D);
  });

  it("should add an instantiated composition to a Three.js scene", () => {
    const fixture = new PrimitiveCompositionFixture();

    const found = PrimitiveTreeSearch.findByName(fixture.library, "Template.Block");
    expect(found).not.toBeNull();

    const sceneRoot = fixture.createSceneRoot("City");
    sceneRoot.add((found as IPrimitiveNode).cloneNode());

    const object3d = fixture.addInstantiatedToScene(sceneRoot);

    expect(fixture.scene.children).toContain(object3d);
    expect(fixture.scene.children).toHaveLength(1);

    const city = fixture.scene.children[0];
    expect(city.name).toBe("City");
    expect(city).toBeInstanceOf(THREE.Group);
    expect(city.children).toHaveLength(1);

    const block = city.children[0];
    expect(block.name).toBe("Template.Block");
    expect(block.children.length).toBeGreaterThan(0);
  });

  it("should create fresh runtime Object3D instances for each instantiation", () => {
    const fixture = new PrimitiveCompositionFixture();

    const found = PrimitiveTreeSearch.findByName(fixture.library, "Template.House");
    expect(found).not.toBeNull();

    const first = (found as IPrimitiveNode).instantiate();
    const second = (found as IPrimitiveNode).instantiate();

    expect(first).not.toBe(second);
    expect(first.children).toHaveLength(2);
    expect(second.children).toHaveLength(2);

    expect(first.children[0]).not.toBe(second.children[0]);
    expect(first.children[1]).not.toBe(second.children[1]);
  });

  it("should allow Three.js scene graph transforms after instantiation", () => {
    const fixture = new PrimitiveCompositionFixture();

    const found = PrimitiveTreeSearch.findByName(fixture.library, "Template.Tower");
    expect(found).not.toBeNull();

    const sceneRoot = fixture.createSceneRoot("PlacedTower");
    sceneRoot.add((found as IPrimitiveNode).cloneNode());

    const object3d = fixture.addInstantiatedToScene(sceneRoot);

    object3d.position.set(10, 0, 5);
    object3d.rotation.y = Math.PI / 4;
    object3d.scale.set(2, 2, 2);

    expect(object3d.position.x).toBe(10);
    expect(object3d.position.y).toBe(0);
    expect(object3d.position.z).toBe(5);

    expect(object3d.rotation.y).toBeCloseTo(Math.PI / 4);
    expect(object3d.scale.x).toBe(2);
    expect(object3d.scale.y).toBe(2);
    expect(object3d.scale.z).toBe(2);
  });

  it("should support building a larger practical composition from reusable templates", () => {
    const fixture = new PrimitiveCompositionFixture();

    const house = PrimitiveTreeSearch.findByName(fixture.library, "Template.House");
    const tower = PrimitiveTreeSearch.findByName(fixture.library, "Template.Tower");

    expect(house).not.toBeNull();
    expect(tower).not.toBeNull();

    const district = fixture.createSceneRoot("District");
    district.add((house as IPrimitiveNode).cloneNode());
    district.add((house as IPrimitiveNode).cloneNode());
    district.add((tower as IPrimitiveNode).cloneNode());

    const districtObject = fixture.addInstantiatedToScene(district);

    expect(districtObject.name).toBe("District");
    expect(districtObject.children).toHaveLength(3);
    expect(districtObject.children[0].name).toBe("Template.House");
    expect(districtObject.children[1].name).toBe("Template.House");
    expect(districtObject.children[2].name).toBe("Template.Tower");
  });
});
