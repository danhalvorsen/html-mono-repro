// Legacy canonical tangent geometry for one full octave.
// Keep coordinates unchanged unless explicitly migrating geometry.
export type LegacyTangentGeometry = {
  name: string;
  points: number[][];
};

export type LegacyOctaveGeometry = {
  whiteKeys: LegacyTangentGeometry[];
  blackKeys: LegacyTangentGeometry[];
};

export const DEFAULT_OCTAVE_GEOMETRY: LegacyOctaveGeometry = {
  whiteKeys: [
    { name: "C", points: [[0, 0], [19.2, 0], [19.2, 90], [14.3, 90], [14.3, 150], [0, 150]] },
    { name: "D", points: [[14.3, 90], [19.4, 90], [19.4, 0], [23.5, 0], [23.5, 90], [28.6, 90], [28.6, 150], [14.3, 150]] },
    { name: "E", points: [[28.6, 90], [33.6, 90], [33.6, 0], [42.9, 0], [42.9, 150], [28.6, 150]] },
    { name: "F", points: [[42.9, 0], [52, 0], [52, 90], [57.1, 90], [57.1, 150], [42.9, 150]] },
    { name: "G", points: [[57.1, 90], [62.3, 90], [62.3, 0], [66.5, 0], [66.5, 90], [71.4, 90], [71.4, 150], [57.1, 150]] },
    { name: "A", points: [[71.4, 90], [76.7, 90], [76.7, 0], [81, 0], [81, 90], [85.7, 90], [85.7, 150], [71.4, 150]] },
    { name: "H", points: [[85.7, 90], [90.8, 90], [90.8, 0], [100, 0], [100, 150], [85.7, 150]] }
  ],
  blackKeys: [
    { name: "Cs", points: [[9.2, 0], [19.4, 0], [19.4, 90], [9.2, 90]] },
    { name: "Ds", points: [[23.5, 0], [33.6, 0], [33.6, 90], [23.5, 90]] },
    { name: "Fs", points: [[52, 0], [62.3, 0], [62.3, 90], [52, 90]] },
    { name: "Gs", points: [[66.5, 0], [76.7, 0], [76.7, 90], [66.5, 90]] },
    { name: "As", points: [[81, 0], [90.8, 0], [90.8, 90], [81, 90]] }
  ]
};

// Convenience list preserving render order: whites first, blacks last.
export const LEGACY_ALL_TANGENTS: LegacyTangentGeometry[] = [
  ...DEFAULT_OCTAVE_GEOMETRY.whiteKeys,
  ...DEFAULT_OCTAVE_GEOMETRY.blackKeys
];

