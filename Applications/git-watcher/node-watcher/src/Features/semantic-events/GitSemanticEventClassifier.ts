import {
  isTransientGitPath,
  type GitFileChange,
  type GitSemanticEvent,
  type GitSemanticEventKind,
} from "../../domain/GitDomain.js";

export interface IGitSemanticEventRule {
  classify(change: GitFileChange): readonly GitSemanticEvent[];
}

export interface IGitSemanticEventFactory {
  create(
    change: GitFileChange,
    kind: GitSemanticEventKind,
    description: string,
  ): GitSemanticEvent;
}

export interface ITransientGitPathPolicy {
  isTransient(relativePath: string): boolean;
}

export class TransientGitPathPolicy implements ITransientGitPathPolicy {
  public isTransient(relativePath: string): boolean {
    return isTransientGitPath(relativePath);
  }
}

export class GitSemanticEventFactory implements IGitSemanticEventFactory {
  public create(
    change: GitFileChange,
    kind: GitSemanticEventKind,
    description: string,
  ): GitSemanticEvent {
    return {
      timestampUtc: change.timestampUtc,
      relativePath: change.relativePath,
      absolutePath: change.absolutePath,
      kind,
      description,
    };
  }
}

export abstract class GitPathRuleBase implements IGitSemanticEventRule {
  public constructor(private readonly factory: IGitSemanticEventFactory) {}

  public classify(change: GitFileChange): readonly GitSemanticEvent[] {
    if (!this.matches(change.relativePath)) {
      return [];
    }

    return [
      this.factory.create(
        change,
        this.getKind(),
        this.getDescription(change.relativePath),
      ),
    ];
  }

  protected abstract matches(relativePath: string): boolean;
  protected abstract getKind(): GitSemanticEventKind;
  protected abstract getDescription(relativePath: string): string;
}

export class HeadChangedRule extends GitPathRuleBase {
  protected matches(relativePath: string): boolean {
    return relativePath === "HEAD";
  }

  protected getKind(): GitSemanticEventKind {
    return "head_changed";
  }

  protected getDescription(): string {
    return "HEAD changed";
  }
}

export class IndexUpdatedRule extends GitPathRuleBase {
  protected matches(relativePath: string): boolean {
    return relativePath === "index";
  }

  protected getKind(): GitSemanticEventKind {
    return "index_updated";
  }

  protected getDescription(): string {
    return "Staging index updated";
  }
}

export class BranchRefMovedRule extends GitPathRuleBase {
  protected matches(relativePath: string): boolean {
    return relativePath.startsWith("refs/heads/");
  }

  protected getKind(): GitSemanticEventKind {
    return "branch_ref_moved";
  }

  protected getDescription(relativePath: string): string {
    return `Branch moved (${relativePath})`;
  }
}

export class TagRefMovedRule extends GitPathRuleBase {
  protected matches(relativePath: string): boolean {
    return relativePath.startsWith("refs/tags/");
  }

  protected getKind(): GitSemanticEventKind {
    return "tag_ref_moved";
  }

  protected getDescription(relativePath: string): string {
    return `Tag moved (${relativePath})`;
  }
}

export class ObjectStoredRule extends GitPathRuleBase {
  protected matches(relativePath: string): boolean {
    return relativePath.startsWith("objects/");
  }

  protected getKind(): GitSemanticEventKind {
    return "object_stored";
  }

  protected getDescription(): string {
    return "Git object stored";
  }
}

export class HeadReflogUpdatedRule extends GitPathRuleBase {
  protected matches(relativePath: string): boolean {
    return relativePath === "logs/HEAD";
  }

  protected getKind(): GitSemanticEventKind {
    return "head_reflog_updated";
  }

  protected getDescription(): string {
    return "HEAD reflog updated";
  }
}

export class BranchReflogUpdatedRule extends GitPathRuleBase {
  protected matches(relativePath: string): boolean {
    return relativePath.startsWith("logs/refs/heads/");
  }

  protected getKind(): GitSemanticEventKind {
    return "branch_reflog_updated";
  }

  protected getDescription(relativePath: string): string {
    return `Branch reflog updated (${relativePath})`;
  }
}

export class OtherGitMetadataRule implements IGitSemanticEventRule {
  public constructor(private readonly factory: IGitSemanticEventFactory) {}

  public classify(change: GitFileChange): readonly GitSemanticEvent[] {
    return [
      this.factory.create(
        change,
        "other",
        `Other git metadata change (${change.relativePath})`,
      ),
    ];
  }
}

export class GitSemanticEventClassifier {
  private readonly rules: readonly IGitSemanticEventRule[];
  private readonly fallbackRule: IGitSemanticEventRule;

  public constructor(
    private readonly transientPathPolicy: ITransientGitPathPolicy = new TransientGitPathPolicy(),
    rules?: readonly IGitSemanticEventRule[],
    fallbackRule?: IGitSemanticEventRule,
  ) {
    const eventFactory = new GitSemanticEventFactory();

    this.rules =
      rules ??
      [
        new HeadChangedRule(eventFactory),
        new IndexUpdatedRule(eventFactory),
        new BranchRefMovedRule(eventFactory),
        new TagRefMovedRule(eventFactory),
        new ObjectStoredRule(eventFactory),
        new HeadReflogUpdatedRule(eventFactory),
        new BranchReflogUpdatedRule(eventFactory),
      ];

    this.fallbackRule = fallbackRule ?? new OtherGitMetadataRule(eventFactory);
  }

  public classify(change: GitFileChange): readonly GitSemanticEvent[] {
    if (this.transientPathPolicy.isTransient(change.relativePath)) {
      return [];
    }

    const events = this.rules.flatMap((rule) => rule.classify(change));
    return events.length > 0 ? events : this.fallbackRule.classify(change);
  }
}
