**Backend-for-Frontend Specification — Save Rectangles API**

---

## 1. Purpose

Expose a deterministic HTTP endpoint that accepts a **SaveCommand** containing rectangle data, applies **server-controlled scaling**, and persists the result to disk under a configured directory.

The backend owns:

* file system access
* coordinate normalization/scaling
* validation and invariants

The frontend only sends intent + data.

---

## 2. Configuration (`configuration.json`)

```json
{
  "saveDirectoryPath": "C:/data/rectangles",
  "scaling": {
    "scaleX": 1.0,
    "scaleY": 1.0
  }
}
```

### Constraints

* `saveDirectoryPath`

  * must exist or be creatable
  * must be absolute
  * no traversal (`..`) allowed at runtime

* `scaleX`, `scaleY`

  * positive numbers
  * deterministic (no runtime mutation)

---

## 3. API Contract

### Endpoint

```
POST /api/save
```

### Request Type

`SaveCommand`

```ts
type SaveCommand = {
  readonly requestId: string;        // idempotency / trace
  readonly fileName: string;         // logical name (no path)
  readonly rectangles: readonly RectangleDto[];
};
```

```ts
type RectangleDto = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};
```

---

## 4. Server Processing Pipeline

### Step 1 — Validation

Reject if:

* `fileName` contains path separators
* rectangles array is empty
* any rectangle:

  * width <= 0
  * height <= 0
  * NaN / Infinity values

---

### Step 2 — Scaling

Apply configuration:

```
scaledX      = x * scaleX
scaledY      = y * scaleY
scaledWidth  = width * scaleX
scaledHeight = height * scaleY
```

Scaling is:

* pure
* deterministic
* stateless

---

### Step 3 — Transformation Model

Internal persistence model:

```ts
type PersistedRectangle = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};
```

```ts
type PersistedDocument = {
  readonly requestId: string;
  readonly rectangles: readonly PersistedRectangle[];
  readonly createdUtc: string;
};
```

---

### Step 4 — File Resolution

Final path:

```
<SaveDirectoryPath>/<fileName>.json
```

Rules:

* sanitize `fileName`
* enforce `.json`
* no overwrite unless explicitly allowed (define policy)

---

### Step 5 — Persistence

* atomic write (write temp → rename)
* UTF-8 JSON
* no partial writes

---

## 5. Response Contract

### Success

```json
{
  "status": "ok",
  "filePath": "C:/data/rectangles/example.json"
}
```

### Failure

```json
{
  "status": "error",
  "code": "VALIDATION_ERROR | IO_ERROR | CONFIG_ERROR",
  "message": "deterministic error message"
}
```

---

## 6. Invariants

* Backend is the **single authority** for scaling
* No raw payload is persisted without transformation
* File system access is **fully controlled by configuration**
* All operations are:

  * deterministic
  * side-effect bounded
  * testable without IO (via abstraction)

---

## 7. Client Responsibility

Using your `HttpClient`:

* construct `SaveCommand`
* do not apply scaling
* do not include file paths
* only send logical `fileName`

---

## 8. Non-Functional Requirements

* No hidden globals
* Configuration injected at composition root
* File system behind interface (testable)
* Pure transformation functions
* Idempotency supported via `requestId` (optional enforcement)

---

## 9. Extension Points (OCP)

* `IScalingStrategy`
* `IFileNamingPolicy`
* `IPersistenceStore`
* `IValidationPolicy`

No modification of core pipeline required for extension.

---

If you want, next step:

* I can give you the **minimal production-grade implementation (pipeline + interfaces + composition root)** aligned with your CQRS + Mediator setup.

# MUST BE USED  modules: 
1. FRONTEND: C:\Users\danha\source\repos\HTML\MonoRepro\Applications\pdf\drawing-tool\application 
2. BACKEND: C:\Users\danha\source\repos\HTML\MonoRepro\Applications\pdf\drawing-tool\backend 
3. HTTP REQ RES FOR TS: C:\Users\danha\source\repos\HTML\MonoRepro\Applications\pdf\drawing-tool\core-http-messages
4. HTTP ADAPTER FOR EXPRESS: C:\Users\danha\source\repos\HTML\MonoRepro\Applications\pdf\drawing-tool\core-http-messages-express 
5. HTTP CLIENT LIBRARY: C:\Users\danha\source\repos\HTML\MonoRepro\Applications\pdf\drawing-tool\core-http-messages-http-client 
