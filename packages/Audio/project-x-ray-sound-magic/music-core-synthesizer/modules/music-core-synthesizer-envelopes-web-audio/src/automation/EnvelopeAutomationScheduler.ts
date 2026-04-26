import {
  EnvelopeCurveKind,
  EnvelopeKind,
  EnvelopeDefinitionValidator,
  EnvelopeSecondsSpecification,
  EnvelopeVelocitySpecification,
  type EnvelopeDefinition,
  type EnvelopeLevelValue,
  type EnvelopeSecondsValue,
  type IAdsrEnvelopeDefinition,
  type IAhdsrEnvelopeDefinition,
  type IArEnvelopeDefinition,
  type IAsrEnvelopeDefinition,
  type IEnvelopeCurveDefinition,
  type IEnvelopeGateOffRequest,
  type IEnvelopeGateOnRequest,
  type IOneShotEnvelopeDefinition,
} from "@monorepo/music-core-synthesizer-envelopes-contracts";

import { WebAudioEnvelopeMath } from "../math/index.js";
import type { IWebAudioAudioParamLike } from "../ports/index.js";
import type { IEnvelopeAutomationScheduler } from "./IEnvelopeAutomationScheduler.js";

export class EnvelopeAutomationScheduler implements IEnvelopeAutomationScheduler {
  private readonly secondsSpecification = new EnvelopeSecondsSpecification();
  private readonly velocitySpecification = new EnvelopeVelocitySpecification();

  public constructor(
    private readonly definitionValidator: EnvelopeDefinitionValidator,
  ) {}

  public static createDefault(): EnvelopeAutomationScheduler {
    return new EnvelopeAutomationScheduler(
      EnvelopeDefinitionValidator.createDefault(),
    );
  }

  public scheduleGateOn(
    definition: EnvelopeDefinition,
    parameter: IWebAudioAudioParamLike,
    request: IEnvelopeGateOnRequest,
  ): void {
    this.definitionValidator.validate(definition);
    this.assertSeconds(request.timeSeconds);
    this.assertVelocity(request.velocity);

    parameter.cancelScheduledValues(request.timeSeconds);
    parameter.setValueAtTime(0, request.timeSeconds);

    switch (definition.kind) {
      case EnvelopeKind.Adsr:
        this.scheduleAdsr(definition, parameter, request);
        return;

      case EnvelopeKind.Ahdsr:
        this.scheduleAhdsr(definition, parameter, request);
        return;

      case EnvelopeKind.Ar:
        this.scheduleAr(definition, parameter, request);
        return;

      case EnvelopeKind.Asr:
        this.scheduleAsr(definition, parameter, request);
        return;

      case EnvelopeKind.OneShot:
        this.scheduleOneShot(definition, parameter, request);
        return;
    }
  }

  public scheduleGateOff(
    definition: EnvelopeDefinition,
    parameter: IWebAudioAudioParamLike,
    request: IEnvelopeGateOffRequest,
  ): void {
    this.definitionValidator.validate(definition);
    this.assertSeconds(request.timeSeconds);

    if (definition.kind === EnvelopeKind.OneShot) {
      return;
    }

    const releaseSeconds = this.getReleaseSeconds(definition);
    const releaseCurve = this.getReleaseCurve(definition);
    const releaseStartLevel = WebAudioEnvelopeMath.levelAtRelease(parameter.value);

    parameter.cancelScheduledValues(request.timeSeconds);
    parameter.setValueAtTime(releaseStartLevel, request.timeSeconds);

    this.scheduleRamp(
      parameter,
      releaseStartLevel,
      0,
      request.timeSeconds,
      releaseSeconds,
      releaseCurve,
    );
  }

  public reset(
    parameter: IWebAudioAudioParamLike,
    timeSeconds: number,
  ): void {
    this.assertSeconds(timeSeconds);

    parameter.cancelScheduledValues(timeSeconds);
    parameter.setValueAtTime(0, timeSeconds);
  }

  private scheduleAdsr(
    definition: IAdsrEnvelopeDefinition,
    parameter: IWebAudioAudioParamLike,
    request: IEnvelopeGateOnRequest,
  ): void {
    this.scheduleAttackDecaySustain(
      parameter,
      request.timeSeconds,
      request.velocity,
      definition.attackSeconds,
      0,
      definition.decaySeconds,
      definition.sustainLevel,
      definition.attackCurve,
      definition.decayCurve,
    );
  }

  private scheduleAhdsr(
    definition: IAhdsrEnvelopeDefinition,
    parameter: IWebAudioAudioParamLike,
    request: IEnvelopeGateOnRequest,
  ): void {
    this.scheduleAttackDecaySustain(
      parameter,
      request.timeSeconds,
      request.velocity,
      definition.attackSeconds,
      definition.holdSeconds,
      definition.decaySeconds,
      definition.sustainLevel,
      definition.attackCurve,
      definition.decayCurve,
    );
  }

  private scheduleAr(
    definition: IArEnvelopeDefinition,
    parameter: IWebAudioAudioParamLike,
    request: IEnvelopeGateOnRequest,
  ): void {
    this.scheduleRamp(
      parameter,
      0,
      request.velocity,
      request.timeSeconds,
      definition.attackSeconds,
      definition.attackCurve,
    );
  }

  private scheduleAsr(
    definition: IAsrEnvelopeDefinition,
    parameter: IWebAudioAudioParamLike,
    request: IEnvelopeGateOnRequest,
  ): void {
    this.scheduleRamp(
      parameter,
      0,
      request.velocity * definition.sustainLevel,
      request.timeSeconds,
      definition.attackSeconds,
      definition.attackCurve,
    );
  }

  private scheduleOneShot(
    definition: IOneShotEnvelopeDefinition,
    parameter: IWebAudioAudioParamLike,
    request: IEnvelopeGateOnRequest,
  ): void {
    const attackEndTime = request.timeSeconds + definition.attackSeconds;

    this.scheduleRamp(
      parameter,
      0,
      request.velocity,
      request.timeSeconds,
      definition.attackSeconds,
      definition.attackCurve,
    );

    this.scheduleRamp(
      parameter,
      request.velocity,
      0,
      attackEndTime,
      definition.decaySeconds,
      definition.decayCurve,
    );
  }

  private scheduleAttackDecaySustain(
    parameter: IWebAudioAudioParamLike,
    startTimeSeconds: EnvelopeSecondsValue,
    velocity: EnvelopeLevelValue,
    attackSeconds: EnvelopeSecondsValue,
    holdSeconds: EnvelopeSecondsValue,
    decaySeconds: EnvelopeSecondsValue,
    sustainLevel: EnvelopeLevelValue,
    attackCurve: IEnvelopeCurveDefinition,
    decayCurve: IEnvelopeCurveDefinition,
  ): void {
    const attackEndTime = startTimeSeconds + attackSeconds;
    const holdEndTime = attackEndTime + holdSeconds;
    const decayEndTime = holdEndTime + decaySeconds;
    const targetSustainLevel = velocity * sustainLevel;

    this.scheduleRamp(
      parameter,
      0,
      velocity,
      startTimeSeconds,
      attackSeconds,
      attackCurve,
    );

    if (holdSeconds > 0) {
      parameter.setValueAtTime(velocity, holdEndTime);
    }

    this.scheduleRamp(
      parameter,
      velocity,
      targetSustainLevel,
      holdEndTime,
      decaySeconds,
      decayCurve,
    );

    parameter.setValueAtTime(targetSustainLevel, decayEndTime);
  }

private scheduleRamp(
  parameter: IWebAudioAudioParamLike,
  startLevel: EnvelopeLevelValue,
  endLevel: EnvelopeLevelValue,
  startTimeSeconds: EnvelopeSecondsValue,
  durationSeconds: EnvelopeSecondsValue,
  curve: IEnvelopeCurveDefinition,
): void {
  const endTimeSeconds = startTimeSeconds + durationSeconds;

  parameter.setValueAtTime(startLevel, startTimeSeconds);

  if (durationSeconds <= 0) {
    parameter.setValueAtTime(endLevel, startTimeSeconds);
    parameter.value = endLevel;
    return;
  }

  switch (curve.kind) {
    case EnvelopeCurveKind.Linear:
      parameter.linearRampToValueAtTime(endLevel, endTimeSeconds);
      parameter.value = endLevel;
      return;

    case EnvelopeCurveKind.Exponential:
    case EnvelopeCurveKind.Logarithmic:
      parameter.setTargetAtTime(
        endLevel,
        startTimeSeconds,
        WebAudioEnvelopeMath.safeTimeConstant(durationSeconds),
      );
      parameter.setValueAtTime(endLevel, endTimeSeconds);
      parameter.value = endLevel;
      return;

    case EnvelopeCurveKind.Instant:
      parameter.setValueAtTime(endLevel, startTimeSeconds);
      parameter.value = endLevel;
      return;
  }
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

  private assertVelocity(value: EnvelopeLevelValue): void {
    if (!this.velocitySpecification.isSatisfiedBy(value)) {
      throw new Error(`velocity must be between 0 and 1. Actual value: ${String(value)}.`);
    }
  }
}
