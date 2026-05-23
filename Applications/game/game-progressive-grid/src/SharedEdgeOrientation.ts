export const SharedEdgeOrientation = Object.freeze({
  Vertical: "Vertical",
  Horizontal: "Horizontal",
} as const);

export type SharedEdgeOrientation =
  (typeof SharedEdgeOrientation)[keyof typeof SharedEdgeOrientation];
