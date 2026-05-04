import { CanvasObjectKinds, type CanvasObjectKind } from "../canvas-object/value-objects/CanvasObjectKind.js";

export interface IMenuShapeItem {
    readonly kind: CanvasObjectKind;
    readonly title: string;
    readonly fill: string;
    readonly showLabel?: boolean;
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
    },
    {
        kind: CanvasObjectKinds.line,
        title: "Separator",
        fill: "#e2e8f0"
    },
    {
        kind: CanvasObjectKinds.saveButton,
        title: "Save",
        fill: "#22c55e",
        showLabel: false
    },
    {
        kind: CanvasObjectKinds.loadButton,
        title: "Load",
        fill: "#38bdf8",
        showLabel: false
    },
    {
        kind: CanvasObjectKinds.deleteButton,
        title: "Delete",
        fill: "#f43f5e",
        showLabel: false
    }
];
