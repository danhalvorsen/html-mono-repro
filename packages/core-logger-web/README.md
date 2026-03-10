# ✅ Logging System – Requirements & Design

This project implements a **modular, human-readable logging system** for a TypeScript codebase using `winston`, designed to replicate the ergonomics of C#’s `ILogger` pattern while maintaining minimal disruption to the source code.

## 🧩 Requirements

### 🎯 Core Goals

- ✅ Strongly-typed `ILogger` interface with late-bound structured logging
- ✅ `LoggerProvider` class to inject named loggers (like `ILogger<YourClass>`)
- ✅ Non-intrusive log usage via format-string placeholders (`{}` style)
- ✅ Multiple log sinks:
  - DevTools-friendly **console output**
  - Persistent **log file output** (`logs/app.log`)

### ✨ Enhanced Capabilities

- ✅ **Late binding log interpolation**:
  - Write: `logger.info("Processed {file}", { file })`
  - Output: `Processed index.ts`
- ✅ **Color-coded placeholders and values** in console using `chalk`
- ✅ **Auto stack traces** for `.error(...)` calls
- ✅ **Safe object dumps** with truncation (via `util.inspect`)
- ✅ JSON logs to file for parsing and auditing
- ✅ Readable, minimal impact on codebase (1-liner structured logs)

## 🔧 Implementation Overview

### Interface

```ts
export interface ILogger {
  info(message: string, params?: Record<string, any>): void;
  warn(message: string, params?: Record<string, any>): void;
  error(message: string, params?: Record<string, any>): void;
  debug(message: string, params?: Record<string, any>): void;
}
```

### Provider

```ts
const logger = LoggerProvider.create("SchemaReader");
logger.info("Reading file {name}", { name: "User.ts" });
```

### Output (Console)

```
[2025-04-15T15:42:00Z] [SchemaReader] INFO: Reading file User.ts
```

### Output (File: `logs/app.log`)

```json
{
  "timestamp": "2025-04-15T15:42:00Z",
  "level": "info",
  "message": "Reading file User.ts"
}
```

---

## 🛠 Install Dependencies

```bash
npm install winston chalk
```

I working on a type of IConstraints where hireaky of Rectangles, e.g a n'te tree (where root can have 0 or many childes ) As binary, but can have more than 2.  Temporary constraints are:

## Constraints
1. No collision between 2 Rectangles
2. Mother rectangle can overlap children (not only at the corners)
3. Children are not allowed to overlap  
4. Rectangles can be nested (a rectangle can not have another rectangle as one of its children)
4. Constraints like STACK vertical and horizontal
5. Constraints like the FLEX vertical and horizontal where objects floating up and down or left and right  should be made.
6. Constrains like CIRCLE where all objects should be inside the circle and not outside it. Circle must not cross its Rectangle constraints from mother node
7. Resolvment of constraints happen continously in sync with the HTML walker process

## Definition: 
Rectangle is a rectangle and is a top node for a structure like HTML ELements Border, Margin, Padding, Content, Background, etc
Rectangle can have 0 to many children with the always with the same properties as the parent
Rectangle can have a set of Constraints (like margin, padding, border, etc) and others
