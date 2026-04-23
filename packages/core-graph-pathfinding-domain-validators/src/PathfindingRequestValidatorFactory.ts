// packages/core-graph-pathfinding-domain-validators/src/PathfindingRequestValidatorFactory.ts

import { CompositeValidator } from "./CompositeValidator.js";
import { GoalNodeMustBeDefinedRule } from "./GoalNodeMustBeDefinedRule.js";
import { GoalNodeMustExistInGraphRule } from "./GoalNodeMustExistInGraphRule.js";
import { GraphMustBeDefinedRule } from "./GraphMustBeDefinedRule.js";
import type { IPathfindingRequestValidationContext } from "./IPathfindingRequestValidationContext.js";
import type { IPathfindingRequestValidatorFactory } from "./IPathfindingRequestValidatorFactory.js";
import { PathfindingRequestValidator } from "./PathfindingRequestValidator.js";
import { RequestMustBeDefinedRule } from "./RequestMustBeDefinedRule.js";
import { StartNodeMustBeDefinedRule } from "./StartNodeMustBeDefinedRule.js";
import { StartNodeMustExistInGraphRule } from "./StartNodeMustExistInGraphRule.js";
import type { IPathfindingRequestValidator } from "@monorepo/core-graph-pathfinding-domain";

export class PathfindingRequestValidatorFactory implements IPathfindingRequestValidatorFactory {
  public create<TNodeId>(): IPathfindingRequestValidator<TNodeId> {
    const validator = new CompositeValidator<IPathfindingRequestValidationContext<TNodeId>>([
      new GraphMustBeDefinedRule<TNodeId>(),
      new RequestMustBeDefinedRule<TNodeId>(),
      new StartNodeMustBeDefinedRule<TNodeId>(),
      new GoalNodeMustBeDefinedRule<TNodeId>(),
      new StartNodeMustExistInGraphRule<TNodeId>(),
      new GoalNodeMustExistInGraphRule<TNodeId>(),
    ]);

    return new PathfindingRequestValidator<TNodeId>(validator);
  }
}