import type { EnvelopeADSR } from "../value-objects/EnvelopeADSR.js";

export type ScheduledAmpEnvelope = {
  readonly releaseSeconds: number;
};

export type ScheduleAmpEnvelopeArgs = {
  readonly envelope: EnvelopeADSR;
  readonly velocity: number;
  readonly sustainOverride?: number;
  readonly startAtSeconds: number;
};

export type ScheduleAmpReleaseArgs = {
  readonly releaseStartSeconds: number;
  readonly releaseSeconds: number;
};

export interface IAmpEnvelopeScheduler {
  scheduleAttackDecaySustain(
    gain: AudioParam,
    args: ScheduleAmpEnvelopeArgs,
  ): ScheduledAmpEnvelope;

  scheduleRelease(gain: AudioParam, args: ScheduleAmpReleaseArgs): void;
}

export class AmpEnvelopeScheduler implements IAmpEnvelopeScheduler {
  public static readonly minimumAttackSeconds = 0.003;
  public static readonly minimumReleaseSeconds = 0.02;
  public static readonly minimumGain = 0.0001;

  public scheduleAttackDecaySustain(
    gain: AudioParam,
    args: ScheduleAmpEnvelopeArgs,
  ): ScheduledAmpEnvelope {
    const safeAttack = Math.max(
      args.envelope.attack,
      AmpEnvelopeScheduler.minimumAttackSeconds,
    );

    const safeRelease = Math.max(
      args.envelope.release,
      AmpEnvelopeScheduler.minimumReleaseSeconds,
    );

    const peak = Math.max(
      AmpEnvelopeScheduler.minimumGain,
      (args.velocity / 127) * 0.9,
    );

    const sustainFactor = args.sustainOverride ?? args.envelope.sustain;
    const sustainLevel = Math.max(
      AmpEnvelopeScheduler.minimumGain,
      peak * Math.max(0, Math.min(1, sustainFactor)),
    );

    gain.setValueAtTime(AmpEnvelopeScheduler.minimumGain, args.startAtSeconds);
    gain.linearRampToValueAtTime(peak, args.startAtSeconds + safeAttack);
    gain.linearRampToValueAtTime(
      sustainLevel,
      args.startAtSeconds + safeAttack + args.envelope.decay,
    );

    return {
      releaseSeconds: safeRelease,
    };
  }

  public scheduleRelease(gain: AudioParam, args: ScheduleAmpReleaseArgs): void {
    gain.cancelScheduledValues(args.releaseStartSeconds);

    const releaseFrom = Math.max(
      AmpEnvelopeScheduler.minimumGain,
      gain.value || AmpEnvelopeScheduler.minimumGain,
    );

    gain.setValueAtTime(releaseFrom, args.releaseStartSeconds);
    gain.linearRampToValueAtTime(
      AmpEnvelopeScheduler.minimumGain,
      args.releaseStartSeconds + args.releaseSeconds,
    );
  }
}
