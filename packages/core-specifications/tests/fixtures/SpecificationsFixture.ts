// packages/core-specifications/tests/fixtures/SpecificationsFixture.ts

import type { ISpecification } from "../../src/specifications/ISpecification.js";
import { Specification } from "../../src/specifications/Specification.js";

export interface ISpecificationModel {
  readonly value: number;
  readonly enabled: boolean;
}

class ValueGreaterThanSpecification extends Specification<ISpecificationModel> {
  public constructor(private readonly threshold: number) {
    super();
  }

  public isSatisfiedBy(candidate: ISpecificationModel): boolean {
    return candidate.value > this.threshold;
  }
}

class EnabledSpecification extends Specification<ISpecificationModel> {
  public isSatisfiedBy(candidate: ISpecificationModel): boolean {
    return candidate.enabled;
  }
}

class DisabledSpecification extends Specification<ISpecificationModel> {
  public isSatisfiedBy(candidate: ISpecificationModel): boolean {
    return candidate.enabled === false;
  }
}

export class SpecificationsFixture {
  private _model: ISpecificationModel = {
    value: 10,
    enabled: true,
  };

  public get model(): ISpecificationModel {
    return this._model;
  }

  public get valueGreaterThanFiveSpecification(): ISpecification<ISpecificationModel> {
    return new ValueGreaterThanSpecification(5);
  }

  public get valueGreaterThanTenSpecification(): ISpecification<ISpecificationModel> {
    return new ValueGreaterThanSpecification(10);
  }

  public get enabledSpecification(): ISpecification<ISpecificationModel> {
    return new EnabledSpecification();
  }

  public get disabledSpecification(): ISpecification<ISpecificationModel> {
    return new DisabledSpecification();
  }

  public withModel(model: ISpecificationModel): this {
    this._model = model;
    return this;
  }

  public withValue(value: number): this {
    this._model = { ...this._model, value };
    return this;
  }

  public withEnabled(enabled: boolean): this {
    this._model = { ...this._model, enabled };
    return this;
  }

  public reset(): void {
    this._model = {
      value: 10,
      enabled: true,
    };
  }
}