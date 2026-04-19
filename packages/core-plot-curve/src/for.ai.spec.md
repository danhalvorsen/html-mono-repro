# `core-plot-curve` AI Implementation Rules

This file is the implementation contract for `@monorepo/core-plot-curve`.

## Purpose

`core-plot-curve` is the single best-fit curve module for the plotting system.

It owns:
- curve domain models
- interpolation services
- curve geometry services
- SVG path generation for curves

Interpolation math implementations must come from `@monorepo/core-math`.

`core-plot-curve` may orchestrate sampling and adapt curve-domain inputs to math primitives, but it
must not duplicate spline formulas or reimplement interpolation algorithms that already belong in
`core-math`.

It does not own:
- plot canvas orchestration
- axis behavior
- rectangle logic
- menu workflow
- general host application concerns

## Chosen Direction

Do not create multiple competing curve architectures.

The chosen shape for this module is:
- Cartesian curve input
- interpolation in math/domain services
- geometry operations over sampled curve points
- SVG path data as the rendering output boundary

That is the canonical fit for this module.

## Open-Closed Rule

The module must be open for new curve/interpolation variants without rewriting stable consumers.

Extend through:
- new interpolation strategies
- new curve model variants
- new SVG path policies
- new geometry policies

Do not copy curve logic back into `core-plot`.

## Integration Rule

`core-plot` may consume this module, but curve-specific logic should stay here.

`core-plot` should only:
- request curve samples
- request curve geometry operations
- request SVG path output
- map curve geometry into its coordinate system

## SVG Rule

This module is SVG-oriented in output.

Preferred output boundary:
- SVG path data strings

Allowed:
- curve-specific SVG helper types if they remain curve-focused

Not allowed:
- CanvasRenderingContext2D ownership as the primary runtime output
- DOM host orchestration

## Testing Rule

Test:
- deterministic interpolation
- insufficient-input stability
- path generation validity
- deterministic geometry operations:
  - point-at-t
  - tangent
  - normal
  - length
