// FILE: src/graph/WebAudioOscillatorGraph.ts

import {
  OscillatorKind,
  type DetuneCentsValue,
  type FrequencyHzValue,
  type IBasicOscillatorDefinition,
  type IOscillator,
  type IOscillatorNoteOffRequest,
  type IOscillatorNoteOnRequest,
  type IOscillatorSample,
  type IOscillatorSampleRequest,
  type IOscillatorStateSnapshot,
  type IPulseOscillatorDefinition,
  type ISampleOscillatorDefinition,
  type IWavetableOscillatorDefinition,
  type OscillatorDefinition,
  type PhaseRadiansValue,
} from "@monorepo/music-core-synthesizer-oscillators-contracts";

import { OscillatorWaveformMapper } from "../mapping/index.js";
import type {
  IWebAudioBufferSourceNodeLike,
  IWebAudioConnectable,
  IWebAudioContextLike,
  IWebAudioOscillatorGraph,
  IWebAudioOscillatorNodeLike,
  IWebAudioSampleBufferProvider,
  IWebAudioSourceNodeLike,
  IWebAudioWavetableProvider,
} from "../ports/index.js";
import { WebAudioOscillatorDefinitionValidator } from "../validation/index.js";

export class WebAudioOscillatorGraph
  implements IOscillator, IWebAudioOscillatorGraph {
  private activeSource: IWebAudioSourceNodeLike | null = null;
  private activeFrequencyHz: FrequencyHzValue;
  private activeDetuneCents: DetuneCentsValue;
  private activePhaseRadians: PhaseRadiansValue;
  private active = false;

  public readonly outputNode: IWebAudioConnectable;

  private readonly waveformMapper = new OscillatorWaveformMapper();

  public constructor(
    private readonly context: IWebAudioContextLike,
    public readonly definition: OscillatorDefinition,
    private readonly definitionValidator: WebAudioOscillatorDefinitionValidator,
    private readonly wavetableProvider: IWebAudioWavetableProvider,
    private readonly sampleBufferProvider: IWebAudioSampleBufferProvider,
  ) {
    this.definitionValidator.validate(definition);

    this.outputNode = this.context.createGain();

    this.activeFrequencyHz = this.getDefinitionFrequency(definition);
    this.activeDetuneCents = this.getDefinitionDetune(definition);
    this.activePhaseRadians = this.getDefinitionPhase(definition);

    this.setOutputGain(definition.gain);
  }

  public noteOn(request: IOscillatorNoteOnRequest): void {
    this.assertTime(request.timeSeconds);
    this.assertFrequency(request.frequencyHz);
    this.assertVelocity(request.velocity);

    this.stopActiveSource(request.timeSeconds);

    const source = this.createSource(this.definition, request);

    source.connect(this.outputNode);
    source.start(request.timeSeconds);

    this.activeSource = source;
    this.activeFrequencyHz = request.frequencyHz;
    this.activeDetuneCents = this.getDefinitionDetune(this.definition);
    this.activePhaseRadians = this.getDefinitionPhase(this.definition);
    this.active = true;

    this.setOutputGain(this.definition.gain * request.velocity);
  }

  public noteOff(request: IOscillatorNoteOffRequest): void {
    this.assertTime(request.timeSeconds);

    this.stopActiveSource(request.timeSeconds);
    this.active = false;
  }

  public sample(request: IOscillatorSampleRequest): IOscillatorSample {
    this.assertTime(request.timeSeconds);
    this.assertSampleRate(request.sampleRateHz);

    return {
      timeSeconds: request.timeSeconds,
      value: 0,
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
    this.stopActiveSource(0);
    this.active = false;
    this.activeFrequencyHz = this.getDefinitionFrequency(this.definition);
    this.activeDetuneCents = this.getDefinitionDetune(this.definition);
    this.activePhaseRadians = this.getDefinitionPhase(this.definition);

    this.setOutputGain(this.definition.gain);
  }

  public connect(destination: IWebAudioConnectable): void {
    this.outputNode.connect(destination);
  }

  public disconnect(): void {
    this.outputNode.disconnect();
  }

  private createSource(
    definition: OscillatorDefinition,
    request: IOscillatorNoteOnRequest,
  ): IWebAudioSourceNodeLike {
    switch (definition.kind) {
      case OscillatorKind.Basic:
        return this.createBasicSource(definition, request);

      case OscillatorKind.Pulse:
        return this.createPulseSource(definition, request);

      case OscillatorKind.Wavetable:
        return this.createWavetableSource(definition, request);

      case OscillatorKind.Sample:
        return this.createSampleSource(definition, request);
    }
  }

  private createBasicSource(
    definition: IBasicOscillatorDefinition,
    request: IOscillatorNoteOnRequest,
  ): IWebAudioOscillatorNodeLike {
    const source = this.context.createOscillator();

    source.type = this.waveformMapper.map(definition.waveform);
    source.frequency.setValueAtTime(request.frequencyHz, request.timeSeconds);
    source.detune.setValueAtTime(definition.detuneCents, request.timeSeconds);

    return source;
  }

  private createPulseSource(
    definition: IPulseOscillatorDefinition,
    request: IOscillatorNoteOnRequest,
  ): IWebAudioOscillatorNodeLike {
    const source = this.context.createOscillator();

    source.type = "square";
    source.frequency.setValueAtTime(request.frequencyHz, request.timeSeconds);
    source.detune.setValueAtTime(definition.detuneCents, request.timeSeconds);

    return source;
  }

  private createWavetableSource(
    definition: IWavetableOscillatorDefinition,
    request: IOscillatorNoteOnRequest,
  ): IWebAudioOscillatorNodeLike {
    const source = this.context.createOscillator();
    const periodicWave = this.wavetableProvider.get(definition.tableId);

    source.setPeriodicWave(periodicWave);
    source.frequency.setValueAtTime(request.frequencyHz, request.timeSeconds);
    source.detune.setValueAtTime(definition.detuneCents, request.timeSeconds);

    return source;
  }

  private createSampleSource(
    definition: ISampleOscillatorDefinition,
    request: IOscillatorNoteOnRequest,
  ): IWebAudioBufferSourceNodeLike {
    const source = this.context.createBufferSource();
    const buffer = this.sampleBufferProvider.get(definition.sampleId);

    source.buffer = buffer;
    source.loop = definition.loop;
    source.playbackRate.setValueAtTime(
      request.frequencyHz / definition.rootFrequencyHz,
      request.timeSeconds,
    );

    return source;
  }

  private stopActiveSource(timeSeconds: number): void {
    if (this.activeSource === null) {
      return;
    }

    this.activeSource.stop(timeSeconds);
    this.activeSource.disconnect();
    this.activeSource = null;
  }

  private setOutputGain(value: number): void {
    const gainNode = this.outputNode as {
      readonly gain?: {
        value: number;
      };
    };

    if (gainNode.gain !== undefined) {
      gainNode.gain.value = value;
    }
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
      throw new Error(
        `timeSeconds must be finite and greater than or equal to 0. Actual value: ${String(value)}.`,
      );
    }
  }

  private assertFrequency(value: number): void {
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error(
        `frequencyHz must be finite and greater than 0. Actual value: ${String(value)}.`,
      );
    }
  }

  private assertVelocity(value: number): void {
    if (!Number.isFinite(value) || value < 0 || value > 1) {
      throw new Error(
        `velocity must be between 0 and 1. Actual value: ${String(value)}.`,
      );
    }
  }

  private assertSampleRate(value: number): void {
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error(
        `sampleRateHz must be finite and greater than 0. Actual value: ${String(value)}.`,
      );
    }
  }
}