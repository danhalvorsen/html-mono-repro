import { Guard } from "../infrastructure/Guard.js";

// ============================
// Step (domain name, not Cell)
// ============================

export class TrackStep<TValue> {
  private readonly _index: number;
  private _active: boolean;
  private _value: TValue | null;

  public constructor(index: number) {
    Guard.integer(index, "Step index");
    Guard.nonNegative(index, "Step index");

    this._index = index;
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

  public activate(value: TValue | null): void {
    this._active = true;
    this._value = value;
  }

  public deactivate(): void {
    this._active = false;
    this._value = null;
  }

  public setValue(value: TValue | null): void {
    this._value = value;
  }

  public clear(): void {
    this.deactivate();
  }
}
