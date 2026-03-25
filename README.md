# MonoRepro

MonoRepro is a TypeScript-first monorepo managed with `pnpm`. It brings together reusable packages, experiments, and runnable applications in one repository so common abstractions, rendering systems, UI building blocks, and domain ideas can evolve side by side.

The repository is intentionally broad. It includes work around graphics and rendering, composition systems, math and data structures, interaction and event handling, audio and Web Audio experiments, CLI tooling, and small application sandboxes used to validate ideas in practice.

## What Is In This Repository

- `packages/` contains reusable libraries and framework-agnostic building blocks.
- `Applications/` contains demo apps, prototypes, and reference implementations built on top of those packages.
- Root tooling provides shared TypeScript, linting, testing, and workspace scripts.

Today the workspace contains more than 100 package projects and 20 application projects, managed together through a single `pnpm` workspace.

## Why A Monorepo

This repository is structured as a monorepo to make it easier to:

- share code across multiple experiments and applications
- keep related packages versioned and developed together
- test architectural ideas in real apps instead of only in isolated libraries
- standardize build, lint, and test workflows at the workspace root

## Workspace Structure

```text
MonoRepro/
├── Applications/   # demos, prototypes, and runnable apps
├── packages/       # reusable libraries and shared modules
├── scripts/        # workspace maintenance and automation
├── tests/          # cross-workspace or integration-oriented tests
└── documentation/  # supporting notes and project documentation
```

## Getting Started

Install dependencies from the repository root:

```bash
pnpm install
```

Common root commands:

```bash
pnpm build
pnpm lint
pnpm test
pnpm build:packages
pnpm build:apps
```

## Working In The Repo

- Run workspace commands from the repository root.
- Use `packages/` when you are building reusable functionality.
- Use `Applications/` when you want to explore, demo, or validate package behavior in a real app.
- Check the local `README.md` files inside individual packages or applications for project-specific details.

## Additional Notes

- Package-focused notes are available in [`packages/README.md`](./packages/README.md).
- Contribution guidance lives in [`CONTRIBUTING.md`](./CONTRIBUTING.md).

This root README is meant to orient new readers quickly. The repository is best explored by starting from the package or application area closest to the subsystem you want to work on.
