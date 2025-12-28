// Simple implementation of ITemplate: render(model) => string
class UserTemplate {
  constructor(raw) {
    this.raw = String(raw || '');
  }

  render(model = {}) {
    try {
      return this.raw.replace(/\$\{(\w+)\}/g, (_, key) => {
        const v = model?.[key];
        return v !== undefined ? String(v) : `[${key} missing]`;
      });
    } catch (err) {
      return `[template render error: ${err?.message ?? 'unknown'}]`;
    }
  }
}

module.exports = { UserTemplate };
