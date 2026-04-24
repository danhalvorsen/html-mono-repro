export class GitPath {
  public static readonly Head = "HEAD";
  public static readonly Index = "index";
  public static readonly CommitEditMessage = "COMMIT_EDITMSG";
  public static readonly MergeMessage = "MERGE_MSG";
  public static readonly SquashMessage = "SQUASH_MSG";
  public static readonly LogsHead = "logs/HEAD";
  public static readonly RefsHeadsPrefix = "refs/heads/";
  public static readonly RefsTagsPrefix = "refs/tags/";
  public static readonly LogsRefsHeadsPrefix = "logs/refs/heads/";
  public static readonly ObjectsPrefix = "objects/";
  public static readonly LockSuffix = ".lock";

  private constructor() {}
}