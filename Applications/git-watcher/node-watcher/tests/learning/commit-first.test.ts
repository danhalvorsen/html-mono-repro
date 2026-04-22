import { afterAll, beforeAll, describe, test } from "vitest";
import { GitScenario } from "../scenarios/GitScenario.js";
import { GitCommandStep } from "../scenarios/steps/GitCommandStep.js";
import { WriteFileStep } from "../scenarios/steps/WriteFileStep.js";
import {
  assertGraphInvariants,
  assertHeadPointsToBranch,
  assertRefPointsToCommit,
  assertRootCommit,
} from "../fixtures/GraphAssertions.js";
import {
  createIntegrationRuntime,
  restartWithFreshRepository,
  waitForGraph,
} from "../integration/helpers.js";

describe("learning/commit-first", () => {
  const runtime = createIntegrationRuntime(import.meta.url, "learning/commit-first");

  beforeAll(async () => {
    await restartWithFreshRepository(runtime);
  });

  afterAll(() => {
    runtime.watcher.stop();
  });

  test("first commit creates a branch tip that points to the root commit", async () => {
    await restartWithFreshRepository(runtime);

    const scenario = new GitScenario("first commit", [
      new WriteFileStep("file.txt", "first\n"),
      new GitCommandStep(["add", "."]),
      new GitCommandStep(["commit", "-m", "first commit"]),
    ]);

    await scenario.execute(runtime.repo);

    const branch = runtime.repo.currentBranch();
    const headSha = runtime.repo.headSha();

    const graph = await waitForGraph(
      runtime,
      (candidate) =>
        candidate.edges.some(
          (edge) =>
            edge.sourceId === `ref:refs/heads/${branch}` &&
            edge.targetId === `commit:${headSha}`,
        ),
      30_000,
      "Graph did not converge for first commit.",
    );

    assertGraphInvariants(graph);
    assertHeadPointsToBranch(graph, branch);
    assertRefPointsToCommit(graph, branch, headSha);
    assertRootCommit(graph, headSha);
  });
});
