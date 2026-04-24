```md
# @monorepo/core-http-messages-express

Express adapter for `@monorepo/core-http-messages`.

## Purpose

This module provides a **thin, explicit adapter layer** between:

- Express (`Request`, `Response`)
- Transport-agnostic HTTP model (`HttpRequestMessage`, `HttpResponseMessage`)

It enables:

- Decoupled application logic (no Express dependency)
- Deterministic, testable handlers
- Clean architecture (ports + adapters)

---

## Architecture

```

Express (framework)
│
▼
core-http-messages-express (adapter)
│
▼
core-http-messages (transport model + mapping)
│
▼
Application handlers (pure logic)

````

### Responsibilities

| Layer                          | Responsibility                         |
|--------------------------------|--------------------------------------|
| core-http-messages             | HTTP model + mapping logic           |
| core-http-messages-express     | Express adapter                      |
| Application                    | Business logic (handlers)            |

---

## Installation

```bash
pnpm add @monorepo/core-http-messages-express
````

---

## Usage

### 1. Create a handler (NO Express dependency)

```ts
import {
  HttpResponseMessageBuilder,
  HeadersBuilder,
  HeaderName,
  type HttpRequestMessage,
  type HttpResponseMessage,
} from '@monorepo/core-http-messages';

import type { IExpressHandler } from '@monorepo/core-http-messages-express';

export class HealthHandler implements IExpressHandler {
  public async handle(
    _request: HttpRequestMessage,
  ): Promise<HttpResponseMessage> {
    return new HttpResponseMessageBuilder()
      .withStatusCode(200)
      .withHeaders(
        new HeadersBuilder()
          .with(HeaderName.ContentType, 'application/json')
          .build(),
      )
      .withBody({ ok: true })
      .build();
  }
}
```

---

### 2. Bind to Express

```ts
import express from 'express';
import { ExpressHttpAdapterComposition } from '@monorepo/core-http-messages-express';
import { HealthHandler } from './HealthHandler';

const app = express();
app.use(express.json());

const healthHandler = new HealthHandler();

app.get(
  '/api/health',
  ExpressHttpAdapterComposition.createRouteHandler(healthHandler),
);

app.listen(3000);
```

---

## Core Concepts

### 1. Request Flow

```
Express Request
   ↓
ExpressHttpInput
   ↓
HttpRequestMapper
   ↓
HttpRequestMessage (domain-safe)
```

---

### 2. Response Flow

```
HttpResponseMessage (domain-safe)
   ↓
HttpResponseWriter
   ↓
ExpressHttpOutput
   ↓
Express Response
```

---

## Design Decisions

### No Express in core

`@monorepo/core-http-messages`:

* no framework dependencies
* fully testable
* reusable across transports (Express, Fastify, Fetch, etc.)

---

### Explicit Adapter Layer

`@monorepo/core-http-messages-express`:

* owns all Express-specific logic
* implements input/output ports
* isolates framework concerns

---

### Strong typing

* Header values are type-safe
* HTTP methods validated
* JSON detection is explicit (`content-type`)

---

### KISS

* No hidden magic
* No decorators
* No runtime reflection
* No framework leakage

---

## Testing Strategy

* Core module: pure unit tests (no Express)
* Adapter module: integration boundary tests
* Handlers: deterministic unit tests using `HttpRequestMessage`

---

## Extension

To support another transport (e.g. Fetch API):

* Implement `IHttpInput`
* Implement `IHttpOutput`
* Reuse:

  * `HttpRequestMapper`
  * `HttpResponseWriter`

No changes required in core or application logic.

---

## Summary

This module enforces:

* **Dependency direction** → framework → adapter → core → application
* **Separation of concerns**
* **Deterministic behavior**
* **Open/closed extension**

It is the only place where Express exists in the system.

```
```
