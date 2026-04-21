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
} from "./helpers.js";

describe("integration/merge-feature-branch", () => {
  const runtime = createIntegrationRuntime(import.meta.url, "merge-feature-branch");

  beforeAll(async () => {
    await restartWithFreshRepository(runtime);
  });

  afterAll(() => {
    runtime.watcher.stop();
  });

  test("merge --no-ff creates merge commit with two parents", async () => {
    await restartWithFreshRepository(runtime);

    const baseBranch = runtime.repo.currentBranch();

    const scenario = new GitScenario("merge feature into base", [
      new WriteFileStep("base.txt", "base\n"),
      new GitCommandStep(["add", "."]),
      new GitCommandStep(["commit", "-m", "base"]),
      new GitCommandStep(["checkout", "-b", "feature"]),
      new WriteFileStep("feature.txt", "feature\n"),
      new GitCommandStep(["add", "."]),
      new GitCommandStep(["commit", "-m", "feature work"]),
      new GitCommandStep(["checkout", baseBranch]),
      new WriteFileStep("main.txt", "main update\n"),
      new GitCommandStep(["add", "."]),
      new GitCommandStep(["commit", "-m", "main work"]),
      new GitCommandStep(["merge", "--no-ff", "feature", "-m", "merge feature"]),
    ]);

    await scenario.execute(runtime.repo);

    const mergeSha = runtime.repo.headSha();
    const firstParentSha = runtime.repo.parentSha("HEAD^1");
    const secondParentSha = runtime.repo.parentSha("HEAD^2");
    const featureSha = runtime.repo.run("rev-parse", "feature");

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
      "Graph did not converge for merge commit.",
    );

    assertGraphInvariants(graph);
    assertHeadPointsToBranch(graph, baseBranch);
    assertRefPointsToCommit(graph, baseBranch, mergeSha);
    assertRefPointsToCommit(graph, "feature", featureSha);
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
