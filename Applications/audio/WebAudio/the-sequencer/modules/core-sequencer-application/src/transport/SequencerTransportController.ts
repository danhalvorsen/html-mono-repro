import {
  FsmBuilder,
  FsmEngine,
  IgnoreUnhandledInput,
  type ILogger,
  type IInput,
  type IFsm,
} from "@monorepo/core-fsm";

export const SequencerTransportState = Object.freeze({
  Stopped: "stopped",
  Playing: "playing",
} as const);

export type SequencerTransportState =
  (typeof SequencerTransportState)[keyof typeof SequencerTransportState];

export const SequencerTransportIntentType = Object.freeze({
  PlayRequested: "play-requested",
  StopRequested: "stop-requested",
} as const);

export type SequencerTransportIntentType =
  (typeof SequencerTransportIntentType)[keyof typeof SequencerTransportIntentType];

export interface ISequencerTransportIntent
  extends IInput<SequencerTransportIntentType, undefined> {}

export const SequencerTransportIntentFactory = Object.freeze({
  playRequested(): ISequencerTransportIntent {
    return Object.freeze({
      type: SequencerTransportIntentType.PlayRequested,
      payload: undefined,
    });
  },
  stopRequested(): ISequencerTransportIntent {
    return Object.freeze({
      type: SequencerTransportIntentType.StopRequested,
      payload: undefined,
    });
  },
});

export interface ISequencerTransportProjection {
  readonly state: SequencerTransportState;
  readonly isPlaying: boolean;
}

export interface IMidiStreamPlaybackPort {
  start(midiStream: string): Promise<void>;
  stop(): Promise<void>;
}

export interface ISequencerMidiStreamProvider {
  buildStream(): string;
}

export type SequencerTransportProjectionListener = (
  projection: ISequencerTransportProjection,
) => void;

export interface ISequencerTransportController {
  readonly projection: ISequencerTransportProjection;
  requestPlay(): Promise<void>;
  requestStop(): Promise<void>;
  subscribe(listener: SequencerTransportProjectionListener): () => void;
}

interface ISequencerTransportContext {
  readonly state: SequencerTransportState;
}

interface ISequencerTransportControllerDependencies {
  readonly logger?: ILogger;
  readonly midiPlayback?: IMidiStreamPlaybackPort;
  readonly midiStreamProvider?: ISequencerMidiStreamProvider;
}

const DefaultMidiStream = Object.freeze({
  fourOnTheFloor:
    "N36-h125-v122-ch1 R-h125 R-h125 R-h125 " +
    "N36-h125-v122-ch1 R-h125 R-h125 R-h125 " +
    "N36-h125-v122-ch1 R-h125 R-h125 R-h125 " +
    "N36-h125-v122-ch1 R-h125 R-h125 R-h125",
});

class NullMidiPlaybackPort implements IMidiStreamPlaybackPort {
  public async start(_midiStream: string): Promise<void> {
    return Promise.resolve();
  }

  public async stop(): Promise<void> {
    return Promise.resolve();
  }
}

class DefaultMidiStreamProvider implements ISequencerMidiStreamProvider {
  public buildStream(): string {
    return DefaultMidiStream.fourOnTheFloor;
  }
}

export class SequencerTransportController
  implements ISequencerTransportController
{
  private readonly fsm: IFsm<
    SequencerTransportState,
    ISequencerTransportContext,
    ISequencerTransportIntent,
    never
  >;

  private readonly listeners = new Set<SequencerTransportProjectionListener>();
  private readonly midiPlayback: IMidiStreamPlaybackPort;
  private readonly midiStreamProvider: ISequencerMidiStreamProvider;
  private currentProjection: ISequencerTransportProjection;

  public constructor(dependencies: ISequencerTransportControllerDependencies = {}) {
    this.fsm = SequencerTransportController.createFsm(dependencies.logger);
    this.midiPlayback = dependencies.midiPlayback ?? new NullMidiPlaybackPort();
    this.midiStreamProvider =
      dependencies.midiStreamProvider ?? new DefaultMidiStreamProvider();
    this.currentProjection = SequencerTransportController.toProjection(
      this.fsm.context,
    );
  }

  public get projection(): ISequencerTransportProjection {
    return this.currentProjection;
  }

  public async requestPlay(): Promise<void> {
    const wasPlaying = this.currentProjection.isPlaying;
    await this.dispatch(SequencerTransportIntentFactory.playRequested());

    if (wasPlaying || !this.currentProjection.isPlaying) {
      return;
    }

    await this.midiPlayback.start(this.midiStreamProvider.buildStream());
  }

  public async requestStop(): Promise<void> {
    const wasPlaying = this.currentProjection.isPlaying;
    await this.dispatch(SequencerTransportIntentFactory.stopRequested());

    if (!wasPlaying || this.currentProjection.isPlaying) {
      return;
    }

    await this.midiPlayback.stop();
  }

  public subscribe(listener: SequencerTransportProjectionListener): () => void {
    this.listeners.add(listener);
    listener(this.currentProjection);

    return () => {
      this.listeners.delete(listener);
    };
  }

  private async dispatch(intent: ISequencerTransportIntent): Promise<void> {
    const result = await this.fsm.dispatch(intent);
    const nextProjection = SequencerTransportController.toProjection(
      result.context,
    );

    if (SequencerTransportController.equalsProjection(this.currentProjection, nextProjection)) {
      return;
    }

    this.currentProjection = nextProjection;
    this.publish(this.currentProjection);
  }

  private publish(projection: ISequencerTransportProjection): void {
    for (const listener of this.listeners) {
      listener(projection);
    }
  }

  private static createFsm(
    _logger?: ILogger,
  ): IFsm<
    SequencerTransportState,
    ISequencerTransportContext,
    ISequencerTransportIntent,
    never
  > {
    const builder = new FsmBuilder<
      SequencerTransportState,
      ISequencerTransportContext,
      ISequencerTransportIntent,
      never
    >();

    builder
      .initial(SequencerTransportState.Stopped)
      .from(SequencerTransportState.Stopped)
      .on(SequencerTransportIntentType.PlayRequested)
      .withAction(() => ({
        state: SequencerTransportState.Playing,
      }))
      .to(SequencerTransportState.Playing)
      .from(SequencerTransportState.Playing)
      .on(SequencerTransportIntentType.StopRequested)
      .withAction(() => ({
        state: SequencerTransportState.Stopped,
      }))
      .to(SequencerTransportState.Stopped);

    return new FsmEngine({
      definition: builder.build(),
      context: { state: SequencerTransportState.Stopped },
      unhandledInputPolicy: new IgnoreUnhandledInput(),
    });
  }

  private static toProjection(
    context: ISequencerTransportContext,
  ): ISequencerTransportProjection {
    return Object.freeze({
      state: context.state,
      isPlaying: context.state === SequencerTransportState.Playing,
    });
  }

  private static equalsProjection(
    a: ISequencerTransportProjection,
    b: ISequencerTransportProjection,
  ): boolean {
    return a.state === b.state && a.isPlaying === b.isPlaying;
  }
}
