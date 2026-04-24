import * as fs from "node:fs/promises";
import { GitTestRepository } from "./GitTestRepository.js";
import { WatcherHost } from "./WatcherHost.js";
import type { GraphJson } from "./GraphAssertions.js";

export class IntegrationFixture {
  public readonly repo: GitTestRepository;
  public readonly watcher: WatcherHost;

  public constructor(
    public readonly projectRoot: string,
    public readonly artifactsDir: string,
    public readonly demoProjectDir: string,
    public readonly graphOutputPath: string,
  ) {
    this.repo = new GitTestRepository(demoProjectDir);
    this.watcher = new WatcherHost();
  }

  public async setup(): Promise<void> {
    await fs.mkdir(this.artifactsDir, { recursive: true });
    await fs.rm(this.demoProjectDir, { recursive: true, force: true });
    await fs.rm(this.graphOutputPath, { force: true });
    await fs.mkdir(this.demoProjectDir, { recursive: true });

    this.repo.initialize();
    this.watcher.start(this.projectRoot, this.demoProjectDir, this.graphOutputPath);
  }

  public teardown(): void {
    this.watcher.stop();
  }

  public async readGraph(): Promise<GraphJson> {
    const raw = await fs.readFile(this.graphOutputPath, "utf8");
    return JSON.parse(raw) as GraphJson;
  }

  public async waitFor(
    condition: () => Promise<boolean>,
    timeoutMs: number,
    message: string,
  ): Promise<void> {
    const until = Date.now() + timeoutMs;

    while (Date.now() < until) {
      this.watcher.ensureRunning();

      if (await condition()) {
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    throw new Error(message);
  }

  public async waitForGraph(
    predicate: (graph: GraphJson) => boolean | Promise<boolean>,
    timeoutMs: number,
    message: string,
  ): Promise<GraphJson> {
    let latestGraph: GraphJson | null = null;

    await this.waitFor(
      async () => {
        try {
          const graph = await this.readGraph();
          latestGraph = graph;
          return await predicate(graph);
        } catch {
          return false;
        }
      },
      timeoutMs,
      message,
    );

    if (latestGraph === null) {
      throw new Error(message);
    }

    return latestGraph;
  }
}
