// // ============================================================================
// // FILE: Applications/art/buildings/block-generator/vite-house/src/three/core/scene/playgrounds/TreeTrunk.Playground.Scene.ts
// // USE THE STRATEGY-BASED TREE GENERATOR IN THE PLAYGROUND
// // ============================================================================

// import * as THREE from "three";

// import type { IThreeScene } from "../IThreeScene.js";
// import { PlaygroundSceneBase } from "../common/PlaygroundSceneBase.ts";

// import type { IMaterialFactory } from "../../../Materials/IMaterialFactory.js";
// import { MaterialToken } from "../../../Materials/MaterialToken.js";

// // STRATEGY-BASED TREE MODEL
 
// import { TreeMeshFactory } from "../../../../Tree/three.tree.renderer/TreeMeshFactory.js";
// import {
//   IndexedTreeGeometryBuilder,
//   TreeThreeRenderer,
// } from "../../../../Tree/three.tree.renderer/three.tree.renderer.js";
// import { TreeModelingCompositionRoot, TreeSpeciesId, type ITreeTrunkDomainObject } from "../../../../Tree/core.tree/core.tree.js";

// export class TreeTrunkPlaygroundScene extends PlaygroundSceneBase {
//   public constructor(
//     scene: IThreeScene,
//     materialFactory: IMaterialFactory,
//   ) {
//     super(scene, "tree-trunk-playground-root", materialFactory);
//   }

//   protected createContent(): void {
//     const oakTree = this.createTree("oak");
//     const pineTree = this.createTree("pine");
//     const birchTree = this.createTree("birch");

//     const oakMesh = this.createTreeMesh(oakTree);
//     oakMesh.name = "Tree.Trunk.Oak";
//     oakMesh.rotation.x = -Math.PI / 2;
//     oakMesh.position.set(-1.5, 0, 0);

//     const pineMesh = this.createTreeMesh(pineTree);
//     pineMesh.name = "Tree.Trunk.Pine";
//     pineMesh.rotation.x = -Math.PI / 2;
//     pineMesh.position.set(0, 0, 0);

//     const birchMesh = this.createTreeMesh(birchTree);
//     birchMesh.name = "Tree.Trunk.Birch";
//     birchMesh.rotation.x = -Math.PI / 2;
//     birchMesh.position.set(1.5, 0, 0);

//     this.addToRoot(oakMesh);
//     this.addToRoot(pineMesh);
//     this.addToRoot(birchMesh);

//     this.addToRoot(new THREE.AxesHelper(5));
//     this.addGround();
//     this.addLightHelpers();
//   }

//   private createTree(species: "oak" | "pine" | "birch"): ITreeTrunkDomainObject {
//     const generator = new TreeModelingCompositionRoot().createGenerator();

//     return generator.generate({
//       speciesId: new TreeSpeciesId(species),
//       years: 12,
//       totalHeight: 4.2,
//       radialSampleCount: 32,
//       verticalSampleCount: 72,
//       baseRadius: this.resolveBaseRadius(species),
//     });
//   }

//   private resolveBaseRadius(species: "oak" | "pine" | "birch"): number {
//     switch (species) {
//       case "oak":
//         return 0.22;
//       case "pine":
//         return 0.18;
//       case "birch":
//         return 0.14;
//     }
//   }

//   private createTreeMesh(tree: ITreeTrunkDomainObject): THREE.Mesh {
//     const geometryBuilder = new IndexedTreeGeometryBuilder();
//     const meshFactory = new TreeMeshFactory(geometryBuilder);
//     const renderer = new TreeThreeRenderer(meshFactory);

//     const tempGroup = new THREE.Group();
//     const mesh = renderer.renderToGroup(
//       tempGroup,
//       tree,
//       this.materialFactory.create(MaterialToken.TreeTrunk),
//     );

//     mesh.castShadow = true;
//     mesh.receiveShadow = true;

//     return mesh;
//   }

//   private addGround(): void {
//     const ground = new THREE.Mesh(
//       new THREE.PlaneGeometry(12, 12),
//       this.materialFactory.create(MaterialToken.Grass),
//     );

//     ground.name = "Ground";
//     ground.rotation.x = Math.PI / 2;
//     ground.position.y = -0.001;
//     ground.receiveShadow = true;

//     this.addToRoot(ground);
//   }

//   private addLightHelpers(): void {
//     const trunkMarker = new THREE.Mesh(
//       new THREE.SphereGeometry(0.04, 12, 12),
//       this.materialFactory.create(MaterialToken.BuildingBlue),
//     );

//     trunkMarker.name = "Tree.Origin.Marker";
//     trunkMarker.position.set(0, 0, 0);
//     trunkMarker.castShadow = true;
//     trunkMarker.receiveShadow = true;

//     this.addToRoot(trunkMarker);
//   }
// }