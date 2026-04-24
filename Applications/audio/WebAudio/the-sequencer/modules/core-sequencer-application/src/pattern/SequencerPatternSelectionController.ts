import {
  FsmBuilder,
  FsmEngine,
  IgnoreUnhandledInput,
  type IInput,
  type IFsm,
} from "@monorepo/core-fsm";

export const SequencerPatternSelectionState = Object.freeze({
  Selected: "selected",
  Disabled: "disabled",
} as const);

export type SequencerPatternSelectionState =
  (typeof SequencerPatternSelectionState)[keyof typeof SequencerPatternSelectionState];

export const SequencerPatternSelectionIntentType = Object.freeze({
  ToggleRequested: "toggle-requested",
} as const);

export type SequencerPatternSelectionIntentType =
  (typeof SequencerPatternSelectionIntentType)[keyof typeof SequencerPatternSelectionIntentType];

interface ISequencerPatternSelectionIntent
  extends IInput<SequencerPatternSelectionIntentType, undefined> {}

const SequencerPatternSelectionIntentFactory = Object.freeze({
  toggleRequested(): ISequencerPatternSelectionIntent {
    return Object.freeze({
      type: SequencerPatternSelectionIntentType.ToggleRequested,
      payload: undefined,
    });
  },
});

interface ITrackPatternSelectionContext {
  readonly state: SequencerPatternSelectionState;
}

interface ITrackPatternSelectionFsmEntry {
  readonly trackId: number;
  readonly fsm: IFsm<
    SequencerPatternSelectionState,
    ITrackPatternSelectionContext,
    ISequencerPatternSelectionIntent,
    never
  >;
}

export interface ISequencerTrackSelectionProjection {
  readonly trackId: number;
  readonly selected: boolean;
}

export interface ISequencerPatternSelectionProjection {
  readonly tracks: readonly ISequencerTrackSelectionProjection[];
}

export type SequencerPatternSelectionProjectionListener = (
  projection: ISequencerPatternSelectionProjection,
) => void;

export interface ISequencerPatternSelectionController {
  readonly projection: ISequencerPatternSelectionProjection;
  toggleTrack(trackId: number): Promise<void>;
  subscribe(listener: SequencerPatternSelectionProjectionListener): () => void;
}

export class SequencerPatternSelectionController
  implements ISequencerPatternSelectionController
{
  private readonly trackFsms = new Map<number, ITrackPatternSelectionFsmEntry>();
  private readonly listeners = new Set<SequencerPatternSelectionProjectionListener>();
  private currentProjection: ISequencerPatternSelectionProjection;

  public constructor(trackIds: readonly number[]) {
    this.initialize(trackIds);
    this.currentProjection = this.createProjection();
  }

  public get projection(): ISequencerPatternSelectionProjection {
    return this.currentProjection;
  }

  public async toggleTrack(trackId: number): Promise<void> {
    const normalizedTrackId = SequencerPatternSelectionController.normalizeTrackId(
      trackId,
    );

    const entry = this.trackFsms.get(normalizedTrackId);
    if (!entry) {
      return;
    }

    await entry.fsm.dispatch(SequencerPatternSelectionIntentFactory.toggleRequested());
    const nextProjection = this.createProjection();

    if (SequencerPatternSelectionController.equalsProjection(this.currentProjection, nextProjection)) {
      return;
    }

    this.currentProjection = nextProjection;
    this.publish(nextProjection);
  }

  public subscribe(
    listener: SequencerPatternSelectionProjectionListener,
  ): () => void {
    this.listeners.add(listener);
    listener(this.currentProjection);

    return () => {
      this.listeners.delete(listener);
    };
  }

  private initialize(trackIds: readonly number[]): void {
    for (const trackId of trackIds) {
      const normalizedTrackId =
        SequencerPatternSelectionController.normalizeTrackId(trackId);

      if (this.trackFsms.has(normalizedTrackId)) {
        continue;
      }

      this.trackFsms.set(normalizedTrackId, {
        trackId: normalizedTrackId,
        fsm: SequencerPatternSelectionController.createTrackFsm(),
      });
    }
  }

  private createProjection(): ISequencerPatternSelectionProjection {
    const tracks = Array.from(this.trackFsms.values())
      .sort((a, b) => a.trackId - b.trackId)
      .map((entry) =>
        Object.freeze({
          trackId: entry.trackId,
          selected:
            entry.fsm.context.state === SequencerPatternSelectionState.Selected,
        }),
      );

    return Object.freeze({
      tracks,
    });
  }

  private publish(projection: ISequencerPatternSelectionProjection): void {
    for (const listener of this.listeners) {
      listener(projection);
    }
  }

  private static createTrackFsm(): IFsm<
    SequencerPatternSelectionState,
    ITrackPatternSelectionContext,
    ISequencerPatternSelectionIntent,
    never
  > {
    const builder = new FsmBuilder<
      SequencerPatternSelectionState,
      ITrackPatternSelectionContext,
      ISequencerPatternSelectionIntent,
      never
    >();

    builder
      .initial(SequencerPatternSelectionState.Selected)
      .from(SequencerPatternSelectionState.Selected)
      .on(SequencerPatternSelectionIntentType.ToggleRequested)
      .withAction(() => ({
        state: SequencerPatternSelectionState.Disabled,
      }))
      .to(SequencerPatternSelectionState.Disabled)
      .from(SequencerPatternSelectionState.Disabled)
      .on(SequencerPatternSelectionIntentType.ToggleRequested)
      .withAction(() => ({
        state: SequencerPatternSelectionState.Selected,
      }))
      .to(SequencerPatternSelectionState.Selected);

    return new FsmEngine({
      definition: builder.build(),
      context: { state: SequencerPatternSelectionState.Selected },
      unhandledInputPolicy: new IgnoreUnhandledInput(),
    });
  }

  private static normalizeTrackId(trackId: number): number {
    if (!Number.isFinite(trackId)) {
      return 0;
    }

    return Math.max(0, Math.floor(trackId));
  }

  private static equalsProjection(
    a: ISequencerPatternSelectionProjection,
    b: ISequencerPatternSelectionProjection,
  ): boolean {
    if (a.tracks.length !== b.tracks.length) {
      return false;
    }

    for (let index = 0; index < a.tracks.length; index += 1) {
      const left = a.tracks[index];
      const right = b.tracks[index];

      if (!left || !right) {
        return false;
      }

      if (left.trackId !== right.trackId || left.selected !== right.selected) {
        return false;
      }
    }

    return true;
  }
}
