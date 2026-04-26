import { OscillatorDefinition, IOscillatorDefinitionValidator, OscillatorKind, OscillatorWaveformKind }
 from '@monorepo/music-core-synthesizer-oscillators-contracts';

export class OscillatorDefinitionValidator implements IOscillatorDefinitionValidator {
  public validate(definition: OscillatorDefinition): void {
    this.assertGain(definition.gain);

    switch (definition.kind) {
      case OscillatorKind.Basic:
        this.assertWaveform(definition.waveform);
        this.assertFrequency(definition.frequencyHz, "frequencyHz");
        this.assertFinite(definition.detuneCents, "detuneCents");
        this.assertFinite(definition.phaseRadians, "phaseRadians");
        return;

      case OscillatorKind.Pulse:
        this.assertFrequency(definition.frequencyHz, "frequencyHz");
        this.assertFinite(definition.detuneCents, "detuneCents");
        this.assertFinite(definition.phaseRadians, "phaseRadians");
        this.assertUnipolar(definition.pulseWidth, "pulseWidth");
        return;

      case OscillatorKind.Wavetable:
        this.assertNonEmptyString(definition.tableId, "tableId");
        this.assertFrequency(definition.frequencyHz, "frequencyHz");
        this.assertFinite(definition.detuneCents, "detuneCents");
        this.assertFinite(definition.phaseRadians, "phaseRadians");
        return;

      case OscillatorKind.Sample:
        this.assertNonEmptyString(definition.sampleId, "sampleId");
        this.assertFrequency(definition.rootFrequencyHz, "rootFrequencyHz");
        this.assertFrequency(definition.playbackFrequencyHz, "playbackFrequencyHz");
        return;
    }
  }

  private assertGain(value: number): void {
    if (!Number.isFinite(value) || value < 0) {
      throw new Error(`gain must be finite and greater than or equal to 0. Actual value: ${String(value)}.`);
    }
  }

  private assertFrequency(
    value: number,
    name: string,
  ): void {
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error(`${name} must be finite and greater than 0. Actual value: ${String(value)}.`);
    }
  }

  private assertFinite(
    value: number,
    name: string,
  ): void {
    if (!Number.isFinite(value)) {
      throw new Error(`${name} must be finite. Actual value: ${String(value)}.`);
    }
  }

  private assertUnipolar(
    value: number,
    name: string,
  ): void {
    if (!Number.isFinite(value) || value < 0 || value > 1) {
      throw new Error(`${name} must be between 0 and 1. Actual value: ${String(value)}.`);
    }
  }

  private assertNonEmptyString(
    value: string,
    name: string,
  ): void {
    if (value.trim().length === 0) {
      throw new Error(`${name} must not be empty.`);
    }
  }

  private assertWaveform(value: string): void {
    if (!Object.values(OscillatorWaveformKind).includes(value as never)) {
      throw new Error(`Unsupported oscillator waveform: ${value}.`);
    }
  }
}
