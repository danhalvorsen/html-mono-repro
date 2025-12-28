 
export interface IColor {
  R: number;
  G: number;
  B: number;
  
 toString (): string;
}
export class Color implements IColor {
  private _r = 0;
  private _g = 0;
  private _b = 0;

  get R(): number {
    return this._r;
  }
  set R(value: number) {
    this._r = value;
  }

  get G(): number {
    return this._g;
  }
  set G(value: number) {
    this._g = value;
  }

  get B(): number {
    return this._b;
  }
  set B(value: number) {
    this._b = value;
  }

  toString(): string {
    return `${this.R},${this.G},${this.B}`;
  }
}
