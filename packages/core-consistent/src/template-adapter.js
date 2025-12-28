// Adapter implementing the simple Template API while mirroring the shape
// of the `core-template` package. This avoids requiring TypeScript sources
// at runtime while allowing validators to use consistent formatting.

function padRight(str, len) {
  return str + ' '.repeat(Math.max(0, len - str.length));
}

function createTemplate(opts = {}) {
  const maxPath = opts.maxPath || 60;
  return {
    header: (title) => `== ${title} ==`,
    success: (msg) => `[OK] ${msg}`,
    info: (msg) => `[INFO] ${msg}`,
    warn: (msg) => `[WARN] ${msg}`,
    error: (msg) => `[ERROR] ${msg}`,
    formatAjvErrors: (errors) => {
      if (!errors || errors.length === 0) return '';
      return errors.map(e => {
        const p = e.instancePath || e.schemaPath || '/';
        const msg = e.message || JSON.stringify(e);
        return ` - ${padRight(p, maxPath)} ${msg}`;
      }).join('\n');
    },
    formatDiffs: (diffs) => {
      if (!diffs || diffs.length === 0) return '';
      return diffs.map(d => {
        const before = (d.before === undefined) ? '<missing>' : String(d.before);
        const after = (d.after === undefined) ? '<missing>' : String(d.after);
        return ` - ${padRight(d.path, maxPath)} before=${before} -> after=${after}`;
      }).join('\n');
    }
  };
}

module.exports = { createTemplate };
