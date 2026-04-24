import { DomainContext } from "../infrastructure/DomainContext.js";
import { DomainError } from "../infrastructure/DomainError.js";
import { ErrorCode } from "../infrastructure/ErrorCode.js";
import { Guard } from "../infrastructure/Guard.js";

export interface ITrackStepSnapshot<TValue> {
  readonly index: number;
  readonly isActive: boolean;
  readonly value: TValue | null;
}

export class TrackStep<TValue> {
  private readonly _index: number;
  private _active: boolean;
  private _value: TValue | null;

  public constructor(index: number) {
    this._index = Guard.nonNegative(
      Guard.integer(index, DomainContext.TrackStepIndex),
      DomainContext.TrackStepIndex,
    );
    this._active = false;
    this._value = null;
  }

  public get index(): number {
    return this._index;
  }

  public get isActive(): boolean {
    return this._active;
  }

  public get value(): TValue | null {
    return this._value;
  }

  public activate(value: TValue | null = null): void {
    this._active = true;
    this._value = value;
  }

  public deactivate(): void {
    this._active = false;
    this._value = null;
  }

  public setValue(value: TValue | null): void {
    if (!this._active) {
      throw new DomainError(
        ErrorCode.InvalidState,
        DomainContext.TrackStepValue,
        "Cannot set value on an inactive step.",
      );
    }

    this._value = value;
  }

  public clear(): void {
    this.deactivate();
  }

  public toSnapshot(): ITrackStepSnapshot<TValue> {
    return Object.freeze({
      index: this._index,
      isActive: this._active,
      value: this._value,
    });
  }
}
