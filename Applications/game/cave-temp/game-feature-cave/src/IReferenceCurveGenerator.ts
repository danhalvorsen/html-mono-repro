import type { ReferenceCurve } from './ReferenceCurve.js';
import type { ReferenceCurveDefinition } from './ReferenceCurveDefinition.js';

export interface IReferenceCurveGenerator {
  create(definition: ReferenceCurveDefinition): ReferenceCurve;
}
