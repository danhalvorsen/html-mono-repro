import { Specification } from "../../../core-specifications/src/index.js";
import { IPointTestModel } from "./PointInRectangleRuleFixture.js";

export class PointInsideRectangleSpecification extends Specification<IPointTestModel> {
    public isSatisfiedBy(candidate: IPointTestModel): boolean {
        const { point, rectangle } = candidate;

        return (
            point.x >= rectangle.x &&
            point.x <= rectangle.x + rectangle.width &&
            point.y >= rectangle.y &&
            point.y <= rectangle.y + rectangle.height
        );
    }
}
