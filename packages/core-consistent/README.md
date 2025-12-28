# @monorepo/core-consistent

Small utility to compute a compact XOR-based fingerprint for `tsconfig`-style files
and run a deterministic collision test.

Usage from the package root:

```
node packages/core-consistent/bin/compute-fp.js [path/to/tsconfig.json]
node packages/core-consistent/bin/test-collisions.js [path/to/tsconfig.json]
```

Notes:
- Fingerprint format: `v1:xor-8:<hex>` (8 bytes) — compact but weaker than full SHA-256.
- The module exports functions in `src/index.js` for programmatic use.
