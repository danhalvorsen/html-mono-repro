# fix-pdf-reading-image-fragment-filter.ps1
#
# Fix:
#   "Show all layers" shows image-looking fragments,
#   but "Show image fragments" does not.
#
# Cause:
#   The image filter is too strict:
#     fragment.kind === FragmentKinds.Image
#
# Fix:
#   Normalize fragment.kind inside the view and filter by local kind:
#     text | rectangle | image | unknown
#
# Run:
#   cd C:\Users\danha\source\repos\HTML\MonoRepro
#   powershell -ExecutionPolicy Bypass -File .\fix-pdf-reading-image-fragment-filter.ps1
#
# Then:
#   pnpm --filter "pdf-reading" build

param(
    [string] $AppRoot = "C:\Users\danha\source\repos\HTML\MonoRepro\packages\core-pdf-modules\pdf-reading"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Assert-FileExists {
    param([string] $Path)

    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
        throw "File not found: $Path"
    }
}

function Set-Utf8NoBomFile {
    param(
        [string] $Path,
        [string] $Content
    )

    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($Path, $Content, $utf8NoBom)
}

$pidViewFile = Join-Path $AppRoot "src\views\pid-pdf-view.ts"

Assert-FileExists $pidViewFile

$text = Get-Content -LiteralPath $pidViewFile -Raw

# Keep FragmentKinds import if already present, but the view will no longer depend on enum identity for filtering.
$text = [regex]::Replace(
    $text,
    'import\s+\{\s*FragmentKinds,\s*type\s+PdfFragment\s*\}\s+from\s+["'']@monorepo/core-pdf-domain["''];',
    'import type { PdfFragment } from "@monorepo/core-pdf-domain";',
    1
)

# Add local normalized kind type after LayerMode.
$text = [regex]::Replace(
    $text,
    'type LayerMode =\s*\| "original"\s*\| "text"\s*\| "rectangle"\s*\| "image"\s*\| "all-fragments"\s*\| "all-layers";',
    @'
type LayerMode =
  | "original"
  | "text"
  | "rectangle"
  | "image"
  | "all-fragments"
  | "all-layers";

type OverlayFragmentKind =
  | "text"
  | "rectangle"
  | "image"
  | "unknown";
'@,
    1
)

# Replace visibility filter with normalized kind filtering.
$text = [regex]::Replace(
    $text,
    '(?s)  private isFragmentVisibleInCurrentMode\(fragment: PdfFragment\): boolean \{\r?\n.*?\r?\n  \}\r?\n\r?\n  private resolveFragmentCssClass',
    @'
  private isFragmentVisibleInCurrentMode(fragment: PdfFragment): boolean {
    const kind = this.resolveOverlayFragmentKind(fragment);

    switch (this.layerMode) {
      case "text":
        return kind === "text";

      case "rectangle":
        return kind === "rectangle";

      case "image":
        return kind === "image";

      case "all-fragments":
      case "all-layers":
        return true;

      case "original":
        return false;
    }
  }

  private resolveFragmentCssClass
'@,
    1
)

# Replace CSS class resolver with normalized kind resolver.
$text = [regex]::Replace(
    $text,
    '(?s)  private resolveFragmentCssClass\(fragment: PdfFragment\): string \{\r?\n.*?\r?\n  \}\r?\n\r?\n  private resolveFragmentOverlayY',
    @'
  private resolveFragmentCssClass(fragment: PdfFragment): string {
    switch (this.resolveOverlayFragmentKind(fragment)) {
      case "text":
        return "fragment fragment-text";

      case "rectangle":
        return "fragment fragment-rectangle";

      case "image":
        return "fragment fragment-image";

      case "unknown":
        return "fragment fragment-unknown";
    }
  }

  private resolveFragmentOverlayY
'@,
    1
)

# Replace text Y correction to use normalized kind.
$text = [regex]::Replace(
    $text,
    'if \(fragment\.kind === FragmentKinds\.Text\) \{\s*return Math\.max\(0, box\.position\.y - box\.height\);\s*\}',
    'if (this.resolveOverlayFragmentKind(fragment) === "text") {
      return Math.max(0, box.position.y - box.height);
    }',
    1
)

# Replace message count block if present.
$text = [regex]::Replace(
    $text,
    '(?s)      this\.message =\r?\n        `Showing \$\{label\}\. Visible: \$\{visibleCount\}\. ` \+\r?\n        `Text: \$\{this\.countKind\(FragmentKinds\.Text\)\}\. ` \+\r?\n        `Rectangles: \$\{this\.countKind\(FragmentKinds\.Rectangle\)\}\. ` \+\r?\n        `Images: \$\{this\.countKind\(FragmentKinds\.Image\)\}\. ` \+\r?\n        `Total: \$\{this\.fragments\.length\}\.`;',
    @'
      this.message =
        `Showing ${label}. Visible: ${visibleCount}. ` +
        `Text: ${this.countKind("text")}. ` +
        `Rectangles: ${this.countKind("rectangle")}. ` +
        `Images: ${this.countKind("image")}. ` +
        `Unknown: ${this.countKind("unknown")}. ` +
        `Total: ${this.fragments.length}.`;
'@,
    1
)

# Replace countVisibleFragments.
$text = [regex]::Replace(
    $text,
    '(?s)  private countVisibleFragments\(mode: Exclude<LayerMode, "original">\): number \{\r?\n.*?\r?\n  \}\r?\n\r?\n  private countKind',
    @'
  private countVisibleFragments(mode: Exclude<LayerMode, "original">): number {
    return this.fragments.filter((fragment) => {
      const kind = this.resolveOverlayFragmentKind(fragment);

      switch (mode) {
        case "text":
          return kind === "text";

        case "rectangle":
          return kind === "rectangle";

        case "image":
          return kind === "image";

        case "all-fragments":
        case "all-layers":
          return true;
      }
    }).length;
  }

  private countKind
'@,
    1
)

# Replace countKind and add normalized kind resolver.
$text = [regex]::Replace(
    $text,
    '(?s)  private countKind\(kind: PdfFragment\["kind"\]\): number \{\r?\n.*?\r?\n  \}\r?\n\r?\n  public static override readonly styles = css`',
    @'
  private countKind(kind: OverlayFragmentKind): number {
    return this.fragments.filter((fragment) =>
      this.resolveOverlayFragmentKind(fragment) === kind,
    ).length;
  }

  private resolveOverlayFragmentKind(fragment: PdfFragment): OverlayFragmentKind {
    const rawKind = String(fragment.kind).trim().toLowerCase();

    if (rawKind === "text" || rawKind.endsWith(".text") || rawKind.includes("text")) {
      return "text";
    }

    if (
      rawKind === "rectangle" ||
      rawKind.endsWith(".rectangle") ||
      rawKind.includes("rectangle")
    ) {
      return "rectangle";
    }

    if (rawKind === "image" || rawKind.endsWith(".image") || rawKind.includes("image")) {
      return "image";
    }

    return "unknown";
  }

  public static override readonly styles = css`
'@,
    1
)

# Ensure image mode keeps original PDF visible.
$text = $text.Replace(
    ".mode-text .original-layer,
    .mode-rectangle .original-layer,
    .mode-image .original-layer,
    .mode-all-fragments .original-layer {",
    ".mode-text .original-layer,
    .mode-rectangle .original-layer,
    .mode-all-fragments .original-layer {"
)

if ($text -notmatch "\.mode-image \.original-layer") {
    $text = $text.Replace(
        "    .mode-all-layers .original-layer,
    .mode-all-layers .fragment-layer {
      visibility: visible;
    }",
        "    .mode-image .original-layer,
    .mode-image .fragment-layer,
    .mode-all-layers .original-layer,
    .mode-all-layers .fragment-layer {
      visibility: visible;
    }"
    )
}

Set-Utf8NoBomFile -Path $pidViewFile -Content $text

Write-Host "Fixed image fragment filtering in:"
Write-Host "  $pidViewFile"
Write-Host ""
Write-Host "Run:"
Write-Host "  pnpm --filter `"pdf-reading`" build"