import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";
import {
  assertGraphInvariants,
  type GraphJsonDocument,
} from "../fixtures/GraphAssertions.js";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(testDir, "..", "..");
const artifactsRoot = path.join(projectRoot, "tests", "artifacts");

function collectGraphJsonFiles(directory: string): string[] {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(directory, { withFileTypes: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw error;
  }
  const results: string[] = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (
        entry.name === ".git" ||
        entry.name === "demo" ||
        entry.name === "demo1" ||
        entry.name.startsWith("demo")
      ) {
        continue;
      }
      results.push(...collectGraphJsonFiles(absolutePath));
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    if (!entry.name.endsWith(".json")) {
      continue;
    }

    if (!entry.name.includes("graph")) {
      continue;
    }

    results.push(absolutePath);
  }

  return results.sort((a, b) => a.localeCompare(b));
}

function readGraph(filePath: string): GraphJsonDocument {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw) as GraphJsonDocument;
}

function normalize(filePath: string): string {
  return filePath.split(path.sep).join("/");
}

function toFeatureName(filePath: string): string {
  const normalized = normalize(filePath);

  const learningToken = "/tests/artifacts/learning/";
  if (normalized.includes(learningToken)) {
    return normalized.split(learningToken)[1]?.split("/")[0] ?? "unknown";
  }

  if (normalized.endsWith("/tests/artifacts/git-history-graph.integration.json")) {
    return "legacy-graph";
  }

  if (normalized.includes("/tests/artifacts/second-commit/")) {
    return "second-commit";
  }

  if (normalized.includes("/tests/artifacts/readable-export/")) {
    return "readable-export";
  }

  if (normalized.includes("/tests/artifacts/sequence/")) {
    return "sequence";
  }

  if (normalized.includes("/tests/artifacts/checkout-existing-branch/")) {
    return "checkout-existing-branch";
  }

  if (normalized.includes("/tests/artifacts/merge-feature-branch/")) {
    return "merge-feature-branch";
  }

  if (normalized.includes("/tests/artifacts/rebase-feature-branch/")) {
    return "rebase-feature-branch";
  }

  if (normalized.includes("/tests/artifacts/tag-current-commit/")) {
    return "tag-current-commit";
  }

  return "unknown";
}

function assertHasHeadAndHeadRef(graph: GraphJsonDocument): void {
  expect(graph.nodes.some((node) => node.id === "head")).toBe(true);
  expect(
    graph.edges.some(
      (edge) =>
        edge.sourceId === "head" &&
        edge.targetId.startsWith("ref:refs/heads/"),
    ),
  ).toBe(true);
}

function assertHasCommitParentEdge(graph: GraphJsonDocument): void {
  expect(
    graph.edges.some(
      (edge) =>
        edge.sourceId.startsWith("commit:") &&
        edge.targetId.startsWith("commit:"),
    ),
  ).toBe(true);
}

function assertFeatureGraph(featureName: string, graph: GraphJsonDocument): void {
  switch (featureName) {
    case "legacy-graph":
      assertHasHeadAndHeadRef(graph);
      assertHasCommitParentEdge(graph);
      return;
    case "second-commit":
    case "commit-second":
      assertHasHeadAndHeadRef(graph);
      assertHasCommitParentEdge(graph);
      return;
    case "commit-first":
      assertHasHeadAndHeadRef(graph);
      expect(
        graph.edges.some(
          (edge) =>
            edge.sourceId.startsWith("commit:") &&
            edge.targetId.startsWith("commit:"),
        ),
      ).toBe(false);
      return;
    case "branch-create-and-checkout":
      expect(
        graph.edges.some(
          (edge) =>
            edge.sourceId === "head" &&
            edge.targetId === "ref:refs/heads/feature",
        ),
      ).toBe(true);
      expect(graph.nodes.some((node) => node.id === "ref:refs/heads/master")).toBe(true);
      expect(graph.nodes.some((node) => node.id === "ref:refs/heads/feature")).toBe(true);
      return;
    case "checkout-existing-branch":
      assertHasHeadAndHeadRef(graph);
      expect(graph.nodes.some((node) => node.id === "ref:refs/heads/feature")).toBe(true);
      expect(
        graph.edges.some(
          (edge) =>
            edge.sourceId === "head" && edge.targetId !== "ref:refs/heads/feature",
        ),
      ).toBe(true);
      return;
    case "merge-feature-branch":
    case "merge-no-ff": {
      const mergeCommitIds = new Set<string>();
      for (const edge of graph.edges) {
        if (edge.sourceId.startsWith("commit:") && edge.targetId.startsWith("commit:")) {
          const current = mergeCommitIds.has(edge.sourceId)
            ? 2
            : graph.edges.filter(
              (candidate) =>
                candidate.sourceId === edge.sourceId &&
                candidate.targetId.startsWith("commit:"),
            ).length;
          if (current >= 2) {
            mergeCommitIds.add(edge.sourceId);
          }
        }
      }
      expect(mergeCommitIds.size).toBeGreaterThan(0);
      return;
    }
    case "rebase-feature-branch":
      expect(
        graph.edges.some(
          (edge) =>
            edge.sourceId === "head" &&
            edge.targetId === "ref:refs/heads/feature",
        ),
      ).toBe(true);
      assertHasCommitParentEdge(graph);
      return;
    case "tag-current-commit":
      assertHasHeadAndHeadRef(graph);
      expect(graph.nodes.some((node) => node.id === "ref:refs/tags/v1")).toBe(true);
      expect(
        graph.edges.some(
          (edge) =>
            edge.sourceId === "ref:refs/tags/v1" &&
            edge.targetId.startsWith("commit:"),
        ),
      ).toBe(true);
      return;
    case "readable-export":
      assertHasHeadAndHeadRef(graph);
      expect(
        graph.nodes.every((node) =>
          node.payload === undefined ||
          node.payload.label === undefined ||
          typeof node.payload.label === "string",
        ),
      ).toBe(true);
      return;
    case "sequence":
      assertHasHeadAndHeadRef(graph);
      expect(graph.nodes.some((node) => node.id === "ref:refs/heads/feature")).toBe(true);
      assertHasCommitParentEdge(graph);
      return;
    default:
      throw new Error(`No feature assertion mapping for '${featureName}'.`);
  }
}

describe("artifact feature graphs", () => {
  const graphFiles = collectGraphJsonFiles(artifactsRoot);
  const graphArtifacts = graphFiles.map((graphFilePath) => ({
    graphFilePath,
    featureName: toFeatureName(graphFilePath),
    graph: readGraph(graphFilePath),
  }));

  test("discovers artifact graph files", () => {
    expect(graphArtifacts.length).toBeGreaterThan(0);
  });

  test.each(graphArtifacts)("validates $graphFilePath", ({ featureName, graph }) => {
    assertGraphInvariants(graph);
    assertFeatureGraph(featureName, graph);
  });
});
