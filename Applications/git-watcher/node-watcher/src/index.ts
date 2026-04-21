// src/index.ts
// Read-only Git folder watchdog.
// Watches the resolved .git directory and logs file changes to console.
// No writes. No mutation of repository state.

import { watch, type FSWatcher } from "node:fs";
import { promises as fs } from "node:fs";
import { createRequire } from "node:module";
import * as path from "node:path";
import { parseArgs } from "node:util";
import { pathToFileURL } from "node:url";
import { inflateSync } from "node:zlib";
import { Graph } from "@monorepo/core-graph";
import { GraphJsonSerializer } from "@monorepo/core-graph-json";
import { DevLogger } from "@monorepo/core-logger-nodejs";
import type { ILogger, ILogParams } from "@monorepo/core-logger-nodejs";
import { NodeFileSystem as CoreNodeFileSystem } from "@monorepo/core-filesystem";
import {
  isTransientGitPath,
  type GitFileChange,
  type GitFileChangeKind,
  type GitSemanticEvent,
} from "./domain/GitDomain.js";
export {
  isTransientGitPath,
  type GitFileChange,
  type GitFileChangeKind,
  type GitSemanticEvent,
} from "./domain/GitDomain.js";
export type { GitSemanticEventKind } from "./domain/GitDomain.js";
export {
  GitSemanticEventClassifier,
  type IGitSemanticEventFactory,
  type IGitSemanticEventRule,
  type ITransientGitPathPolicy,
} from "./Features/semantic-events/GitSemanticEventClassifier.js";
import { GitSemanticEventClassifier } from "./Features/semantic-events/GitSemanticEventClassifier.js";

export interface IClock {
  nowIsoUtc(): string;
}

export interface IPathService {
  resolve(...segments: readonly string[]): string;
  dirname(value: string): string;
  basename(value: string): string;
  relative(from: string, to: string): string;
  normalize(value: string): string;
  join(...segments: readonly string[]): string;
}

export interface IFileSystemEntry {
  readonly absolutePath: string;
  readonly isDirectory: boolean;
}

export interface IFileSystem {
  readUtf8File(filePath: string): Promise<string>;
  writeUtf8File(filePath: string, content: string): Promise<void>;
  pathExists(targetPath: string): Promise<boolean>;
  getEntry(targetPath: string): Promise<IFileSystemEntry | null>;
  readDirectory(directoryPath: string): Promise<readonly IFileSystemEntry[]>;
  createWatcher(
    directoryPath: string,
    onEvent: (eventType: string, fileName: string | null) => void,
    onError: (error: unknown) => void,
  ): FSWatcher;
}

export interface IGitDirectoryResolver {
  resolveRepositoryGitDirectory(repositoryPath: string): Promise<string>;
}

export interface IGitWatchdog {
  start(): Promise<void>;
  stop(): Promise<void>;
}

export interface IGitWatchdogFactory {
  create(options: GitWatchdogOptions): IGitWatchdog;
}

export interface GitWatchdogOptions {
  readonly repositoryPath: string;
  readonly includeObjectDirectories?: boolean;
  readonly ignoredRelativePaths?: readonly string[];
  readonly graphOutputJsonPath?: string;
}

export interface IGitFileChangeClassifier {
  classify(targetPath: string, watcherEventType: string): Promise<GitFileChangeKind>;
}

export interface IGitFileChangeSink {
  write(change: GitFileChange): void;
}

export interface IGitSemanticEventClassifier {
  classify(change: GitFileChange): readonly GitSemanticEvent[];
}

export interface IGitSemanticEventSink {
  write(event: GitSemanticEvent): void;
}

export class SystemClock implements IClock {
  public nowIsoUtc(): string {
    return new Date().toISOString();
  }
}

export class CoreLoggerAdapter implements ILogger {
  private readonly logger = new DevLogger("git-watcher");

  public info(template: string, params?: ILogParams): void {
    if (params === undefined) {
      this.logger.info(template);
      return;
    }

    this.logger.info(template, params);
  }

  public warn(template: string, params?: ILogParams): void {
    if (params === undefined) {
      this.logger.warn(template);
      return;
    }

    this.logger.warn(template, params);
  }

  public error(template: string, params?: ILogParams): void {
    if (params === undefined) {
      this.logger.error(template);
      return;
    }

    this.logger.error(template, params);
  }

  public debug(template: string, params?: ILogParams): void {
    if (params === undefined) {
      this.logger.debug(template);
      return;
    }

    this.logger.debug(template, params);
  }
}

export class NodePathService implements IPathService {
  public resolve(...segments: readonly string[]): string {
    return path.resolve(...segments);
  }

  public dirname(value: string): string {
    return path.dirname(value);
  }

  public basename(value: string): string {
    return path.basename(value);
  }

  public relative(from: string, to: string): string {
    return path.relative(from, to);
  }

  public normalize(value: string): string {
    return path.normalize(value);
  }

  public join(...segments: readonly string[]): string {
    return path.join(...segments);
  }
}

export class NodeFileSystem implements IFileSystem {
  public constructor(
    private readonly fileSystem: CoreNodeFileSystem = new CoreNodeFileSystem(),
  ) {}

  public async readUtf8File(filePath: string): Promise<string> {
    return this.fileSystem.readFile(filePath, "utf8");
  }

  public async writeUtf8File(filePath: string, content: string): Promise<void> {
    this.fileSystem.writeFile(filePath, content, "utf8");
  }

  public async pathExists(targetPath: string): Promise<boolean> {
    return this.fileSystem.exists(targetPath);
  }

  public async getEntry(targetPath: string): Promise<IFileSystemEntry | null> {
    if (!this.fileSystem.exists(targetPath)) {
      return null;
    }

    try {
      this.fileSystem.readdir(targetPath);
      return { absolutePath: targetPath, isDirectory: true };
    } catch {
      try {
        this.fileSystem.readFile(targetPath, "utf8");
        return { absolutePath: targetPath, isDirectory: false };
      } catch {
        return null;
      }
    }
  }

  public async readDirectory(directoryPath: string): Promise<readonly IFileSystemEntry[]> {
    const entries = this.fileSystem.readdir(directoryPath);

    return entries.map((entry) => ({
      absolutePath: path.join(directoryPath, entry.name),
      isDirectory: entry.isDirectory,
    }));
  }

  public createWatcher(
    directoryPath: string,
    onEvent: (eventType: string, fileName: string | null) => void,
    onError: (error: unknown) => void,
  ): FSWatcher {
    const watcher = watch(directoryPath, { persistent: true }, (eventType, fileName) => {
      onEvent(eventType, fileName?.toString() ?? null);
    });

    watcher.on("error", onError);

    return watcher;
  }
}

export class GitDirectoryResolver implements IGitDirectoryResolver {
  public constructor(
    private readonly fileSystem: IFileSystem,
    private readonly pathService: IPathService,
  ) {}

  public async resolveRepositoryGitDirectory(repositoryPath: string): Promise<string> {
    const repositoryAbsolutePath = this.pathService.resolve(repositoryPath);

    if (this.pathService.basename(repositoryAbsolutePath) === ".git") {
      const directEntry = await this.fileSystem.getEntry(repositoryAbsolutePath);

      if (directEntry === null) {
        throw new Error(`.git was not found at '${repositoryAbsolutePath}'.`);
      }

      if (directEntry.isDirectory) {
        return repositoryAbsolutePath;
      }

      const fileContent = await this.fileSystem.readUtf8File(repositoryAbsolutePath);
      const trimmed = fileContent.trim();

      if (!trimmed.startsWith("gitdir:")) {
        throw new Error(`Unsupported .git file format at '${repositoryAbsolutePath}'.`);
      }

      const rawGitDir = trimmed.substring("gitdir:".length).trim();
      const resolvedGitDir = path.isAbsolute(rawGitDir)
        ? rawGitDir
        : this.pathService.resolve(this.pathService.dirname(repositoryAbsolutePath), rawGitDir);
      const resolvedEntry = await this.fileSystem.getEntry(resolvedGitDir);

      if (resolvedEntry === null || !resolvedEntry.isDirectory) {
        throw new Error(`Resolved git directory '${resolvedGitDir}' does not exist.`);
      }

      return resolvedGitDir;
    }

    const dotGitPath = this.pathService.join(repositoryAbsolutePath, ".git");
    const entry = await this.fileSystem.getEntry(dotGitPath);

    if (entry === null) {
      throw new Error(`.git was not found at '${dotGitPath}'.`);
    }

    if (entry.isDirectory) {
      return dotGitPath;
    }

    const fileContent = await this.fileSystem.readUtf8File(dotGitPath);
    const trimmed = fileContent.trim();

    if (!trimmed.startsWith("gitdir:")) {
      throw new Error(`Unsupported .git file format at '${dotGitPath}'.`);
    }

    const rawGitDir = trimmed.substring("gitdir:".length).trim();
    const resolvedGitDir = path.isAbsolute(rawGitDir)
      ? rawGitDir
      : this.pathService.resolve(repositoryAbsolutePath, rawGitDir);

    const resolvedEntry = await this.fileSystem.getEntry(resolvedGitDir);

    if (resolvedEntry === null || !resolvedEntry.isDirectory) {
      throw new Error(`Resolved git directory '${resolvedGitDir}' does not exist.`);
    }

    return resolvedGitDir;
  }
}

export class GitFileChangeClassifier implements IGitFileChangeClassifier {
  public constructor(private readonly fileSystem: IFileSystem) {}

  public async classify(targetPath: string, watcherEventType: string): Promise<GitFileChangeKind> {
    if (watcherEventType === "change") {
      return "changed";
    }

    if (watcherEventType !== "rename") {
      return "unknown";
    }

    const exists = await this.fileSystem.pathExists(targetPath);
    return exists ? "created" : "deleted";
  }
}

export class ConsoleGitFileChangeSink implements IGitFileChangeSink {
  public constructor(
    private readonly logger: ILogger,
    private readonly semanticClassifier?: IGitSemanticEventClassifier,
    private readonly semanticSink?: IGitSemanticEventSink,
  ) {}

  public write(change: GitFileChange): void {
    this.logger.info(
      `[${change.timestampUtc}] ${change.kind.toUpperCase()} ${change.relativePath} (fs:${change.watcherEventType})`,
    );

    if (this.semanticClassifier === undefined || this.semanticSink === undefined) {
      return;
    }

    const events = this.semanticClassifier.classify(change);

    for (const event of events) {
      this.semanticSink.write(event);
    }
  }
}

export class ConsoleGitSemanticEventSink implements IGitSemanticEventSink {
  public constructor(
    private readonly logger: ILogger,
    private readonly semanticGraph: GitSemanticEventGraph,
  ) {}

  public write(event: GitSemanticEvent): void {
    this.semanticGraph.append(event);
    this.logger.info(`  -> ${event.description}`);
  }
}

export class GitSemanticEventGraph {
  private readonly graph = new Graph();
  private previousNode: ReturnType<Graph["addNode"]> | null = null;
  private sequence = 0;

  public append(event: GitSemanticEvent): void {
    this.sequence += 1;
    const nodeId = `${event.timestampUtc}#${this.sequence}`;
    const node = this.graph.addNode(nodeId, event);

    if (this.previousNode !== null) {
      this.graph.addEdge(this.previousNode, node);
    }

    this.previousNode = node;
  }
}

interface GitCommitNodePayload {
  readonly type: "commit";
  readonly sha: string;
  readonly shortSha: string;
  label: string;
  message?: string;
  author?: string;
  branchTips: string[];
  tagNames: string[];
  isHead: boolean;
}

interface GitRefNodePayload {
  readonly type: "ref";
  readonly refName: string;
  readonly shortName: string;
  readonly label: string;
}

interface GitHeadNodePayload {
  readonly type: "head";
  readonly label: "HEAD";
}

export class GitHistoryGraphMaintainer {
  private readonly graph = new Graph();
  private readonly nodeById = new Map<string, ReturnType<Graph["addNode"]>>();
  private readonly edgeKeys = new Set<string>();
  private readonly currentPointerTargetBySource = new Map<string, string>();
  private readonly expandedCommitShas = new Set<string>();
  private readonly commitPayloadBySha = new Map<string, GitCommitNodePayload>();
  private readonly serializer = new GraphJsonSerializer();
  private gitDirectoryPath: string | null = null;
  private pendingUpdate: Promise<void> = Promise.resolve();

  public constructor(
    private readonly fileSystem: IFileSystem,
    private readonly logger: ILogger,
    private readonly outputJsonPath: string,
  ) {}

  public async initialize(gitDirectoryPath: string): Promise<void> {
    this.pendingUpdate = this.pendingUpdate.then(() => this.initializeInternal(gitDirectoryPath));
    return this.pendingUpdate;
  }

  private async initializeInternal(gitDirectoryPath: string): Promise<void> {
    this.gitDirectoryPath = gitDirectoryPath;
    const logsHeadPath = path.join(gitDirectoryPath, "logs", "HEAD");
    const logsHeadContent = await this.readFileSafe(logsHeadPath);

    if (logsHeadContent !== null) {
      const lines = logsHeadContent
        .split(/\r?\n/u)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      for (const line of lines) {
        await this.applyReflogLine(line);
      }
    }

    const headPath = path.join(gitDirectoryPath, "HEAD");
    const headContent = await this.readFileSafe(headPath);

    if (headContent !== null) {
      const trimmedHead = headContent.trim();
      await this.updateHeadPointer(trimmedHead, gitDirectoryPath);

      if (trimmedHead.startsWith("ref:")) {
        const refName = trimmedHead.substring("ref:".length).trim();
        const refPath = path.join(gitDirectoryPath, ...refName.split("/"));
        const refValue = await this.readFileSafe(refPath);

        if (refValue !== null) {
          const sha = refValue.trim();

          if (/^[0-9a-f]{40}$/u.test(sha)) {
            const refNode = this.ensureRefNode(refName);
            const commitNode = await this.ensureCommitNodeWithParents(sha);

            if (commitNode !== null) {
              this.ensurePointerEdge(refNode, commitNode);
            }
          }
        }
      } else if (/^[0-9a-f]{40}$/u.test(trimmedHead)) {
        await this.ensureCommitNodeWithParents(trimmedHead);
      }
    }

    await this.persist();
  }

  public async handle(change: GitFileChange): Promise<void> {
    this.pendingUpdate = this.pendingUpdate.then(() => this.handleInternal(change));
    return this.pendingUpdate;
  }

  private async handleInternal(change: GitFileChange): Promise<void> {
    if (isTransientGitPath(change.relativePath)) {
      return;
    }

    if (change.relativePath === "HEAD") {
      await this.handleHeadChange(change);
      return;
    }

    if (this.isLooseObjectPath(change.relativePath)) {
      const sha = this.shaFromLooseObjectPath(change.relativePath);

      if (sha !== null) {
        await this.ensureCommitNodeWithParents(sha);
        await this.persist();
      }
    }

    if (change.relativePath.startsWith("logs/")) {
      await this.handleReflogChange(change);
      return;
    }

    if (change.relativePath.startsWith("refs/heads/") || change.relativePath.startsWith("refs/tags/")) {
      await this.handleRefChange(change);
    }
  }

  private async handleReflogChange(change: GitFileChange): Promise<void> {
    const content = await this.readFileSafe(change.absolutePath);

    if (content === null) {
      return;
    }

    const lines = content.split(/\r?\n/u).map((line) => line.trim()).filter((line) => line.length > 0);
    const lastLine = lines.at(-1);

    if (lastLine === undefined) {
      return;
    }

    await this.applyReflogLine(lastLine);

    await this.persist();
  }

  private async handleRefChange(change: GitFileChange): Promise<void> {
    const refName = change.relativePath;
    const content = await this.readFileSafe(change.absolutePath);

    if (content === null) {
      return;
    }

    const sha = content.trim();

    if (!/^[0-9a-f]{40}$/u.test(sha)) {
      return;
    }

    const refNode = this.ensureRefNode(refName);
    const commitNode = await this.ensureCommitNodeWithParents(sha);

    if (commitNode !== null) {
      this.ensurePointerEdge(refNode, commitNode);
      await this.persist();
    }
  }

  private async handleHeadChange(change: GitFileChange): Promise<void> {
    if (this.gitDirectoryPath === null) {
      return;
    }

    const content = await this.readFileSafe(change.absolutePath);

    if (content === null) {
      return;
    }

    await this.updateHeadPointer(content.trim(), this.gitDirectoryPath);
    await this.persist();
  }

  private tryParseReflogLine(line: string): { previousSha: string; nextSha: string } | null {
    const match = /^([0-9a-f]{40}) ([0-9a-f]{40})\s/u.exec(line);

    if (match === null || match[1] === undefined || match[2] === undefined) {
      return null;
    }

    return {
      previousSha: match[1],
      nextSha: match[2],
    };
  }

  private async applyReflogLine(line: string): Promise<void> {
    const parsed = this.tryParseReflogLine(line);

    if (parsed === null) {
      return;
    }

    await this.ensureCommitNodeWithParents(parsed.previousSha);
    await this.ensureCommitNodeWithParents(parsed.nextSha);
  }

  private async ensureCommitNodeWithParents(sha: string): Promise<ReturnType<Graph["addNode"]> | null> {
    if (/^0{40}$/u.test(sha)) {
      return null;
    }

    const commitNode = this.ensureCommitNode(sha);

    if (this.expandedCommitShas.has(sha)) {
      return commitNode;
    }

    this.expandedCommitShas.add(sha);
    const parsedCommit = await this.tryReadLooseCommitObject(sha);

    if (parsedCommit === null) {
      this.refreshReadableMetadata();
      return commitNode;
    }

    const payload = this.commitPayloadBySha.get(sha);

    if (payload !== undefined) {
      if (parsedCommit.message !== null) {
        payload.message = parsedCommit.message;
      }

      if (parsedCommit.author !== null) {
        payload.author = parsedCommit.author;
      }
    }

    for (const parentSha of parsedCommit.parents) {
      const parentNode = await this.ensureCommitNodeWithParents(parentSha);

      if (parentNode !== null) {
        // Commit DAG edge direction in this graph: commit -> parent.
        this.ensureEdge(commitNode, parentNode);
      }
    }

    this.refreshReadableMetadata();
    return commitNode;
  }

  private async tryReadLooseCommitObject(
    sha: string,
  ): Promise<{
    readonly parents: readonly string[];
    readonly message: string | null;
    readonly author: string | null;
  } | null> {
    if (this.gitDirectoryPath === null) {
      return null;
    }

    const objectPath = path.join(
      this.gitDirectoryPath,
      "objects",
      sha.slice(0, 2),
      sha.slice(2),
    );

    try {
      const compressed = await fs.readFile(objectPath);
      const raw = inflateSync(compressed);
      const nulIndex = raw.indexOf(0x00);

      if (nulIndex < 0) {
        return null;
      }

      const header = raw.subarray(0, nulIndex).toString("utf8");
      const body = raw.subarray(nulIndex + 1).toString("utf8");

      if (!header.startsWith("commit ")) {
        return null;
      }

      const parents: string[] = [];
      let author: string | null = null;
      let message: string | null = null;
      const lines = body.split(/\r?\n/u);
      let inMessage = false;

      for (const line of lines) {
        if (inMessage) {
          if (line.length > 0) {
            message = line;
            break;
          }

          continue;
        }

        if (line.startsWith("parent ")) {
          const parentSha = line.substring("parent ".length).trim();

          if (/^[0-9a-f]{40}$/u.test(parentSha)) {
            parents.push(parentSha);
          }
        }

        if (line.startsWith("author ")) {
          const rawAuthor = line.substring("author ".length).trim();
          const ltIndex = rawAuthor.indexOf("<");
          author = (ltIndex > 0 ? rawAuthor.substring(0, ltIndex) : rawAuthor).trim() || null;
        }

        if (line.length === 0) {
          inMessage = true;
        }
      }

      return { parents, message, author };
    } catch {
      return null;
    }
  }

  private isLooseObjectPath(relativePath: string): boolean {
    return /^objects\/[0-9a-f]{2}\/[0-9a-f]{38}$/u.test(relativePath);
  }

  private shaFromLooseObjectPath(relativePath: string): string | null {
    const match = /^objects\/([0-9a-f]{2})\/([0-9a-f]{38})$/u.exec(relativePath);

    if (match === null || match[1] === undefined || match[2] === undefined) {
      return null;
    }

    return `${match[1]}${match[2]}`;
  }

  private ensureNode(nodeId: string, payload: unknown): ReturnType<Graph["addNode"]> {
    const existing = this.nodeById.get(nodeId);

    if (existing !== undefined) {
      return existing;
    }

    const created = this.graph.addNode(nodeId, payload);
    this.nodeById.set(nodeId, created);
    return created;
  }

  private async updateHeadPointer(headValue: string, gitDirectoryPath: string): Promise<void> {
    const headNode = this.ensureHeadNode();

    if (headValue.startsWith("ref:")) {
      const refName = headValue.substring("ref:".length).trim();
      const refNode = this.ensureRefNode(refName);
      this.ensurePointerEdge(headNode, refNode);
      return;
    }

    if (/^[0-9a-f]{40}$/u.test(headValue)) {
      const commitNode = await this.ensureCommitNodeWithParents(headValue);

      if (commitNode !== null) {
        this.ensurePointerEdge(headNode, commitNode);
      }

      return;
    }

    const headPath = path.join(gitDirectoryPath, "HEAD");
    this.logger.error(`Unrecognized HEAD format at '${headPath}': '${headValue}'`);
  }

  private ensureEdge(
    source: ReturnType<Graph["addNode"]>,
    target: ReturnType<Graph["addNode"]>,
  ): void {
    const key = `${source.id}->${target.id}`;

    if (this.edgeKeys.has(key)) {
      return;
    }

    this.edgeKeys.add(key);
    this.graph.addEdge(source, target);
  }

  private ensurePointerEdge(
    source: ReturnType<Graph["addNode"]>,
    target: ReturnType<Graph["addNode"]>,
  ): void {
    const existingTargetId = this.currentPointerTargetBySource.get(source.id);

    if (existingTargetId === target.id) {
      this.ensureEdge(source, target);
      return;
    }

    const graphInternal = this.graph as unknown as {
      edgesInternal: Array<{ source: { id: string }; target: { id: string } }>;
    };

    if (existingTargetId !== undefined) {
      graphInternal.edgesInternal = graphInternal.edgesInternal.filter((edge) => {
        const isRemoved = edge.source.id === source.id;

        if (isRemoved) {
          this.edgeKeys.delete(`${edge.source.id}->${edge.target.id}`);
        }

        return !isRemoved;
      });
    }

    this.currentPointerTargetBySource.set(source.id, target.id);
    this.ensureEdge(source, target);
    this.refreshReadableMetadata();
  }

  private ensureHeadNode(): ReturnType<Graph["addNode"]> {
    return this.ensureNode("head", { type: "head", label: "HEAD" } as GitHeadNodePayload);
  }

  private ensureRefNode(refName: string): ReturnType<Graph["addNode"]> {
    const shortName = this.toShortRefName(refName);
    const payload: GitRefNodePayload = {
      type: "ref",
      refName,
      shortName,
      label: shortName,
    };

    return this.ensureNode(`ref:${refName}`, payload);
  }

  private ensureCommitNode(sha: string): ReturnType<Graph["addNode"]> {
    const existing = this.commitPayloadBySha.get(sha);

    if (existing !== undefined) {
      return this.ensureNode(`commit:${sha}`, existing);
    }

    const shortSha = sha.slice(0, 7);
    const payload: GitCommitNodePayload = {
      type: "commit",
      sha,
      shortSha,
      label: shortSha,
      branchTips: [],
      tagNames: [],
      isHead: false,
    };

    this.commitPayloadBySha.set(sha, payload);
    return this.ensureNode(`commit:${sha}`, payload);
  }

  private toShortRefName(refName: string): string {
    if (refName.startsWith("refs/heads/")) {
      return refName.substring("refs/heads/".length);
    }

    if (refName.startsWith("refs/tags/")) {
      return refName.substring("refs/tags/".length);
    }

    return refName;
  }

  private refreshReadableMetadata(): void {
    for (const payload of this.commitPayloadBySha.values()) {
      payload.branchTips = [];
      payload.tagNames = [];
      payload.isHead = false;
    }

    for (const [sourceId, targetId] of this.currentPointerTargetBySource.entries()) {
      if (!sourceId.startsWith("ref:") || !targetId.startsWith("commit:")) {
        continue;
      }

      const refName = sourceId.substring("ref:".length);
      const shortRefName = this.toShortRefName(refName);
      const sha = targetId.substring("commit:".length);
      const payload = this.commitPayloadBySha.get(sha);

      if (payload === undefined) {
        continue;
      }

      if (refName.startsWith("refs/heads/")) {
        payload.branchTips.push(shortRefName);
      } else if (refName.startsWith("refs/tags/")) {
        payload.tagNames.push(shortRefName);
      }
    }

    const headTarget = this.currentPointerTargetBySource.get("head");
    let headCommitSha: string | null = null;

    if (headTarget !== undefined) {
      if (headTarget.startsWith("commit:")) {
        headCommitSha = headTarget.substring("commit:".length);
      } else if (headTarget.startsWith("ref:")) {
        const pointed = this.currentPointerTargetBySource.get(headTarget);

        if (pointed !== undefined && pointed.startsWith("commit:")) {
          headCommitSha = pointed.substring("commit:".length);
        }
      }
    }

    for (const payload of this.commitPayloadBySha.values()) {
      payload.branchTips = Array.from(new Set(payload.branchTips)).sort();
      payload.tagNames = Array.from(new Set(payload.tagNames)).sort();
      payload.isHead = headCommitSha === payload.sha;

      const messagePart = payload.message?.trim().length ? ` ${payload.message.trim()}` : "";
      const markers: string[] = [];

      if (payload.branchTips.length > 0) {
        markers.push(...payload.branchTips);
      }

      if (payload.tagNames.length > 0) {
        markers.push(...payload.tagNames.map((tagName) => `tag:${tagName}`));
      }

      if (
        payload.isHead &&
        (headTarget === undefined || !headTarget.startsWith("ref:"))
      ) {
        markers.push("HEAD");
      }

      const markerSuffix = markers.length > 0 ? ` [${markers.join(", ")}]` : "";
      payload.label = `${payload.shortSha}${messagePart}${markerSuffix}`.trim();
    }
  }

  private async readFileSafe(filePath: string): Promise<string | null> {
    try {
      return await this.fileSystem.readUtf8File(filePath);
    } catch {
      return null;
    }
  }

  private async persist(): Promise<void> {
    const json = this.serializer.serialize(this.graph);
    await this.fileSystem.writeUtf8File(this.outputJsonPath, json);
    this.logger.info(`  -> Graph JSON updated: ${this.outputJsonPath}`);
  }
}

export class GitWatchdog implements IGitWatchdog {
  private readonly watchers = new Map<string, FSWatcher>();
  private readonly pendingDirectoryRefreshes = new Set<string>();
  private readonly ignoredRelativePaths: ReadonlySet<string>;
  private gitDirectoryPath: string | null = null;
  private isStarted = false;

  public constructor(
    private readonly options: Required<GitWatchdogOptions>,
    private readonly gitDirectoryResolver: IGitDirectoryResolver,
    private readonly fileSystem: IFileSystem,
    private readonly pathService: IPathService,
    private readonly clock: IClock,
    private readonly changeClassifier: IGitFileChangeClassifier,
    private readonly changeSink: IGitFileChangeSink,
    private readonly historyGraphMaintainer: GitHistoryGraphMaintainer,
    private readonly logger: ILogger,
  ) {
    this.ignoredRelativePaths = new Set(
      options.ignoredRelativePaths.map((value) => this.normalizeRelativePath(value)),
    );
  }

  public async start(): Promise<void> {
    if (this.isStarted) {
      return;
    }

    this.gitDirectoryPath = await this.gitDirectoryResolver.resolveRepositoryGitDirectory(
      this.options.repositoryPath,
    );
    await this.historyGraphMaintainer.initialize(this.gitDirectoryPath);

    await this.watchDirectoryTree(this.gitDirectoryPath);

    this.isStarted = true;
    this.logger.info(`Watching '${this.gitDirectoryPath}' in read-only mode.`);
  }

  public async stop(): Promise<void> {
    for (const watcher of this.watchers.values()) {
      watcher.close();
    }

    this.watchers.clear();
    this.pendingDirectoryRefreshes.clear();
    this.gitDirectoryPath = null;
    this.isStarted = false;
  }

  private async watchDirectoryTree(rootDirectoryPath: string): Promise<void> {
    await this.ensureDirectoryWatcher(rootDirectoryPath);

    const entries = await this.fileSystem.readDirectory(rootDirectoryPath);

    for (const entry of entries) {
      if (!entry.isDirectory) {
        continue;
      }

      if (!this.shouldWatchAbsolutePath(entry.absolutePath)) {
        continue;
      }

      await this.watchDirectoryTree(entry.absolutePath);
    }
  }

  private async ensureDirectoryWatcher(directoryPath: string): Promise<void> {
    const normalized = this.pathService.normalize(directoryPath);

    if (this.watchers.has(normalized)) {
      return;
    }

    const watcher = this.fileSystem.createWatcher(
      normalized,
      (eventType, fileName) => {
        void this.handleWatcherEvent(normalized, eventType, fileName);
      },
      (error) => {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(`Watcher error at '${normalized}': ${message}`);
      },
    );

    this.watchers.set(normalized, watcher);
  }

  private async handleWatcherEvent(
    directoryPath: string,
    watcherEventType: string,
    fileName: string | null,
  ): Promise<void> {
    if (this.gitDirectoryPath === null) {
      return;
    }

    if (fileName === null || fileName.length === 0) {
      await this.refreshDirectoryWatchers(directoryPath);
      return;
    }

    const absolutePath = this.pathService.join(directoryPath, fileName);

    if (!this.shouldWatchAbsolutePath(absolutePath)) {
      return;
    }

    const kind = await this.changeClassifier.classify(absolutePath, watcherEventType);
    const relativePath = this.normalizeRelativePath(
      this.pathService.relative(this.gitDirectoryPath, absolutePath),
    );

    if (this.ignoredRelativePaths.has(relativePath)) {
      return;
    }

    this.changeSink.write({
      timestampUtc: this.clock.nowIsoUtc(),
      gitDirectoryPath: this.gitDirectoryPath,
      relativePath,
      absolutePath,
      kind,
      watcherEventType,
    });
    await this.historyGraphMaintainer.handle({
      timestampUtc: this.clock.nowIsoUtc(),
      gitDirectoryPath: this.gitDirectoryPath,
      relativePath,
      absolutePath,
      kind,
      watcherEventType,
    });

    await this.refreshDirectoryWatchers(directoryPath);

    if (kind === "created") {
      const entry = await this.fileSystem.getEntry(absolutePath);

      if (entry?.isDirectory === true) {
        await this.watchDirectoryTree(absolutePath);
      }
    }
  }

  private async refreshDirectoryWatchers(directoryPath: string): Promise<void> {
    const normalized = this.pathService.normalize(directoryPath);

    if (this.pendingDirectoryRefreshes.has(normalized)) {
      return;
    }

    this.pendingDirectoryRefreshes.add(normalized);

    try {
      const entries = await this.fileSystem.readDirectory(normalized);

      for (const entry of entries) {
        if (!entry.isDirectory) {
          continue;
        }

        if (!this.shouldWatchAbsolutePath(entry.absolutePath)) {
          continue;
        }

        await this.ensureDirectoryWatcher(entry.absolutePath);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to refresh watchers for '${normalized}': ${message}`);
    } finally {
      this.pendingDirectoryRefreshes.delete(normalized);
    }
  }

  private shouldWatchAbsolutePath(absolutePath: string): boolean {
    if (this.gitDirectoryPath === null) {
      return false;
    }

    const relativePath = this.normalizeRelativePath(
      this.pathService.relative(this.gitDirectoryPath, absolutePath),
    );

    if (relativePath === "") {
      return true;
    }

    if (!this.options.includeObjectDirectories) {
      if (relativePath === "objects" || relativePath.startsWith("objects/")) {
        return false;
      }
    }

    return !this.ignoredRelativePaths.has(relativePath);
  }

  private normalizeRelativePath(value: string): string {
    return value.replaceAll("\\", "/").replace(/^\.\/+/u, "").replace(/\/+/gu, "/");
  }
}

export class GitWatchdogFactory implements IGitWatchdogFactory {
  public constructor(
    private readonly fileSystem: IFileSystem,
    private readonly pathService: IPathService,
    private readonly clock: IClock,
    private readonly logger: ILogger,
  ) {}

  public create(options: GitWatchdogOptions): IGitWatchdog {
    const resolvedOptions: Required<GitWatchdogOptions> = {
      repositoryPath: options.repositoryPath,
      includeObjectDirectories: options.includeObjectDirectories ?? false,
      ignoredRelativePaths: options.ignoredRelativePaths ?? ["index.lock"],
      graphOutputJsonPath: options.graphOutputJsonPath ?? "git-history-graph.json",
    };

    const gitDirectoryResolver = new GitDirectoryResolver(this.fileSystem, this.pathService);
    const semanticGraph = new GitSemanticEventGraph();
    const semanticClassifier = new GitSemanticEventClassifier();
    const semanticSink = new ConsoleGitSemanticEventSink(this.logger, semanticGraph);
    const changeClassifier = new GitFileChangeClassifier(this.fileSystem);
    const historyGraphMaintainer = new GitHistoryGraphMaintainer(
      this.fileSystem,
      this.logger,
      resolvedOptions.graphOutputJsonPath,
    );
    const changeSink = new ConsoleGitFileChangeSink(
      this.logger,
      semanticClassifier,
      semanticSink,
    );

    return new GitWatchdog(
      resolvedOptions,
      gitDirectoryResolver,
      this.fileSystem,
      this.pathService,
      this.clock,
      changeClassifier,
      changeSink,
      historyGraphMaintainer,
      this.logger,
    );
  }
}

export function createGitWatchdogFactory(): IGitWatchdogFactory {
  return new GitWatchdogFactory(
    new NodeFileSystem(),
    new NodePathService(),
    new SystemClock(),
    new CoreLoggerAdapter(),
  );
}

export interface CliOptions {
  readonly repositoryPath: string;
  readonly includeObjectDirectories: boolean;
  readonly ignoredRelativePaths: readonly string[];
  readonly graphOutputJsonPath: string;
  readonly showHelp: boolean;
  readonly configPath: string;
  readonly hasExplicitRepositoryPath: boolean;
  readonly hasExplicitIncludeObjects: boolean;
  readonly hasExplicitIgnores: boolean;
  readonly hasExplicitGraphOutputJsonPath: boolean;
}

interface CliOptionDefinition {
  readonly type: "string" | "boolean" | "number";
  readonly short?: string;
  readonly multiple?: boolean;
}

type CliOptionSchema = Record<string, CliOptionDefinition>;

interface CliParseResult {
  readonly options: Record<string, unknown>;
  readonly positionals: string[];
}

interface CliParserLike {
  parseOptions(args: string[], schema: CliOptionSchema): CliParseResult;
}

class FallbackCliParser implements CliParserLike {
  public parseOptions(args: string[], schema: CliOptionSchema): CliParseResult {
    const options: Record<string, {
      type: "string" | "boolean";
      multiple: boolean;
      short?: string;
    }> = {};

    for (const [name, definition] of Object.entries(schema)) {
      options[name] = {
        type: definition.type === "number" ? "string" : definition.type,
        multiple: definition.multiple ?? false,
        ...(definition.short !== undefined ? { short: definition.short } : {}),
      };
    }

    const parsed = parseArgs({
      args,
      options,
      strict: false,
      allowPositionals: true,
    });

    const values: Record<string, unknown> = { ...parsed.values };

    for (const [name, definition] of Object.entries(schema)) {
      if (definition.type !== "number") {
        continue;
      }

      const current = values[name];

      if (current === undefined) {
        continue;
      }

      values[name] = Array.isArray(current)
        ? current.map((entry) => Number(entry))
        : Number(current);
    }

    return {
      options: values,
      positionals: parsed.positionals,
    };
  }
}

class CliParserFactory {
  public create(): CliParserLike {
    const require = createRequire(import.meta.url);

    try {
      const coreConsoleCli = require("../../../../packages/core-console-cli/dist/code.js") as {
        CliParser: new () => CliParserLike;
      };

      return new coreConsoleCli.CliParser();
    } catch {
      return new FallbackCliParser();
    }
  }
}

interface IWatcherCliOptionsParser {
  parse(argumentsVector: readonly string[]): CliOptions;
}

interface IWatcherConfigLoader {
  load(configPath: string): Promise<WatcherConfigFile | null>;
}

interface IGraphOutputPathResolver {
  resolve(templateOrPath: string): string;
}

interface ICliUsageTextProvider {
  getUsageText(): string;
}

export class WatcherCliOptionsParser implements IWatcherCliOptionsParser {
  private readonly cliParser: CliParserLike;
  private readonly optionSchema: CliOptionSchema = {
    help: { type: "boolean", short: "h" },
    repo: { type: "string" },
    config: { type: "string" },
    "include-objects": { type: "boolean" },
    ignore: { type: "string", multiple: true },
    "graph-json": { type: "string" },
  };

  public constructor(cliParserFactory: CliParserFactory = new CliParserFactory()) {
    this.cliParser = cliParserFactory.create();
  }

  public parse(argumentsVector: readonly string[]): CliOptions {
    this.assertOptionHasValue(argumentsVector, "--repo");
    this.assertOptionHasValue(argumentsVector, "--ignore");
    this.assertOptionHasValue(argumentsVector, "--config");
    this.assertOptionHasValue(argumentsVector, "--graph-json");

    const parsed = this.cliParser.parseOptions([...argumentsVector], this.optionSchema);
    let repositoryPath: string | null = null;
    let hasExplicitRepositoryPath = false;

    for (let index = 0; index < argumentsVector.length; index += 1) {
      const current = argumentsVector[index];

      if (current === undefined) {
        continue;
      }

      if (current === "--repo") {
        repositoryPath = argumentsVector[index + 1] ?? null;
        hasExplicitRepositoryPath = true;
        index += 1;
        continue;
      }

      if (current === "--ignore" || current === "--config" || current === "--graph-json") {
        index += 1;
        continue;
      }

      if (current === "--help" || current === "-h" || current === "--include-objects") {
        continue;
      }

      if (current.startsWith("-")) {
        throw new Error(`Unknown argument '${current}'.`);
      }

      if (repositoryPath !== null) {
        throw new Error(
          `Repository path was already set to '${repositoryPath}'. Unexpected value '${current}'.`,
        );
      }

      repositoryPath = current;
      hasExplicitRepositoryPath = true;
    }

    const includeObjectDirectories = parsed.options["include-objects"] === true;
    const ignoredRelativePaths = this.optionAsStringArray(parsed.options.ignore, "ignore");
    const graphOutputJsonPath = this.optionAsString(parsed.options["graph-json"], "graph-json") ?? "git-history-graph.json";
    const showHelp = parsed.options.help === true;
    const configPath = this.optionAsString(parsed.options.config, "config") ?? "watcher.config.json";

    return {
      repositoryPath: repositoryPath ?? process.cwd(),
      includeObjectDirectories,
      ignoredRelativePaths,
      graphOutputJsonPath,
      showHelp,
      configPath,
      hasExplicitRepositoryPath,
      hasExplicitIncludeObjects: parsed.options["include-objects"] !== undefined,
      hasExplicitIgnores: parsed.options.ignore !== undefined,
      hasExplicitGraphOutputJsonPath: parsed.options["graph-json"] !== undefined,
    };
  }

  private assertOptionHasValue(argumentsVector: readonly string[], optionName: string): void {
    for (let index = 0; index < argumentsVector.length; index += 1) {
      if (argumentsVector[index] === optionName && argumentsVector[index + 1] === undefined) {
        throw new Error(`Missing value for '${optionName}'.`);
      }
    }
  }

  private optionAsString(value: unknown, optionName: string): string | null {
    if (value === undefined) {
      return null;
    }

    if (typeof value !== "string") {
      throw new Error(`Invalid value for '--${optionName}'. Expected string.`);
    }

    return value;
  }

  private optionAsStringArray(value: unknown, optionName: string): string[] {
    if (value === undefined) {
      return [];
    }

    if (Array.isArray(value)) {
      if (!value.every((entry) => typeof entry === "string")) {
        throw new Error(`Invalid value for '--${optionName}'. Expected string values.`);
      }

      return [...value];
    }

    if (typeof value === "string") {
      return [value];
    }

    throw new Error(`Invalid value for '--${optionName}'. Expected string values.`);
  }
}

export class WatcherConfigLoader implements IWatcherConfigLoader {
  public async load(configPath: string): Promise<WatcherConfigFile | null> {
    try {
      const content = await fs.readFile(configPath, "utf8");
      const parsed = JSON.parse(content) as unknown;

      if (parsed === null || typeof parsed !== "object") {
        throw new Error("Config root must be an object.");
      }

      return parsed as WatcherConfigFile;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return null;
      }

      throw error;
    }
  }
}

export class GraphOutputPathResolver implements IGraphOutputPathResolver {
  public resolve(templateOrPath: string): string {
    const timestamp = this.createTimestampForFileName(new Date());
    return templateOrPath.replaceAll("{timestamp}", timestamp);
  }

  private createTimestampForFileName(clock: Date): string {
    const year = String(clock.getFullYear());
    const month = String(clock.getMonth() + 1).padStart(2, "0");
    const day = String(clock.getDate()).padStart(2, "0");
    const hour = String(clock.getHours()).padStart(2, "0");
    const minute = String(clock.getMinutes()).padStart(2, "0");
    const second = String(clock.getSeconds()).padStart(2, "0");
    return `${year}${month}${day}-${hour}${minute}${second}`;
  }
}

class WatcherCliUsageTextProvider implements ICliUsageTextProvider {
  public getUsageText(): string {
    return [
      "Usage: node-watcher [repository-path] [options]",
      "",
      "Options:",
      "  --repo <path>         Repository path to inspect (overrides positional path)",
      "  --config <path>       Path to JSON config file (default: watcher.config.json)",
      "  --include-objects     Include .git/objects directories",
      "  --ignore <path>       Ignore relative path under the resolved .git dir (repeatable)",
      "  --graph-json <path>   Graph JSON output path (default: git-history-graph.json)",
      "  -h, --help            Show this help",
    ].join("\n");
  }
}

export class NodeWatcherCliApplication {
  public constructor(
    private readonly optionsParser: IWatcherCliOptionsParser = new WatcherCliOptionsParser(),
    private readonly configLoader: IWatcherConfigLoader = new WatcherConfigLoader(),
    private readonly graphOutputPathResolver: IGraphOutputPathResolver = new GraphOutputPathResolver(),
    private readonly usageTextProvider: ICliUsageTextProvider = new WatcherCliUsageTextProvider(),
  ) {}

  public isExecutedDirectly(): boolean {
    const entryPointPath = process.argv[1];

    if (entryPointPath === undefined) {
      return false;
    }

    return pathToFileURL(entryPointPath).href === import.meta.url;
  }

  public async run(): Promise<void> {
    let options: CliOptions;

    try {
      options = this.optionsParser.parse(process.argv.slice(2));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(message);
      console.error("");
      console.error(this.usageTextProvider.getUsageText());
      process.exitCode = 1;
      return;
    }

    if (options.showHelp) {
      console.log(this.usageTextProvider.getUsageText());
      return;
    }

    let fileConfig: WatcherConfigFile | null = null;

    try {
      fileConfig = await this.configLoader.load(options.configPath);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Failed to load config '${options.configPath}': ${message}`);
      process.exitCode = 1;
      return;
    }

    const configuredRepositoryPath = fileConfig?.gitPath ?? fileConfig?.repositoryPath ?? process.cwd();
    const repositoryPath = options.hasExplicitRepositoryPath
      ? options.repositoryPath
      : configuredRepositoryPath;
    const includeObjectDirectories = options.hasExplicitIncludeObjects
      ? options.includeObjectDirectories
      : (fileConfig?.includeObjectDirectories ?? false);
    const ignoredRelativePaths = options.hasExplicitIgnores
      ? options.ignoredRelativePaths
      : (fileConfig?.ignoredRelativePaths ?? []);
    const graphOutputJsonPathTemplate = options.hasExplicitGraphOutputJsonPath
      ? options.graphOutputJsonPath
      : (fileConfig?.graphOutputJsonPath ?? "git-history-graph-{timestamp}.json");
    const graphOutputJsonPath = this.graphOutputPathResolver.resolve(graphOutputJsonPathTemplate);

    const watchdog = createGitWatchdogFactory().create({
      repositoryPath,
      includeObjectDirectories,
      ignoredRelativePaths,
      graphOutputJsonPath,
    });

    const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
      console.log(`Received ${signal}. Stopping watcher...`);
      await watchdog.stop();
      process.exit(0);
    };

    process.on("SIGINT", () => {
      void shutdown("SIGINT");
    });
    process.on("SIGTERM", () => {
      void shutdown("SIGTERM");
    });

    try {
      await watchdog.start();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Failed to start watcher: ${message}`);
      process.exitCode = 1;
    }
  }
}

interface WatcherConfigFile {
  readonly gitPath?: string;
  readonly repositoryPath?: string;
  readonly includeObjectDirectories?: boolean;
  readonly ignoredRelativePaths?: readonly string[];
  readonly graphOutputJsonPath?: string;
}

if (new NodeWatcherCliApplication().isExecutedDirectly()) {
  void new NodeWatcherCliApplication().run();
}
