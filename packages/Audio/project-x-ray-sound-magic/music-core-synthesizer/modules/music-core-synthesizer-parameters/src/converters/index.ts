import {
  Decibels,
  DetuneCents,
  FrequencyRatio,
  LinearGain,
  ParameterMilliseconds,
  ParameterSamples,
  ParameterSeconds,
  SampleRateHz,
} from "../value-objects/index.js";
import {
  LinearGainSpecification,
  SemitoneSpecification,
} from "../specifications/index.js";
import type {
  DecibelsValue,
  DetuneCentsValue,
  FrequencyRatioValue,
  LinearGainValue,
  MillisecondsValue,
  SamplesValue,
  SampleRateHzValue,
  SecondsValue,
  SemitoneValue,
} from "../types/index.js";

export interface IParameterConverter<TInput, TOutput> {
  convert(input: TInput): TOutput;
}

export class DecibelsToLinearGainConverter
  implements IParameterConverter<DecibelsValue, LinearGainValue>
{
  public convert(input: DecibelsValue): LinearGainValue {
    Decibels.create(input);

    return Math.pow(10, input / 20);
  }
}

export class LinearGainToDecibelsConverter
  implements IParameterConverter<LinearGainValue, DecibelsValue>
{
  public convert(input: LinearGainValue): DecibelsValue {
    if (!LinearGainSpecification.positive().isSatisfiedBy(input)) {
      throw new Error(`linearGain must be finite and greater than 0 for decibel conversion. Actual value: ${String(input)}.`);
    }

    return 20 * Math.log10(input);
  }
}

export class CentsToFrequencyRatioConverter
  implements IParameterConverter<DetuneCentsValue, FrequencyRatioValue>
{
  public convert(input: DetuneCentsValue): FrequencyRatioValue {
    DetuneCents.create(input);

    return Math.pow(2, input / 1_200);
  }
}

export class FrequencyRatioToCentsConverter
  implements IParameterConverter<FrequencyRatioValue, DetuneCentsValue>
{
  public convert(input: FrequencyRatioValue): DetuneCentsValue {
    FrequencyRatio.create(input);

    return 1_200 * Math.log2(input);
  }
}

export class SemitoneToFrequencyRatioConverter
  implements IParameterConverter<SemitoneValue, FrequencyRatioValue>
{
  public convert(input: SemitoneValue): FrequencyRatioValue {
    if (!SemitoneSpecification.finite().isSatisfiedBy(input)) {
      throw new Error(`semitone must be finite. Actual value: ${String(input)}.`);
    }

    return Math.pow(2, input / 12);
  }
}

export class FrequencyRatioToSemitoneConverter
  implements IParameterConverter<FrequencyRatioValue, SemitoneValue>
{
  public convert(input: FrequencyRatioValue): SemitoneValue {
    FrequencyRatio.create(input);

    return 12 * Math.log2(input);
  }
}

export class SecondsToMillisecondsConverter
  implements IParameterConverter<SecondsValue, MillisecondsValue>
{
  public convert(input: SecondsValue): MillisecondsValue {
    ParameterSeconds.create(input);

    return input * 1_000;
  }
}

export class MillisecondsToSecondsConverter
  implements IParameterConverter<MillisecondsValue, SecondsValue>
{
  public convert(input: MillisecondsValue): SecondsValue {
    ParameterMilliseconds.create(input);

    return input / 1_000;
  }
}

export class SecondsToSamplesConverter
  implements IParameterConverter<SecondsValue, SamplesValue>
{
  public constructor(private readonly sampleRateHz: SampleRateHzValue) {
    SampleRateHz.create(sampleRateHz);
  }

  public convert(input: SecondsValue): SamplesValue {
    ParameterSeconds.create(input);

    return Math.round(input * this.sampleRateHz);
  }
}

export class SamplesToSecondsConverter
  implements IParameterConverter<SamplesValue, SecondsValue>
{
  public constructor(private readonly sampleRateHz: SampleRateHzValue) {
    SampleRateHz.create(sampleRateHz);
  }

  public convert(input: SamplesValue): SecondsValue {
    ParameterSamples.create(input);

    return input / this.sampleRateHz;
  }
}
