# core-svg-fabric-products

Product-level SVG web components built on `@monorepo/core-svg-fabric`.

## Components

- `svg-fabric-circle`
- `svg-fabric-box`
- `svg-fabric-triangle`
- `svg-fabric-box-triangle`

## Architecture

- Product components own Lit properties only.
- SVG node construction is centralized in `src/composition/product-shape-node-factory.ts`.
- Geometry stays deterministic and DOM-free in `src/domain/product-shape-geometry.ts`.
- Rendering is delegated to `SvgLitElement` and the core SVG node renderer.

## Commands

```powershell
pnpm build
pnpm test:typecheck
```
