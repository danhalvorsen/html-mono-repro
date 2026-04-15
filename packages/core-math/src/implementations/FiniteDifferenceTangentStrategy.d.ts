import { Vector3 } from './Vector3.js';
import { IControlPointStrategy } from '../interfaces/IControlPointStrategy.js';
export declare class FiniteDifferenceTangentStrategy implements IControlPointStrategy<Vector3> {
    estimate(points: Vector3[], index: number): Vector3;
}
//# sourceMappingURL=FiniteDifferenceTangentStrategy.d.ts.map