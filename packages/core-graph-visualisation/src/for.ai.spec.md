<!-- FILE: src/specification.for.ai.md -->

# specification.for.ai.md

## Purpose

This document defines the mandatory engineering standards for all generated or modified code in this codebase.

Any AI-assisted contribution must treat this file as the primary implementation contract unless the task explicitly overrides a rule in writing.

---

## 1. Core Delivery Expectations

All delivered code must be:

- production-grade
- deterministic
- testable
- maintainable
- cohesive
- extension-friendly
- minimal in public surface area

Do not generate:

- demo code
- placeholder architecture
- pseudo-implementations
- magic strings when a type-safe alternative exists
- hidden globals
- service locator usage
- framework-driven implicit behavior when explicit composition is possible

Prefer correctness and maintainability over brevity.

---

## 2. Architectural Principles

### 2.1 SOLID is mandatory

All code must follow SOLID.

#### Single Responsibility Principle
- each type must have one reason to change
- separate orchestration, domain logic, infrastructure, and mapping concerns
- avoid god objects and mixed responsibilities

#### Open/Closed Principle
- extend behavior through:
  - new implementations
  - strategies
  - policies
  - factories
  - decorators
  - composition
- do not extend behavior by editing stable core logic unless unavoidable

#### Liskov Substitution Principle
- derived or implementing types must honor the contract
- do not weaken preconditions
- do not strengthen postconditions unexpectedly
- avoid inheritance when substitution is questionable

#### Interface Segregation Principle
- prefer small, role-focused interfaces
- do not create wide interfaces that force irrelevant members on consumers

#### Dependency Inversion Principle
- depend on abstractions
- wire dependencies in an explicit composition root
- keep domain and application logic independent from infrastructure details

---

## 3. Clean Architecture Requirements

Use a layered design with clear dependency direction.

### Preferred layers
- Domain
- Application
- Infrastructure
- Presentation / Host / Adapter

### Rules
- Domain must not depend on infrastructure
- Application coordinates use cases through abstractions
- Infrastructure implements abstractions
- Composition root assembles the object graph
- Dependencies must point inward toward policy, not outward toward tooling

---

## 4. Design Requirements

### 4.1 Interface-first design
- define contracts before implementations when appropriate
- public collaboration points should be expressed as interfaces
- concrete types should be replaceable without changing consumers

### 4.2 Composition over inheritance
- prefer composition for behavior assembly
- use inheritance only where there is a real and stable is-a relationship

### 4.3 Encapsulation
- default to internal visibility
- expose only intentionally designed public APIs
- hide implementation details
- preserve invariants inside the owning type

### 4.4 Naming
- use domain language
- use precise and stable names
- avoid vague names such as:
  - Helper
  - Utils
  - Manager
  - BaseThing
  - Misc
- type names must reflect responsibility

### 4.5 No magic strings
Use one of these instead:
- enums
- readonly constants
- discriminated unions
- typed identifiers
- value objects

### 4.6 Determinism
- do not hide randomness, time, or environment access
- abstract system clock, random source, IO, and external dependencies
- inject dependencies explicitly

---

## 5. Preferred Patterns

Use only when justified by the problem.

### Allowed and preferred patterns
- Strategy
- Factory / Abstract Factory
- Builder
- Composite
- Decorator
- Adapter
- Specification
- Policy
- Command / Query
- Mediator
- Repository
- Value Object
- Domain Service
- Result / Error object pattern

### Pattern guidance
- patterns must reduce coupling or improve extension
- do not add patterns as ceremony
- avoid over-engineering for trivial logic

---

## 6. Dependency Injection Rules

- use constructor injection
- use explicit composition root
- avoid service locator
- avoid static mutable state
- no hidden container access from domain types
- object creation responsibilities must be visible and testable

---

## 7. Code Style Requirements

### General
- keep methods short and focused
- avoid deep nesting
- prefer guard clauses
- keep side effects explicit
- keep data flow readable
- do not mix orchestration with business rules

### Type design
- prefer immutable value objects where possible
- validate invariants at boundaries
- use readonly when possible
- avoid primitive obsession where domain meaning matters

### Error handling
- fail clearly
- use typed results or explicit exceptions consistently
- do not swallow exceptions
- do not return ambiguous null/undefined values without clear contract semantics

---

## 8. TypeScript-Specific Rules

### Compiler and typing
- strict mode expected
- avoid `any`
- prefer `unknown` over `any` where uncertainty exists
- narrow types explicitly
- use discriminated unions where useful
- keep exported surface intentional
- prefer interfaeces vs types based on use case (interfaces for contracts, types for unions and mapped types)
### Modules
- keep files cohesive
- export only what is required
- prefer barrel files only when they improve clarity and are controlled

### API design
- prefer interfaces for contracts
- prefer readonly arrays and readonly properties for query-style APIs
- use branded or domain-specific types when identity matters

---

## 9. C#-Specific Rules

When delivering C#:

- use clean namespaces by domain/capability
- default to `internal`
- expose only intentional `public` APIs
- use constructor injection
- use records/value objects where appropriate
- use interfaces for stable collaboration points
- avoid static service access
- avoid anemic abstractions and oversized services

---

## 10. Testing Standard

All code deliveries must include tests unless the task explicitly states otherwise.

### Required testing style
BDD-style tests are expected.

Examples:
- `describe`, `it`, `should`
- scenario-oriented naming
- behavior-focused assertions

### Test expectations
- test public behavior, not private implementation
- cover success paths
- cover failure paths
- cover edge cases
- use shared fixtures to reduce duplication
- keep fixtures deterministic and explicit
- avoid brittle mocks
- mock only true boundaries

### Unit test rules
- one logical behavior per test
- arrange/act/assert structure should be clear
- no hidden test setup magic
- names should describe observable behavior

### Integration tests
Use where composition or infrastructure contracts matter.

---
## 10. Task Interpretation Rules
If the task is ambiguous, prefer the simplest interpretation that satisfies the requirements.

Do not assume missing context—ask for clarification instead of guessing.

Do not infer domain concepts not explicitly stated.

Do not generate examples unless explicitly requested.

## 11. BDD Test Conventions

When generating tests, prefer behavior phrasing such as:

- should create a valid result when input is valid
- should reject invalid state transitions
- should delegate to the configured strategy
- should preserve invariant X when operation Y occurs
- should return deterministic output for known input
- should throw when required dependency is missing

### Fixture guidance
- create reusable fixture builders for repeated setup
- fixtures must stay explicit
- fixtures must not hide important test intent
- sample data must be realistic and named

---

## 12. Output Format for AI Code Delivery

When generating code for this repository, use this output structure:

1. Code first
2. Minimal technical explanation after code
3. Keep explanation short and implementation-focused
4. Do not add unnecessary narrative

### Delivery expectations
- provide complete snippets, not partial fragments, unless explicitly requested
- preserve folder intent when file structure is relevant
- do not invent extra modules unless justified
- prefer a single coherent solution over many alternatives unless asked

---

## 13. Change Rules for Existing Code

When modifying existing code:

- preserve established architecture unless change is required
- do not widen public APIs without reason
- do not break contracts silently
- prefer extension over intrusive rewrite
- remove duplication when safe
- keep behavior backward compatible unless instructed otherwise

If a tradeoff is required, prefer:
1. correctness
2. maintainability
3. extensibility
4. performance
5. brevity

---

## 14. Non-Negotiable Prohibitions

Do not generate:

- service locator patterns
- hidden singleton dependencies
- magic strings for core domain decisions
- mixed infrastructure/domain logic
- large multipurpose classes
- fragile inheritance hierarchies
- speculative abstractions with no consumer
- test code without assertions
- random examples without domain relevance

---