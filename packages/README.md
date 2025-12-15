# Frontend Libraries

This repository contains reusable frontend libraries and packages for graphics, rendering, and core functionality.

> IMPORTANT  
> - Run `pnpm install` only at the **repo root** (`C:\Users\danha\source\repos\HTML\MonoRepro`).  
> - The `/packages` folder has a `preinstall` guard that will fail if you try `pnpm install` here.

## 📦 Package Overview

### Core Components
- **core-components** - Reusable UI components
- **core-event** - Event handling system
- **core-graphics** - Graphics utilities and primitives
- **core-ioc** - Inversion of Control container
- **core-morph** - Morphing and animation utilities
- **core-pubsub** - Publisher-subscriber pattern implementation
- **core-service-worker** - Service worker utilities
- **core-three-card** - Three.js card components
- **core-threejs** - Three.js utilities and helpers

### Core Tools & Utilities
- **core.code.tools** - Code generation and tooling
- **core.console.cli** - Console and CLI utilities
- **core.design-patterns** - Common design pattern implementations
- **core.example** - Example implementations and demos
- **core-filesystem** - File system abstractions
- **core-filesystem-json** - JSON file system utilities
- **core.formatter** - Code and data formatters
- **core.generators** - Code generators
- **core-rules** - Business rules engine
- **core-structures** - Data structures
- **core-template** - Template processing
- **core-trace** - Tracing and debugging utilities
- **core-validaton** - Validation utilities

### Math & Rendering
- **math** - Mathematical utilities and functions
- **math-types-mapping** - Type mappings for mathematical operations
- **rendering-system-abstract** - Abstract rendering system interfaces
- **rendering-system-html5** - HTML5 Canvas rendering implementation
- **rendering-system-webgl** - WebGL rendering implementation

### Utilities
- **logger** - Logging utilities
- **types-abstract** - Abstract type definitions

## 🚀 Getting Started

Each package is independently installable and can be used in your projects. Navigate to individual package directories for specific documentation and usage examples.

## 🔬 Running tests

From repo root:

```bash
# Single package
pnpm -F core.spreadsheet.core run test

# All library packages
cd packages
pnpm test
```

Vitest uses `packages/vitest.config.ts` and looks for tests in `test/**/*.test.ts` under each package.

## 📈 Migration History

This repository was migrated from `C:\Users\danha\source\repos\Web\Canvas\Graphical\my-graphics-engine\packages\` on October 17, 2025, preserving the complete git history of all packages.

## 🔧 Development

Each package contains its own:
- `package.json` - Package configuration
- `vitest.config.mts` - Testing configuration
- Individual README files with usage documentation

## 📄 License

See individual package licenses for specific terms.