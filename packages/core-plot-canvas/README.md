# `@monorepo/core-plot-curve`

Curve interpolation module extracted alongside `core-plot`.

Interpolation math should come from `@monorepo/core-math`.

This package owns:

* curve-facing domain models
* curve sampling orchestration
* curve geometry services
* curve SVG path generation

This package does not own spline math implementations.

It reuses `@monorepo/core-math` for spline math and provides a focused place for:
- curve domain models
- interpolation services
- future curve-specific geometry and hit-testing helpers

## Build

`pnpm build`

## Test

`pnpm test`
