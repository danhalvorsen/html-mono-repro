export interface IGraphOutputPathResolver {
  resolve(templateOrPath: string): string;
}