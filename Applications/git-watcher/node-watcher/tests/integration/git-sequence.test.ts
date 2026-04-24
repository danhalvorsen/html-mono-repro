import { afterAll, beforeAll, describe, expect, test } from "vitest";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { GitRepo } from "../fixtures/GitRepo.js";
import { WatcherHost } from "../fixtures/WatcherHost.js";
import { GraphReader } from "../fixtures/GraphReader.js";
import { PollingWaiter } from "../fixtures/PollingWaiter.js";
import { GitScenario } from "../scenarios/GitScenario.js";
import { WriteFileStep } from "../scenarios/steps/WriteFileStep.js";
import { GitCommandStep } from "../scenarios/steps/GitCommandStep.js";
import {
  assertCommitParent,
  assertGraphInvariants,
  assertHeadPointsToBranch,
  assertRefDoesNotPointToCommit,
  assertRefPointsToCommit,
  assertRootCommit,
} from "../fixtures/GraphAssertions.js";

describe("git sequence integration", () => {
  const testDir = path.dirname(fileURLToPath(import.meta.url));
  const projectRoot = path.resolve(testDir, "..", "..");
  const artifactsDir = path.join(projectRoot, "tests", "artifacts", "sequence");
  const repoDir = path.join(artifactsDir, "demo");
  const graphOutputPath = path.join(artifactsDir, "sequence-graph.json");

  const repo = new GitRepo(repoDir);
  const watcher = new WatcherHost();
  const graphReader = new GraphReader(graphOutputPath);
  const waiter = new PollingWaiter();

  async function recreateRepository(): Promise<void> {
    await fs.rm(repoDir, { recursive: true, force: true });
    await fs.rm(graphOutputPath, { force: true });
    await fs.mkdir(repoDir, { recursive: true });
    repo.initialize();
  }

  async function startWatcherForCurrentRepository(): Promise<void> {
    watcher.start(projectRoot, repoDir, graphOutputPath);

    await waiter.until(
      async () => {
        watcher.ensureRunning();
        return graphReader.exists();
      },
      30_000,
      "Watcher did not create initial graph JSON.",
    );
  }

  beforeAll(async () => {
    await fs.mkdir(artifactsDir, { recursive: true });
    await recreateRepository();
    await startWatcherForCurrentRepository();
  });

  afterAll(() => {
    watcher.stop();
  });

  test("first commit", async () => {
    watcher.stop();
    await recreateRepository();
    await startWatcherForCurrentRepository();

    const scenario = new GitScenario("first commit", [
      new WriteFileStep("integration-file.txt", "first\n"),
      new GitCommandStep(["add", "."]),
      new GitCommandStep(["commit", "-m", "first"]),
    ]);

    await scenario.execute(repo);

    const branch = repo.currentBranch();
    const headSha = repo.headSha();

    await waiter.until(
      async () => {
        watcher.ensureRunning();
        const graph = await graphReader.read();

        return graph.edges.some(
          (edge) =>
            edge.sourceId === `ref:refs/heads/${branch}` &&
            edge.targetId === `commit:${headSha}`,
        );
      },
      30_000,
      "Graph did not converge after first commit.",
    );

    const graph = await graphReader.read();

    assertGraphInvariants(graph);
    assertHeadPointsToBranch(graph, branch);
    assertRefPointsToCommit(graph, branch, headSha);
    assertRootCommit(graph, headSha);
  });

  test("second commit", async () => {
    watcher.stop();
    await recreateRepository();
    await startWatcherForCurrentRepository();

    const scenario = new GitScenario("second commit", [
      new WriteFileStep("integration-file.txt", "first\n"),
      new GitCommandStep(["add", "."]),
      new GitCommandStep(["commit", "-m", "first"]),
      new WriteFileStep("integration-file.txt", "second\n"),
      new GitCommandStep(["add", "."]),
      new GitCommandStep(["commit", "-m", "second"]),
    ]);

    await scenario.execute(repo);

    const branch = repo.currentBranch();
    const headSha = repo.headSha();
    const parentSha = repo.parentSha();

    await waiter.until(
      async () => {
        watcher.ensureRunning();
        const graph = await graphReader.read();

        return (
          graph.edges.some(
            (edge) =>
              edge.sourceId === `ref:refs/heads/${branch}` &&
              edge.targetId === `commit:${headSha}`,
          ) &&
          graph.edges.some(
            (edge) =>
              edge.sourceId === `commit:${headSha}` &&
              edge.targetId === `commit:${parentSha}`,
          )
        );
      },
      30_000,
      "Graph did not converge after second commit.",
    );

    const graph = await graphReader.read();

    assertGraphInvariants(graph);
    assertHeadPointsToBranch(graph, branch);
    assertRefPointsToCommit(graph, branch, headSha);
    assertCommitParent(graph, headSha, parentSha);
    assertRefDoesNotPointToCommit(graph, branch, parentSha);
  });

  test("create and checkout a new branch", async () => {
    watcher.stop();
    await recreateRepository();
    await startWatcherForCurrentRepository();

    await repo.writeFile("file.txt", "first\n");
    repo.run("add", ".");
    repo.run("commit", "-m", "first");
    const baseBranch = repo.currentBranch();
    repo.run("checkout", "-b", "feature");

    const activeBranch = repo.currentBranch();
    const baseSha = repo.headSha();

    await waiter.until(
      async () => {
        watcher.ensureRunning();
        const graph = await graphReader.read();

        return (
          graph.nodes.some((node) => node.id === "ref:refs/heads/feature") &&
          graph.edges.some(
            (edge) =>
              edge.sourceId === "head" &&
              edge.targetId === "ref:refs/heads/feature",
          )
        );
      },
      30_000,
      "Feature branch not reflected in graph.",
    );

    const graph = await graphReader.read();
    assertGraphInvariants(graph);

    expect(activeBranch).toBe("feature");
    assertHeadPointsToBranch(graph, "feature");
    assertRefPointsToCommit(graph, "feature", baseSha);
    assertRefPointsToCommit(graph, baseBranch, baseSha);
  });

  test("commit on new branch diverges from base branch", async () => {
    watcher.stop();
    await recreateRepository();
    await startWatcherForCurrentRepository();

    await repo.writeFile("file.txt", "base\n");
    repo.run("add", ".");
    repo.run("commit", "-m", "base");
    const baseBranch = repo.currentBranch();
    repo.run("checkout", "-b", "feature");
    await repo.writeFile("feature.txt", "feature\n");
    repo.run("add", ".");
    repo.run("commit", "-m", "feature commit");

    const featureSha = repo.headSha();
    const baseSha = repo.parentSha();

    await waiter.until(
      async () => {
        watcher.ensureRunning();
        const graph = await graphReader.read();

        return (
          graph.edges.some(
            (edge) =>
              edge.sourceId === "ref:refs/heads/feature" &&
              edge.targetId === `commit:${featureSha}`,
          ) &&
          graph.edges.some(
            (edge) =>
              edge.sourceId === `commit:${featureSha}` &&
              edge.targetId === `commit:${baseSha}`,
          )
        );
      },
      30_000,
      "Branch divergence not reflected in graph.",
    );

    const graph = await graphReader.read();
    assertGraphInvariants(graph);

    assertHeadPointsToBranch(graph, "feature");
    assertRefPointsToCommit(graph, "feature", featureSha);
    assertRefPointsToCommit(graph, baseBranch, baseSha);
    assertCommitParent(graph, featureSha, baseSha);
  });
});
