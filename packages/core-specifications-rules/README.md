# `@monorepo/core-specifications-rules`

User guide for turning `ISpecification<T>` into readable validation.

## Focus

This package should be used with `@monorepo/core-specifications`.

The intended default is:

1. write an `ISpecification<T>`
2. wrap it in `SpecificationRule<T>`
3. produce readable messages through `IRuleMessageFactory`
4. aggregate failures with `ValidationResult`

If you already have specifications, this package lets you reuse them instead of rewriting the same logic in custom validators.

## Relationship To `@monorepo/core-specifications`

Use the two packages together:

- `@monorepo/core-specifications`
  owns semantic truth and composition
- `@monorepo/core-specifications-rules`
  owns reporting, message rendering, and validation results

Short version:

- `ISpecification<T>` answers: "is this true?"
- `SpecificationRule<T>` answers: "if not, how do I report it?"

## Main Types

### `SpecificationRule<T>`

This is the main type in this package.

It adapts an `ISpecification<T>` into an `IRule<T>`.

Use it when:

- you already have a specification
- you want readable validation errors
- you want one semantic source of truth
- you do not want to duplicate rule logic

### `IRuleMessageFactory<T, TMessageModel>`

Creates the validation message for a failed rule.

This is where you define:

- error code
- template
- message model

### `ValidationMessage<TModel>`

Concrete validation message.

It contains:

- `code`
- `template`
- `model`

The human-readable message comes from `render()`.

### `ValidationResult`

Represents success or failure.

Use it to:

- return success with `ValidationResult.ok()`
- return failures with `ValidationResult.fail(...)`
- combine results with `merge(...)`
- render user-facing errors with `renderErrors()`

### `Rule<T, TMessageModel>`

This is the lower-level escape hatch.

Use `Rule` only when there is no meaningful underlying specification.

For most semantic validation in application code, prefer `SpecificationRule<T>`.

## Installation

Typical dependencies:

```json
{
  "dependencies": {
    "@monorepo/core-specifications": "workspace:*",
    "@monorepo/core-specifications-rules": "workspace:*",
    "@monorepo/core-template": "workspace:*"
  }
}
```

`@monorepo/core-template` is required because `ValidationMessage` renders through `ITemplate<TModel>`.

## Standard Process

The recommended process is:

1. define an `ISpecification<T>`
2. define a message factory for failures
3. create a `SpecificationRule<T>`
4. call `check(model)`
5. merge results from multiple rules
6. render errors at the boundary

## Main Example

This is the default usage pattern this package is designed for.

```ts
import { CrossPlatformTemplate } from "@monorepo/core-template";
import type { ISpecification } from "@monorepo/core-specifications";
import type {
  IRule,
  IRuleMessageFactory,
  ISpecificationRuleMessageModel,
  IValidationMessage,
} from "@monorepo/core-specifications-rules";
import {
  SpecificationRule,
  ValidationMessage,
  ValidationResult,
} from "@monorepo/core-specifications-rules";

interface IUserRegistration {
  readonly username: string;
  readonly email: string;
  readonly age: number;
}

class UsernameProvidedSpecification
  implements ISpecification<IUserRegistration>
{
  public isSatisfiedBy(model: IUserRegistration): boolean {
    return model.username.trim().length > 0;
  }
}

class EmailContainsAtSignSpecification
  implements ISpecification<IUserRegistration>
{
  public isSatisfiedBy(model: IUserRegistration): boolean {
    return model.email.includes("@");
  }
}

class AdultSpecification implements ISpecification<IUserRegistration> {
  public isSatisfiedBy(model: IUserRegistration): boolean {
    return model.age >= 18;
  }
}

interface IUserRegistrationMessageModel
  extends ISpecificationRuleMessageModel<IUserRegistration> {
  readonly detail: string;
}

class UserRegistrationMessageFactory
  implements
    IRuleMessageFactory<IUserRegistration, IUserRegistrationMessageModel>
{
  private readonly detailSelector: (model: IUserRegistration) => string;

  public constructor(detailSelector: (model: IUserRegistration) => string) {
    this.detailSelector = detailSelector;
  }

  public createAdapter(
    ruleName: string,
    model: IUserRegistration,
    _messageModel: IUserRegistrationMessageModel,
  ): IValidationMessage<IUserRegistrationMessageModel> {
    return new ValidationMessage(
      "USER_REGISTRATION_RULE_FAILED",
      new CrossPlatformTemplate("Rule ${ruleName} failed: ${detail}"),
      {
        ruleName,
        candidate: model,
        detail: this.detailSelector(model),
      },
    );
  }
}

const rules: readonly IRule<IUserRegistration>[] = [
  new SpecificationRule(
    "UsernameProvided",
    new UsernameProvidedSpecification(),
    new UserRegistrationMessageFactory(
      () => "username must not be empty",
    ),
  ),
  new SpecificationRule(
    "EmailContainsAtSign",
    new EmailContainsAtSignSpecification(),
    new UserRegistrationMessageFactory(
      (model) => `email '${model.email}' must contain @`,
    ),
  ),
  new SpecificationRule(
    "AdultSpecification",
    new AdultSpecification(),
    new UserRegistrationMessageFactory(
      (model) => `age ${model.age} is below 18`,
    ),
  ),
];

const model: IUserRegistration = {
  username: "",
  email: "invalid.example.com",
  age: 15,
};

const result = rules.reduce(
  (current, rule) => current.merge(rule.check(model)),
  ValidationResult.ok(),
);

console.log(result.isSuccess);
console.log(result.renderErrors());
```

Expected rendered output:

```txt
[
  "Rule UsernameProvided failed: username must not be empty",
  "Rule EmailContainsAtSign failed: email 'invalid.example.com' must contain @",
  "Rule AdultSpecification failed: age 15 is below 18"
]
```

## Why `SpecificationRule<T>` Should Be The Default

Using `SpecificationRule<T>` gives you:

- one place for semantic truth
- one place for reporting
- reuse of existing specifications
- no duplicated predicate logic
- a clear relation between specification and validation rule

That is the main architectural value of this package.

## Where The Human-Readable Message Comes From

The readable text does not live in `SpecificationRule<T>` itself.

It comes from:

1. `IRuleMessageFactory`
2. `ValidationMessage`
3. the template implementation, usually `CrossPlatformTemplate`

So the flow is:

- specification decides pass or fail
- rule wraps the specification
- message factory creates the failure message
- validation result carries the message
- `renderErrors()` returns the final strings

## When To Use Custom `Rule<T, TMessageModel>`

Use custom `Rule` only when:

- there is no meaningful underlying specification
- the check is procedural rather than predicate-based
- the validation logic should not be reused as a specification

If a rule is really just reporting a semantic predicate, prefer `SpecificationRule<T>`.

## Recommended Pattern For Application Code

For most packages, the clean pattern is:

1. define specifications in the semantic layer
2. adapt each specification with `SpecificationRule<T>`
3. merge results with `ValidationResult`
4. render messages only at the application boundary

This keeps:

- specifications reusable
- rules readable
- validation composable
- reporting separate from semantic truth

## Reference In This Repository

See:

- [SpecificationRule.ts](/mnt/c/Users/danha/source/repos/HTML/MonoRepro/packages/core-specifications-rules/src/SpecificationRule.ts)
- [Rule.ts](/mnt/c/Users/danha/source/repos/HTML/MonoRepro/packages/core-specifications-rules/src/Rule.ts)
- [ValidationResult.ts](/mnt/c/Users/danha/source/repos/HTML/MonoRepro/packages/core-specifications-rules/src/ValidationResult.ts)
- [ValidationMessage.ts](/mnt/c/Users/danha/source/repos/HTML/MonoRepro/packages/core-specifications-rules/src/ValidationMessage.ts)
- [PointInRectangleRuleFixture.ts](/mnt/c/Users/danha/source/repos/HTML/MonoRepro/packages/core-specifications-rules/tests/fixtures/PointInRectangleRuleFixture.ts)
