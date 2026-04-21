# Integration Test How-To

This folder contains integration tests for `node-watcher` that run real Git commands and assert the exported graph JSON.

## Where to add new tests

- Add each operation as its own file in `tests/integration/`.
- Keep one operation per file so failures are easy to inspect.
- Reuse existing helpers and fixtures:
  - `tests/integration/helpers.ts`
  - `tests/scenarios/GitScenario.ts`
  - `tests/scenarios/steps/GitCommandStep.ts`
  - `tests/scenarios/steps/WriteFileStep.ts`
  - `tests/fixtures/GraphAssertions.ts`

## Standard test pattern

1. Create runtime with `createIntegrationRuntime(import.meta.url, "<suite-name>")`.
2. In `beforeAll`, call `restartWithFreshRepository(runtime)`.
3. In `afterAll`, call `runtime.watcher.stop()`.
4. In each test:
   - Reset with `restartWithFreshRepository(runtime)`.
   - Execute a `GitScenario` with `WriteFileStep` + `GitCommandStep`.
   - Read expected SHAs from `runtime.repo`.
   - Wait for graph convergence using `waitForGraph(...)`.
   - Assert invariants + operation-specific edges.

## Minimal template

```ts
import { afterAll, beforeAll, describe, test } from "vitest";
import { GitScenario } from "../scenarios/GitScenario.js";
import { GitCommandStep } from "../scenarios/steps/GitCommandStep.js";
import { WriteFileStep } from "../scenarios/steps/WriteFileStep.js";
import { assertGraphInvariants } from "../fixtures/GraphAssertions.js";
import {
  createIntegrationRuntime,
  restartWithFreshRepository,
  waitForGraph,
} from "./helpers.js";

describe("integration/<operation-name>", () => {
  const runtime = createIntegrationRuntime(import.meta.url, "<operation-name>");

  beforeAll(async () => {
    await restartWithFreshRepository(runtime);
  });

  afterAll(() => {
    runtime.watcher.stop();
  });

  test("<operation behavior>", async () => {
    await restartWithFreshRepository(runtime);

    const scenario = new GitScenario("<scenario-name>", [
      new WriteFileStep("file.txt", "content\n"),
      new GitCommandStep(["add", "."]),
      new GitCommandStep(["commit", "-m", "message"]),
    ]);

    await scenario.execute(runtime.repo);

    const headSha = runtime.repo.headSha();

    const graph = await waitForGraph(
      runtime,
      (candidate) =>
        candidate.edges.some(
          (edge) =>
            edge.sourceId.startsWith("ref:refs/heads/") &&
            edge.targetId === `commit:${headSha}`,
        ),
      30_000,
      "Graph did not converge.",
    );

    assertGraphInvariants(graph);
  });
});
```

## Assertion checklist

- Always call `assertGraphInvariants(graph)`.
- For branch pointer operations:
  - assert `head -> ref:refs/heads/<branch>`
  - assert `ref:refs/heads/<branch> -> commit:<sha>`
- For history operations:
  - assert `commit:<child> -> commit:<parent>`
- For merge:
  - assert two parent edges from merge commit
- For tag:
  - assert `ref:refs/tags/<tag> -> commit:<sha>`

## Naming rules

- File name: `<operation>.test.ts`
- Suite name: `integration/<operation>`
- Artifact folder comes from suite name automatically via helper runtime.

## Running tests

From `Applications/git-watcher/node-watcher`:

```bash
pnpm test:integration
```

Run a single file:

```bash
pnpm vitest run tests/integration/<operation>.test.ts
```
