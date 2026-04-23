export interface IProjectLoader<TProject, TInput = string> {
  load(input: TInput): TProject | Promise<TProject>;
}
