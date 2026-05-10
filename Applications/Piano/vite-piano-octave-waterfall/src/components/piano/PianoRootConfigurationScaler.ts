import type { Point2 } from "@monorepo/core-math";
import type {
  PianoOctaveConfiguration,
  PianoRootConfiguration,
  PianoRootStageConfiguration,
  PianoWaterfallColumnConfiguration,
  PianoWaterfallConfiguration,
  PlayedNoteConfiguration,
} from "./PianoRootConfiguration";

export type Scale2 = {
  readonly x: number;
  readonly y: number;
};

export interface IPianoRootConfigurationScaler {
  scale(
    configuration: PianoRootConfiguration,
    scale: Scale2
  ): PianoRootConfiguration;
}

export class PianoRootConfigurationScaler implements IPianoRootConfigurationScaler {
  public scale(
    configuration: PianoRootConfiguration,
    scale: Scale2
  ): PianoRootConfiguration {
    const safeScale = this.getSafeScale(scale);

    return {
      ...configuration,

      root: {
        ...configuration.root,
        position: this.scalePoint(configuration.root.position, safeScale),
        size: this.scalePoint(configuration.root.size, safeScale),
      },

      stage: this.scaleStage(configuration.stage, safeScale),

      waterfall: this.scaleWaterfall(configuration.waterfall, safeScale),

      octaves: configuration.octaves.map((octave) =>
        this.scaleOctave(octave, safeScale)
      ),
    };
  }

  private scaleStage(
    stage: PianoRootStageConfiguration,
    scale: Scale2
  ): PianoRootStageConfiguration {
    return {
      ...stage,
      octaveSize: this.scalePoint(stage.octaveSize, scale),
      waterfallSize: this.scalePoint(stage.waterfallSize, scale),
      waterfallPosition: this.scalePoint(stage.waterfallPosition, scale),
      octaveStartPosition: this.scalePoint(stage.octaveStartPosition, scale),
      octaveGap: stage.octaveGap * scale.x,
    };
  }

  private scaleWaterfall(
    waterfall: PianoWaterfallConfiguration,
    scale: Scale2
  ): PianoWaterfallConfiguration {
    return {
      ...waterfall,
      position: this.scalePoint(waterfall.position, scale),
      size: this.scalePoint(waterfall.size, scale),
      columns: waterfall.columns.map((column) =>
        this.scaleColumn(column, scale)
      ),
    };
  }

  private scaleColumn(
    column: PianoWaterfallColumnConfiguration,
    scale: Scale2
  ): PianoWaterfallColumnConfiguration {
    return {
      ...column,
      position: this.scalePoint(column.position, scale),
      size: this.scalePoint(column.size, scale),
      playedNote: this.scalePlayedNote(column.playedNote, scale),
    };
  }

  private scalePlayedNote(
    playedNote: PlayedNoteConfiguration,
    scale: Scale2
  ): PlayedNoteConfiguration {
    return {
      ...playedNote,
      size: this.scalePoint(playedNote.size, scale),
      speedPxPerSecond: playedNote.speedPxPerSecond * scale.y,
    };
  }

  private scaleOctave(
    octave: PianoOctaveConfiguration,
    scale: Scale2
  ): PianoOctaveConfiguration {
    return {
      ...octave,
      position: this.scalePoint(octave.position, scale),
      size: this.scalePoint(octave.size, scale),

      // Geometry and polygon data are already normalized.
      // Do not scale these values here.
      geometry: octave.geometry,
      viewBox: octave.viewBox,
      tangents: octave.tangents,
      tangent: octave.tangent,
    };
  }

  private scalePoint(point: Point2, scale: Scale2): Point2 {
    return {
      x: point.x * scale.x,
      y: point.y * scale.y,
    } as Point2;
  }

  private getSafeScale(scale: Scale2): Scale2 {
    return {
      x: this.getSafePositiveNumber(scale.x, 1),
      y: this.getSafePositiveNumber(scale.y, 1),
    };
  }

  private getSafePositiveNumber(value: number, fallback: number): number {
    if (!Number.isFinite(value) || value <= 0) {
      return fallback;
    }

    return value;
  }
}