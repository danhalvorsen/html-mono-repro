import { DomainContext } from "../infrastructure/DomainContext.js";
import { Guard } from "../infrastructure/Guard.js";
import type { ISequencerPlaybackFrame } from "./ISequencerPlaybackFrame.js";
import type { IBpmControllableMidiStreamProvider } from "./IBpmControllableMidiStreamProvider.js";
import type { ISequencerPlaybackProjectionSource } from "./ISequencerPlaybackProjectionSource.js";
import {
  SequencerMidiStreamBuilder,
  type ISequencerMidiStreamBuilderDependencies,
} from "./SequencerMidiStreamBuilder.js";

export interface ISequencerPlaybackProjectionMidiStreamProviderDependencies
  extends ISequencerMidiStreamBuilderDependencies {
  readonly streamBuilder?: SequencerMidiStreamBuilder;
}

export class SequencerPlaybackProjectionMidiStreamProvider
  implements IBpmControllableMidiStreamProvider
{
  private readonly projectionSource: ISequencerPlaybackProjectionSource;
  private readonly streamBuilder: SequencerMidiStreamBuilder;

  public constructor(
    projectionSource: ISequencerPlaybackProjectionSource,
    dependencies: ISequencerPlaybackProjectionMidiStreamProviderDependencies = {},
  ) {
    this.projectionSource = Guard.notNull(
      projectionSource,
      DomainContext.ProjectionSource,
    );
    this.streamBuilder =
      dependencies.streamBuilder ?? new SequencerMidiStreamBuilder(dependencies);
  }

  public get bpm(): number {
    return this.streamBuilder.bpm;
  }

  public setBpm(value: number): void {
    this.streamBuilder.setBpm(value);
  }

  public buildStream(): string {
    return this.streamBuilder.buildStream(
      this.projectionSource.getTrackProjections(),
      this.projectionSource.stepCount,
    );
  }

  public getPlaybackFrame(): ISequencerPlaybackFrame {
    return this.streamBuilder.buildPlaybackFrame(
      this.projectionSource.getTrackProjections(),
      this.projectionSource.stepCount,
    );
  }
}