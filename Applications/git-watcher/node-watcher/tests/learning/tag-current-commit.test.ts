import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { GitScenario } from "../scenarios/GitScenario.js";
import { GitCommandStep } from "../scenarios/steps/GitCommandStep.js";
import { WriteFileStep } from "../scenarios/steps/WriteFileStep.js";
import {
  assertGraphInvariants,
  assertRefPointsToCommit,
} from "../fixtures/GraphAssertions.js";
import {
  createIntegrationRuntime,
  restartWithFreshRepository,
  waitForGraph,
} from "../integration/helpers.js";

describe("learning/tag-current-commit", () => {
  const runtime = createIntegrationRuntime(import.meta.url, "learning/tag-current-commit");

  beforeAll(async () => {
    await restartWithFreshRepository(runtime);
  });

  afterAll(() => {
    runtime.watcher.stop();
  });

  test("tag creates a refs/tags edge to the current commit", async () => {
    await restartWithFreshRepository(runtime);

    const scenario = new GitScenario("tag current commit", [
      new WriteFileStep("file.txt", "base\n"),
      new GitCommandStep(["add", "."]),
      new GitCommandStep(["commit", "-m", "base commit"]),
      new GitCommandStep(["tag", "v1"]),
    ]);

    await scenario.execute(runtime.repo);

    const headSha = runtime.repo.headSha();
    const branch = runtime.repo.currentBranch();
    const tagRefId = "ref:refs/tags/v1";

    const graph = await waitForGraph(
      runtime,
      (candidate) =>
        candidate.nodes.some((node) => node.id === tagRefId) &&
        candidate.edges.some(
          (edge) =>
            edge.sourceId === tagRefId &&
            edge.targetId === `commit:${headSha}`,
        ),
      30_000,
      "Graph did not converge for tag.",
    );

    assertGraphInvariants(graph);
    assertRefPointsToCommit(graph, branch, headSha);
    expect(
      graph.edges.some(
        (edge) =>
          edge.sourceId === tagRefId &&
          edge.targetId === `commit:${headSha}`,
      ),
    ).toBe(true);
  });
});
