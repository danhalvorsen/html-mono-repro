import { afterAll, beforeAll, describe, test } from "vitest";
import { GitScenario } from "../scenarios/GitScenario.js";
import { GitCommandStep } from "../scenarios/steps/GitCommandStep.js";
import { WriteFileStep } from "../scenarios/steps/WriteFileStep.js";
import {
  assertCommitParent,
  assertGraphInvariants,
  assertHeadPointsToBranch,
  assertRefDoesNotPointToCommit,
  assertRefPointsToCommit,
} from "../fixtures/GraphAssertions.js";
import {
  createIntegrationRuntime,
  restartWithFreshRepository,
  waitForGraph,
} from "../integration/helpers.js";

describe("learning/commit-second", () => {
  const runtime = createIntegrationRuntime(import.meta.url, "learning/commit-second");

  beforeAll(async () => {
    await restartWithFreshRepository(runtime);
  });

  afterAll(() => {
    runtime.watcher.stop();
  });

  test("second commit points to first commit as parent", async () => {
    await restartWithFreshRepository(runtime);

    const scenario = new GitScenario("second commit", [
      new WriteFileStep("file.txt", "first\n"),
      new GitCommandStep(["add", "."]),
      new GitCommandStep(["commit", "-m", "first commit"]),
      new WriteFileStep("file.txt", "second\n"),
      new GitCommandStep(["add", "."]),
      new GitCommandStep(["commit", "-m", "second commit"]),
    ]);

    await scenario.execute(runtime.repo);

    const branch = runtime.repo.currentBranch();
    const headSha = runtime.repo.headSha();
    const parentSha = runtime.repo.parentSha();

    const graph = await waitForGraph(
      runtime,
      (candidate) =>
        candidate.edges.some(
          (edge) =>
            edge.sourceId === `ref:refs/heads/${branch}` &&
            edge.targetId === `commit:${headSha}`,
        ) &&
        candidate.edges.some(
          (edge) =>
            edge.sourceId === `commit:${headSha}` &&
            edge.targetId === `commit:${parentSha}`,
        ),
      30_000,
      "Graph did not converge for second commit.",
    );

    assertGraphInvariants(graph);
    assertHeadPointsToBranch(graph, branch);
    assertRefPointsToCommit(graph, branch, headSha);
    assertCommitParent(graph, headSha, parentSha);
    assertRefDoesNotPointToCommit(graph, branch, parentSha);
  });
});
