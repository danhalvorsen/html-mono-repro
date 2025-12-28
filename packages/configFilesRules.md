# Package.json

## Rules 

```
{
    "name": {
        "type": "string",
 # Package.json

 ## Rules

Refer to [core-consistent/rules/package-json-rules.json](core-consistent/rules/package-json-rules.json) for the canonical definition. The file drives validation and also documents what we expect from every package:

- `name` must match the module folder name.
- `scripts.build` must not start with `tsc -b`; prefer `pnpm run build:ts`.
- `scripts.test` must not start with `vite`; prefer `pnpm run test:unit`.
- `devDependencies` should never include root-only tools such as `typescript` or `vitest`.
- `references` are disallowed so each package relies on workspace references instead of local TypeScript installs.
        "test: {
