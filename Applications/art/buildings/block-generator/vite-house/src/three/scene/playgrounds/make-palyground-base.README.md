# make-palyground-base.ps1

Scaffolds a new playground scene under `src/three/scene/playgrounds` with a simple centered box.

## Script location

- `src/three/scene/playgrounds/make-palyground-base.ps1`

## What it creates

Given `-Name "my new playground"`, it creates:

1. Folder:
   - `src/three/scene/playgrounds/my-new-playground/`
2. Scene file:
   - `src/three/scene/playgrounds/my-new-playground/MyNewPlaygroundPlaygroundScene.ts`

The generated scene:

- Extends `PlaygroundSceneBase`
- Has a default `viewId`
- Adds a simple centered blue box (`2x2x2`, positioned at `y=1`)

## Parameters

- `-Name` (required)
  - Human-friendly name. Converted to:
    - `PascalCase` for class name
    - `kebab-case` for folder and default `viewId`
- `-ViewId` (optional)
  - Defaults to kebab-case name
- `-RootName` (optional)
  - Defaults to `<kebab-name>-root`

## Usage

From `vite-house` project root:

```powershell
./src/three/scene/playgrounds/make-palyground-base.ps1 -Name "modern roof study"
```

With custom view id:

```powershell
./src/three/scene/playgrounds/make-palyground-base.ps1 -Name "modern roof study" -ViewId "roof-study"
```

With custom root name:

```powershell
./src/three/scene/playgrounds/make-palyground-base.ps1 -Name "modern roof study" -RootName "roof-study-root"
```

## After generation

The script prints next-step snippets for:

1. Import in `src/three/ThreeApplication.ts`
2. `this.menu.register(...)` entry

These steps are currently manual.

## Notes

- If the target file already exists, the script stops with an error.
- The script does not modify `ThreeApplication.ts` automatically.
