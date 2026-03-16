// tests/fixtures/PointInRectangleRuleFixture.ts

import { CrossPlatformTemplate } from "@monorepo/core-template";

import type { IRuleMessageFactory } from "../../src/IRuleMessageFactory.js";
import type { IValidationMessage } from "../../src/IValidationMessage.js";
import type { ISpecificationRuleMessageModel } from "../../src/SpecificationRule.js";

import { SpecificationRule } from "../../src/SpecificationRule.js";
import { ValidationMessage } from "../../src/ValidationMessage.js";
import { PointInsideRectangleSpecification } from "./PointInsideRectangleSpecification.js";

export interface IPoint {
  x: number;
  y: number;
}

export interface IRectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface IPointTestModel {
  point: IPoint;
  rectangle: IRectangle;
}

export interface IPointRuleMessageModel
  extends ISpecificationRuleMessageModel<IPointTestModel> {
  pointX: number;
  pointY: number;
}

class PointRuleMessageFactory
  implements IRuleMessageFactory<IPointTestModel, IPointRuleMessageModel>
{
  public createAdapter(
    ruleName: string,
    model: IPointTestModel,
    _messageModel: IPointRuleMessageModel,
  ): IValidationMessage<IPointRuleMessageModel> {
    return new ValidationMessage(
      "POINT_OUTSIDE_RECTANGLE",
      new CrossPlatformTemplate(
        "Rule ${ruleName}: point (${pointX},${pointY}) is outside rectangle",
      ),
      {
        ruleName,
        candidate: model,
        pointX: model.point.x,
        pointY: model.point.y,
      },
    );
  }
}

export class PointInRectangleRuleFixture {
  public model: IPointTestModel = {
    point: { x: 5, y: 5 },
    rectangle: { x: 0, y: 0, width: 10, height: 10 },
  };

  public createRule(): SpecificationRule<IPointTestModel> {
    return new SpecificationRule(
      "PointInsideRectangle",
      new PointInsideRectangleSpecification(),
      new PointRuleMessageFactory(),
    );
  }
}