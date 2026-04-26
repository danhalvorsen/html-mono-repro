import {
  EnvelopeCurveKind,
  EnvelopeDefinitionValidator,
  EnvelopeKind,
  EnvelopeStage,
  EnvelopeVelocitySpecification,
  EnvelopeSecondsSpecification,
  type EnvelopeDefinition,
  type EnvelopeLevelValue,
  type EnvelopeSecondsValue,
  type EnvelopeVelocityValue,
  type IAdsrEnvelopeDefinition,
  type IAhdsrEnvelopeDefinition,
  type IArEnvelopeDefinition,
  type IAsrEnvelopeDefinition,
  type IEnvelope,
  type IEnvelopeCurveDefinition,
  type IEnvelopeFactory,
  type IEnvelopeGateOffRequest,
  type IEnvelopeGateOnRequest,
  type IEnvelopeSample,
  type IEnvelopeSampleRequest,
  type IEnvelopeStateSnapshot,
  type IOneShotEnvelopeDefinition,
} from "@monorepo/music-core-synthesizer-envelopes-contracts";

export interface IEnvelopeCurveEvaluator {
  evaluate(progress: number): number;
}

export interface IEnvelopeCurveEvaluatorFactory {
  create(definition: IEnvelopeCurveDefinition): IEnvelopeCurveEvaluator;
}

export class EnvelopeMath {
  public static clamp01(value: number): number {
    if (!Number.isFinite(value)) {
      return 0;
    }

    if (value < 0) {
      return 0;
    }

    if (value > 1) {
      return 1;
    }

    return value;
  }

  public static progress(elapsedSeconds: number, durationSeconds: number): number {
    if (durationSeconds <= 0) {
      return 1;
    }

    return EnvelopeMath.clamp01(elapsedSeconds / durationSeconds);
  }

  public static interpolate(
    startLevel: number,
    endLevel: number,
    progress: number,
  ): number {
    return startLevel + (endLevel - startLevel) * EnvelopeMath.clamp01(progress);
  }
}

export class LinearEnvelopeCurveEvaluator implements IEnvelopeCurveEvaluator {
  public evaluate(progress: number): number {
    return EnvelopeMath.clamp01(progress);
  }
}

export class ExponentialEnvelopeCurveEvaluator implements IEnvelopeCurveEvaluator {
  public evaluate(progress: number): number {
    const value = EnvelopeMath.clamp01(progress);

    return value * value;
  }
}

export class LogarithmicEnvelopeCurveEvaluator implements IEnvelopeCurveEvaluator {
  public evaluate(progress: number): number {
    return Math.sqrt(EnvelopeMath.clamp01(progress));
  }
}

export class InstantEnvelopeCurveEvaluator implements IEnvelopeCurveEvaluator {
  public evaluate(progress: number): number {
    return EnvelopeMath.clamp01(progress) <= 0 ? 0 : 1;
  }
}

export class EnvelopeCurveEvaluatorFactory implements IEnvelopeCurveEvaluatorFactory {
  public create(definition: IEnvelopeCurveDefinition): IEnvelopeCurveEvaluator {
    switch (definition.kind) {
      case EnvelopeCurveKind.Linear:
        return new LinearEnvelopeCurveEvaluator();

      case EnvelopeCurveKind.Exponential:
        return new ExponentialEnvelopeCurveEvaluator();

      case EnvelopeCurveKind.Logarithmic:
        return new LogarithmicEnvelopeCurveEvaluator();

      case EnvelopeCurveKind.Instant:
        return new InstantEnvelopeCurveEvaluator();
    }
  }
}

interface IEnvelopeEvaluation {
  readonly level: EnvelopeLevelValue;
  readonly stage: typeof EnvelopeStage[keyof typeof EnvelopeStage];
  readonly isComplete: boolean;
}

export class Envelope implements IEnvelope {
  private startedAtSeconds: EnvelopeSecondsValue | null = null;
  private releasedAtSeconds: EnvelopeSecondsValue | null = null;
  private releaseStartLevel: EnvelopeLevelValue = 0;
  private currentLevel: EnvelopeLevelValue = 0;
  private currentStage: typeof EnvelopeStage[keyof typeof EnvelopeStage] = EnvelopeStage.Idle;
  private isGateOpen = false;
  private isEnvelopeComplete = false;
  private velocity: EnvelopeVelocityValue = 1;

  private readonly secondsSpecification = new EnvelopeSecondsSpecification();
  private readonly velocitySpecification = new EnvelopeVelocitySpecification();

  public constructor(
    public readonly definition: EnvelopeDefinition,
    private readonly curveEvaluatorFactory: IEnvelopeCurveEvaluatorFactory,
  ) {}

  public gateOn(request: IEnvelopeGateOnRequest): void {
    this.assertSeconds(request.timeSeconds);
    this.assertVelocity(request.velocity);

    this.startedAtSeconds = request.timeSeconds;
    this.releasedAtSeconds = null;
    this.releaseStartLevel = 0;
    this.currentLevel = 0;
    this.currentStage = EnvelopeStage.Attack;
    this.isGateOpen = true;
    this.isEnvelopeComplete = false;
    this.velocity = request.velocity;
  }

  public gateOff(request: IEnvelopeGateOffRequest): void {
    this.assertSeconds(request.timeSeconds);

    if (this.startedAtSeconds === null) {
      return;
    }

    if (this.definition.kind === EnvelopeKind.OneShot) {
      return;
    }

    const evaluation = this.evaluateAt(request.timeSeconds);

    this.releasedAtSeconds = request.timeSeconds;
    this.releaseStartLevel = evaluation.level;
    this.currentLevel = evaluation.level;
    this.currentStage = EnvelopeStage.Release;
    this.isGateOpen = false;
    this.isEnvelopeComplete = false;
  }

  public sample(request: IEnvelopeSampleRequest): IEnvelopeSample {
    this.assertSeconds(request.timeSeconds);

    const evaluation = this.evaluateAt(request.timeSeconds);

    this.currentLevel = evaluation.level;
    this.currentStage = evaluation.stage;
    this.isEnvelopeComplete = evaluation.isComplete;

    if (evaluation.isComplete) {
      this.isGateOpen = false;
    }

    return {
      timeSeconds: request.timeSeconds,
      level: evaluation.level,
      stage: evaluation.stage,
      isComplete: evaluation.isComplete,
    };
  }

  public snapshot(): IEnvelopeStateSnapshot {
    return {
      stage: this.currentStage,
      startedAtSeconds: this.startedAtSeconds,
      releasedAtSeconds: this.releasedAtSeconds,
      releaseStartLevel: this.releaseStartLevel,
      currentLevel: this.currentLevel,
      isGateOpen: this.isGateOpen,
      isComplete: this.isEnvelopeComplete,
    };
  }

  public reset(): void {
    this.startedAtSeconds = null;
    this.releasedAtSeconds = null;
    this.releaseStartLevel = 0;
    this.currentLevel = 0;
    this.currentStage = EnvelopeStage.Idle;
    this.isGateOpen = false;
    this.isEnvelopeComplete = false;
    this.velocity = 1;
  }

  private evaluateAt(timeSeconds: EnvelopeSecondsValue): IEnvelopeEvaluation {
    if (this.startedAtSeconds === null) {
      return {
        level: 0,
        stage: EnvelopeStage.Idle,
        isComplete: false,
      };
    }

    if (this.releasedAtSeconds !== null && this.definition.kind !== EnvelopeKind.OneShot) {
      return this.evaluateRelease(timeSeconds);
    }

    switch (this.definition.kind) {
      case EnvelopeKind.Adsr:
        return this.evaluateAdsr(this.definition, timeSeconds);

      case EnvelopeKind.Ahdsr:
        return this.evaluateAhdsr(this.definition, timeSeconds);

      case EnvelopeKind.Ar:
        return this.evaluateAr(this.definition, timeSeconds);

      case EnvelopeKind.Asr:
        return this.evaluateAsr(this.definition, timeSeconds);

      case EnvelopeKind.OneShot:
        return this.evaluateOneShot(this.definition, timeSeconds);
    }
  }

  private evaluateAdsr(
    definition: IAdsrEnvelopeDefinition,
    timeSeconds: EnvelopeSecondsValue,
  ): IEnvelopeEvaluation {
    return this.evaluateAttackDecaySustain(
      timeSeconds,
      definition.attackSeconds,
      0,
      definition.decaySeconds,
      definition.sustainLevel,
      definition.attackCurve,
      definition.decayCurve,
    );
  }

  private evaluateAhdsr(
    definition: IAhdsrEnvelopeDefinition,
    timeSeconds: EnvelopeSecondsValue,
  ): IEnvelopeEvaluation {
    return this.evaluateAttackDecaySustain(
      timeSeconds,
      definition.attackSeconds,
      definition.holdSeconds,
      definition.decaySeconds,
      definition.sustainLevel,
      definition.attackCurve,
      definition.decayCurve,
    );
  }

  private evaluateAr(
    definition: IArEnvelopeDefinition,
    timeSeconds: EnvelopeSecondsValue,
  ): IEnvelopeEvaluation {
    const elapsedSeconds = this.getElapsedSinceStart(timeSeconds);
    const peakLevel = this.velocity;

    if (definition.attackSeconds > 0 && elapsedSeconds < definition.attackSeconds) {
      return {
        level: this.evaluateCurveLevel(
          0,
          peakLevel,
          elapsedSeconds,
          definition.attackSeconds,
          definition.attackCurve,
        ),
        stage: EnvelopeStage.Attack,
        isComplete: false,
      };
    }

    return {
      level: peakLevel,
      stage: EnvelopeStage.Sustain,
      isComplete: false,
    };
  }

  private evaluateAsr(
    definition: IAsrEnvelopeDefinition,
    timeSeconds: EnvelopeSecondsValue,
  ): IEnvelopeEvaluation {
    const elapsedSeconds = this.getElapsedSinceStart(timeSeconds);
    const peakLevel = this.velocity;
    const sustainLevel = this.velocity * definition.sustainLevel;

    if (definition.attackSeconds > 0 && elapsedSeconds < definition.attackSeconds) {
      return {
        level: this.evaluateCurveLevel(
          0,
          peakLevel,
          elapsedSeconds,
          definition.attackSeconds,
          definition.attackCurve,
        ),
        stage: EnvelopeStage.Attack,
        isComplete: false,
      };
    }

    return {
      level: sustainLevel,
      stage: EnvelopeStage.Sustain,
      isComplete: false,
    };
  }

  private evaluateOneShot(
    definition: IOneShotEnvelopeDefinition,
    timeSeconds: EnvelopeSecondsValue,
  ): IEnvelopeEvaluation {
    let elapsedSeconds = this.getElapsedSinceStart(timeSeconds);
    const peakLevel = this.velocity;

    if (definition.attackSeconds > 0 && elapsedSeconds < definition.attackSeconds) {
      return {
        level: this.evaluateCurveLevel(
          0,
          peakLevel,
          elapsedSeconds,
          definition.attackSeconds,
          definition.attackCurve,
        ),
        stage: EnvelopeStage.Attack,
        isComplete: false,
      };
    }

    elapsedSeconds -= definition.attackSeconds;

    if (definition.decaySeconds > 0 && elapsedSeconds < definition.decaySeconds) {
      return {
        level: this.evaluateCurveLevel(
          peakLevel,
          0,
          elapsedSeconds,
          definition.decaySeconds,
          definition.decayCurve,
        ),
        stage: EnvelopeStage.Decay,
        isComplete: false,
      };
    }

    return {
      level: 0,
      stage: EnvelopeStage.Complete,
      isComplete: true,
    };
  }

  private evaluateAttackDecaySustain(
    timeSeconds: EnvelopeSecondsValue,
    attackSeconds: EnvelopeSecondsValue,
    holdSeconds: EnvelopeSecondsValue,
    decaySeconds: EnvelopeSecondsValue,
    sustainLevel: EnvelopeLevelValue,
    attackCurve: IEnvelopeCurveDefinition,
    decayCurve: IEnvelopeCurveDefinition,
  ): IEnvelopeEvaluation {
    let elapsedSeconds = this.getElapsedSinceStart(timeSeconds);
    const peakLevel = this.velocity;
    const targetSustainLevel = this.velocity * sustainLevel;

    if (attackSeconds > 0 && elapsedSeconds < attackSeconds) {
      return {
        level: this.evaluateCurveLevel(
          0,
          peakLevel,
          elapsedSeconds,
          attackSeconds,
          attackCurve,
        ),
        stage: EnvelopeStage.Attack,
        isComplete: false,
      };
    }

    elapsedSeconds -= attackSeconds;

    if (holdSeconds > 0 && elapsedSeconds < holdSeconds) {
      return {
        level: peakLevel,
        stage: EnvelopeStage.Hold,
        isComplete: false,
      };
    }

    elapsedSeconds -= holdSeconds;

    if (decaySeconds > 0 && elapsedSeconds < decaySeconds) {
      return {
        level: this.evaluateCurveLevel(
          peakLevel,
          targetSustainLevel,
          elapsedSeconds,
          decaySeconds,
          decayCurve,
        ),
        stage: EnvelopeStage.Decay,
        isComplete: false,
      };
    }

    return {
      level: targetSustainLevel,
      stage: EnvelopeStage.Sustain,
      isComplete: false,
    };
  }

  private evaluateRelease(timeSeconds: EnvelopeSecondsValue): IEnvelopeEvaluation {
    if (this.releasedAtSeconds === null) {
      throw new Error("Cannot evaluate release before release has started.");
    }

    const releaseSeconds = this.getReleaseSeconds(this.definition);
    const releaseCurve = this.getReleaseCurve(this.definition);

    if (releaseSeconds <= 0) {
      return {
        level: 0,
        stage: EnvelopeStage.Complete,
        isComplete: true,
      };
    }

    const elapsedSeconds = Math.max(0, timeSeconds - this.releasedAtSeconds);

    if (elapsedSeconds >= releaseSeconds) {
      return {
        level: 0,
        stage: EnvelopeStage.Complete,
        isComplete: true,
      };
    }

    return {
      level: this.evaluateCurveLevel(
        this.releaseStartLevel,
        0,
        elapsedSeconds,
        releaseSeconds,
        releaseCurve,
      ),
      stage: EnvelopeStage.Release,
      isComplete: false,
    };
  }

  private evaluateCurveLevel(
    startLevel: EnvelopeLevelValue,
    endLevel: EnvelopeLevelValue,
    elapsedSeconds: EnvelopeSecondsValue,
    durationSeconds: EnvelopeSecondsValue,
    curve: IEnvelopeCurveDefinition,
  ): EnvelopeLevelValue {
    const evaluator = this.curveEvaluatorFactory.create(curve);
    const progress = EnvelopeMath.progress(elapsedSeconds, durationSeconds);

    return EnvelopeMath.interpolate(startLevel, endLevel, evaluator.evaluate(progress));
  }

  private getElapsedSinceStart(timeSeconds: EnvelopeSecondsValue): EnvelopeSecondsValue {
    if (this.startedAtSeconds === null) {
      return 0;
    }

    return Math.max(0, timeSeconds - this.startedAtSeconds);
  }

  private getReleaseSeconds(definition: EnvelopeDefinition): EnvelopeSecondsValue {
    switch (definition.kind) {
      case EnvelopeKind.Adsr:
      case EnvelopeKind.Ahdsr:
      case EnvelopeKind.Ar:
      case EnvelopeKind.Asr:
        return definition.releaseSeconds;

      case EnvelopeKind.OneShot:
        return 0;
    }
  }

  private getReleaseCurve(definition: EnvelopeDefinition): IEnvelopeCurveDefinition {
    switch (definition.kind) {
      case EnvelopeKind.Adsr:
      case EnvelopeKind.Ahdsr:
      case EnvelopeKind.Ar:
      case EnvelopeKind.Asr:
        return definition.releaseCurve;

      case EnvelopeKind.OneShot:
        return {
          kind: EnvelopeCurveKind.Instant,
        };
    }
  }

  private assertSeconds(value: EnvelopeSecondsValue): void {
    if (!this.secondsSpecification.isSatisfiedBy(value)) {
      throw new Error(`timeSeconds must be finite and greater than or equal to 0. Actual value: ${String(value)}.`);
    }
  }

  private assertVelocity(value: EnvelopeVelocityValue): void {
    if (!this.velocitySpecification.isSatisfiedBy(value)) {
      throw new Error(`velocity must be between 0 and 1. Actual value: ${String(value)}.`);
    }
  }
}

export class EnvelopeFactory implements IEnvelopeFactory {
  public constructor(
    private readonly definitionValidator: EnvelopeDefinitionValidator,
    private readonly curveEvaluatorFactory: IEnvelopeCurveEvaluatorFactory,
  ) {}

  public static createDefault(): EnvelopeFactory {
    return new EnvelopeFactory(
      EnvelopeDefinitionValidator.createDefault(),
      new EnvelopeCurveEvaluatorFactory(),
    );
  }

  public create(definition: EnvelopeDefinition): IEnvelope {
    this.definitionValidator.validate(definition);

    return new Envelope(definition, this.curveEvaluatorFactory);
  }
}
