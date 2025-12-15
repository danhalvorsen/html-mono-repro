# core-formatter

`@my-graphics/core-formatter` is a lightweight bridge between your formatting logic and the
`core-template` package. It wraps any `ITemplate` implementation with a consistent formatter that
supports default models, sanitized output, and safe fallbacks when the template is missing or
fails to render.

## Features

- Formats any `ITemplate` with configurable fallback strings.
- Sanitizes every result through a supplied hook.
- Captures render errors and optionally delegates to an error callback before applying a fallback.
- Supplies a runtime-friendly default model when no data is provided.

## Installation

```bash
pnpm add @my-graphics/core-formatter
```

## Basic usage

```ts
import { TemplateFormatter } from "@my-graphics/core-formatter";
import { CrossPlatformTemplate } from "@my-graphics/core-template";

const template = new CrossPlatformTemplate("Hello ${name}");
const formatter = new TemplateFormatter();
const message = formatter.format({ name: "Alex" }, template);
// message === "Hello Alex"
```

## Advanced configuration

```ts
const formatter = new TemplateFormatter({
  fallback: "[failed to format]",
  missingTemplateFallback: "[no template supplied]",
  sanitize: (value) => value.trim(),
  defaultModel: { name: "Guest" },
  onError: ({ error }) => `[error: ${(error as Error).message}]`,
});

formatter.format(undefined, template); // uses default model
formatter.format({ name: "Kate" }, undefined); // returns "[no template supplied]"
```

Customizing the formatter in this way makes it easy to reuse the same presentation rules across
multiple templates, while keeping rendering logic encapsulated inside the template implementations.
