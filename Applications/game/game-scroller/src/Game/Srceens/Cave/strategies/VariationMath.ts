export interface IMovingAverageContext {
  readonly values: readonly number[];
  readonly index: number;
  readonly windowSize: number;
}

export interface ISpikeSuppressionContext {
  readonly value: number;
  readonly localAverage: number;
  readonly factor: number;
}

export interface ISmoothSeriesContext {
  readonly values: readonly number[];
  readonly passes: number;
}

export function movingAverageBackward(context: IMovingAverageContext): number {
  const start = Math.max(0, context.index - context.windowSize + 1);
  let sum = 0;
  let count = 0;

  for (let i = start; i <= context.index; i += 1) {
    sum += context.values[i] ?? 0;
    count += 1;
  }

  return count > 0 ? sum / count : 0;
}

export function suppressSpike(context: ISpikeSuppressionContext): number {
  const limit = Math.max(context.localAverage * context.factor, context.localAverage + 1);
  return Math.min(context.value, limit);
}

export function smoothSeries(context: ISmoothSeriesContext): number[] {
  let current = [...context.values];
  for (let pass = 0; pass < context.passes; pass += 1) {
    const next = [...current];
    for (let i = 1; i < current.length - 1; i += 1) {
      next[i] = (current[i - 1] + 2 * current[i] + current[i + 1]) / 4;
    }
    current = next;
  }
  return current;
}
