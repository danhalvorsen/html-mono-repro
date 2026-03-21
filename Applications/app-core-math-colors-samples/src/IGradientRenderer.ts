export interface IGradientRenderer<T> {
  buildBackground(model: T | null): string;
}
