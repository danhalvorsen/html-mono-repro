# core-lit-monaco-code-editor-sample-projects

Sample projects for the Monaco editor playground, stored as standard files.

## Structure

Each sample folder contains:

- `project.json` (project definition/metadata)
- `main.ts`
- `index.html`
- `styles.css`

Example:

```text
src/
  sample1/
    project.json
    main.ts
    index.html
    styles.css
```

## Use In Editor Application

1. Copy or extract a sample folder.
2. In the editor app, use **Load code folder**.
3. Select the sample folder (`sample1`, `sample2`, `sample3`, `sample4`).

The app will map files to tabs:

- `main.ts` -> TypeScript tab
- `index.html` -> HTML tab
- `styles.css` -> CSS tab

## Extract Samples To Folder

Default output (`../core-lit-monaco-editor-application/samples`):

```bash
pnpm -C packages/core-lit-monaco-editor-modules/core-lit-monaco-code-editor-sample-projects extract:samples
```

Custom output folder:

```bash
pnpm -C packages/core-lit-monaco-editor-modules/core-lit-monaco-code-editor-sample-projects extract:samples ../../../../tmp/my-samples
```

This command also writes `samples.manifest.json` in the output folder.

## Add New Sample

1. Create `src/sampleX/`.
2. Add `project.json`, `main.ts`, `index.html`, `styles.css`.
3. Register it in `src/index.ts` (`name`, `root`, `manifestPath`, `files`).
