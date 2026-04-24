import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { fileURLToPath } from "node:url";
import * as path from "node:path";
import { IntegrationFixture } from "../fixtures/IntegrationFixture.js";
import { expectGraphInvariants } from "../fixtures/GraphAssertions.js";

interface NodeWithPayload {
  id: string;
  payload: Record<string, unknown>;
}

const testDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(testDir, "..", "..");
const artifactsDir = path.join(projectRoot, "tests", "artifacts", "readable-export");
const demoProjectDir = path.join(artifactsDir, "demo1");
const graphOutputPath = path.join(artifactsDir, "git-history-graph.integration.json");
const fixture = new IntegrationFixture(projectRoot, artifactsDir, demoProjectDir, graphOutputPath);

describe("integration/readableExport", () => {
  beforeAll(async () => {
    await fixture.setup();

    await fixture.waitForGraph(
      () => true,
      30_000,
      "Watcher did not produce graph JSON.",
    );
  });

  afterAll(() => {
    fixture.teardown();
  });

  test("exports readable labels while keeping sha identity", async () => {
    await fixture.repo.writeFile("readable.txt", "payload\n");
    fixture.repo.git("add", ".");
    fixture.repo.git("commit", "-m", "readable export");

    const branch = fixture.repo.git("branch", "--show-current");
    const headSha = fixture.repo.git("rev-parse", "HEAD");
    const commitNodeId = `commit:${headSha}`;
    const refNodeId = `ref:refs/heads/${branch}`;

    const graph = await fixture.waitForGraph(
      async (candidate) => {
        const nodeIds = new Set(candidate.nodes.map((node) => node.id));
        if (!nodeIds.has(commitNodeId) || !nodeIds.has(refNodeId) || !nodeIds.has("head")) {
          return false;
        }

        return candidate.edges.some(
          (edge) => edge.sourceId === refNodeId && edge.targetId === commitNodeId,
        );
      },
      30_000,
      "Graph did not converge to readable export state.",
    );

    expectGraphInvariants(graph);

    const nodes = graph.nodes as NodeWithPayload[];
    const headNode = nodes.find((node) => node.id === "head");
    const refNode = nodes.find((node) => node.id === refNodeId);
    const commitNode = nodes.find((node) => node.id === commitNodeId);

    expect(headNode).toBeDefined();
    expect(headNode?.payload.type).toBe("head");
    expect(headNode?.payload.label).toBe("HEAD");

    expect(refNode).toBeDefined();
    expect(refNode?.payload.type).toBe("ref");
    expect(refNode?.payload.refName).toBe(`refs/heads/${branch}`);
    expect(refNode?.payload.shortName).toBe(branch);
    expect(refNode?.payload.label).toBe(branch);

    expect(commitNode).toBeDefined();
    expect(commitNode?.payload.type).toBe("commit");
    expect(commitNode?.payload.sha).toBe(headSha);
    expect(commitNode?.payload.shortSha).toBe(headSha.slice(0, 7));
    expect(String(commitNode?.payload.label ?? "")).toContain(headSha.slice(0, 7));
    expect(String(commitNode?.payload.label ?? "")).toContain("readable export");
    expect(commitNode?.payload.message).toBe("readable export");
    expect(commitNode?.payload.author).toBe("Integration Test");
    expect(commitNode?.payload.isHead).toBe(true);
    expect(commitNode?.payload.branchTips).toEqual([branch]);
  });
});
