# `@monorepo/core-plot-shapes`

SVG shape module extracted alongside `core-plot`.

## Canonical Specification

The governing specification for this package is:

* [documentation/master.spesification.txt](./documentation/master.spesification.txt)

This package owns:

* reusable SVG shape primitives
* reusable SVG composition objects
* builders for renderable shape objects
* token-driven SVG style contracts

This package does not own:

* plot orchestration
* canvas orchestration
* controller behavior
* curve interpolation math

## Build

`pnpm build`

## Test

`pnpm test`
