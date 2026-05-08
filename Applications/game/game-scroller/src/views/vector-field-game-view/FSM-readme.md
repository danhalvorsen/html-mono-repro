# FSM Pilot Report

## Scope

This report covers the FSM pilot implementation under:

- `src/views/vector-field-game-view`

The goal was to introduce a view-level finite state machine pattern for a small pilot (`view-fsm-pilot`) and a real demo view (`view-vector-field-game-object-demo-fsm`) without changing existing non-pilot views.

## What Is Done

1. Added a dedicated pilot folder and entrypoint:
- `index.ts`
- `view-fsm-pilot.ts`
- `view-vector-field-game-object-demo-fsm.ts`
- `vector-field-game-object-demo-fsm-model.ts`

2. Added two new routes in `my-element`:
- `fsm - pilot`
- `fsm - vector field`

3. Added two new menu items in `public/menu-items.json`:
- `FSM Pilot`
- `FSM - Vector Field`

4. Implemented a simple reference FSM in `view-fsm-pilot.ts`:
- One state (`Idle`)
- Two transitions (`Increment`, `Decrement`)
- Snapshot output for state/context/last transition

5. Implemented a domain-focused FSM model for vector field options:
- State id: `Editing`
- Typed transitions for numeric controls, preset changes, randomize, and reset
- Context split into `foo` (vector field options) and `bla` (theme/preset/seed)
- Output payloads for transition observability

6. Reduced duplicated transition/control code in the vector field model:
- Numeric transition schema (`VectorFieldNumericTransitions`)
- Shared `createRangeControls(...)`
- Shared clamping logic and per-transition apply/read behavior

7. Integrated `@monorepo/core-design-composite` UI components in FSM view:
- `ui-input-range`
- `ui-input-select`
- `ui-button`
- `ui-label`

8. Removed blocking side-effect import from core-design-composite package exports:
- `export * from './demo/main.js'` removed from package index
- This prevents `Missing #app element` runtime crash caused by demo bootstrap code

## Advantages

1. Clear separation of concerns:
- View rendering (`view-vector-field-game-object-demo-fsm.ts`)
- Transition and state rules (`vector-field-game-object-demo-fsm-model.ts`)

2. Predictable update flow:
- All mutations occur through explicit transitions
- Inputs become auditable events

3. Reusable transition metadata:
- Transition schema drives both FSM behavior and UI control generation

4. Better testability:
- FSM model logic is isolated from Lit rendering concerns

5. Incremental adoption:
- Pilot coexists with existing architecture
- No forced rewrite of current views

## Pros / Cons

### Pros

1. Deterministic behavior from explicit state transitions.
2. Easier debugging via transition outputs and snapshots.
3. Lower duplication after schema-based numeric transition refactor.
4. Easier to add new controls by adding transition definitions.
5. Compatible with existing menu + routing model.

### Cons

1. More upfront boilerplate than direct property mutation.
2. Naming and type volume can grow quickly for large option sets.
3. Requires strict naming discipline (`State`, `Transition`, `Context`, `Output`) to stay readable.
4. Event-to-transition mapping in the view still requires careful wiring.
5. Pilot currently uses some local helper functions in the model; deeper reuse may justify extraction into shared modules later.

## Current Status

1. Build status for `Applications/game/game-scroller` is passing.
2. FSM pilot views are wired into the existing app shell (`my-element`) and menu.
3. The previous `Missing #app element` blocker was addressed by removing demo bootstrap export side effects from `@monorepo/core-design-composite`.

## Recommended Next Step

1. Add focused tests for `vector-field-game-object-demo-fsm-model.ts` transitions:
- numeric boundary clamping
- reset behavior
- theme preset + randomize behavior
- output field/value expectations
