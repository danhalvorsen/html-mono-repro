export const MonacoMenuEventNames = {
  LoadCodeFile: "load-code-file",
  SaveCodeFile: "save-code-file",
  BuildCode: "build-code",
  RunCode: "run-code",
} as const;

export interface MonacoCodeLoadEntry {
  readonly path: string;
  readonly fileName: string;
  readonly content: string;
}

export interface MonacoCodeLoadEventDetail {
  readonly fileName: string;
  readonly content: string;
  readonly folderName: string;
  readonly files: readonly MonacoCodeLoadEntry[];
}

export interface MonacoCodeSaveEventDetail {
  readonly fileName: string;
  readonly content: string;
  readonly files: readonly MonacoCodeLoadEntry[];
}

export interface MonacoCodeBuildEventDetail {
  readonly content: string;
  readonly lineCount: number;
}

export interface MonacoCodeRunEventDetail {
  readonly content: string;
  readonly lineCount: number;
}
