import { CanvasObjectKinds, type CanvasObjectKind } from "./CanvasObjectKind.js";

export interface IMenuShapeItem {
    readonly kind: CanvasObjectKind;
    readonly title: string;
    readonly fill: string;
}

export const MenuShapeCatalog: ReadonlyArray<IMenuShapeItem> = [
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
    }
];
