import { afterAll, beforeAll, describe, test } from "vitest";
import { GitScenario } from "../scenarios/GitScenario.js";
import { GitCommandStep } from "../scenarios/steps/GitCommandStep.js";
import { WriteFileStep } from "../scenarios/steps/WriteFileStep.js";
import {
  assertGraphInvariants,
  assertHeadPointsToBranch,
  assertRefPointsToCommit,
} from "../fixtures/GraphAssertions.js";
import {
  createIntegrationRuntime,
  restartWithFreshRepository,
  waitForGraph,
} from "../integration/helpers.js";

describe("learning/branch-create-and-checkout", () => {
  const runtime = createIntegrationRuntime(import.meta.url, "learning/branch-create-and-checkout");

  beforeAll(async () => {
    await restartWithFreshRepository(runtime);
  });

  afterAll(() => {
    runtime.watcher.stop();
  });

  test("checkout -b creates feature branch and moves HEAD to it", async () => {
    await restartWithFreshRepository(runtime);

    const baseBranch = runtime.repo.currentBranch();

    const scenario = new GitScenario("create and checkout feature branch", [
      new WriteFileStep("file.txt", "base\n"),
      new GitCommandStep(["add", "."]),
      new GitCommandStep(["commit", "-m", "base commit"]),
      new GitCommandStep(["checkout", "-b", "feature"]),
    ]);

    await scenario.execute(runtime.repo);

    const baseSha = runtime.repo.headSha();

    const graph = await waitForGraph(
      runtime,
      (candidate) =>
        candidate.edges.some(
          (edge) =>
            edge.sourceId === "head" &&
            edge.targetId === "ref:refs/heads/feature",
        ) &&
        candidate.edges.some(
          (edge) =>
            edge.sourceId === "ref:refs/heads/feature" &&
            edge.targetId === `commit:${baseSha}`,
        ),
      30_000,
      "Graph did not converge for branch create/checkout.",
    );

    assertGraphInvariants(graph);
    assertHeadPointsToBranch(graph, "feature");
    assertRefPointsToCommit(graph, "feature", baseSha);
    assertRefPointsToCommit(graph, baseBranch, baseSha);
  });
});
