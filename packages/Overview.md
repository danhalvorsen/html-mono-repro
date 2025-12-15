# Packages Overview

- All library packages live under this `/packages` folder.
- The workspace tooling (Vitest, TypeScript, pnpm) is configured at the **repo root**.

## Rules of Thumb

- ✅ Run `pnpm install` at `C:\Users\danha\source\repos\HTML\MonoRepro`
- ✅ Run per-package commands via filters:

```bash
pnpm -F <package-name> run build
pnpm -F <package-name> run test
```

- ❌ Do **not** run `pnpm install` inside `/packages` (it will fail on purpose).
