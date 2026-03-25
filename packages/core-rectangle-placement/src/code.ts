// ============================================================================
// packages/core.rectangle.placement/src/code.ts
// ============================================================================

import type { IBox2 } from "@monorepo/core-math-rectangle";
import type { ISpecification } from "@monorepo/core-specifications";
import type { IRule } from "@monorepo/core-specifications-rules";

// ----------------------------------------------------------------------------
// IDENTIFIERS
// ----------------------------------------------------------------------------

export interface IRectangleKind {
  readonly value: string;
}

export interface IPlacementZoneId {
  readonly value: string;
}

export interface IPlaceholderId {
  readonly value: string;
}

// ----------------------------------------------------------------------------
// CORE VALUE CONTRACTS
// ----------------------------------------------------------------------------

export interface IEdgeInset2 {
  readonly top: number;
  readonly bottom: number;
  readonly left: number;
  readonly right: number;
}

export interface IPlacementCandidate {
  readonly kind: IRectangleKind;
  readonly bounds: IBox2;
}

export interface IOccupiedPlacement {
  readonly candidate: IPlacementCandidate;
}

export interface IPlacementContext {
  readonly host: IBox2;
  readonly candidate: IPlacementCandidate;
  readonly occupied: readonly IOccupiedPlacement[];
}

export interface IPlacementQuery {
  readonly kind: IRectangleKind;
  readonly minimumBounds: IBox2;
}

export interface IPlacementZone {
  readonly id: IPlacementZoneId;
  readonly bounds: IBox2;
  readonly allowedKinds: readonly IRectangleKind[];
}

export enum PlaceholderState {
  Free = "free",
  Reserved = "reserved",
  Occupied = "occupied",
  Blocked = "blocked",
}

export interface IPlaceholderVisualPart {
  readonly name: string;
  readonly bounds: IBox2;
}

export interface IPlaceholder {
  readonly id: IPlaceholderId;
  readonly state: PlaceholderState;
  readonly zone: IPlacementZone;
  readonly bounds: IBox2;
  readonly allowedKinds: readonly IRectangleKind[];
  readonly visualParts: readonly IPlaceholderVisualPart[];
}

// ----------------------------------------------------------------------------
// SPECIFICATION CONTRACTS
// ----------------------------------------------------------------------------

export interface IRectanglePlacementSpecification extends ISpecification<IPlacementContext> {}

export interface IAllowedKindsSpecification extends IRectanglePlacementSpecification {
  readonly allowedKinds: readonly IRectangleKind[];
}

export interface IInsideHostSpecification extends IRectanglePlacementSpecification {}

export interface IInsetFromHostSpecification extends IRectanglePlacementSpecification {
  readonly inset: IEdgeInset2;
}

export interface ISpacingToOccupiedSpecification extends IRectanglePlacementSpecification {
  readonly spacing: IEdgeInset2;
}

export interface IContainedInZoneSpecification extends IRectanglePlacementSpecification {
  readonly zoneId: IPlacementZoneId;
}

export interface IExcludedByZoneSpecification extends IRectanglePlacementSpecification {
  readonly zoneId: IPlacementZoneId;
}

export interface IPlacementZoneProviderSpecification extends IRectanglePlacementSpecification {
  readonly zone: IPlacementZone;
}

// ----------------------------------------------------------------------------
// RULE ADAPTER CONTRACTS
// ----------------------------------------------------------------------------

export interface IRectanglePlacementRule extends IRule<IPlacementContext> {}

export interface IPlacementRuleCatalog {
  readonly rules: readonly IRectanglePlacementRule[];
}

// ----------------------------------------------------------------------------
// PLACEHOLDER CONTRACTS
// ----------------------------------------------------------------------------

export interface IPlaceholderCatalog {
  getAll(): readonly IPlaceholder[];
  getByKind(kind: IRectangleKind): readonly IPlaceholder[];
  getByState(state: PlaceholderState): readonly IPlaceholder[];
}

export interface IPlaceholderResolver {
  resolve(query: IPlacementQuery): readonly IPlaceholder[];
}

export interface IPlaceholderReservation {
  readonly placeholder: IPlaceholder;
  readonly candidate: IPlacementCandidate;
}

export interface IPlacementPlan {
  readonly reservation: IPlaceholderReservation;
}

export interface IPlacementResult {
  readonly isValid: boolean;
  readonly acceptedPlan: IPlacementPlan | null;
}

export interface IPlacementValidator {
  validate(context: IPlacementContext): IPlacementResult;
}

export interface IPlacementPlanner {
  plan(
    query: IPlacementQuery,
    candidate: IPlacementCandidate,
    occupied: readonly IOccupiedPlacement[],
  ): IPlacementResult;
}

// ============================================================================
// packages/core.rectangle.placement/src/index.ts
// ============================================================================

export * from "./code.js";

