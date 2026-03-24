
import { DistributionKind, EstimateRange, IProjectEstimate } from "@monorepo/core-math-probability";
import { IBacklogTaskShapeMapper } from "./IBacklogTaskShapeMapper.js";
import { IBacklogRootJson } from "./json/IBacklogRootJson.js";

export class BacklogJsonProjectAdapter {
  public constructor(
    private readonly shapeMapper: IBacklogTaskShapeMapper,
    private readonly distributionKind: DistributionKind = DistributionKind.SkewNormal,
  ) {}

  public map(backlog: IBacklogRootJson): IProjectEstimate {
    return {
      id: this.createProjectId(backlog),
      name: this.createProjectName(backlog),
      features: backlog.epics.flatMap((epic) =>
        epic.features.map((feature) => ({
          id: `${epic.id}:${feature.id}`,
          name: `${epic.title} / ${feature.title}`,
          stories: feature.userStories.map((story) => ({
            id: story.id,
            name: story.title,
            tasks: story.tasks.map((task) => ({
              id: task.id,
              name: `[${task.type}] ${task.title}`,
              range: new EstimateRange(
                task.estimate.optimistic,
                task.estimate.mostLikely,
                task.estimate.pessimistic,
              ),
              shape: this.shapeMapper.mapTask(task),
              distributionKind: this.distributionKind,
            })),
          })),
        })),
      ),
    };
  }

  private createProjectId(backlog: IBacklogRootJson): string {
    return backlog.epics.map((epic) => epic.id).join("+");
  }

  private createProjectName(backlog: IBacklogRootJson): string {
    if (backlog.epics.length === 1) {
      return backlog.epics[0]?.title ?? "";
    }

    return backlog.epics.map((epic) => epic.title).join(" + ");
  }
}
