param(
    [string]$PackageName = "@my-graphics/core-constraints",
    [string]$Folder = "Libraries/core-constraints"
)

Write-Host "⚙️ Creating package: $PackageName in $Folder"

# --- Remove if exists ---
if (Test-Path $Folder) {
    Write-Host "🗑 Removing existing folder..."
    Remove-Item -Recurse -Force $Folder
}

# --- Create folder structure ---
Write-Host "📁 Creating structure..."
New-Item -ItemType Directory -Path "$Folder/src/interfaces" -Force | Out-Null
New-Item -ItemType Directory -Path "$Folder/src/model" -Force | Out-Null
New-Item -ItemType Directory -Path "$Folder/src/constraints" -Force | Out-Null
New-Item -ItemType Directory -Path "$Folder/tests" -Force | Out-Null

# -----------------------------
# Helper: Write file safely
# -----------------------------
function Write-File($path, $content) {
    $dir = Split-Path $path
    if (!(Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    Set-Content -Path $path -Value $content -Encoding UTF8
}

# -----------------------------
# package.json
# -----------------------------
Write-File "$Folder/package.json" @"
{
  "name": "$PackageName",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "test": "vitest --config vitest.config.ts"
  },
  "dependencies": {
    "@my-graphics/core-logger": "workspace:*",
    "@my-graphics/core-filesystem": "workspace:*",
    "@my-graphics/core-specifications": "workspace:*"
  },
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  }
}
"@

# -----------------------------
# tsconfig.json
# -----------------------------
Write-File "$Folder/tsconfig.json" @"
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "composite": true,
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
"@

# -----------------------------
# vitest.config.ts
# -----------------------------
Write-File "$Folder/vitest.config.ts" @"
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: ['tests/**/*.test.ts']
  }
});
"@

# -----------------------------
# src/index.ts
# -----------------------------
Write-File "$Folder/src/index.ts" @"
export * from './interfaces/IConstraint.js';
export * from './model/RectangleNode.js';
export * from './constraints/NoOverlapConstraint.js';
export * from './constraints/StackConstraint.js';
export * from './constraints/FlexConstraint.js';
export * from './constraints/CircleConstraint.js';
"@

# -----------------------------
# interfaces/IConstraint.ts
# -----------------------------
Write-File "$Folder/src/interfaces/IConstraint.ts" @"
import { RectangleNode } from '../model/RectangleNode.js';

export interface IConstraint {
  readonly name: string;
  apply(node: RectangleNode): void;
}
"@

# -----------------------------
# model/RectangleNode.ts
# -----------------------------
Write-File "$Folder/src/model/RectangleNode.ts" @"
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class RectangleNode {
  children: RectangleNode[] = [];
  constraints: any[] = [];

  constructor(public rect: Rect) {}

  add(node: RectangleNode): this {
    this.children.push(node);
    return this;
  }

  addConstraint(c: any): this {
    this.constraints.push(c);
    return this;
  }
}
"@

# -----------------------------
# constraints/NoOverlapConstraint.ts
# -----------------------------
Write-File "$Folder/src/constraints/NoOverlapConstraint.ts" @"
import { RectangleNode } from '../model/RectangleNode.js';
import { IConstraint } from '../interfaces/IConstraint.js';

export class NoOverlapConstraint implements IConstraint {
  readonly name = 'NoOverlap';

  apply(node: RectangleNode): void {
    for (let i = 0; i < node.children.length; i++) {
      for (let j = i + 1; j < node.children.length; j++) {
        const A = node.children[i].rect;
        const B = node.children[j].rect;

        const overlap =
          A.x < B.x + B.width &&
          A.x + A.width > B.x &&
          A.y < B.y + B.height &&
          A.y + A.height > B.y;

        if (overlap) {
          const shift = 10;
          node.children[j].rect.x += shift;
          node.children[j].rect.y += shift;
        }
      }
    }
  }
}
"@

# -----------------------------
# constraints/StackConstraint.ts
# -----------------------------
Write-File "$Folder/src/constraints/StackConstraint.ts" @"
import { RectangleNode } from '../model/RectangleNode.js';
import { IConstraint } from '../interfaces/IConstraint.js';

export class StackConstraint implements IConstraint {
  readonly name = 'STACK_VERTICAL';

  constructor(private gap: number = 4) {}

  apply(node: RectangleNode): void {
    let offsetY = node.rect.y;

    for (const c of node.children) {
      c.rect.y = offsetY;
      offsetY += c.rect.height + this.gap;
    }
  }
}
"@

# -----------------------------
# constraints/FlexConstraint.ts
# -----------------------------
Write-File "$Folder/src/constraints/FlexConstraint.ts" @"
import { RectangleNode } from '../model/RectangleNode.js';
import { IConstraint } from '../interfaces/IConstraint.js';

export class FlexConstraint implements IConstraint {
  readonly name = 'FLEX_ROW';

  constructor(private gap: number = 6) {}

  apply(node: RectangleNode): void {
    let offsetX = node.rect.x;

    for (const c of node.children) {
      c.rect.x = offsetX;
      offsetX += c.rect.width + this.gap;
    }
  }
}
"@

# -----------------------------
# constraints/CircleConstraint.ts
# -----------------------------
Write-File "$Folder/src/constraints/CircleConstraint.ts" @"
import { RectangleNode } from '../model/RectangleNode.js';
import { IConstraint } from '../interfaces/IConstraint.js';

export class CircleConstraint implements IConstraint {
  readonly name = 'CIRCLE';

  apply(node: RectangleNode): void {
    const R = Math.min(node.rect.width, node.rect.height) / 2;
    const cx = node.rect.x + R;
    const cy = node.rect.y + R;

    const count = node.children.length;
    const step = (Math.PI * 2) / count;

    node.children.forEach((c, i) => {
      const angle = i * step;
      c.rect.x = cx + Math.cos(angle) * (R - c.rect.width / 2);
      c.rect.y = cy + Math.sin(angle) * (R - c.rect.height / 2);
    });
  }
}
"@

# -----------------------------
# tests/basic.test.ts
# -----------------------------
Write-File "$Folder/tests/basic.test.ts" @"
import { describe, it, expect } from 'vitest';
import { RectangleNode } from '../src/model/RectangleNode.js';
import { StackConstraint } from '../src/constraints/StackConstraint.js';

describe('StackConstraint', () => {
  it('applies simple vertical layout', () => {
    const root = new RectangleNode({ x: 0, y: 0, width: 100, height: 100 });

    root
      .add(new RectangleNode({ x: 0, y: 0, width: 20, height: 10 }))
      .add(new RectangleNode({ x: 0, y: 0, width: 20, height: 10 }));

    const c = new StackConstraint(5);
    c.apply(root);

    expect(root.children[0].rect.y).toBe(0);
    expect(root.children[1].rect.y).toBe(15);
  });
});
"@

Write-Host "📦 Installing workspace dependencies..."
pnpm install

Write-Host "🛠 Building workspace..."
pnpm -w build

Write-Host "✅ core-constraints created successfully"
