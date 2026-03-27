# @monorepo/core-design-pattern-composite-tree-threejs

Three.js-aware composite tree contracts and reusable node implementations.

## Includes

- `IPrimitiveNode`
- `IPrimitiveCompositeNode`
- `ITransform`
- `PrimitiveCompositeNode`
- `TransformNode`
- `PrimitiveTreeSearch`

## Notes

This package does not own application-specific primitive request models or primitive factories.

Leaf nodes that depend on request models or factories should be implemented in the consuming application.

## Build

```bash
pnpm build