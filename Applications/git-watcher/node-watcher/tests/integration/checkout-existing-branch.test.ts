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
} from "./helpers.js";

describe("integration/checkout-existing-branch", () => {
  const runtime = createIntegrationRuntime(
    import.meta.url,
    "checkout-existing-branch",
  );

  beforeAll(async () => {
    await restartWithFreshRepository(runtime);
  });

  afterAll(() => {
    runtime.watcher.stop();
  });

  test("checkout existing branch moves HEAD back to base branch", async () => {
    await restartWithFreshRepository(runtime);

    const baseBranch = runtime.repo.currentBranch();

    const scenario = new GitScenario("checkout existing branch", [
      new WriteFileStep("file.txt", "base\n"),
      new GitCommandStep(["add", "."]),
      new GitCommandStep(["commit", "-m", "base"]),
      new GitCommandStep(["checkout", "-b", "feature"]),
      new WriteFileStep("feature.txt", "feature\n"),
      new GitCommandStep(["add", "."]),
      new GitCommandStep(["commit", "-m", "feature"]),
      new GitCommandStep(["checkout", baseBranch]),
    ]);

    await scenario.execute(runtime.repo);

    const baseTipSha = runtime.repo.run("rev-parse", baseBranch);
    const featureTipSha = runtime.repo.run("rev-parse", "feature");

    const graph = await waitForGraph(
      runtime,
      (candidate) =>
        candidate.edges.some(
          (edge) =>
            edge.sourceId === "head" &&
            edge.targetId === `ref:refs/heads/${baseBranch}`,
        ) &&
        candidate.edges.some(
          (edge) =>
            edge.sourceId === `ref:refs/heads/${baseBranch}` &&
            edge.targetId === `commit:${baseTipSha}`,
        ) &&
        candidate.edges.some(
          (edge) =>
            edge.sourceId === "ref:refs/heads/feature" &&
            edge.targetId === `commit:${featureTipSha}`,
        ),
      30_000,
      "Graph did not converge for checkout existing branch.",
    );

    assertGraphInvariants(graph);
    assertHeadPointsToBranch(graph, baseBranch);
    assertRefPointsToCommit(graph, baseBranch, baseTipSha);
    assertRefPointsToCommit(graph, "feature", featureTipSha);
  });
});
