Bra innhold – strukturen er riktig, men teksten kan **strammes språklig og arkitektonisk** slik at den:

* tydelig skiller **core** vs **cross-cutting concerns**
* presiserer batch-semantikk (`List<TPayload>`)
* er **pakke-/README-klar**
* unngår tvetydighet rundt middleware og payload

Nedenfor er en **forbedret og konsistent versjon**, uten å endre intensjonen din.

---

# Command with Undo / Redo

This package provides a **core command execution engine** with built-in **undo and redo** support.
It is designed for applications that require a **Command Pattern** implementation with deterministic, reversible actions and support for batch operations.

The module focuses strictly on **command execution and history management**, leaving cross-cutting concerns to separate, optional packages.

---

## Core Features

* **Command Pattern implementation**

  * Explicit commands representing reversible actions.
  * Commands encapsulate intent, not policy.

* **Undo / Redo history**

  * Stack-based history management.
  * Deterministic undo and redo behavior.
  * History ownership is centralized (not embedded in commands).

* **Batch-first command model**

  * Command payload is always `List<TPayload>`.
  * Single and batch operations share the same execution and undo semantics.
  * Enables atomic undo/redo for grouped operations by default.

* **Strong TypeScript typing**

  * Strongly typed commands and payloads.
  * Compile-time guarantees for command and payload structure.

* **Middleware / Interceptor support**

  * Interceptors can observe and modify command execution.
  * Middleware can be used for:

    * validation
    * logging
    * batching / aggregation
    * transactions
  * Middleware has **read-only access** to history stacks.

---

## Execution Model

```
Client / UI / CLI
        ↓
  Middleware Pipeline
        ↓
   Command Dispatcher
        ↓
  Command.execute()
        ↓
   History (Undo / Redo)
```

Undo:

```
Dispatcher.undo()
  → Command.undo()
```

Redo:

```
Dispatcher.redo()
  → Command.redo()
```

---

## Design Guarantees

* Commands do **not** manage history.
* Undo / Redo is a **separate concern**.
* Middleware can intercept behavior without mutating history.
* Batch operations are first-class, not an afterthought.
* No global singletons.
* Deterministic and testable behavior.

---

## Cross-Cutting / Optional Concerns

The following concerns are intentionally **out of scope** for this package and should live in separate modules:

### `core-command-access-props`

* Automatic creation of accessor properties for payload items.
* Read-only or controlled mutation views over command payloads.
* Intended for editor / inspector / UI integration.
* Does **not** affect command execution or history semantics.

These concerns can be composed on top of the core command engine without modifying it.

---

## Intended Use Cases

* Editors (SVG, canvas, diagram, CAD)
* Scene graph or document editors
* CLI tools with reversible operations
* Scriptable transformation engines
* Batch-oriented processing pipelines

---

## Explicitly Out of Scope

* UI state management
* Reactive data binding
* Proxy-based implicit mutation
* Domain-specific validation rules

These can be layered on top using middleware or external modules.

---

## Summary

This package provides a **minimal, batch-oriented command engine** with:

* clear separation of concerns
* predictable undo/redo behavior
* middleware-based extensibility
* strong typing and refactor safety

It is designed to scale in **correctness and longevity**, not in hidden complexity.

---

Hvis du vil, kan jeg neste:

* navngi modulene endelig (`@core/command-history`, `@core/command-access-props`)
* lage et **minimal usage example**
* dokumentere **Aggregate / Batch semantics eksplisitt**
* eller gjøre dette **npm-publiseringsklart**

Bare si ifra.
