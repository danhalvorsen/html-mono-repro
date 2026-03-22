# ====================================================================================
# Setup script for @monorepo/core-constraint
# Creates folder structure + writes files
# ====================================================================================

param(
    [string]$Root = ".\packages\core-constraint\src"
)

Write-Host "Creating core-constraint structure at $Root"

# ------------------------------------------------------------------------------------
# Helper
# ------------------------------------------------------------------------------------
function Write-File {
    param (
        [string]$Path,
        [string]$Content
    )

    $dir = Split-Path $Path
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }

    Set-Content -Path $Path -Value $Content -Encoding UTF8
    Write-Host "✔ $Path"
}

# ------------------------------------------------------------------------------------
# Files map (ADD YOUR CODE HERE)
# ------------------------------------------------------------------------------------

$files = @{

# ===================== ROOT =====================
"$Root\index.ts" = @"
export * from './contracts/IReference.js';
"@

# ===================== CONTRACTS =====================
"$Root\contracts\IReference.ts" = @"
export interface IReference<TCategory extends string = string> {
  readonly category: TCategory;
  readonly value: string;
}
"@

"$Root\contracts\IReferenceFactory.ts" = @"
import { IReference } from './IReference.js';

export interface IReferenceFactory {
  create<TCategory extends string>(category: TCategory): IReference<TCategory>;
}
"@

"$Root\contracts\IEntity.ts" = @"
import { IReference } from './IReference.js';

export interface IEntity<TRef extends IReference = IReference> {
  readonly ref: TRef;
}
"@

# ===================== GEOMETRY =====================
"$Root\contracts\geometry\IArea2D.ts" = @"
import type { IBoundingBox } from '@monorepo/core-math';

export interface IArea2D {
  readonly bounds: IBoundingBox;
  contains(area: IArea2D): boolean;
}
"@

"$Root\contracts\geometry\refs.ts" = @"
import { IReference } from '../IReference.js';

export type VertexRef = IReference<'vertex'>;
export type EdgeRef = IReference<'edge'>;
export type GeometryRef = IReference<'geometry'>;
"@

# ===================== IMPLEMENTATIONS =====================
"$Root\implementations\Reference.ts" = @"
import { IReference } from '../contracts/IReference.js';

export class Reference<TCategory extends string> implements IReference<TCategory> {
  constructor(
    public readonly category: TCategory,
    public readonly value: string
  ) {}
}
"@

"$Root\implementations\SequentialReferenceFactory.ts" = @"
import { IReferenceFactory } from '../contracts/IReferenceFactory.js';
import { Reference } from './Reference.js';

export class SequentialReferenceFactory implements IReferenceFactory {
  private readonly counters = new Map<string, number>();

  create<TCategory extends string>(category: TCategory) {
    const next = (this.counters.get(category) ?? 0) + 1;
    this.counters.set(category, next);
    return new Reference(category, `\${category}-\${next}`);
  }
}
"@

# ===================== SPECIFICATIONS =====================
"$Root\implementations\specifications\FitsWithinTargetSpecification.ts" = @"
import { Specification } from '@monorepo/core-specifications';

export interface IPlacementContext {
  target: { containsBox(b: any): boolean };
  source: any;
}

export class FitsWithinTargetSpecification
  extends Specification<IPlacementContext> {

  isSatisfiedBy(context: IPlacementContext): boolean {
    return context.target.containsBox(context.source);
  }
}
"@

# ===================== SOLVER =====================
"$Root\implementations\solver\ConstraintViolation.ts" = @"
export class ConstraintViolation {
  constructor(
    public readonly constraintId: string,
    public readonly message: string
  ) {}
}
"@

}

# ------------------------------------------------------------------------------------
# Write files
# ------------------------------------------------------------------------------------
foreach ($file in $files.GetEnumerator()) {
    Write-File -Path $file.Key -Content $file.Value
}

Write-Host "`n✔ core-constraint setup complete"