// packages/Audio/music-core-synthesizer/src/IProjectLoader.ts

export interface IProjectLoader<TProject, TInput = string> {
  load(input: TInput): TProject | Promise<TProject>;
}