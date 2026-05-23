import { BuildingPreviewScene } from "../BuildingPreviewScene";
import { BuildingPreviewWithPlacementPlaygroundScene } from "./building-preview-with-placement/BuildingPreviewWithPlacementPlaygroundScene";
import { TinyPrimitiveCompositionScene } from "./compositions/simple/TinyPrimitiveCompositionScene.ts";
import { ControlledBoxGridPlaygroundScene } from "./ControlledBoxGrid";
import { FooBuilderPlaygroundScene } from "./FooBuilder.Playground.Scene";
import { HousesCollectionPlaygroundScene } from "./HousesCollectionPlaygroundScene";
import { PlacementScene } from "./Placement/Placement.Platground.Scene";
import { ProgressiveMeshDemo1PlaygroundScene } from "./progressive-mesh-demo-1/ProgressiveMeshDemo1PlaygroundScene";
import { HeightMapProgressiveGridPlaygroundScene } from "./height-map/HeightMapProgressiveGridPlaygroundScene";
import { HeigthmapPlaygroundScene } from "./heigthmap/HeigthmapPlaygroundScene";
import { VectorFieldPlaygroundScene } from "./vector-field/VectorFieldPlaygroundScene";
import { WavesPlaygroundScene } from "./waves/WavesPlaygroundScene";
import { WindowBuilderPlaygroundScene } from "./WindowBuilder.Playground.Scene";
import type { PlaygroundPlugin } from "./PlaygroundPlugin";

export const playgroundPlugins: readonly PlaygroundPlugin[] = [
  {
    id: "building-preview",
    label: "BuildingPreviewScene",
    create: ({ scene }) => new BuildingPreviewScene(scene, "building-preview"),
  },
  {
    id: "building-preview-with-placement",
    label: "BuildingPreviewWithPlacementPlaygroundScene",
    create: ({ scene, materialFactory }) =>
      new BuildingPreviewWithPlacementPlaygroundScene(
        scene,
        materialFactory,
        "building-preview-with-placement",
      ),
  },
  {
    id: "window-builder",
    label: "WindowBuilderPlaygroundScene",
    create: ({ scene, materialFactory }) =>
      new WindowBuilderPlaygroundScene(scene, materialFactory, "window-builder"),
  },
  {
    id: "foo-builder",
    label: "FooBuilderPlaygroundScene",
    create: ({ scene, materialFactory }) =>
      new FooBuilderPlaygroundScene(scene, materialFactory, "foo-builder"),
  },
  {
    id: "houses-collection",
    label: "HousesCollectionPlaygroundScene",
    create: ({ scene, materialFactory }) =>
      new HousesCollectionPlaygroundScene(scene, materialFactory, "houses-collection"),
  },
  {
    id: "controlled-box-grid",
    label: "ControlledBoxGridPlaygroundScene",
    create: ({ scene, materialFactory }) =>
      new ControlledBoxGridPlaygroundScene(
        scene,
        materialFactory,
        undefined,
        "controlled-box-grid",
      ),
  },
  {
    id: "tiny-primitive-composition",
    label: "TinyPrimitiveCompositionScene",
    create: ({ scene, materialFactory }) =>
      new TinyPrimitiveCompositionScene(
        scene,
        materialFactory,
        "tiny-primitive-composition",
      ),
  },
  {
    id: "placement",
    label: "Placement.Playground.Scene",
    create: ({ scene, materialFactory }) =>
      new PlacementScene(scene, materialFactory, "placement"),
  },
  {
    id: "vector-field",
    label: "VectorFieldPlaygroundScene",
    create: ({ scene, materialFactory }) =>
      new VectorFieldPlaygroundScene(scene, materialFactory, "vector-field"),
  },
  {
    id: "progressive-mesh-demo-1",
    label: "Progressive mesh demo 1",
    create: ({ scene, materialFactory }) =>
      new ProgressiveMeshDemo1PlaygroundScene(scene, materialFactory, "progressive-mesh-demo-1"),
  },
  {
    id: "heigthmap",
    label: "Heigthmap",
    create: ({ scene, materialFactory }) =>
      new HeigthmapPlaygroundScene(scene, materialFactory, "heigthmap"),
  },
  {
    id: "height-map-progressive-grid",
    label: "Height map progressive grid",
    create: ({ scene, materialFactory }) =>
      new HeightMapProgressiveGridPlaygroundScene(
        scene,
        materialFactory,
        "height-map-progressive-grid",
      ),
  },
  {
    id: "waves",
    label: "WavesPlaygroundScene",
    create: ({ scene, materialFactory }) =>
      new WavesPlaygroundScene(scene, materialFactory, "waves"),
  },
];
