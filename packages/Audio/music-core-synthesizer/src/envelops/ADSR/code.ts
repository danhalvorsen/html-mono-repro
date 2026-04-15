// New code only.
// Assumes these existing symbols are already available in your module graph:
// Specification
// SpecificationRule
// IRuleMessageFactory
// IAggregateRuleMessageModel
// ITemplate
// IValidationMessage
// ValidationMessage

import { IRuleMessageFactory, IValidationMessage, SpecificationRule, ValidationMessage } from "@monorepo/core-specifications-rules";
import { Specification } from "../../../../../core-specifications/dist/specifications/Specification.js";
import { ITemplate } from "@monorepo/core-template";
import { ISpecification } from "@monorepo/core-specifications";
import { IStrictAdsrRuleMessageModel } from "./IStrictAdsrRuleMessageModel.js";
import { StartMustBeOriginSpecification } from "./StartMustBeOriginSpecification.js";
import { Point2 } from "../../../../../core-math/dist/interfaces/IPoint.js";
import { AdsrPointsRecord } from "./types.js";
 
export interface IAdsrPointsProvider {
  getPoints(): AdsrPointsRecord;
}
 ;

export type StrictAdsrEnvelope = {
  readonly start: Point2;
  readonly attack: Point2;
  readonly decay: Point2;
  readonly sustain: Point2;
  readonly end: Point2;
};

export class EndMustBeOnXAxisSpecification extends Specification<StrictAdsrEnvelope> {
  public override isSatisfiedBy(candidate: StrictAdsrEnvelope): boolean {
    return candidate.end.y === 0;
  }
}

export class AttackMustBeAtPeakSpecification extends Specification<StrictAdsrEnvelope> {
  public override isSatisfiedBy(candidate: StrictAdsrEnvelope): boolean {
    return candidate.attack.y === 1;
  }
}

export class DecayAndSustainMustShareLevelSpecification extends Specification<StrictAdsrEnvelope> {
  public override isSatisfiedBy(candidate: StrictAdsrEnvelope): boolean {
    return candidate.decay.y === candidate.sustain.y;
  }
}

export class XCoordinatesMustBeStrictAdsrOrderedSpecification extends Specification<StrictAdsrEnvelope> {
  public override isSatisfiedBy(candidate: StrictAdsrEnvelope): boolean {
    return (
      candidate.start.x < candidate.attack.x &&
      candidate.attack.x < candidate.decay.x &&
      candidate.decay.x <= candidate.sustain.x &&
      candidate.sustain.x < candidate.end.x
    );
  }
}

export class CoordinatesMustBeNormalizedSpecification extends Specification<StrictAdsrEnvelope> {
  public override isSatisfiedBy(candidate: StrictAdsrEnvelope): boolean {
    const points = [
      candidate.start,
      candidate.attack,
      candidate.decay,
      candidate.sustain,
      candidate.end,
    ];

    return points.every((point): boolean => {
      return (
        Number.isFinite(point.x) &&
        Number.isFinite(point.y) &&
        point.x >= 0 &&
        point.x <= 1 &&
        point.y >= 0 &&
        point.y <= 1
      );
    });
  }
}

export class SegmentDirectionsMustMatchStrictAdsrShapeSpecification extends Specification<StrictAdsrEnvelope> {
  public override isSatisfiedBy(candidate: StrictAdsrEnvelope): boolean {
    return (
      candidate.start.y < candidate.attack.y &&
      candidate.decay.y <= candidate.attack.y &&
      candidate.decay.y === candidate.sustain.y &&
      candidate.sustain.y > candidate.end.y
    );
  }
}

export class StrictAdsrEnvelopeSpecification extends Specification<StrictAdsrEnvelope> {
  private readonly inner: ISpecification<StrictAdsrEnvelope>;

  public constructor() {
    super();

    this.inner = new CoordinatesMustBeNormalizedSpecification()
      .and(new StartMustBeOriginSpecification())
      .and(new EndMustBeOnXAxisSpecification())
      .and(new AttackMustBeAtPeakSpecification())
      .and(new DecayAndSustainMustShareLevelSpecification())
      .and(new XCoordinatesMustBeStrictAdsrOrderedSpecification())
      .and(new SegmentDirectionsMustMatchStrictAdsrShapeSpecification());
  }

  public override isSatisfiedBy(candidate: StrictAdsrEnvelope): boolean {
    return this.inner.isSatisfiedBy(candidate);
  }
}

export class StrictAdsrRuleMessageFactory
  implements IRuleMessageFactory<StrictAdsrEnvelope, IStrictAdsrRuleMessageModel>
{
  private readonly code: string;
  private readonly template: ITemplate<IStrictAdsrRuleMessageModel>;

  public constructor(
    code: string,
    template: ITemplate<IStrictAdsrRuleMessageModel>,
  ) {
    this.code = code;
    this.template = template;
  }

  public createAdapter(
    ruleName: string,
    model: StrictAdsrEnvelope,
    messageModel: IStrictAdsrRuleMessageModel,
  ): IValidationMessage<IStrictAdsrRuleMessageModel> {
    return new ValidationMessage<IStrictAdsrRuleMessageModel>(
      this.code,
      this.template,
      {
        ...messageModel,
        ruleName,
        candidate: model,
      },
    );
  }
}

export class StrictAdsrEnvelopeRule extends SpecificationRule<StrictAdsrEnvelope> {
  public constructor(
    name: string,
    messageFactory: IRuleMessageFactory<
      StrictAdsrEnvelope,
      IStrictAdsrRuleMessageModel
    >,
  ) {
    super(
      name,
      new StrictAdsrEnvelopeSpecification(),
      messageFactory,
    );
  }
}

// Optional additive policy examples.
// Keep these separate so the strict ADSR core stays closed.

export class AttackAndDecayMustNotCollapseSpecification extends Specification<StrictAdsrEnvelope> {
  public override isSatisfiedBy(candidate: StrictAdsrEnvelope): boolean {
    return candidate.attack.x < candidate.decay.x;
  }
}

export class SustainMustHaveVisibleWidthSpecification extends Specification<StrictAdsrEnvelope> {
  public override isSatisfiedBy(candidate: StrictAdsrEnvelope): boolean {
    return candidate.decay.x < candidate.sustain.x;
  }
}

export { StartMustBeOriginSpecification };
