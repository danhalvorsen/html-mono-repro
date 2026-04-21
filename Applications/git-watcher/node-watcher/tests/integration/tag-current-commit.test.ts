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
} from "./helpers.js";

describe("integration/tag-current-commit", () => {
  const runtime = createIntegrationRuntime(import.meta.url, "tag-current-commit");

  beforeAll(async () => {
    await restartWithFreshRepository(runtime);
  });

  afterAll(() => {
    runtime.watcher.stop();
  });

  test("creating a tag adds tag ref that points to current commit", async () => {
    await restartWithFreshRepository(runtime);

    const scenario = new GitScenario("tag current commit", [
      new WriteFileStep("file.txt", "base\n"),
      new GitCommandStep(["add", "."]),
      new GitCommandStep(["commit", "-m", "base"]),
      new GitCommandStep(["tag", "v1"]),
    ]);

    await scenario.execute(runtime.repo);

    const headSha = runtime.repo.headSha();
    const activeBranch = runtime.repo.currentBranch();
    const tagNodeId = "ref:refs/tags/v1";

    const graph = await waitForGraph(
      runtime,
      (candidate) =>
        candidate.nodes.some((node) => node.id === tagNodeId) &&
        candidate.edges.some(
          (edge) =>
            edge.sourceId === tagNodeId &&
            edge.targetId === `commit:${headSha}`,
        ),
      30_000,
      "Graph did not converge for tag creation.",
    );

    assertGraphInvariants(graph);
    assertRefPointsToCommit(graph, activeBranch, headSha);
    expect(
      graph.edges.some(
        (edge) =>
          edge.sourceId === tagNodeId &&
          edge.targetId === `commit:${headSha}`,
      ),
    ).toBe(true);
  });
});
