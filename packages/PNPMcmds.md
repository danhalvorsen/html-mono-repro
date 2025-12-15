````markdown
# Commands

### 🛠️ Watch build
```bash
pnpm run build:ts:watch
```

---

### 🧹 Clean then rebuild

```bash
pnpm run clean:ts
pnpm run build:ts
```

---

### 🔍 Git helpers

```bash
# Show staged changes (what will be committed)
git diff --cached    # or: git diff --staged
```

---

### 📦 When adding internal deps

Add as `workspace:*` then refresh references:

```bash
pnpm -F <pkg> add @my-graphics/<dep>@workspace:*
powershell -ExecutionPolicy Bypass -File .\add-ts-refs.ps1
```

**Optional:** auto-refresh refs after installs.

Add this to your `package.json`:

```json
{
 
  "scripts": {
     
    "postinstall": "powershell -ExecutionPolicy Bypass -File ./add-ts-refs.ps1 -NoBuild"
  }
 
}

### 💡 Tip: per-package build with references

```bash
pnpm -F @my-graphics/core-morph run build
```

---

# Commands & Quick Fixes for pnpm recursion / MODULE_NOT_FOUND

If you see errors like:
Error: Cannot find module '.../node_modules/pnpm/bin/pnpm.cjs'
-> This usually means package scripts invoke `pnpm` recursively but the pnpm binary isn't installed/hoisted into the repo's node_modules.

Quick checklist (apply in order)

1) Install pnpm (workspace hoist)
- Preferred (local workspace install, will add pnpm into node_modules):
  pnpm install
- Or run the helper:
  pnpm run bootstrap

2) If CI or hoisted layout needed:
  pnpm run ci-install

3) Remove nested pnpm dependencies
- Search workspace for package.json files that list "pnpm" as a dependency/devDependency:
  git grep -n '"pnpm":' || true
- Remove any in-package "pnpm" entries (keep pnpm at the repo root only).

4) Replace recursive pnpm usage inside package scripts
- Avoid scripts that run `pnpm -r` from inside a package. Replace with:
  - per-package direct build (tsc/vite) commands, or
  - run from the root using filters:
    pnpm -r --filter ./path/to/package run build
  - or use a root orchestrator script.

Short example: instead of a package script that does:
  "build": "pnpm -r --parallel run build"
use a package-local script that runs tsc/vite directly, and orchestrate from the root.

Notes
- Ensure .npmrc allows bin links on Windows (bin-links=true) if you rely on local .bin shims.
- After applying the root install, re-run your normal build:
  pnpm install
  pnpm -r run build

Windows / PowerShell
- Run the PowerShell prebuild check (fails with an actionable message if pnpm is missing):
  pnpm run prebuild:win
- If check fails, from repo root run:
  pnpm install
  pnpm -r run build

---

### ⚠️ PowerShell tip

Do **not** paste the pnpm log output (lines like `Scope: 57 of 58 workspace projects` or `│ ... build$ ...`) back into PowerShell; those are just logs, not commands.

Run only the actual commands, e.g.:

```bash
pnpm -r run build
pnpm -F syntesizers-am run build
````
````

