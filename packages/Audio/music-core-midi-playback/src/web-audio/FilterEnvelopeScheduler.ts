import type { EnvelopeADSR } from "../value-objects/EnvelopeADSR.js";

export type ScheduledFilterEnvelope = {
  readonly filterBaseFrequency: number;
  readonly filterSustainFrequency: number;
  readonly releaseSeconds: number;
};

export type ScheduleFilterEnvelopeArgs = {
  readonly envelope: EnvelopeADSR;
  readonly filterBaseFrequency: number;
  readonly velocity: number;
  readonly filterEnvAmount: number;
  readonly velocityToFilter: number;
  readonly startAtSeconds: number;
};

export type ScheduleFilterReleaseArgs = {
  readonly releaseStartSeconds: number;
  readonly filterBaseFrequency: number;
  readonly filterSustainFrequency: number;
  readonly releaseSeconds: number;
};

export interface IFilterEnvelopeScheduler {
  scheduleAttackDecaySustain(
    frequency: AudioParam,
    args: ScheduleFilterEnvelopeArgs,
  ): ScheduledFilterEnvelope;

  scheduleRelease(
    frequency: AudioParam,
    args: ScheduleFilterReleaseArgs,
  ): void;
}

export class FilterEnvelopeScheduler implements IFilterEnvelopeScheduler {
  private static readonly minimumFilterAttackSeconds = 0.01;
  private static readonly minimumReleaseSeconds = 0.02;
  private static readonly initialFrequencyFactor = 0.62;
  private static readonly releaseFrequencyFactor = 0.58;
  private static readonly minimumSustainFactor = 0.4;

  public scheduleAttackDecaySustain(
    frequency: AudioParam,
    args: ScheduleFilterEnvelopeArgs,
  ): ScheduledFilterEnvelope {
    const velocityFactor = 1 + args.velocityToFilter * (args.velocity / 127);

    const filterPeak =
      args.filterBaseFrequency * args.filterEnvAmount * velocityFactor;

    const filterSustainFrequency =
      args.filterBaseFrequency *
      Math.max(
        FilterEnvelopeScheduler.minimumSustainFactor,
        args.envelope.sustain,
      );

    frequency.setValueAtTime(
      args.filterBaseFrequency *
        FilterEnvelopeScheduler.initialFrequencyFactor,
      args.startAtSeconds,
    );

    frequency.linearRampToValueAtTime(
      filterPeak,
      args.startAtSeconds +
        Math.max(
          FilterEnvelopeScheduler.minimumFilterAttackSeconds,
          args.envelope.attack,
        ),
    );

    frequency.linearRampToValueAtTime(
      filterSustainFrequency,
      args.startAtSeconds + args.envelope.attack + args.envelope.decay,
    );

    return {
      filterBaseFrequency: args.filterBaseFrequency,
      filterSustainFrequency,
      releaseSeconds: Math.max(
        args.envelope.release,
        FilterEnvelopeScheduler.minimumReleaseSeconds,
      ),
    };
  }

  public scheduleRelease(
    frequency: AudioParam,
    args: ScheduleFilterReleaseArgs,
  ): void {
    frequency.cancelScheduledValues(args.releaseStartSeconds);
    frequency.setValueAtTime(
      args.filterSustainFrequency,
      args.releaseStartSeconds,
    );

    frequency.linearRampToValueAtTime(
      args.filterBaseFrequency *
        FilterEnvelopeScheduler.releaseFrequencyFactor,
      args.releaseStartSeconds + args.releaseSeconds,
    );
  }
}
