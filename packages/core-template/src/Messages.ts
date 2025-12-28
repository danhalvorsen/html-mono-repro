// Reusable, developer-friendly error/warning message templates
// Export simple functions that return formatted message strings.

export const Messages = {
  missingField: (path: string) => `Missing required field: ${path}`,
  invalidType: (path: string, expected: string, got: string) =>
    `Invalid type at '${path}': expected ${expected}, got ${got}`,
  scriptMissing: (pkgName: string, scriptName: string) =>
    `Package '${pkgName}' is missing script '${scriptName}'`,
  fingerprintMismatch: (file: string, expected: string | null, actual: string) =>
    `Fingerprint mismatch for ${file}. Expected=${expected ?? '<none>'}, Actual=${actual}`,
  fileNotFound: (file: string) => `Configuration file not found: ${file}`,
  ajvErrorsSummary: (count: number) => `Validation failed with ${count} issue(s)`,
  suggestionUpdateBaseline: (file: string) =>
    `If this change is intentional, update the baseline for ${file} via the repository maintainer workflow.`,
  permissionDenied: (file: string) => `Permission denied while accessing ${file}`,
  unparsableJson: (file: string, errMsg: string) => `Unable to parse JSON in ${file}: ${errMsg}`,
  reportHeader: (title: string) => `== ${title} ==`,
  minimalFixHint: (path: string, suggestion: string) =>
    `Suggested fix for ${path}: ${suggestion}`
};

export type MessagesType = typeof Messages;
