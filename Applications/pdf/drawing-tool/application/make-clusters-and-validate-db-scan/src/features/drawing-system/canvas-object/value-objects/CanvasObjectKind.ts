export const CanvasObjectKinds = {
    rectangle: "rectangle",
    circle: "circle",
    triangle: "triangle",
    diamond: "diamond",
    line: "line",
    text: "text",
    saveButton: "save-button",
    loadButton: "load-button",
    deleteButton: "delete-button"
} as const;

export type CanvasObjectKind =
    typeof CanvasObjectKinds[keyof typeof CanvasObjectKinds];
