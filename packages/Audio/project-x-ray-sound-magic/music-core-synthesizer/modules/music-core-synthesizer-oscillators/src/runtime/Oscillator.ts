import {
  OscillatorKind,
  type AudioSampleValue,
  type DetuneCentsValue,
  type FrequencyHzValue,
  type IOscillator,
  type IOscillatorNoteOffRequest,
  type IOscillatorNoteOnRequest,
  type IOscillatorSample,
  type IOscillatorSampleRequest,
  type IOscillatorStateSnapshot,
  type OscillatorDefinition,
  type PhaseRadiansValue,
} from "@monorepo/music-core-synthesizer-oscillators-contracts";

import type { IOscillatorAlgorithm } from "../algorithms/index.js";
import { OscillatorMath } from "../math/index.js";
import { OscillatorDefinitionValidator } from "../validation/index.js";

export class Oscillator implements IOscillator {
  private phase01 = 0;
  private activeFrequencyHz: FrequencyHzValue;
  private activeDetuneCents: DetuneCentsValue;
  private activePhaseRadians: PhaseRadiansValue;
  private active = false;

  public constructor(
    public readonly definition: OscillatorDefinition,
    private readonly algorithm: IOscillatorAlgorithm,
    private readonly definitionValidator: OscillatorDefinitionValidator,
  ) {
    this.definitionValidator.validate(definition);

    this.activeFrequencyHz = this.getDefinitionFrequency(definition);
    this.activeDetuneCents = this.getDefinitionDetune(definition);
    this.activePhaseRadians = this.getDefinitionPhase(definition);
    this.phase01 = OscillatorMath.radiansToCycles(this.activePhaseRadians);
  }

  public noteOn(request: IOscillatorNoteOnRequest): void {
    this.assertTime(request.timeSeconds);
    this.assertFrequency(request.frequencyHz);
    this.assertVelocity(request.velocity);

    this.activeFrequencyHz = request.frequencyHz;
    this.activeDetuneCents = this.getDefinitionDetune(this.definition);
    this.activePhaseRadians = this.getDefinitionPhase(this.definition);
    this.phase01 = OscillatorMath.radiansToCycles(this.activePhaseRadians);
    this.active = true;
  }

  public noteOff(request: IOscillatorNoteOffRequest): void {
    this.assertTime(request.timeSeconds);

    this.active = false;
  }

  public sample(request: IOscillatorSampleRequest): IOscillatorSample {
    this.assertTime(request.timeSeconds);
    this.assertSampleRate(request.sampleRateHz);

    if (!this.active) {
      return {
        timeSeconds: request.timeSeconds,
        value: 0,
      };
    }

    const value = this.nextSample(request.sampleRateHz);

    return {
      timeSeconds: request.timeSeconds,
      value,
    };
  }

  public snapshot(): IOscillatorStateSnapshot {
    return {
      definition: this.definition,
      frequencyHz: this.activeFrequencyHz,
      detuneCents: this.activeDetuneCents,
      phaseRadians: this.activePhaseRadians,
      gain: this.definition.gain,
      isActive: this.active,
    };
  }

  public reset(): void {
    this.active = false;
    this.activeFrequencyHz = this.getDefinitionFrequency(this.definition);
    this.activeDetuneCents = this.getDefinitionDetune(this.definition);
    this.activePhaseRadians = this.getDefinitionPhase(this.definition);
    this.phase01 = OscillatorMath.radiansToCycles(this.activePhaseRadians);
  }

  private nextSample(sampleRateHz: number): AudioSampleValue {
    const raw = this.algorithm.sample(this.definition, this.phase01);
    const value = OscillatorMath.clampBipolar(raw * this.definition.gain);
    const effectiveFrequency = OscillatorMath.frequencyWithDetune(
      this.activeFrequencyHz,
      this.activeDetuneCents,
    );

    this.phase01 = OscillatorMath.wrap01(
      this.phase01 + OscillatorMath.phaseIncrement(effectiveFrequency, sampleRateHz),
    );

    return value;
  }

  private getDefinitionFrequency(definition: OscillatorDefinition): FrequencyHzValue {
    switch (definition.kind) {
      case OscillatorKind.Basic:
      case OscillatorKind.Pulse:
      case OscillatorKind.Wavetable:
        return definition.frequencyHz;

      case OscillatorKind.Sample:
        return definition.playbackFrequencyHz;
    }
  }

  private getDefinitionDetune(definition: OscillatorDefinition): DetuneCentsValue {
    switch (definition.kind) {
      case OscillatorKind.Basic:
      case OscillatorKind.Pulse:
      case OscillatorKind.Wavetable:
        return definition.detuneCents;

      case OscillatorKind.Sample:
        return 0;
    }
  }

  private getDefinitionPhase(definition: OscillatorDefinition): PhaseRadiansValue {
    switch (definition.kind) {
      case OscillatorKind.Basic:
      case OscillatorKind.Pulse:
      case OscillatorKind.Wavetable:
        return definition.phaseRadians;

      case OscillatorKind.Sample:
        return 0;
    }
  }

  private assertTime(value: number): void {
    if (!Number.isFinite(value) || value < 0) {
      throw new Error(`timeSeconds must be finite and greater than or equal to 0. Actual value: ${String(value)}.`);
    }
  }

  private assertFrequency(value: number): void {
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error(`frequencyHz must be finite and greater than 0. Actual value: ${String(value)}.`);
    }
  }

  private assertVelocity(value: number): void {
    if (!Number.isFinite(value) || value < 0 || value > 1) {
      throw new Error(`velocity must be between 0 and 1. Actual value: ${String(value)}.`);
    }
  }

  private assertSampleRate(value: number): void {
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error(`sampleRateHz must be finite and greater than 0. Actual value: ${String(value)}.`);
    }
  }
}
