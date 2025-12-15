param(
  [string]$Remote = ""
)

# Run from repo root
$repoRoot = Resolve-Path "."
Set-Location $repoRoot

Write-Host "Initializing git in $repoRoot"

# init if needed
if (-not (Test-Path ".git")) {
  git init -b main
} else {
  Write-Host ".git already exists — skipping git init"
}

# ensure .gitignore exists
if (-not (Test-Path ".gitignore")) {
  Write-Host "No .gitignore found — create one first or use the provided .gitignore."
  exit 1
}

# Stage and commit
git add .
git commit -m "Initial commit: recreate repository" || Write-Host "Nothing to commit or commit failed."

# Optionally add remote and push
if ($Remote -ne "") {
  git remote add origin $Remote 2>$null || git remote set-url origin $Remote
  git branch --set-upstream-to=origin/main main 2>$null
  Write-Host "Pushing to remote origin/main..."
  git push -u origin main
}

Write-Host "Done. Run `pnpm install` at the repo root next."
