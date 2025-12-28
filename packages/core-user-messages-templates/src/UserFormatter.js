// Simple implementation of IFormatter: format(model, template) => string
class UserFormatter {
  constructor(options = {}) {
    this.options = options || {};
  }

  format(model, template) {
    if (!template) {
      return this.options.missingTemplateFallback ?? this.options.fallback ?? '[template missing]';
    }

    const normalized = model ?? this.options.defaultModel ?? {};
    try {
      const out = template.render(normalized);
      if (this.options.sanitize) return this.options.sanitize(out);
      return out;
    } catch (err) {
      if (this.options.onError) return this.options.onError({ template, model: normalized, error: err });
      return this.options.fallback ?? '[failed to format template]';
    }
  }
}

module.exports = { UserFormatter };
