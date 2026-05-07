export interface IOutputDirectoryCleaner {
  clean(directoryPath: string): Promise<void>;
}