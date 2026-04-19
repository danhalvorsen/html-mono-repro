export const CanvasObjectKinds = {
    rectangle: "rectangle",
    circle: "circle",
    triangle: "triangle",
    diamond: "diamond"
} as const;

export type CanvasObjectKind =
    typeof CanvasObjectKinds[keyof typeof CanvasObjectKinds];
