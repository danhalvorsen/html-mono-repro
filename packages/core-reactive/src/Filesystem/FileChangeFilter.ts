export class FileChangeFilter {
  static isImportant(file: string): boolean {
    return (
      /package\.json$/.test(file) ||
      /package-lock\.json$/.test(file) ||
      /pnpm-lock\.yaml$/.test(file) ||
      /tsconfig(\..+)?\.json$/.test(file) ||
      /vitest\.config\.(ts|mts|js|mjs)$/.test(file) ||
      /\.(ts|mts|cts)$/.test(file)
    );
  }
}