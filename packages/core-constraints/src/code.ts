// ============================================================================
// @monorepo/core-constraint
// 3D-ready abstractions
// Depends on @monorepo/core-math only
// ============================================================================

import type { IBoundingBox, IMatrix, IVector } from "@monorepo/core-math";

// ----------------------------------------------------------------------------
// References
// ----------------------------------------------------------------------------

export interface IReference<TCategory extends string = string> {
  readonly category: TCategory;
  readonly value: string;
}

export type VertexRef = IReference<"vertex">;
export type EdgeRef = IReference<"edge">;
export type FaceRef = IReference<"face">;
export type GeometryRef = IReference<"geometry">;

// ----------------------------------------------------------------------------
// Base entity
// ----------------------------------------------------------------------------

export interface IEntity<TRef extends IReference = IReference> {
  readonly ref: TRef;
}

// ----------------------------------------------------------------------------
// 3D math-facing contracts
// ----------------------------------------------------------------------------

export interface IVertex3<TVector extends IVector<TVector>> extends IEntity<VertexRef> {
  readonly position: TVector;
}

export interface IEdge extends IEntity<EdgeRef> {
  readonly start: VertexRef;
  readonly end: VertexRef;
}

export interface IFace extends IEntity<FaceRef> {
  readonly vertices: readonly VertexRef[];
}

export interface IGeometry3<TVector extends IVector<TVector>> extends IEntity<GeometryRef> {
  readonly vertices: readonly VertexRef[];
  readonly edges: readonly EdgeRef[];
  readonly faces: readonly FaceRef[];
  readonly bounds: IBoundingBox;
}

export interface IMeshGeometry<TVector extends IVector<TVector>> extends IGeometry3<TVector> {
  readonly transform: IMatrix;
}

export interface IGeometrySnapshot3<TVector extends IVector<TVector>, TGeometry extends IGeometry3<TVector> = IGeometry3<TVector>> {
  readonly geometry: TGeometry;
  readonly vertices: readonly IVertex3<TVector>[];
  readonly edges: readonly IEdge[];
  readonly faces: readonly IFace[];
  readonly bounds: IBoundingBox;
}

// ----------------------------------------------------------------------------
// Mesh topology specializations
// ----------------------------------------------------------------------------

export interface ITriangleFace extends IFace {
  readonly vertices: readonly [VertexRef, VertexRef, VertexRef];
}

export interface IQuadFace extends IFace {
  readonly vertices: readonly [VertexRef, VertexRef, VertexRef, VertexRef];
}

export interface ITriangleMeshGeometry<TVector extends IVector<TVector>> extends IMeshGeometry<TVector> {
  readonly faces: readonly FaceRef[];
}

// ----------------------------------------------------------------------------
// Constraint abstractions for 3D
// ----------------------------------------------------------------------------

export type ConstraintRef = IReference<"constraint">;
export type ConstrainedRef = VertexRef | EdgeRef | FaceRef | GeometryRef | ConstraintRef;

export interface IConstraint extends IEntity<ConstraintRef> {
  readonly participants: readonly ConstrainedRef[];
}

export interface IDistanceConstraint extends IConstraint {
  readonly first: VertexRef;
  readonly second: VertexRef;
  readonly distance: number;
}

export interface IFixedVertexConstraint<TVector extends IVector<TVector>> extends IConstraint {
  readonly target: VertexRef;
  readonly anchor: TVector;
}

export interface IPlanarFaceConstraint extends IConstraint {
  readonly face: FaceRef;
}

export interface INormalAlignmentConstraint<TVector extends IVector<TVector>> extends IConstraint {
  readonly face: FaceRef;
  readonly normal: TVector;
}

export interface ITransformConstraint extends IConstraint {
  readonly geometry: GeometryRef;
  readonly transform: IMatrix;
}

// ----------------------------------------------------------------------------
// Store contracts
// ----------------------------------------------------------------------------

export interface IGeometryStore3<TVector extends IVector<TVector>> {
  getVertex(ref: VertexRef): IVertex3<TVector> | undefined;
  getEdge(ref: EdgeRef): IEdge | undefined;
  getFace(ref: FaceRef): IFace | undefined;
  getGeometry(ref: GeometryRef): IGeometry3<TVector> | undefined;
  getSnapshot<TGeometry extends IGeometry3<TVector>>(ref: GeometryRef): IGeometrySnapshot3<TVector, TGeometry> | undefined;
}

export interface IConstraintStore {
  getConstraint(ref: ConstraintRef): IConstraint | undefined;
  getConstraintsFor(target: ConstrainedRef): readonly IConstraint[];
  getAllConstraints(): readonly IConstraint[];
}

export interface IConstraintModel3<TVector extends IVector<TVector>>
  extends IGeometryStore3<TVector>, IConstraintStore {}

// ----------------------------------------------------------------------------
// Renderer-facing adapter contract stays outside rendering technology
// ----------------------------------------------------------------------------

export interface IViewAdapter<TSource, TView> {
  create(source: TSource): TView;
  update(source: TSource, view: TView): void;
  dispose(view: TView): void;
}