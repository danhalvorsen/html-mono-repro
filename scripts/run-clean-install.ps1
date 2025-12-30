function Run-Step {
    param(
        [string]$Name,
        [ScriptBlock]$Action
    )

    Write-Host ""
    Write-Host "=== $Name ==="
    try {
        & $Action
    } catch {
        Write-Host "Step '$Name' failed: $($_.Exception.Message)" -ForegroundColor Red
        throw
    }
}

Set-Location -LiteralPath (Split-Path -Parent $MyInvocation.MyCommand.Path)
Run-Step 'Clean node_modules' { Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue }
Run-Step 'Clean pnpm store' { Remove-Item -Recurse -Force .pnpm-store -ErrorAction SilentlyContinue }
Run-Step 'Clean pnpm lockfile' { Remove-Item -Force pnpm-lock.yaml -ErrorAction SilentlyContinue }
Run-Step 'Check workspace deps' { & "$PSScriptRoot/check-workspace-deps.ps1" }
Run-Step 'Install dependencies' { pnpm install --reporter=append-only }
Run-Step 'Build workspace' { pnpm build }
