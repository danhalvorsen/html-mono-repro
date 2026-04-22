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
} from "../integration/helpers.js";

describe("learning/rebase-feature-branch", () => {
  const runtime = createIntegrationRuntime(import.meta.url, "learning/rebase-feature-branch");

  beforeAll(async () => {
    await restartWithFreshRepository(runtime);
  });

  afterAll(() => {
    runtime.watcher.stop();
  });

  test("rebase rewrites feature branch so its tip points to latest base tip", async () => {
    await restartWithFreshRepository(runtime);

    const baseBranch = runtime.repo.currentBranch();

    const scenario = new GitScenario("rebase feature branch", [
      new WriteFileStep("base.txt", "base\n"),
      new GitCommandStep(["add", "."]),
      new GitCommandStep(["commit", "-m", "base commit"]),
      new GitCommandStep(["checkout", "-b", "feature"]),
      new WriteFileStep("feature.txt", "feature v1\n"),
      new GitCommandStep(["add", "."]),
      new GitCommandStep(["commit", "-m", "feature commit"]),
      new GitCommandStep(["checkout", baseBranch]),
      new WriteFileStep("main.txt", "main v2\n"),
      new GitCommandStep(["add", "."]),
      new GitCommandStep(["commit", "-m", "main commit"]),
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
      "Graph did not converge for rebase.",
    );

    assertGraphInvariants(graph);
    assertHeadPointsToBranch(graph, "feature");
    assertRefPointsToCommit(graph, "feature", featureTipSha);
    assertRefPointsToCommit(graph, baseBranch, baseTipSha);
    assertCommitParent(graph, featureTipSha, featureParentSha);
  });
});
