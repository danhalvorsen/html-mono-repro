import { GitPath } from "./GitPath.js";
import { GitRelativePath } from "./GitRelativePath.js";

export interface ITransientGitPathPolicy {
  isTransient(relativePath: GitRelativePath): boolean;
}

export class TransientGitPathPolicy implements ITransientGitPathPolicy {
  public isTransient(relativePath: GitRelativePath): boolean {
    if (relativePath.endsWith(GitPath.LockSuffix)) {
      return true;
    }

    const pathValue = relativePath.toString();

    return (
      pathValue === GitPath.CommitEditMessage ||
      pathValue === GitPath.MergeMessage ||
      pathValue === GitPath.SquashMessage
    );
  }
}

export function isTransientGitPath(relativePath: string): boolean {
  return new TransientGitPathPolicy().isTransient(GitRelativePath.create(relativePath));
}
