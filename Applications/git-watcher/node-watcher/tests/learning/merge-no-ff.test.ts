import { afterAll, beforeAll, describe, expect, test } from "vitest";
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

describe("learning/merge-no-ff", () => {
  const runtime = createIntegrationRuntime(import.meta.url, "learning/merge-no-ff");

  beforeAll(async () => {
    await restartWithFreshRepository(runtime);
  });

  afterAll(() => {
    runtime.watcher.stop();
  });

  test("merge --no-ff creates a merge commit with two parents", async () => {
    await restartWithFreshRepository(runtime);

    const baseBranch = runtime.repo.currentBranch();

    const scenario = new GitScenario("merge feature branch", [
      new WriteFileStep("base.txt", "base\n"),
      new GitCommandStep(["add", "."]),
      new GitCommandStep(["commit", "-m", "base commit"]),
      new GitCommandStep(["checkout", "-b", "feature"]),
      new WriteFileStep("feature.txt", "feature\n"),
      new GitCommandStep(["add", "."]),
      new GitCommandStep(["commit", "-m", "feature commit"]),
      new GitCommandStep(["checkout", baseBranch]),
      new WriteFileStep("main.txt", "main\n"),
      new GitCommandStep(["add", "."]),
      new GitCommandStep(["commit", "-m", "main commit"]),
      new GitCommandStep(["merge", "--no-ff", "feature", "-m", "merge feature"]),
    ]);

    await scenario.execute(runtime.repo);

    const mergeSha = runtime.repo.headSha();
    const firstParentSha = runtime.repo.parentSha("HEAD^1");
    const secondParentSha = runtime.repo.parentSha("HEAD^2");
    const featureTipSha = runtime.repo.run("rev-parse", "feature");

    const graph = await waitForGraph(
      runtime,
      (candidate) =>
        candidate.edges.some(
          (edge) =>
            edge.sourceId === `ref:refs/heads/${baseBranch}` &&
            edge.targetId === `commit:${mergeSha}`,
        ) &&
        candidate.edges.some(
          (edge) =>
            edge.sourceId === `commit:${mergeSha}` &&
            edge.targetId === `commit:${firstParentSha}`,
        ) &&
        candidate.edges.some(
          (edge) =>
            edge.sourceId === `commit:${mergeSha}` &&
            edge.targetId === `commit:${secondParentSha}`,
        ),
      30_000,
      "Graph did not converge for merge --no-ff.",
    );

    assertGraphInvariants(graph);
    assertHeadPointsToBranch(graph, baseBranch);
    assertRefPointsToCommit(graph, baseBranch, mergeSha);
    assertRefPointsToCommit(graph, "feature", featureTipSha);
    assertCommitParent(graph, mergeSha, firstParentSha);
    assertCommitParent(graph, mergeSha, secondParentSha);

    const mergeParentEdges = graph.edges.filter(
      (edge) =>
        edge.sourceId === `commit:${mergeSha}` &&
        edge.targetId.startsWith("commit:"),
    );

    expect(mergeParentEdges).toHaveLength(2);
  });
});
