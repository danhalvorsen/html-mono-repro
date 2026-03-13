// ============================================================
// CORE NUMERIC FFT + GRID + FIELD LAYER
// Single-file architecture skeleton
// ============================================================

// ============================================================
// GRID INTERFACES
// ============================================================

interface IGrid1 {
  readonly size: number
  readonly cellSize: number
  readonly length: number

  isInside(x: number): boolean
  toIndex(x: number): number
}

interface IGrid2 {
  readonly width: number
  readonly height: number
  readonly cellSizeX: number
  readonly cellSizeY: number

  isInside(x: number, y: number): boolean
  toIndex(x: number, y: number): number
}

interface IGrid3 {
  readonly width: number
  readonly height: number
  readonly depth: number
  readonly cellSizeX: number
  readonly cellSizeY: number
  readonly cellSizeZ: number

  isInside(x: number, y: number, z: number): boolean
  toIndex(x: number, y: number, z: number): number
}

// ============================================================
// GRID IMPLEMENTATIONS
// ============================================================

class Grid1 implements IGrid1 {
  readonly length: number

  constructor(
    public readonly size: number,
    public readonly cellSize: number
  ) {
    this.length = size * cellSize
  }

  isInside(x: number): boolean {
    return x >= 0 && x < this.size
  }

  toIndex(x: number): number {
    return x
  }
}

class Grid2 implements IGrid2 {

  constructor(
    public readonly width: number,
    public readonly height: number,
    public readonly cellSizeX: number,
    public readonly cellSizeY: number
  ) {}

  isInside(x: number, y: number): boolean {
    return x >= 0 && x < this.width && y >= 0 && y < this.height
  }

  toIndex(x: number, y: number): number {
    return y * this.width + x
  }
}

class Grid3 implements IGrid3 {

  constructor(
    public readonly width: number,
    public readonly height: number,
    public readonly depth: number,
    public readonly cellSizeX: number,
    public readonly cellSizeY: number,
    public readonly cellSizeZ: number
  ) {}

  isInside(x: number, y: number, z: number): boolean {
    return (
      x >= 0 && x < this.width &&
      y >= 0 && y < this.height &&
      z >= 0 && z < this.depth
    )
  }

  toIndex(x: number, y: number, z: number): number {
    return x + y * this.width + z * this.width * this.height
  }
}

// ============================================================
// SCALAR FIELD INTERFACES
// ============================================================

interface IScalarField1 {
  readonly grid: IGrid1
  get(x: number): number
  set(x: number, v: number): void
  raw(): Float64Array
}

interface IScalarField2 {
  readonly grid: IGrid2
  get(x: number, y: number): number
  set(x: number, y: number, v: number): void
  raw(): Float64Array
}

interface IScalarField3 {
  readonly grid: IGrid3
  get(x: number, y: number, z: number): number
  set(x: number, y: number, z: number, v: number): void
  raw(): Float64Array
}

// ============================================================
// SCALAR FIELD IMPLEMENTATIONS
// ============================================================

class ScalarField1 implements IScalarField1 {

  private data: Float64Array

  constructor(public readonly grid: IGrid1) {
    this.data = new Float64Array(grid.size)
  }

  get(x: number): number {
    return this.data[this.grid.toIndex(x)]
  }

  set(x: number, v: number): void {
    this.data[this.grid.toIndex(x)] = v
  }

  raw(): Float64Array {
    return this.data
  }
}

class ScalarField2 implements IScalarField2 {

  private data: Float64Array

  constructor(public readonly grid: IGrid2) {
    this.data = new Float64Array(grid.width * grid.height)
  }

  get(x: number, y: number): number {
    return this.data[this.grid.toIndex(x, y)]
  }

  set(x: number, y: number, v: number): void {
    this.data[this.grid.toIndex(x, y)] = v
  }

  raw(): Float64Array {
    return this.data
  }
}

class ScalarField3 implements IScalarField3 {

  private data: Float64Array

  constructor(public readonly grid: IGrid3) {
    this.data = new Float64Array(
      grid.width * grid.height * grid.depth
    )
  }

  get(x: number, y: number, z: number): number {
    return this.data[this.grid.toIndex(x, y, z)]
  }

  set(x: number, y: number, z: number, v: number): void {
    this.data[this.grid.toIndex(x, y, z)] = v
  }

  raw(): Float64Array {
    return this.data
  }
}

// ============================================================
// COMPLEX SPECTRUM INTERFACES
// ============================================================

interface ISpectrum1 {
  readonly size: number
  real(): Float64Array
  imag(): Float64Array
}

interface ISpectrum2 {
  readonly width: number
  readonly height: number
  real(): Float64Array
  imag(): Float64Array
}

interface ISpectrum3 {
  readonly width: number
  readonly height: number
  readonly depth: number
  real(): Float64Array
  imag(): Float64Array
}

// ============================================================
// COMPLEX SPECTRUM IMPLEMENTATIONS
// ============================================================

class Spectrum1 implements ISpectrum1 {

  private r: Float64Array
  private i: Float64Array

  constructor(public readonly size: number) {
    this.r = new Float64Array(size)
    this.i = new Float64Array(size)
  }

  real(): Float64Array { return this.r }
  imag(): Float64Array { return this.i }
}

class Spectrum2 implements ISpectrum2 {

  private r: Float64Array
  private i: Float64Array

  constructor(
    public readonly width: number,
    public readonly height: number
  ) {
    const n = width * height
    this.r = new Float64Array(n)
    this.i = new Float64Array(n)
  }

  real(): Float64Array { return this.r }
  imag(): Float64Array { return this.i }
}

class Spectrum3 implements ISpectrum3 {

  private r: Float64Array
  private i: Float64Array

  constructor(
    public readonly width: number,
    public readonly height: number,
    public readonly depth: number
  ) {
    const n = width * height * depth
    this.r = new Float64Array(n)
    this.i = new Float64Array(n)
  }

  real(): Float64Array { return this.r }
  imag(): Float64Array { return this.i }
}

// ============================================================
// FFT INTERFACES
// ============================================================

interface IFft1 {
  forward(field: IScalarField1, spectrum: ISpectrum1): void
  inverse(spectrum: ISpectrum1, field: IScalarField1): void
}

interface IFft2 {
  forward(field: IScalarField2, spectrum: ISpectrum2): void
  inverse(spectrum: ISpectrum2, field: IScalarField2): void
}

interface IFft3 {
  forward(field: IScalarField3, spectrum: ISpectrum3): void
  inverse(spectrum: ISpectrum3, field: IScalarField3): void
}

// ============================================================
// SIMPLE REFERENCE FFT IMPLEMENTATION (DFT)
// NOTE: O(N²) reference implementation
// ============================================================

class NaiveFft1 implements IFft1 {

  forward(field: IScalarField1, spec: ISpectrum1): void {

    const data = field.raw()
    const re = spec.real()
    const im = spec.imag()

    const N = spec.size

    for (let k = 0; k < N; k++) {

      let sumRe = 0
      let sumIm = 0

      for (let n = 0; n < N; n++) {

        const angle = -2 * Math.PI * k * n / N

        sumRe += data[n] * Math.cos(angle)
        sumIm += data[n] * Math.sin(angle)
      }

      re[k] = sumRe
      im[k] = sumIm
    }
  }

  inverse(spec: ISpectrum1, field: IScalarField1): void {

    const re = spec.real()
    const im = spec.imag()
    const out = field.raw()

    const N = spec.size

    for (let n = 0; n < N; n++) {

      let sum = 0

      for (let k = 0; k < N; k++) {

        const angle = 2 * Math.PI * k * n / N

        sum +=
          re[k] * Math.cos(angle) -
          im[k] * Math.sin(angle)
      }

      out[n] = sum / N
    }
  }
}

// ============================================================
// 2D FFT (ROW/COLUMN COMPOSITION)
// ============================================================

class Fft2 implements IFft2 {

  constructor(private fft1: IFft1) {}

  forward(field: IScalarField2, spec: ISpectrum2): void {

    const grid = field.grid
    const tempField = new ScalarField1(new Grid1(grid.width,1))
    const tempSpec = new Spectrum1(grid.width)

    for (let y = 0; y < grid.height; y++) {

      for (let x = 0; x < grid.width; x++) {
        tempField.set(x, field.get(x,y))
      }

      this.fft1.forward(tempField,tempSpec)

      for (let x = 0; x < grid.width; x++) {
        spec.real()[grid.toIndex(x,y)] = tempSpec.real()[x]
        spec.imag()[grid.toIndex(x,y)] = tempSpec.imag()[x]
      }
    }
  }

  inverse(spec: ISpectrum2, field: IScalarField2): void {

    const grid = field.grid

    for (let i=0;i<spec.real().length;i++){
      field.raw()[i] = spec.real()[i]
    }
  }
}

// ============================================================
// 3D FFT (EXTENSION)
// ============================================================

class Fft3 implements IFft3 {

  constructor(private fft2: IFft2) {}

  forward(field: IScalarField3, spec: ISpectrum3): void {

    const grid = field.grid

    const sliceGrid = new Grid2(grid.width,grid.height,1,1)
    const sliceField = new ScalarField2(sliceGrid)
    const sliceSpec = new Spectrum2(grid.width,grid.height)

    for (let z=0; z<grid.depth; z++){

      for (let y=0;y<grid.height;y++)
      for (let x=0;x<grid.width;x++)
        sliceField.set(x,y,field.get(x,y,z))

      this.fft2.forward(sliceField,sliceSpec)

      const offset = z*grid.width*grid.height

      for (let i=0;i<sliceSpec.real().length;i++){
        spec.real()[offset+i] = sliceSpec.real()[i]
        spec.imag()[offset+i] = sliceSpec.imag()[i]
      }
    }
  }

  inverse(spec: ISpectrum3, field: IScalarField3): void {

    for (let i=0;i<field.raw().length;i++){
      field.raw()[i] = spec.real()[i]
    }
  }
}