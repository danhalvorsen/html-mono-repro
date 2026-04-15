// packages/core.module.example/core.module.example.nodejs/README.md
# core.module.calculator.nodejs

Small calculator sample package for TypeScript module scaffolding.

## Example

```ts
import { calculate } from "@monorepo/core.module.calculator.nodejs";

const result = calculate({
  operator: "add",
  left: 10,
  right: 5,
});

// result.value === 15