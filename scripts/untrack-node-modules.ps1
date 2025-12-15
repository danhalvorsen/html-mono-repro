param(
  [switch]$DryRun
)

# Ensure running from script folder -> repo root
$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition | Resolve-Path
Set-Location $repoRoot

Write-Host "Repo root: $repoRoot"

# Unstage everything
Write-Host "-> git reset HEAD ."
git reset HEAD . 2>$null

# Patterns to untrack (keeps files on disk)
$patterns = @(
  "node_modules",
  "node_modules/*",
  "packages/*/node_modules",
  "packages/**/node_modules",
  "Applications/*/node_modules",
  "Applications/**/node_modules"
)

foreach ($p in $patterns) {
  Write-Host "-> git rm -r --cached $p"
  git rm -r --cached $p 2>$null || $null
}

# Re-add files (node_modules should be ignored now)
Write-Host "-> git add ."
git add .

# Show staged summary
Write-Host "`nStaged changes summary:"
git status --short

# Show staged file list (if any)
$staged = git diff --staged --name-only
if (-not [string]::IsNullOrWhiteSpace($staged)) {
  Write-Host "`nFiles staged for commit:"
  $staged
  if (-not $DryRun) {
    Write-Host "`n-> git commit -m 'Remove tracked node_modules and apply .gitignore'"
    git commit -m "Remove tracked node_modules and apply .gitignore"
  } else {
    Write-Host "`nDryRun: not committing."
  }
} else {
  Write-Host "`nNo staged changes to commit."
}
