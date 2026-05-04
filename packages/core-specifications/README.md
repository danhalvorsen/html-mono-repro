# `@monorepo/core-specifications`

Core abstractions for expressing domain predicates with the **Specification pattern** and returning lightweight validation outcomes.

## Purpose

This package provides:

- Composable boolean predicates (`ISpecification<T>`) for domain/business rules.
- Base and composite specifications (`Specification`, `AndSpecification`, `OrSpecification`, `NotSpecification`).
- Minimal validation contracts (`IValidator`, `IRule`, `IRuleSet`) and `ValidationResult` utilities.

Use this package when you want reusable, testable rule logic that can be composed with `and`, `or`, and `not`.

## Install

This package is workspace-scoped in this monorepo.

```json
{
  "dependencies": {
    "@monorepo/core-specifications": "workspace:*"
  }
}
```

## Public API

### Specifications

- `ISpecification<T>`
- `Specification<T>`
- `AndSpecification<T>`
- `OrSpecification<T>`
- `NotSpecification<T>`

`ISpecification<T>` contract:

```ts
export interface ISpecification<T> {
  isSatisfiedBy(candidate: T): boolean;
  and(other: ISpecification<T>): ISpecification<T>;
  or(other: ISpecification<T>): ISpecification<T>;
  not(): ISpecification<T>;
}
```

### Validation

- `IValidator<T>`
- `IRule<T>`
- `IRuleSet<T>`
- `ValidationResult`

`ValidationResult` supports:

- `ValidationResult.ok()`
- `ValidationResult.fail(message | string[])`
- `merge(other)` to combine outcomes

## Usage

### 1. Create concrete specifications

```ts
import { Specification } from "@monorepo/core-specifications";

type User = {
  isActive: boolean;
  age: number;
};

class IsActiveSpecification extends Specification<User> {
  isSatisfiedBy(candidate: User): boolean {
    return candidate.isActive;
  }
}

class IsAdultSpecification extends Specification<User> {
  isSatisfiedBy(candidate: User): boolean {
    return candidate.age >= 18;
  }
}
```

### 2. Compose rules

```ts
const canAccess = new IsActiveSpecification().and(new IsAdultSpecification());

canAccess.isSatisfiedBy({ isActive: true, age: 30 });  // true
canAccess.isSatisfiedBy({ isActive: true, age: 15 });  // false
```

### 3. Negate rules

```ts
const isBlocked = new IsActiveSpecification().not();

isBlocked.isSatisfiedBy({ isActive: false, age: 20 }); // true
```

Note: `NotSpecification.not()` unwraps back to the inner specification (double-negation returns the original rule object).

### 4. Return validation outcomes

```ts
import { ValidationResult, type IValidator } from "@monorepo/core-specifications";

class UserValidator implements IValidator<User> {
  validate(model: User): ValidationResult {
    const activeResult = model.isActive
      ? ValidationResult.ok()
      : ValidationResult.fail("User must be active.");

    const ageResult = model.age >= 18
      ? ValidationResult.ok()
      : ValidationResult.fail("User must be 18 or older.");

    return activeResult.merge(ageResult);
  }
}
```

## Design Notes

- `Specification<T>` is the recommended base class for custom rules.
- Composite classes are immutable wrappers around other `ISpecification<T>` instances.
- `ValidationResult.merge` preserves all accumulated errors when either side fails.
- This package intentionally stays minimal and framework-agnostic.

## Testing

Run tests for this package:

```bash
pnpm --filter @monorepo/core-specifications test
```

Build this package:

```bash
pnpm --filter @monorepo/core-specifications build
```

## Source Files

- `src/specifications/*`
- `src/validation/*`
- `src/index.ts`

