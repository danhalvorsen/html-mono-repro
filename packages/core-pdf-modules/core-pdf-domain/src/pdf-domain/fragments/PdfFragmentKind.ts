export const FragmentKinds = Object.freeze({
  Text: "text",
  Image: "image",
  Rectangle: "rectangle",
  Path: "path",
} as const);

export type FragmentKind =
  (typeof FragmentKinds)[keyof typeof FragmentKinds];

// Backward-compatible aliases.
export const PdfFragmentKinds = FragmentKinds;
export type PdfFragmentKind = FragmentKind;
