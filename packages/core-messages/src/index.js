// Shared, runtime-friendly message helpers for validators and tools
// Keep functions simple and string-only for easy consumption across packages.

const Messages = {
  missingField: (path) => `Missing required field: ${path}`,
  invalidType: (path, expected, got) => `Invalid type at '${path}': expected ${expected}, got ${got}`,
  scriptMissing: (pkgName, scriptName) => `Package '${pkgName}' is missing script '${scriptName}'`,
  fingerprintMismatch: (file, expected, actual) => `Fingerprint mismatch for ${file}. Expected=${expected ?? '<none>'}, Actual=${actual}`,
  fileNotFound: (file) => `Configuration file not found: ${file}`,
  ajvErrorsSummary: (count) => `Validation failed with ${count} issue(s)`,
  suggestionUpdateBaseline: (file) => `If this change is intentional, update the baseline for ${file} via the repository maintainer workflow.`,
  permissionDenied: (file) => `Permission denied while accessing ${file}`,
  unparsableJson: (file, errMsg) => `Unable to parse JSON in ${file}: ${errMsg}`,
  reportHeader: (title) => `== ${title} ==`,
  minimalFixHint: (path, suggestion) => `Suggested fix for ${path}: ${suggestion}`
};

class MessagesTemplate {
  constructor(title = 'Report') { this.title = title }
  render(model = {}) {
    const header = Messages.reportHeader(this.title);
    const body = Object.entries(model)
      .map(([k,v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : String(v)}`)
      .join('\n');
    return header + '\n' + body;
  }
}

module.exports = { Messages, MessagesTemplate };
