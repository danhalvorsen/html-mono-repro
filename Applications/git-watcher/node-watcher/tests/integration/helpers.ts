import * as fs from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { GitRepo } from "../fixtures/GitRepo.js";
import { GraphReader } from "../fixtures/GraphReader.js";
import { PollingWaiter } from "../fixtures/PollingWaiter.js";
import { WatcherHost } from "../fixtures/WatcherHost.js";
import type { GraphJsonDocument } from "../fixtures/GraphAssertions.js";

export interface IntegrationRuntime {
  readonly projectRoot: string;
  readonly artifactsDir: string;
  readonly repoDir: string;
  readonly graphOutputPath: string;
  readonly repo: GitRepo;
  readonly watcher: WatcherHost;
  readonly graphReader: GraphReader;
  readonly waiter: PollingWaiter;
}

export function createIntegrationRuntime(importMetaUrl: string, suiteName: string): IntegrationRuntime {
  const testDir = path.dirname(fileURLToPath(importMetaUrl));
  const projectRoot = path.resolve(testDir, "..", "..");
  const artifactsDir = path.join(projectRoot, "tests", "artifacts", suiteName);
  const repoDir = path.join(artifactsDir, "demo");
  const graphOutputPath = path.join(artifactsDir, "graph.json");

  return {
    projectRoot,
    artifactsDir,
    repoDir,
    graphOutputPath,
    repo: new GitRepo(repoDir),
    watcher: new WatcherHost(),
    graphReader: new GraphReader(graphOutputPath),
    waiter: new PollingWaiter(),
  };
}

export async function recreateRepository(runtime: IntegrationRuntime): Promise<void> {
  await fs.mkdir(runtime.artifactsDir, { recursive: true });
  await fs.rm(runtime.repoDir, { recursive: true, force: true });
  await fs.rm(runtime.graphOutputPath, { force: true });
  await fs.mkdir(runtime.repoDir, { recursive: true });
  runtime.repo.initialize();
}

export async function startWatcher(runtime: IntegrationRuntime): Promise<void> {
  runtime.watcher.start(runtime.projectRoot, runtime.repoDir, runtime.graphOutputPath);

  await runtime.waiter.until(
    async () => {
      runtime.watcher.ensureRunning();
      return runtime.graphReader.exists();
    },
    30_000,
    "Watcher did not create initial graph JSON.",
  );
}

export async function restartWithFreshRepository(runtime: IntegrationRuntime): Promise<void> {
  runtime.watcher.stop();
  await recreateRepository(runtime);
  await startWatcher(runtime);
}

export async function waitForGraph(
  runtime: IntegrationRuntime,
  predicate: (graph: GraphJsonDocument) => boolean,
  timeoutMs: number,
  failureMessage: string,
): Promise<GraphJsonDocument> {
  await runtime.waiter.until(
    async () => {
      runtime.watcher.ensureRunning();
      const graph = await runtime.graphReader.read();
      return predicate(graph);
    },
    timeoutMs,
    failureMessage,
  );

  return runtime.graphReader.read();
}
