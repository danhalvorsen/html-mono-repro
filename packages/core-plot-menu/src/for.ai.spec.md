# `core-plot-menu` AI Implementation Rules

This file is the implementation contract for `@monorepo/core-plot-menu`.

## Purpose

`core-plot-menu` exists to support `@monorepo/core-plot` with menu-side workflow and state.

It owns:
- plot definition models
- plot registry behavior
- menu command handling
- selection and visibility state
- controller-side menu orchestration

It does not own:
- coordinate mapping
- SVG rendering primitives
- canvas orchestration
- curve math
- rectangle geometry

## Open-Closed Rule

This module must be open for extension and closed for modification.

Extend behavior by adding:
- new plot definition kinds
- new command types
- new controller implementations
- new parser/factory services
- new menu-state policies

Do not extend behavior by rewriting stable registry/controller logic unless there is a real defect.

## Architectural Boundaries

Use these boundaries:
- `domain/` for plot definitions and command contracts
- `services/` for registry and menu workflow policies
- `controllers/` for menu orchestration

Do not place Lit elements, SVG output, or host-application routing in this module.

## Modeling Rules

- Plot types must be type-safe.
- Selection state must be explicit.
- Visibility state must be explicit.
- Registry ordering must be deterministic.
- Menu commands must be discriminated unions or equally type-safe abstractions.

## Integration Rule

`core-plot-menu` may support `core-plot`, but must not depend on `PlotCanvasElement` or `CoordinateSystem`.

Integration happens through contracts and composition, not through direct coupling to the plotting host.

## Testing Rule

Test:
- deterministic registration order
- selection updates
- visibility toggling
- removal behavior
- invalid or missing target stability

Do not test private implementation details.
