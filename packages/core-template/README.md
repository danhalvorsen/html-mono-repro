# `@monorepo/core-template`

Template utilities for rendering human-readable text from plain object models.

## What This Package Is For

Use this package when you need to turn structured data into readable strings.

Typical use cases:

- validation error messages
- rule/message rendering
- exception formatting
- debug or diagnostic reports

This package is intentionally small. It gives you simple template objects that implement `ITemplate<T>`.

## Main Interface

The core contract is [ITemplate.ts](/mnt/c/Users/danha/source/repos/HTML/MonoRepro/packages/core-template/src/ITemplate.ts):

```ts
export interface ITemplate<T = Record<string, any>> {
  render(model: T): string;
}
```

Everything else in the package is an implementation of that idea.

## Exported Types

The package currently exports:

- [CrossPlatformTemplate.ts](/mnt/c/Users/danha/source/repos/HTML/MonoRepro/packages/core-template/src/CrossPlatformTemplate.ts)
- [ValidationTemplate.ts](/mnt/c/Users/danha/source/repos/HTML/MonoRepro/packages/core-template/src/ValidationTemplate.ts)
- [KeyValueReportTemplate.ts](/mnt/c/Users/danha/source/repos/HTML/MonoRepro/packages/core-template/src/KeyValueReportTemplate.ts)
- [DefaultExceptionTemplate.ts](/mnt/c/Users/danha/source/repos/HTML/MonoRepro/packages/core-template/src/DefaultExceptionTemplate.ts)
- [ExceptionContext.ts](/mnt/c/Users/danha/source/repos/HTML/MonoRepro/packages/core-template/src/ExceptionContext.ts)
- [IDebuggableTemplate.ts](/mnt/c/Users/danha/source/repos/HTML/MonoRepro/packages/core-template/src/IDebuggableTemplate.ts)
- [Messages.ts](/mnt/c/Users/danha/source/repos/HTML/MonoRepro/packages/core-template/src/Messages.ts)

## Which Template To Use

Use `CrossPlatformTemplate` when:

- you want simple `${name}` placeholder replacement
- your model is a plain object
- missing values should render as `[name missing]`

Use `ValidationTemplate` when:

- you want the same placeholder style
- you want rendering to fail safely
- the model might throw during property access

Use `KeyValueReportTemplate` when:

- you want a report or debug dump
- you want every property rendered as `key: value`
- nested objects or arrays should be stringified

Use `DefaultExceptionTemplate` when:

- you need a simple exception message + stack formatter

## Example 1: `CrossPlatformTemplate`

This is the simplest and most common template in the package.

```ts
import { CrossPlatformTemplate } from "@monorepo/core-template";

const template = new CrossPlatformTemplate<{ ruleName: string; value: number }>(
  "Rule ${ruleName} failed for value ${value}",
);

const text = template.render({
  ruleName: "GreaterThanFive",
  value: 1,
});

console.log(text);
```

Output:

```txt
Rule GreaterThanFive failed for value 1
```

### Missing Placeholder Values

If a key is missing, it renders as `[key missing]`.

```ts
import { CrossPlatformTemplate } from "@monorepo/core-template";

const template = new CrossPlatformTemplate<{ name?: string }>(
  "Hello ${name}",
);

console.log(template.render({}));
```

Output:

```txt
Hello [name missing]
```

## Example 2: `ValidationTemplate`

`ValidationTemplate` is similar to `CrossPlatformTemplate`, but it is defensive during rendering.

Use it when template rendering should never throw.

```ts
import { ValidationTemplate } from "@monorepo/core-template";

const template = new ValidationTemplate<{ field: string; reason: string }>(
  "Validation failed for ${field}: ${reason}",
);

const text = template.render({
  field: "email",
  reason: "must contain @",
});

console.log(text);
```

Output:

```txt
Validation failed for email: must contain @
```

If property access fails or rendering breaks, the template returns a readable fallback string instead of throwing.

## Example 3: `KeyValueReportTemplate`

Use this for debug and diagnostics output.

```ts
import { KeyValueReportTemplate } from "@monorepo/core-template";

const template = new KeyValueReportTemplate();

const text = template.render({
  status: "ok",
  count: 3,
  user: { name: "Jane", roles: ["admin"] },
});

console.log(text);
```

Possible output:

```txt
status: ok
count: 3
user: {
  "name": "Jane",
  "roles": [
    "admin"
  ]
}
```

You can also customize separator and line break:

```ts
import { KeyValueReportTemplate } from "@monorepo/core-template";

const template = new KeyValueReportTemplate(" = ", " | ");

console.log(template.render({ name: "Alice", age: 30 }));
```

Output:

```txt
name = Alice | age = 30
```

## Example 4: `DefaultExceptionTemplate`

Use this when you want a simple exception formatter.

```ts
import { DefaultExceptionTemplate } from "@monorepo/core-template";
import { ExceptionContext } from "@monorepo/core-template";

const template = new DefaultExceptionTemplate();

const text = template.render(
  new ExceptionContext("Something failed", "stack line 1\nstack line 2"),
);

console.log(text);
```

Output:

```txt
Something failed
stack line 1
stack line 2
```

## How This Is Used In The Monorepo

One important consumer is `@monorepo/core-specifications-rules`.

That package uses `ValidationMessage`, which depends on `ITemplate<T>`.

Typical flow:

1. a rule fails
2. a message factory creates a `ValidationMessage`
3. the `ValidationMessage` uses a template from this package
4. `render()` produces the human-readable message

That is why `@monorepo/core-template` is a real dependency when rules need readable text.

## Recommended Pattern

Use:

- `CrossPlatformTemplate` for ordinary user-facing or validation messages
- `ValidationTemplate` when rendering must never throw
- `KeyValueReportTemplate` for diagnostics and reports
- `DefaultExceptionTemplate` for exception formatting

Keep the template focused on rendering only. Do not put validation logic or business logic in the template itself.

## Reference Tests

Current tests:

- [keyvalue.report.template.test.ts](/mnt/c/Users/danha/source/repos/HTML/MonoRepro/packages/core-template/tests/keyvalue.report.template.test.ts)
- [missing.test.ts](/mnt/c/Users/danha/source/repos/HTML/MonoRepro/packages/core-template/tests/missing.test.ts)

The `KeyValueReportTemplate` test is the strongest current usage example in this package.
