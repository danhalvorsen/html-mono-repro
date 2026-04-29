# Graph Vizualisation App Extension Guide

This guide explains how to add new functionality to the multiview demo application.

## Architecture Overview

The app is a Lit-based multiview shell with focused layers:

- `src/MultiViewApp.ts`: root view menu + active view renderer.
- `src/views/AppView1/AppView1.ts`: graph visualisation view.
- `src/views/AppView2/AppView2.ts`: secondary dashboard view.
- `src/app/*`: application orchestration, graph factory, layout registry, coordinator.
- `src/components/*`: reusable UI and graph host web components.
- `src/data/graphs/*.json`: graph datasets selectable in AppView1.

## Add A New Source Graph

1. Create a JSON file in `src/data/graphs/`:

```json
{
  "nodes": [{ "id": "A", "payload": null }],
  "edges": []
}
```

2. Import and expose it in `src/app/ApplicationGraphFactory.ts`:
- Add import.
- Add method to `IApplicationGraphFactory`.
- Implement method in `ApplicationGraphFactory`.

3. Register source id in `src/app/GraphVisualizationSourceGraphTypes.ts`.

4. Add selector option and switch case in `src/views/AppView1/AppView1.ts`.

## Add A New Layout Algorithm

1. Add the layout id to `src/app/GraphVisualizationLayoutTypes.ts`.

2. Register the algorithm in `src/app/GraphVisualizationLayoutControllerRegistry.ts`:
- Create controller or strategy instance.
- Add an entry to `entries` with `id`, `label`, `algorithmName`, and `sceneFactory`.

3. The toolbar layout dropdown is auto-populated from registry options.

## Add A New Node Shape Option

1. Extend shape support in package `packages/core-graph-visualisation`:
- `src/features/node/NodeSvgShape.ts`
- `src/GraphSvgScene.ts`
- `src/lit/GraphSceneSvgRenderer.ts`

2. Rebuild that package:

```bash
pnpm --filter @monorepo/core-graph-visualisation build
```

3. Add the shape option in `src/components/GraphVisualizationToolbar.ts` and include it in change validation.

## Add A New View To The App

1. Create `src/views/AppViewX/AppViewX.ts` and register a custom element.
2. Import it in `src/MultiViewApp.ts`.
3. Add an entry in `initializeViews()`.
4. Add a case in `renderActiveView()`.

## Dependency Wiring Tips

If Vite fails to resolve imports:

1. Ensure workspace package is listed in `Applications/graph-visualization/graph-vizualisation/package.json`.
2. Run install from the app folder:

```bash
pnpm i
```

3. Build local workspace package if it exports from `dist/`:

```bash
pnpm --filter <workspace-package-name> build
```

## Validation Checklist

Run after each functional change:

```bash
pnpm build
pnpm test
```

If tests fail due architecture snapshots/string checks, update tests when the architectural intent has intentionally changed.
