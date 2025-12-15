export interface ISpline<T> {
  getPointAt(t: number): T;
  getLength(): number;
  getPoints(): T[];
}
