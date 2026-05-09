import type { Point2 } from "@monorepo/core-math";
import { DefaultMidiNoteMapper } from "../application/DefaultMidiNoteMapper";
import { DefaultPianoTangentNamingPolicy } from "../application/PianoTangentNamingPolicy";
import {
  DEFAULT_OCTAVE_GEOMETRY,
  LEGACY_ALL_TANGENTS,
  type LegacyOctaveGeometry,
  type LegacyTangentGeometry,
} from "../octave/geometry/DefaultOctaveGeometry";

export type CssPosition =
  | "static"
  | "relative"
  | "absolute"
  | "fixed"
  | "sticky";

export type TangentSkinTemplate = "none" | "identifier" | "debug";

export type PianoTangentNoteName =
  | "C"
  | "Cs"
  | "D"
  | "Ds"
  | "E"
  | "F"
  | "Fs"
  | "G"
  | "Gs"
  | "A"
  | "As"
  | "H";

export type PianoPoint = readonly [x: number, y: number];

export type PianoRootConfiguration = {
  readonly root: PianoRootSurfaceConfiguration;
  readonly stage: PianoRootStageConfiguration;
  readonly playback: PianoRootPlaybackConfiguration;
  readonly visual: PianoRootVisualConfiguration;
  readonly waterfall: PianoWaterfallConfiguration;
  readonly octaves: readonly PianoOctaveConfiguration[];
};

export type PianoRootSurfaceConfiguration = {
  readonly position: Point2;
  readonly size: Point2;
};

export type PianoRootStageConfiguration = {
  readonly octaveCount: number;
  readonly octaveSize: Point2;
  readonly waterfallSize: Point2;
  readonly waterfallPosition: Point2;
  readonly octaveStartPosition: Point2;
  readonly octaveGap: number;
  readonly waterfallHeightRatioToOctaveHeight: number;
};

export type PianoRootPlaybackConfiguration = {
  readonly maxSimultaneousOctaves: number;
  readonly midiTempoBpm: number;
  readonly playbackSpeed: number;
  readonly midiSignalRate: number;
};

export type PianoRootVisualConfiguration = {
  readonly fillBlack: string;
  readonly fillWhite: string;
  readonly strokeColor: string;
  readonly pressedBlackFill: string;
  readonly pressedWhiteFill: string;
};

export type PlayedNoteConfiguration = {
  readonly fill: string;
  readonly strokeColor: string;
  readonly size: Point2;
  readonly speedPxPerSecond: number;
};

export type PianoWaterfallConfiguration = {
  readonly position: Point2;
  readonly size: Point2;
  readonly columns: readonly PianoWaterfallColumnConfiguration[];
};

export type PianoWaterfallColumnConfiguration = {
  readonly position: Point2;
  readonly size: Point2;
  readonly index: number;
  readonly tangentId: string;
  readonly note: PianoTangentNoteName;
  readonly octaveIndex: number;
  readonly fill: string;
  readonly strokeColor: string;
  readonly playedNote: PlayedNoteConfiguration;
};

export type PianoOctaveConfiguration = {
  readonly id: string;
  readonly cssPosition: CssPosition;
  readonly position: Point2;
  readonly size: Point2;
  readonly octaveIndex: number;
  readonly gap: number;
  readonly labelMaxWidthRatio: number;
  readonly geometry: PianoOctaveGeometryConfiguration;
  readonly viewBox: PianoOctaveViewBoxConfiguration;
  readonly skin: PianoOctaveSkinConfiguration;
  readonly tangents: readonly PianoTangentConfiguration[];
  readonly tangent: Readonly<Record<PianoTangentNoteName, PianoTangentConfiguration>>;
};

export type PianoOctaveGeometryConfiguration = {
  readonly source: "standard-piano-octave-geometry";
  readonly whiteKeys: readonly PianoTangentGeometryConfiguration[];
  readonly blackKeys: readonly PianoTangentGeometryConfiguration[];
};

export type PianoOctaveViewBoxConfiguration = {
  readonly minX: number;
  readonly minY: number;
  readonly width: number;
  readonly height: number;
};

export type PianoOctaveSkinConfiguration = {
  readonly visible: boolean;
  readonly template: TangentSkinTemplate;
  readonly showBox: boolean;
  readonly marginRatio: number;
  readonly boxWidthRatio: number;
  readonly boxDepthRatio: number;
};

export type PianoTangentConfiguration = {
  readonly id: string;
  readonly note: PianoTangentNoteName;
  readonly displayName: string;
  readonly octaveIndex: number;
  readonly midiNote: number | null;
  readonly isBlack: boolean;
  readonly geometry: PianoTangentGeometryConfiguration;
  readonly polygon: PianoTangentPolygonConfiguration;
  readonly layout: PianoTangentLayoutConfiguration;
  readonly skin: PianoOctaveSkinConfiguration;
};

export type PianoTangentGeometryConfiguration = {
  readonly source: "standard-piano-octave-geometry";
  readonly name: PianoTangentNoteName;
  readonly points: readonly PianoPoint[];
};

export type PianoTangentPolygonConfiguration = {
  readonly points: readonly PianoPoint[];
  readonly fill: string;
  readonly pressedFill: string;
  readonly strokeColor: string;
  readonly strokeWidth: number;
};

export type PianoTangentLayoutConfiguration = {
  readonly leftPercent: number;
  readonly topPercent: number;
  readonly widthPercent: number;
  readonly heightPercent: number;
  readonly zIndex: number;
};

type GeometryBounds = {
  readonly minX: number;
  readonly maxX: number;
  readonly minY: number;
  readonly maxY: number;
  readonly width: number;
  readonly height: number;
};

export type PianoRootConfigurationFactoryOptions = {
  readonly octaveCount: number;
  readonly rootPosition: Point2;
  readonly octaveSize: Point2;
  readonly octaveStartPosition: Point2;
  readonly octaveGap: number;
  readonly waterfallPosition: Point2;
  readonly waterfallHeightRatioToOctaveHeight: number;
  readonly maxSimultaneousOctaves: number;
  readonly midiTempoBpm: number;
  readonly playbackSpeed: number;
  readonly midiSignalRate: number;
};

export const DefaultPianoRootConfigurationFactoryOptions: PianoRootConfigurationFactoryOptions = {
  octaveCount: 1,
  rootPosition: { x: 0, y: 0 } as Point2,
  // Match the reference playground octave footprint/aspect.
  // 300px width with aspect 164.5/150 -> height = 300 * 150 / 164.5
  octaveSize: { x: 300, y: (300 * 150) / 164.5 } as Point2,
  octaveStartPosition: { x: 0, y: (300 * 150) / 164.5 } as Point2,
  octaveGap: 6,
  waterfallPosition: { x: 0, y: 0 } as Point2,
  waterfallHeightRatioToOctaveHeight: 1,
  maxSimultaneousOctaves: 2,
  midiTempoBpm: 130,
  playbackSpeed: 1,
  midiSignalRate: 1,
};

export class PianoRootConfigurationFactory {
  private readonly tangentNamingPolicy = new DefaultPianoTangentNamingPolicy();
  private readonly midiNoteMapper = new DefaultMidiNoteMapper();

  public create(
    options: PianoRootConfigurationFactoryOptions =
      DefaultPianoRootConfigurationFactoryOptions
  ): PianoRootConfiguration {
    const octaveCount = this.getSafePositiveInteger(options.octaveCount, 1);
    const octaveGap = this.getSafeNonNegativeNumber(options.octaveGap, 0);
    const waterfallHeightRatio = this.getSafePositiveNumber(
      options.waterfallHeightRatioToOctaveHeight,
      1
    );

    const waterfallSize = {
      x: octaveCount * options.octaveSize.x,
      y: options.octaveSize.y * waterfallHeightRatio,
    } as Point2;

    const rootSize = {
      x: waterfallSize.x,
      y: waterfallSize.y + options.octaveSize.y + octaveGap,
    } as Point2;

    const visual: PianoRootVisualConfiguration = {
      fillBlack: "#111111",
      fillWhite: "#ffffff",
      strokeColor: "#000000",
      pressedBlackFill: "#444444",
      pressedWhiteFill: "#f0f0f0",
    };

    const playedNote: PlayedNoteConfiguration = {
      fill: "#f59e0b",
      strokeColor: "rgba(19, 32, 56, 0.45)",
      size: { x: 0, y: 14 } as Point2,
      speedPxPerSecond: 180,
    };

    const octaves = Array.from({ length: octaveCount }, (_, index) =>
      this.createOctave({
        octaveIndex: index,
        position: {
          x: options.octaveStartPosition.x + index * options.octaveSize.x,
          y: options.octaveStartPosition.y,
        } as Point2,
        size: options.octaveSize,
        visual,
      })
    );

    const configuration: PianoRootConfiguration = {
      root: {
        position: options.rootPosition,
        size: rootSize,
      },
      stage: {
        octaveCount,
        octaveSize: options.octaveSize,
        waterfallSize,
        waterfallPosition: options.waterfallPosition,
        octaveStartPosition: options.octaveStartPosition,
        octaveGap,
        waterfallHeightRatioToOctaveHeight: waterfallHeightRatio,
      },
      playback: {
        maxSimultaneousOctaves: this.getSafePositiveInteger(
          options.maxSimultaneousOctaves,
          1
        ),
        midiTempoBpm: this.getSafePositiveNumber(options.midiTempoBpm, 130),
        playbackSpeed: this.getSafePositiveNumber(options.playbackSpeed, 1),
        midiSignalRate: this.getSafePositiveNumber(options.midiSignalRate, 1),
      },
      visual,
      waterfall: {
        position: options.waterfallPosition,
        size: waterfallSize,
        columns: this.createWaterfallColumns({
          octaves,
          waterfallSize,
          playedNote,
        }),
      },
      octaves,
    };

    return this.deepFreeze(configuration);
  }

  private createOctave(options: {
    readonly octaveIndex: number;
    readonly position: Point2;
    readonly size: Point2;
    readonly visual: PianoRootVisualConfiguration;
  }): PianoOctaveConfiguration {
    const geometry = this.createOctaveGeometryConfiguration(DEFAULT_OCTAVE_GEOMETRY);
    const geometries = [...geometry.whiteKeys, ...geometry.blackKeys];
    const viewBox = this.createViewBox(LEGACY_ALL_TANGENTS);

    const skin: PianoOctaveSkinConfiguration = {
      visible: false,
      template: "none",
      showBox: false,
      marginRatio: 0,
      boxWidthRatio: 0.8,
      boxDepthRatio: 0.9,
    };

    const tangents = geometries.map((geometryItem) =>
      this.createTangent({
        geometry: geometryItem,
        octaveIndex: options.octaveIndex,
        viewBox,
        visual: options.visual,
        skin,
      })
    );

    return {
      id: `octave-${options.octaveIndex + 1}`,
      cssPosition: "absolute",
      position: options.position,
      size: options.size,
      octaveIndex: options.octaveIndex,
      gap: 6,
      labelMaxWidthRatio: 0.8,
      geometry,
      viewBox,
      skin,
      tangents,
      tangent: this.createTangentMap(tangents),
    };
  }

  private createOctaveGeometryConfiguration(
    source: LegacyOctaveGeometry
  ): PianoOctaveGeometryConfiguration {
    return {
      source: "standard-piano-octave-geometry",
      whiteKeys: source.whiteKeys.map((geometry) =>
        this.toGeometryConfiguration(geometry)
      ),
      blackKeys: source.blackKeys.map((geometry) =>
        this.toGeometryConfiguration(geometry)
      ),
    };
  }

  private toGeometryConfiguration(
    geometry: LegacyTangentGeometry
  ): PianoTangentGeometryConfiguration {
    return {
      source: "standard-piano-octave-geometry",
      name: this.toNoteName(geometry.name),
      points: this.toPoints(geometry.points),
    };
  }

  private createTangent(options: {
    readonly geometry: PianoTangentGeometryConfiguration;
    readonly octaveIndex: number;
    readonly viewBox: PianoOctaveViewBoxConfiguration;
    readonly visual: PianoRootVisualConfiguration;
    readonly skin: PianoOctaveSkinConfiguration;
  }): PianoTangentConfiguration {
    const bounds = this.readBounds(options.geometry.points);
    const isBlack = options.geometry.name.includes("s");

    const tangentId = this.tangentNamingPolicy.toTangentId(
      options.geometry.name,
      options.octaveIndex
    );

    return {
      id: tangentId,
      note: options.geometry.name,
      displayName: tangentId,
      octaveIndex: options.octaveIndex,
      midiNote: this.midiNoteMapper.toMidi(options.geometry.name, options.octaveIndex),
      isBlack,
      geometry: options.geometry,
      polygon: {
        points: options.geometry.points,
        fill: isBlack ? options.visual.fillBlack : options.visual.fillWhite,
        pressedFill: isBlack
          ? options.visual.pressedBlackFill
          : options.visual.pressedWhiteFill,
        strokeColor: options.visual.strokeColor,
        strokeWidth: 0.3,
      },
      layout: {
        leftPercent: ((bounds.minX - options.viewBox.minX) / options.viewBox.width) * 100,
        topPercent: ((bounds.minY - options.viewBox.minY) / options.viewBox.height) * 100,
        widthPercent: (bounds.width / options.viewBox.width) * 100,
        heightPercent: (bounds.height / options.viewBox.height) * 100,
        zIndex: isBlack ? 20 : 10,
      },
      skin: options.skin,
    };
  }

  private createTangentMap(
    tangents: readonly PianoTangentConfiguration[]
  ): Readonly<Record<PianoTangentNoteName, PianoTangentConfiguration>> {
    const byNote = new Map<PianoTangentNoteName, PianoTangentConfiguration>();

    for (const tangent of tangents) {
      byNote.set(tangent.note, tangent);
    }

    return {
      C: this.requireTangent(byNote, "C"),
      Cs: this.requireTangent(byNote, "Cs"),
      D: this.requireTangent(byNote, "D"),
      Ds: this.requireTangent(byNote, "Ds"),
      E: this.requireTangent(byNote, "E"),
      F: this.requireTangent(byNote, "F"),
      Fs: this.requireTangent(byNote, "Fs"),
      G: this.requireTangent(byNote, "G"),
      Gs: this.requireTangent(byNote, "Gs"),
      A: this.requireTangent(byNote, "A"),
      As: this.requireTangent(byNote, "As"),
      H: this.requireTangent(byNote, "H"),
    };
  }

  private requireTangent(
    byNote: ReadonlyMap<PianoTangentNoteName, PianoTangentConfiguration>,
    note: PianoTangentNoteName
  ): PianoTangentConfiguration {
    const tangent = byNote.get(note);

    if (tangent === undefined) {
      throw new Error(`Missing tangent configuration for note: ${note}`);
    }

    return tangent;
  }

  private createWaterfallColumns(options: {
    readonly octaves: readonly PianoOctaveConfiguration[];
    readonly waterfallSize: Point2;
    readonly playedNote: PlayedNoteConfiguration;
  }): readonly PianoWaterfallColumnConfiguration[] {
    const tangents = options.octaves.flatMap((octave) => octave.tangents);
    const viewBox = this.createViewBox(LEGACY_ALL_TANGENTS);

    return tangents.map((tangent, index): PianoWaterfallColumnConfiguration => {
      const bounds = this.readBounds(tangent.polygon.points);
      const width = (bounds.width / viewBox.width) * options.waterfallSize.x;

      return {
        position: {
          x: ((bounds.minX - viewBox.minX) / viewBox.width) * options.waterfallSize.x,
          y: 0,
        } as Point2,
        size: {
          x: width,
          y: options.waterfallSize.y,
        } as Point2,
        index,
        tangentId: tangent.id,
        note: tangent.note,
        octaveIndex: tangent.octaveIndex,
        fill: tangent.isBlack
          ? "rgba(30, 34, 46, 0.90)"
          : "rgba(255, 255, 255, 0.30)",
        strokeColor: "rgba(255, 0, 0, 0.95)",
        playedNote: {
          ...options.playedNote,
          size: {
            x: width,
            y: options.playedNote.size.y,
          } as Point2,
        },
      };
    });
  }

  private createViewBox(
    geometries: readonly LegacyTangentGeometry[]
  ): PianoOctaveViewBoxConfiguration {
    const points = geometries.flatMap((geometry) => this.toPoints(geometry.points));
    const bounds = this.readBounds(points);

    return {
      minX: bounds.minX,
      minY: bounds.minY,
      width: bounds.width,
      height: bounds.height,
    };
  }

  private readBounds(points: readonly PianoPoint[]): GeometryBounds {
    const xs = points.map(([x]) => x);
    const ys = points.map(([, y]) => y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    return {
      minX,
      maxX,
      minY,
      maxY,
      width: Math.max(0.000001, maxX - minX),
      height: Math.max(0.000001, maxY - minY),
    };
  }

  private toPoints(points: readonly number[][]): readonly PianoPoint[] {
    return points.map(([x, y]) => [x ?? 0, y ?? 0] as const);
  }

  private toNoteName(value: string): PianoTangentNoteName {
    if (
      value === "C" ||
      value === "Cs" ||
      value === "D" ||
      value === "Ds" ||
      value === "E" ||
      value === "F" ||
      value === "Fs" ||
      value === "G" ||
      value === "Gs" ||
      value === "A" ||
      value === "As" ||
      value === "H"
    ) {
      return value;
    }

    throw new Error(`Unsupported tangent note name: ${value}`);
  }

  private getSafePositiveInteger(value: number, fallback: number): number {
    if (!Number.isInteger(value) || value < 1) {
      return fallback;
    }

    return value;
  }

  private getSafePositiveNumber(value: number, fallback: number): number {
    if (!Number.isFinite(value) || value <= 0) {
      return fallback;
    }

    return value;
  }

  private getSafeNonNegativeNumber(value: number, fallback: number): number {
    if (!Number.isFinite(value) || value < 0) {
      return fallback;
    }

    return value;
  }

  private deepFreeze<T>(value: T): T {
    if (value === null || typeof value !== "object") {
      return value;
    }

    const objectValue = value as Record<string, unknown>;
    const keys = Reflect.ownKeys(objectValue);

    for (const key of keys) {
      const child = objectValue[key as keyof typeof objectValue];

      if (child !== null && typeof child === "object") {
        this.deepFreeze(child);
      }
    }

    return Object.freeze(value);
  }
}

export const DefaultPianoRootConfiguration: PianoRootConfiguration =
  new PianoRootConfigurationFactory().create();
