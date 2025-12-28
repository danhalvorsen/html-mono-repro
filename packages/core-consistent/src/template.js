// Simple ITemplate implementation for consistent validator messages
// Exports a factory that returns an object with methods to format messages.

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
    // format AJV errors array
    formatAjvErrors: (errors) => {
      if (!errors || errors.length === 0) return '';
      return errors.map(e => {
        const p = e.instancePath || e.schemaPath || '/';
        const msg = e.message || JSON.stringify(e);
        return ` - ${padRight(p, maxPath)} ${msg}`;
      }).join('\n');
    },
    // format generic diffs array from diff() helper
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
