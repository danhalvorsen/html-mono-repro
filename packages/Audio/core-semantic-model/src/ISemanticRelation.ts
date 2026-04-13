import { SemanticShapeId } from "./SemanticValue.js";


export interface ISemanticRelation {
    readonly type: string;
    readonly targetShapeId: SemanticShapeId;
}
