import { CanvasObjectKinds, type CanvasObjectKind } from "../canvas-object/value-objects/CanvasObjectKind.js";

export interface IGraphicalMenuItem {
    readonly kind: CanvasObjectKind;
    readonly title: string;
    readonly fill: string;
}

export const GraphicalMenuCatalog: ReadonlyArray<IGraphicalMenuItem> = [
    {
        kind: CanvasObjectKinds.rectangle,
        title: "Rectangle",
        fill: "#4caf50"
    },
    {
        kind: CanvasObjectKinds.circle,
        title: "Circle",
        fill: "#2196f3"
    },
    {
        kind: CanvasObjectKinds.triangle,
        title: "Triangle",
        fill: "#f59e0b"
    },
    {
        kind: CanvasObjectKinds.diamond,
        title: "Diamond",
        fill: "#8b5cf6"
    },
    {
        kind: CanvasObjectKinds.text,
        title: "Text",
        fill: "#f8fafc"
    }
];
