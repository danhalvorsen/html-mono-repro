export type OscillatorModel = Readonly<{
  id: string;
  type: OscillatorType;
  frequency: number;
  detune: number;
  gain: number;
}>;

