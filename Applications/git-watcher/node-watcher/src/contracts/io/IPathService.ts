export interface IPathService {
  resolve(...segments: readonly string[]): string;
  dirname(value: string): string;
  basename(value: string): string;
  relative(from: string, to: string): string;
  normalize(value: string): string;
  join(...segments: readonly string[]): string;
}