CodeQL queries for this repository (TypeScript)

Placement:
- `scripts/codeql/queries/typescript/` — TypeScript/JavaScript queries (.ql)

Usage:
- Install CodeQL CLI: https://codeql.github.com/docs/codeql-cli/getting-started-with-the-codeql-cli/
- Create a database for this repo and run queries. Example:

```bash
# from repo root
codeql database create codeql-db --language=javascript --command='pnpm -w -r run build' \
  --source-root=MonoRepro
codeql database analyze codeql-db scripts/codeql/queries --format=sarif-latest --output=codeql-results.sarif
```

Notes:
- These queries are intentionally small examples: `eval`/`Function`, unsafe `innerHTML`, and direct DOM insertion sinks.
- Adjust and expand queries as needed.
