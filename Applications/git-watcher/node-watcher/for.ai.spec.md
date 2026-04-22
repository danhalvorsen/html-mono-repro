<!-- FILE: src/specification.for.ai.md -->

# specification.for.ai.md

## Purpose

This document defines the mandatory engineering standards for all generated or modified code in this codebase.

This specification is domain-agnostic and applies to all modules.

Any AI-assisted contribution must treat this file as the primary implementation contract unless explicitly overridden.

---

## 1. Core Delivery Expectations

All delivered code must be:

- strictly object-oriented (class-based)
- SOLID compliant
- production-grade
- deterministic
- testable
- maintainable
- cohesive
- extension-friendly
- minimal in public surface area

Do not generate:

- demo code
- placeholder implementations
- pseudo-logic
- hidden globals
- service locator patterns
- framework-driven implicit behavior

---

## 2. OOP Enforcement Rules

### Mandatory

- use classes and interfaces for behavior-bearing components
- behavior must live on objects, not free functions
- orchestration must be handled by objects
- module entry points must be object-oriented abstractions:
  - class
  - interface + class
  - factory class
  - builder class
  - composition root class

### Prohibited

- free functions for domain behavior
- top-level factory functions
- functional-style orchestration
- function-first APIs where OOP is possible

---

## 3. Composition Root Rules

### Mandatory

- composition must be encapsulated in a class
- dependency wiring must be explicit
- constructors must receive abstractions
- object graph creation must be visible

### Naming

- `DefaultXFactory`
- `XCompositionRoot`
- `XBuilder`

### Prohibited

- `createX()` functions
- `buildX()` functions
- `makeX()` functions
- module-level composition

### Required style

- `DefaultXFactory.create()`
- `new XCompositionRoot().compose()`

---

## 4. Public API Requirements

### Mandatory

- export classes, interfaces, value objects
- expose behavior through methods
- keep API minimal

### Prohibited

- exported free-function facades
- function-first APIs

---

## 5. Type Selection Guidance

### Mandatory

- no magic strings in domain logic
- all domain values must be type-safe

### Use (in order)

1. constant
2. const object + union
3. enum / const enum
4. value object / class
5. polymorphic abstraction

### Prohibited

- raw strings in:
  - control flow
  - strategy selection
  - error codes
  - state

---

## 6. Factory Rules

### Mandatory

- factories must be classes
- encapsulate object graph creation
- use constructor injection
- return valid objects
- no module-level composition

---

## 7. Builder Rules

### Use only when

- multi-step construction
- order matters
- many optional parameters
- invalid intermediate states exist
- readability requires staged construction

### Mandatory

- builders must be classes
- use `withX(...)` fluent methods
- enforce invariants
- terminal method:
  - `build()`
  - `create()`

### Prohibited

- builders for trivial objects
- duplicating factory logic

---

## 8. Factory + Builder Relationship

- factory is primary
- builder is supporting
- factory may use builder internally
- builder must not replace factory unnecessarily

---

## 9. Module-Level Function Restriction

### Prohibited

- business logic in top-level functions
- orchestration in top-level functions
- composition in top-level functions
- public API as functions

### Allowed

- pure private predicates
- local type guards

---

## 10. Dependency Injection Rules

- constructor injection required
- depend on abstractions
- no service locator
- no hidden dependency resolution
- no static mutable state

---

## 11. Testing Standard

### Mandatory

- test public behavior only
- use testing fixtures for setup
- use positive and negative testing style  
- use BDD naming conventions (`should ...`) 
- use object instances or factories
- BDD naming (`should ...`)
- deterministic tests

### Prohibited

- testing private implementation
- function-centered testing unless required

---

## 12. Magic String Rule (Explicit)

A string is considered a magic string if it influences behavior.

### Mandatory

- replace with:
  - constants
  - enums
  - value objects
  - typed unions

### Allowed

- UI text
- logs
- external boundary values (must be mapped immediately)

---

## 13. Automated Enforcement Policy

- ESLint and TypeScript must enforce mechanical rules
- not all rules are enforceable automatically

### Important

- passing lint != compliant architecture
- passing tests != SOLID compliance
- code review is authoritative

---

## 14. Non-Negotiable Prohibitions

Do not generate:

- `createX`, `buildX`, `makeX` top-level functions
- free-function APIs over class systems
- function-oriented
- function-oriented APIs where OOP is viable 
- module-level orchestration
- magic strings in domain logic
- hidden dependencies
- service locator patterns
- speculative abstractions

# Use core modules for modules development
- use `core.logging' for logging  
- use 'core.spesification' for for spesification 
- use 'core.spesification.rules`for rules and validation separations
- use 'core-design-patterns' for design patterns and architectural guidance  (GOF)
- use 'core-testing' for testing utilities and fixtures 
