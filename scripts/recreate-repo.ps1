param(
  [switch]$DryRun,
  [switch]$KeepNodeModules
)

# Ensure running from repo root
$repoRoot = (Resolve-Path ".").Path
Write-Host "Repo root: $repoRoot"

if ($DryRun) {
  if ($KeepNodeModules) {
    Write-Host "DryRun: preview mode, no destructive actions will run. Node modules will be kept."
  } else {
    Write-Host "DryRun: preview mode, no destructive actions will run."
  }
} else {
  # Confirmation message mentions node_modules removal only when not keeping them
  if (-not $KeepNodeModules) {
    $confirm = Read-Host "This will DELETE existing .git metadata and optionally remove node_modules/.pnpm-store on disk. Continue? (y/N)"
  } else {
    $confirm = Read-Host "This will DELETE existing .git metadata and optionally remove .pnpm-store on disk. Node modules will be kept. Continue? (y/N)"
  }
  if ($confirm -ne 'y' -and $confirm -ne 'Y') {
    Write-Host "Aborted."
    exit 0
  }
}

# .gitignore content (overwrites). Build lines conditionally so we can keep node_modules when requested.
$gitignoreLines = @(
  ".pnpm-store/",
  ".pnpm-debug.log*",
  "pnpm-lock.yaml",
  "npm-debug.log*",
  "yarn-debug.log*",
  "yarn-error.log*",
  "pnpm-debug.log*",
  "*.log",
  "dist/",
  "build/",
  "coverage/",
  "*.tsbuildinfo",
  ".env",
  ".env.*",
  ".nyc_output",
  ".eslintcache",
  ".cache/",
  ".parcel-cache/",
  ".vite/",
  ".vscode/",
  ".DS_Store",
  "Thumbs.db",
  ".ipynb_checkpoints/",
  "packages/**/dist/",
  "packages/**/coverage/"
)

if (-not $KeepNodeModules) {
  $gitignoreLines = @("node_modules/","**/node_modules/","packages/**/node_modules/","Applications/**/node_modules/") + $gitignoreLines
}

$gitignoreContent = ($gitignoreLines -join "`n") + "`n"

if ($DryRun) {
  Write-Host "`n--- .gitignore (preview) ---`n$gitignoreContent`n--- end preview ---"
} else {
  $gitignorePath = Join-Path $repoRoot ".gitignore"
  Write-Host "Writing .gitignore -> $gitignorePath"
  $gitignoreContent | Out-File -FilePath $gitignorePath -Encoding utf8 -Force
}

# Paths to remove when performing full recreate
$pathsToRemove = @(
  ".git",
  ".pnpm-store",
  ".pnpm-store/*"
)

if (-not $KeepNodeModules) {
  $pathsToRemove += @(
    "node_modules",
    "packages/*/node_modules",
    "packages/**/node_modules",
    "Applications/*/node_modules",
    "Applications/**/node_modules"
  )
}

foreach ($p in $pathsToRemove) {
  if ($DryRun) {
    Write-Host "Would remove: $p"
  } else {
    if (Test-Path $p) {
      if ($p -eq ".git") {
        Write-Host "Removing existing .git metadata..."
        Remove-Item -Recurse -Force ".git"
      } else {
        Write-Host "Removing paths matching: $p"
        Get-ChildItem -Path $p -Force -ErrorAction SilentlyContinue | ForEach-Object {
          try {
            Remove-Item -Recurse -Force $_.FullName -ErrorAction Stop
            Write-Host "Removed: $($_.FullName)"
          } catch {
            Write-Warning "Could not remove: $($_.FullName) - $_"
          }
        }
      }
    } else {
      Write-Host "Not found (skipping): $p"
    }
  }
}

if ($DryRun) {
  Write-Host "`nDryRun complete. No git or files were modified."
  exit 0
}

# Reinitialize git and commit
Write-Host "`nInitializing new git repo (branch: main)..."
git init -b main

Write-Host "Staging files (respecting .gitignore)..."
git add .

Write-Host "Staged files summary:"
git status --short

$staged = git diff --staged --name-only
if (-not [string]::IsNullOrWhiteSpace($staged)) {
  Write-Host "`nCommitting..."
  git commit -m "Initial commit: recreate repository and apply .gitignore"
  Write-Host "Repository reinitialized and committed."
} else {
  Write-Host "No files staged. Check .gitignore and workspace contents."
}

Write-Host "`nDone. If you need to add a remote: git remote add origin <url>"
