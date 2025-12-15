**Contributing — MonoRepro**

Short and practical guidelines for contributors to this monorepo.

Purpose
- Keep package config minimal and consistent so packages build independently and the workspace is easy to maintain.

Tsconfig strategy
- Keep `tsconfig.base.json` at repo root for shared compiler options.
- Provide three root variants for common targets: `tsconfig.node.json`, `tsconfig.web.json`, `tsconfig.hybrid.json`.
- Each package should have a minimal `packages/<pkg>/tsconfig.json` that only extends the appropriate root variant and sets per-package overrides:
  - Example:
    ```jsonc
    {
      "extends": "../../tsconfig.node.json",
      "compilerOptions": { "rootDir": "src", "outDir": "dist" },
      "include": ["src"]
    }
    ```
- Keep tests out of the main `tsconfig.json`. Use `tsconfig.test.json` per package for test-only settings (`noEmit`, `types: ["vitest/globals"]`).

Vitest and shared test config
- Keep a single root `vitest.config.ts` at the repo root for defaults used by most packages.
- Per-package `package.json` test scripts should point to the root config to avoid duplication:
  - `"test": "vitest run --config ../../vitest.config.ts"`
- If a package needs overrides, add a tiny `packages/<pkg>/vitest.config.ts` that imports and merges the root base.

Package.json templates
- We keep package.json minimal. Typical fields:
  - `name`, `version`, `type: "module"`, `main`, `types`, `exports`, `dependencies`, `scripts` (build/test/clean).
- Do not duplicate tooling configs; point to root config files or use `pnpm -w -F <pkg> run <script>` from workspace root when convenient.

Decorators / inversify / reflect-metadata
- Root tsconfig variants include:
  - `experimentalDecorators: true`
  - `emitDecoratorMetadata: true`
  - `allowSyntheticDefaultImports: true`
- Packages that use `inversify`/`reflect-metadata` are allowed to keep their DI-specific settings but should still `extend` a root variant and only add package-level overrides when necessary.

Scripts & automation
- `scripts/apply-tsconfig-template.js` — helper to normalize package-level `tsconfig.json` to the one-line `extends` pattern (dry-run by default, `--apply` to write). Use this to batch-standardize packages.
- Use `pnpm` workspace filters for cross-package commands:
  - `pnpm -w -F <packageName> run build`
  - `pnpm -w -r run test`

Why this pattern
- Centralized base + simple per-package extends:
  - avoids duplicated config and drift,
  - keeps `tsc -p packages/<pkg>` predictable,
  - makes it easy to change a single root policy (module resolution, decorators, lib targets) for all packages.

Useful links
- TypeScript tsconfig reference: https://www.typescriptlang.org/tsconfig
- TypeScript project references: https://www.typescriptlang.org/docs/handbook/project-references.html
- pnpm workspaces: https://pnpm.io/workspaces
- Vitest docs: https://vitest.dev/
- Lit docs: https://lit.dev/docs/
- Inversify: https://github.com/inversify/InversifyJS
- reflect-metadata: https://github.com/rbuckton/reflect-metadata

Sources and rationale
This repository's conventions are based on the following public, authoritative sources. Each guideline in this document maps to one or more items below.

1. TypeScript compiler options and tsconfig patterns — TypeScript docs
  - https://www.typescriptlang.org/tsconfig
  - Reason: definitive reference for `module`, `moduleResolution`, `experimentalDecorators`, `emitDecoratorMetadata`, `composite`, and other compiler options.

2. Project references / monorepo builds — TypeScript handbook
  - https://www.typescriptlang.org/docs/handbook/project-references.html
  - Reason: explains `composite` + `references` and `tsc -b` workflow used for multi-package builds.

3. Module resolution choices (NodeNext vs Bundler) — TypeScript & Node docs
  - TS: https://www.typescriptlang.org/tsconfig#moduleResolution
  - Node ESM: https://nodejs.org/api/esm.html
  - Reason: background and trade-offs for choosing `NodeNext` and when to use `Bundler` for web packages.

4. pnpm monorepo / workspaces
  - https://pnpm.io/workspaces
  - Reason: workspace filtering (`-w -F`), `workspace:*` dependencies, and workspace script patterns referenced in this file.

5. Vitest configuration and sharing
  - https://vitest.dev/
  - Reason: best-practice patterns for a shared `vitest.config.ts` at repo root and per-package overrides and CLI usage.

6. Lit (web components) guidance
  - https://lit.dev/docs/
  - Reason: DOM typings, bundler-friendly builds, and decorator usage common to Lit components.

7. Inversify (DI) and reflect-metadata runtime needs
  - Inversify: https://github.com/inversify/InversifyJS
  - reflect-metadata: https://github.com/rbuckton/reflect-metadata
  - Reason: these projects document the requirement for `experimentalDecorators` and `emitDecoratorMetadata`, and how to initialize `reflect-metadata` at runtime.

8. Tooling / Lint / Formatting
  - ESLint: https://eslint.org/
  - Prettier: https://prettier.io/
  - Reason: standard linting/formatting conventions and integration notes for monorepos.

How the sources map to repo rules
- Centralized `tsconfig.base.json`: TypeScript recommended to centralize shared compiler options (see TS docs, items 1–3).
- Per-package one-line `tsconfig.json` that `extends` a root variant: aligns with monorepo practices in TS project references and keeps `rootDir`/`outDir` per package (see item 2).
- `experimentalDecorators` + `emitDecoratorMetadata` enabled in variants: required by Inversify/reflect-metadata (item 7).
- Shared `vitest.config.ts` at repo root: documented pattern in Vitest docs (item 5).

If you'd like, I can create a short `BEST_PRACTICES.md` that expands each mapping with inline excerpts from the linked docs.

If you want me to apply the one-line `tsconfig` pattern to packages now, run the script in dry-run mode to review changes first:

```powershell
node .\scripts\apply-tsconfig-template.js
node .\scripts\apply-tsconfig-template.js --apply   # to apply
```

If you'd like, I can open a draft PR that includes these guidelines plus the template changes we discussed.
