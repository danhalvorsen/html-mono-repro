export type MonacoCodeEditorFileRole = "entry" | "support";

export interface MonacoCodeEditorProjectFileDeclaration {
  readonly path: string;
  readonly language: string;
  readonly role?: MonacoCodeEditorFileRole;
}

export interface MonacoCodeEditorProjectFile extends MonacoCodeEditorProjectFileDeclaration {
  readonly content: string;
}

export interface MonacoCodeEditorProjectEntrypoints {
  readonly ts?: string;
  readonly html?: string;
  readonly css?: string;
}

export interface MonacoCodeEditorProjectManifest {
  readonly name: string;
  readonly version: string;
  readonly entry: MonacoCodeEditorProjectEntrypoints;
  readonly files: readonly MonacoCodeEditorProjectFileDeclaration[];
  readonly tags?: readonly string[];
}

export interface MonacoCodeEditorProject extends Omit<MonacoCodeEditorProjectManifest, "files"> {
  readonly files: readonly MonacoCodeEditorProjectFile[];
}

export interface MonacoCodeEditorProjectValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

const UNKNOWN_FILE_LABEL = "(unknown)";
const REQUIRED_PROJECT_NAME_ERROR = "Project name is required.";
const REQUIRED_PROJECT_VERSION_ERROR = "Project version is required.";
const REQUIRED_PROJECT_FILES_ERROR = "Project must contain at least one file.";
const REQUIRED_FILE_PATH_ERROR = "Project file path is required.";

const toNonEmptyTrimmedString = (value: string | undefined): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
};

const getFileDisplayLabel = (path: string): string => {
  return toNonEmptyTrimmedString(path) ?? UNKNOWN_FILE_LABEL;
};

const createFileLanguageRequiredError = (path: string): string => {
  return `File "${getFileDisplayLabel(path)}" is missing language.`;
};

const createEntryMissingFileError = (
  entryType: keyof MonacoCodeEditorProjectEntrypoints,
  entryPath: string,
): string => {
  return `Entry "${entryType}" points to missing file "${entryPath}".`;
};

const createFileContentRequiredError = (path: string): string => {
  return `File "${getFileDisplayLabel(path)}" is missing content.`;
};

const appendProjectHeaderErrors = (
  project: MonacoCodeEditorProjectManifest,
  errors: string[],
): void => {
  if (!toNonEmptyTrimmedString(project.name)) {
    errors.push(REQUIRED_PROJECT_NAME_ERROR);
  }

  if (!toNonEmptyTrimmedString(project.version)) {
    errors.push(REQUIRED_PROJECT_VERSION_ERROR);
  }

  if (project.files.length === 0) {
    errors.push(REQUIRED_PROJECT_FILES_ERROR);
  }
};

const appendFileDeclarationErrors = (
  files: readonly MonacoCodeEditorProjectFileDeclaration[],
  errors: string[],
): void => {
  for (const file of files) {
    if (!toNonEmptyTrimmedString(file.path)) {
      errors.push(REQUIRED_FILE_PATH_ERROR);
    }

    if (!toNonEmptyTrimmedString(file.language)) {
      errors.push(createFileLanguageRequiredError(file.path));
    }
  }
};

const appendEntryReferenceErrors = (
  entry: MonacoCodeEditorProjectEntrypoints,
  files: readonly MonacoCodeEditorProjectFileDeclaration[],
  errors: string[],
): void => {
  const filePathSet = new Set(files.map((file) => file.path));
  const entries = Object.entries(entry) as Array<
    [keyof MonacoCodeEditorProjectEntrypoints, string | undefined]
  >;

  for (const [entryType, entryPath] of entries) {
    if (!entryPath) {
      continue;
    }

    if (!filePathSet.has(entryPath)) {
      errors.push(createEntryMissingFileError(entryType, entryPath));
    }
  }
};

export const validateMonacoCodeEditorProjectManifest = (
  project: MonacoCodeEditorProjectManifest,
): MonacoCodeEditorProjectValidationResult => {
  const errors: string[] = [];
  appendProjectHeaderErrors(project, errors);
  appendFileDeclarationErrors(project.files, errors);
  appendEntryReferenceErrors(project.entry, project.files, errors);

  return {
    valid: errors.length === 0,
    errors,
  };
};

export const validateMonacoCodeEditorProject = (
  project: MonacoCodeEditorProject,
): MonacoCodeEditorProjectValidationResult => {
  const baseValidation = validateMonacoCodeEditorProjectManifest(project);
  const errors = [...baseValidation.errors];

  for (const file of project.files) {
    if (typeof file.content !== "string") {
      errors.push(createFileContentRequiredError(file.path));
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
