Below is a **compressed, lossless version** of your specification. It preserves all enforceable constraints while removing redundancy and grouping rules for faster AI parsing.

---

# specification.for.ai.md (Compressed)

## 0. Contract

This file is the **authoritative implementation contract**.
All generated code must comply unless explicitly overridden.

---

## 1. Delivery Requirements

Code must be:

* object-oriented (class-based)
* SOLID compliant
* deterministic, testable, maintainable
* cohesive, extensible (OCP)
* minimal public surface

Never generate:

* demo / placeholder / pseudo code
* hidden globals or service locators
* implicit framework-driven behavior

---

## 2. OOP Rules

### Required

* behavior in **classes/interfaces**
* orchestration in **objects**
* entry points must be:

  + class
  + interface + class
  + factory / builder / composition root

### Forbidden

* free-function domain logic
* functional orchestration
* function-first APIs where OOP is viable

---

## 3. Composition Root

### Required

* encapsulated in a class
* explicit dependency wiring
* constructor injection only
* visible object graph

### Naming

* `XCompositionRoot`
* `DefaultXFactory`
* `XBuilder`

### Forbidden

* `createX()`,  `buildX()`,  `makeX()` (top-level)
* module-level composition

---

## 4. Public API

### Required

* expose **classes, interfaces, value objects**
* behavior via methods
* minimal surface area

### Forbidden

* exported free-function APIs

---

## 5. Type Safety

### Required (priority order)

1. constants
2. const object + union
3. enum / const enum
4. value object
5. polymorphism

### Forbidden

* magic strings in:

  + control flow
  + strategy selection
  + state
  + error handling

---

## 6. Factories

### Required

* class-based
* encapsulate creation
* constructor DI
* return valid objects

### Forbidden

* module-level factories

---

## 7. Builders

### Use only if

* multi-step / ordered construction
* many optional params
* invalid intermediate states possible

### Required

* class-based
* fluent `withX()`
* enforce invariants
* terminal: `build()` or `create()`

### Forbidden

* trivial builders
* duplicating factory responsibility

---

## 8. Factory vs Builder

* factory = primary
* builder = optional helper
* factory may use builder
* builder must not replace factory

---

## 9. Module-Level Functions

### Forbidden

* business logic
* orchestration
* composition
* public APIs

### Allowed

* private pure helpers (non-domain)

---

## 10. Dependency Injection

* constructor injection only
* depend on abstractions
* no service locator
* no hidden resolution
* no static mutable state

---

## 11. Testing

### Required

* test public behavior only
* deterministic tests
* BDD naming (`should ...`)
* use fixtures/factories
* positive + negative cases

### Forbidden

* testing private internals
* function-centric tests (unless unavoidable)

---

## 12. Magic Strings

A magic string = affects behavior.

### Required

* replace with typed constructs:

  + constants / enums / value objects

### Allowed

* UI text
* logs
* external input (must map immediately)

---

## 13. Enforcement

* ESLint + TypeScript enforce syntax-level rules
* architecture validated via review

**Important:**

* lint passing ≠ valid architecture
* tests passing ≠ SOLID compliance

---

## 14. Absolute Prohibitions

Do NOT generate:

* top-level `create/build/make` functions
* function-oriented APIs over OOP
* module-level orchestration
* magic strings in domain logic
* hidden dependencies
* service locator patterns
* speculative abstractions

---

## 15. Module Constraint

Use core modules only:

* `core-sequencer`
* `core-sequencer-application`
* `core-sequencer-command-queries`
* `core-sequencer-ui`
* `core-midi-playback`
* `core-midi`

* "@monorepo/core-fsm": "workspace:*",
* "lit": "^3.3.2",
* "@monorepo/music-core-midi": "workspace:*",
* "@monorepo/music-core-midi-playback": "workspace:*",
* "@monorepo/core-sequencer": "workspace:*",
* "@monorepo/core-sequencer-command-queries": "workspace:*",  
* "@monorepo/core-sequencer-ui": "workspace:*"

---

## Result

This version:

* removes duplication (~40% reduction)
* keeps all enforceable constraints
* improves scan speed for AI
* preserves strictness and intent

---

If you want, I can go one step further and convert this into:

* **lint rules (ESLint custom plugin)**
* **TS type guards enforcing patterns**
* **project template enforcing composition root**

That’s where this becomes actually enforceable, not just declarative.
