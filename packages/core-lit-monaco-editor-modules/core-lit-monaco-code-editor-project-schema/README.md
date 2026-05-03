# core-lit-monaco-code-editor-project-schema

Schema contracts and validators for Monaco code-editor project folders.

## Main Types

- `MonacoCodeEditorProjectManifest`:
  project metadata + file declarations (no file content).
- `MonacoCodeEditorProject`:
  resolved project with `content` per file.

## Validation API

- `validateMonacoCodeEditorProjectManifest(manifest)`
- `validateMonacoCodeEditorProject(project)`

Both return:

```ts
{
  valid: boolean;
  errors: readonly string[];
}
```
