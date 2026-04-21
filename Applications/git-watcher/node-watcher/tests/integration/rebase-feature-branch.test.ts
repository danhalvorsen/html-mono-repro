import { afterAll, beforeAll, describe, test } from "vitest";
import { GitScenario } from "../scenarios/GitScenario.js";
import { GitCommandStep } from "../scenarios/steps/GitCommandStep.js";
import { WriteFileStep } from "../scenarios/steps/WriteFileStep.js";
import {
  assertCommitParent,
  assertGraphInvariants,
  assertHeadPointsToBranch,
  assertRefPointsToCommit,
} from "../fixtures/GraphAssertions.js";
import {
  createIntegrationRuntime,
  restartWithFreshRepository,
  waitForGraph,
} from "./helpers.js";

describe("integration/rebase-feature-branch", () => {
  const runtime = createIntegrationRuntime(import.meta.url, "rebase-feature-branch");

  beforeAll(async () => {
    await restartWithFreshRepository(runtime);
  });

  afterAll(() => {
    runtime.watcher.stop();
  });

  test("rebase feature onto base branch rewrites feature tip parent", async () => {
    await restartWithFreshRepository(runtime);

    const baseBranch = runtime.repo.currentBranch();

    const scenario = new GitScenario("rebase feature", [
      new WriteFileStep("base.txt", "base\n"),
      new GitCommandStep(["add", "."]),
      new GitCommandStep(["commit", "-m", "base"]),
      new GitCommandStep(["checkout", "-b", "feature"]),
      new WriteFileStep("feature.txt", "feature v1\n"),
      new GitCommandStep(["add", "."]),
      new GitCommandStep(["commit", "-m", "feature work"]),
      new GitCommandStep(["checkout", baseBranch]),
      new WriteFileStep("main.txt", "main v2\n"),
      new GitCommandStep(["add", "."]),
      new GitCommandStep(["commit", "-m", "main work"]),
      new GitCommandStep(["checkout", "feature"]),
      new GitCommandStep(["rebase", baseBranch]),
    ]);

    await scenario.execute(runtime.repo);

    const featureTipSha = runtime.repo.headSha();
    const featureParentSha = runtime.repo.parentSha();
    const baseTipSha = runtime.repo.run("rev-parse", baseBranch);

    const graph = await waitForGraph(
      runtime,
      (candidate) =>
        candidate.edges.some(
          (edge) =>
            edge.sourceId === "ref:refs/heads/feature" &&
            edge.targetId === `commit:${featureTipSha}`,
        ) &&
        candidate.edges.some(
          (edge) =>
            edge.sourceId === `commit:${featureTipSha}` &&
            edge.targetId === `commit:${baseTipSha}`,
        ) &&
        candidate.edges.some(
          (edge) =>
            edge.sourceId === `ref:refs/heads/${baseBranch}` &&
            edge.targetId === `commit:${baseTipSha}`,
        ),
      30_000,
      "Graph did not converge for feature rebase.",
    );

    assertGraphInvariants(graph);
    assertHeadPointsToBranch(graph, "feature");
    assertRefPointsToCommit(graph, "feature", featureTipSha);
    assertRefPointsToCommit(graph, baseBranch, baseTipSha);
    assertCommitParent(graph, featureTipSha, featureParentSha);
  });
});
