# codereviewUpdate.ps1
# Overwrites selected files in Applications/Lit/svg-rect with the reviewed updates.
# - Makes backups (*.bak.<timestamp>) before overwriting.
# - Writes UTF-8 (no BOM) deterministically.
# Usage:
#   pwsh .\codereviewUpdate.ps1
#   pwsh .\codereviewUpdate.ps1 -RepoRoot "C:\path\to\MonoRepro"

[CmdletBinding()]
param(
  [Parameter(Mandatory = $false)]
  [string]$RepoRoot = (Get-Location).Path
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Write-FileWithBackup {
  param(
    [Parameter(Mandatory = $true)][string]$Path,
    [Parameter(Mandatory = $true)][string]$Content
  )

  $dir = Split-Path -Parent $Path
  if (-not (Test-Path $dir)) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
  }

  if (Test-Path $Path) {
    $ts = Get-Date -Format "yyyyMMdd-HHmmss"
    Copy-Item -Path $Path -Destination ($Path + ".bak." + $ts) -Force
  }

  # Ensure LF line endings (PowerShell may keep CRLF; TS compiler doesn't care, but keep stable)
  $normalized = $Content -replace "`r`n", "`n"

  Set-Content -Path $Path -Value $normalized -Encoding utf8NoBOM -NoNewline
  Write-Host "Updated: $Path"
}

$base = Join-Path $RepoRoot "Applications\Lit\svg-rect\src"

# ---------------------------------------------------------------------------
# controllers/types.ts  (add viewport to CanvasSurface; keep existing exports)
# ---------------------------------------------------------------------------
$typesTs = @'
import type { ReactiveControllerHost } from "lit";

export class RectModel {
  public x = 20;
  public y = 20;
  public w = 80;
  public h = 60;
}

export type Host = ReactiveControllerHost & EventTarget;
export type Handle = "nw" | "ne" | "se" | "sw";

// Added: small surface port (MVP)
export type ViewBox = Readonly<{ x: number; y: number; width: number; height: number }>;
export type Viewport = Readonly<{ width: number; height: number }>;

export type CanvasSurface = Readonly<{
  layers: {
    layer(name: string, behindAll?: boolean): SVGGElement;
    remove(name: string): void;
  };
  viewBox(): ViewBox;
  viewport(): Viewport;
}>;
'@

# ---------------------------------------------------------------------------
# controllers/LayerController.ts  (remove touchAction ownership from layer)
# ---------------------------------------------------------------------------
$layerControllerTs = @'
import type { ReactiveController } from "lit";
import type { Host } from "./types.js";

export class LayerController implements ReactiveController {
  private svg?: SVGSVGElement;
  private readonly layers = new Map<string, SVGGElement>();

  public constructor(host: Host) {
    host.addController(this);
  }

  public attach(svg: SVGSVGElement): void {
    if (this.svg === svg) return;
    this.detach();
    this.svg = svg;
  }

  public detach(): void {
    for (const [, g] of this.layers) {
      if (g.isConnected) g.remove();
    }
    this.layers.clear();
    this.svg = undefined;
  }

  public layer(name: string, behindAll = true): SVGGElement {
    const svg = this.requireSvg();
    const key = name;

    const cached = this.layers.get(key);
    if (cached && cached.isConnected) return cached;

    const existing = svg.querySelector<SVGGElement>(`g[data-layer="${CSS.escape(key)}"]`);
    if (existing) {
      existing.setAttribute("pointer-events", "none");
      this.layers.set(key, existing);
      return existing;
    }

    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("data-layer", key);
    g.setAttribute("pointer-events", "none");

    if (behindAll) svg.insertBefore(g, svg.firstChild);
    else svg.appendChild(g);

    this.layers.set(key, g);
    return g;
  }

  public remove(name: string): void {
    const svg = this.svg;
    const key = name;

    const cached = this.layers.get(key);
    if (cached?.isConnected) cached.remove();
    this.layers.delete(key);

    svg?.querySelector<SVGGElement>(`g[data-layer="${CSS.escape(key)}"]`)?.remove();
  }

  public viewBox(): { x: number; y: number; width: number; height: number } {
    const vb = this.requireSvg().viewBox.baseVal;
    return { x: vb?.x ?? 0, y: vb?.y ?? 0, width: vb?.width ?? 0, height: vb?.height ?? 0 };
  }

  hostConnected(): void {}

  hostDisconnected(): void {
    this.detach();
  }

  private requireSvg(): SVGSVGElement {
    if (!this.svg) throw new Error("LayerController: call attach(svg) before use.");
    return this.svg;
  }
}
'@

# ---------------------------------------------------------------------------
# controllers/GridController.ts
# - host.requestUpdate() (no any-cast)
# - uses canvas.viewport() (required by you)
# - normalized modulo (negative coords safe)
# ---------------------------------------------------------------------------
$gridControllerTs = @'
import type { ReactiveController } from "lit";
import type { Host } from "./types.js";
import type { SvgCanvas } from "../svgs/SvgCanvas.js";

import { LineSvg } from "../svgs/LineSvg.js";
import { CANVAS_GEOMETRY_EVENT } from "../events/canvas-events.js";

export class GridController implements ReactiveController {
  private enabled = true;
  private size = 10;
  private majorEvery = 5;
  private readonly layerName = "grid";

  private readonly onGeom = () => this.render();

  public constructor(
    private readonly host: Host,
    private readonly canvas: SvgCanvas
  ) {
    host.addController(this);
  }

  hostConnected(): void {
    this.canvas.addEventListener(CANVAS_GEOMETRY_EVENT, this.onGeom);
    this.render();
  }

  hostDisconnected(): void {
    this.canvas.removeEventListener(CANVAS_GEOMETRY_EVENT, this.onGeom);
  }

  public setEnabled(v: boolean): void {
    if (this.enabled === v) return;
    this.enabled = v;
    this.render();
    this.host.requestUpdate();
  }

  private mod(n: number, m: number): number {
    return ((n % m) + m) % m;
  }

  public render(): void {
    if (!this.enabled) {
      this.canvas.layers.remove(this.layerName);
      return;
    }

    // Required: grid reads viewport size from canvas
    const vp = this.canvas.viewport();
    if (vp.width <= 0 || vp.height <= 0) return;

    const vb = this.canvas.viewBox();
    const g = this.canvas.layers.layer(this.layerName, true);
    g.replaceChildren();

    const x0 = vb.x, y0 = vb.y, x1 = vb.x + vb.width, y1 = vb.y + vb.height;
    const step = this.size;

    const startX = Math.floor(x0 / step) * step;
    const startY = Math.floor(y0 / step) * step;

    for (let x = startX; x <= x1; x += step) {
      const idx = Math.floor(x / step);
      const major = this.mod(idx, this.majorEvery) === 0;
      const line = new LineSvg(x, y0, x, y1);
      (major ? line.major() : line.minor()).appendTo(g);
    }

    for (let y = startY; y <= y1; y += step) {
      const idx = Math.floor(y / step);
      const major = this.mod(idx, this.majorEvery) === 0;
      const line = new LineSvg(x0, y, x1, y);
      (major ? line.major() : line.minor()).appendTo(g);
    }
  }
}
'@

# ---------------------------------------------------------------------------
# svgs/SvgCanvas.ts
# - extends EventTarget
# - owns touchAction + viewBox authority
# - syncViewBoxToViewport dispatches CANVAS_GEOMETRY_EVENT
# - DOES NOT call sync in constructor (layout may be 0x0)
# ---------------------------------------------------------------------------
$svgCanvasTs = @'
import type { Host } from "../controllers/types.js";
import { LayerController } from "../controllers/LayerController.js";
import { GridController } from "../controllers/GridController.js";
import { CANVAS_GEOMETRY_EVENT } from "../events/canvas-events.js";

export type Pt = { x: number; y: number };

export class SvgCanvas extends EventTarget {
  public readonly layers: LayerController;
  public readonly grid: GridController;

  public constructor(host: Host, public readonly el: SVGSVGElement) {
    super();

    // single owner for pointer behavior
    this.el.style.touchAction = "none";

    this.layers = new LayerController(host);
    this.layers.attach(el);

    this.grid = new GridController(host, this);
  }

  public viewBox(): Readonly<{ x: number; y: number; width: number; height: number }> {
    const vb = this.el.viewBox.baseVal;
    return { x: vb?.x ?? 0, y: vb?.y ?? 0, width: vb?.width ?? 0, height: vb?.height ?? 0 };
  }

  /** Viewport in CSS pixels (what user sees). */
  public viewport(): Readonly<{ width: number; height: number }> {
    const r = this.el.getBoundingClientRect();
    return { width: Math.round(r.width), height: Math.round(r.height) };
  }

  public toSvgPoint(e: PointerEvent): Pt {
    const pt = this.el.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;

    const ctm = this.el.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };

    const sp = pt.matrixTransform(ctm.inverse());
    return { x: sp.x, y: sp.y };
  }

  /** Align viewBox to viewport and notify grid/others. Call from firstUpdated() and on resize. */
  public syncViewBoxToViewport(): void {
    const r = this.el.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width));
    const h = Math.max(1, Math.round(r.height));

    const vb = this.el.viewBox.baseVal;
    const same =
      vb.x === 0 &&
      vb.y === 0 &&
      Math.round(vb.width) === w &&
      Math.round(vb.height) === h;

    if (!same) this.el.setAttribute("viewBox", `0 0 ${w} ${h}`);

    this.dispatchEvent(new Event(CANVAS_GEOMETRY_EVENT));
  }
}
'@

# ---------------------------------------------------------------------------
# svgs/Draggable-rect-svg.ts
# - remove hardcoded viewBox (canvas is authority)
# - call canvas.syncViewBoxToViewport() in firstUpdated (after layout)
# ---------------------------------------------------------------------------
$draggableRectSvgTs = @'
// Applications/Lit/svg-rect/src/svgs/Draggable-rect-svg.ts
import { LitElement, html, svg } from "lit";
import { customElement, query } from "lit/decorators.js";

import type { ReactiveController } from "lit";

import { MouseController } from "../controllers/MouseController.js";
import { DragController } from "../controllers/DragController.js";
import { ScaleController } from "../controllers/ScaleController.js";
import { RectModel } from "../controllers/types.js";

import { SvgCanvas } from "./SvgCanvas.js";
import { GRID_TOGGLE_EVENT, type GridToggleDetail } from "../events/grid-events.js";

class GridToggleController implements ReactiveController {
  private latestEnabled: boolean | undefined;

  public constructor(
    private readonly host: LitElement,
    private readonly getCanvas: () => SvgCanvas | undefined
  ) {
    host.addController(this);
  }

  hostConnected(): void {
    window.addEventListener(GRID_TOGGLE_EVENT, this.onToggle as EventListener);
  }

  hostDisconnected(): void {
    window.removeEventListener(GRID_TOGGLE_EVENT, this.onToggle as EventListener);
  }

  public applyBufferedState(): void {
    const canvas = this.getCanvas();
    if (!canvas) return;
    canvas.grid.setEnabled(this.latestEnabled ?? true);
  }

  private readonly onToggle = (e: Event) => {
    const ev = e as CustomEvent<GridToggleDetail>;
    const enabled = ev.detail?.enabled;
    if (typeof enabled !== "boolean") return;

    this.latestEnabled = enabled;

    const canvas = this.getCanvas();
    if (canvas) {
      canvas.grid.setEnabled(enabled);
      this.host.requestUpdate();
    }
  };
}

@customElement("draggable-rect-svg")
export class DraggableRectSvg extends LitElement {
  private canvas?: SvgCanvas;

  private readonly mouse = new MouseController(this);
  private readonly rect = new RectModel();

  private readonly drag = new DragController(this, this.rect);
  private readonly scale = new ScaleController(this, this.rect);

  private readonly gridToggle = new GridToggleController(this, () => this.canvas);

  @query("svg") private readonly svgEl!: SVGSVGElement;

  protected firstUpdated(): void {
    this.canvas = new SvgCanvas(this, this.svgEl);

    // Canvas is the viewBox authority; sync AFTER layout.
    this.canvas.syncViewBoxToViewport();

    // Apply any toggle that happened before firstUpdated
    this.gridToggle.applyBufferedState();

    this.mouse.attach(this.canvas);
  }

  disconnectedCallback(): void {
    this.mouse.detach();
    super.disconnectedCallback();
  }

  render() {
    const r = 3;
    const { x, y, w, h } = this.rect;

    return html`
      <svg width="1500" height="400" style="border:2px solid #ccc;">
        ${svg`
          <rect
            x="${x}"
            y="${y}"
            width="${w}"
            height="${h}"
            fill="yellow"
            fill-opacity="0.3"
            stroke="yellow"
            stroke-width="1"
            @pointerdown=${(e: PointerEvent) => {
              this.drag.beginDrag();
              this.mouse.begin(e);
            }}
          ></rect>

          <circle
            cx="${x}"
            cy="${y}"
            r="${r}"
            fill="yellow"
            @pointerdown=${(e: PointerEvent) => {
              this.scale.beginScale("nw");
              this.mouse.begin(e);
            }}
          ></circle>

          <circle
            cx="${x + w}"
            cy="${y}"
            r="${r}"
            fill="yellow"
            @pointerdown=${(e: PointerEvent) => {
              this.scale.beginScale("ne");
              this.mouse.begin(e);
            }}
          ></circle>

          <circle
            cx="${x + w}"
            cy="${y + h}"
            r="${r}"
            fill="yellow"
            @pointerdown=${(e: PointerEvent) => {
              this.scale.beginScale("se");
              this.mouse.begin(e);
            }}
          ></circle>

          <circle
            cx="${x}"
            cy="${y + h}"
            r="${r}"
            fill="yellow"
            @pointerdown=${(e: PointerEvent) => {
              this.scale.beginScale("sw");
              this.mouse.begin(e);
            }}
          ></circle>
        `}
      </svg>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "draggable-rect-svg": DraggableRectSvg;
  }
}
'@

# Write all files
Write-FileWithBackup -Path (Join-Path $base "controllers\types.ts") -Content $typesTs
Write-FileWithBackup -Path (Join-Path $base "controllers\LayerController.ts") -Content $layerControllerTs
Write-FileWithBackup -Path (Join-Path $base "controllers\GridController.ts") -Content $gridControllerTs
Write-FileWithBackup -Path (Join-Path $base "svgs\SvgCanvas.ts") -Content $svgCanvasTs
Write-FileWithBackup -Path (Join-Path $base "svgs\Draggable-rect-svg.ts") -Content $draggableRectSvgTs

Write-Host "Done."