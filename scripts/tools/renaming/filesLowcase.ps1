
<#
.SYNOPSIS
Renames TypeScript files so the first character is lowercase.

Rules
1. IFoo.ts → foo.ts
2. If foo.ts already exists:
      - prepend content of IFoo.ts to foo.ts
      - delete IFoo.ts
3. Default mode = DRY RUN
4. Use -Apply to execute changes.

.DESCRIPTION
Scans recursively from the current directory.
Safe by default: prints actions instead of executing them.

.EXAMPLE
# Dry run (default)
.\normalize-ts-files.ps1

.EXAMPLE
# Apply changes
.\normalize-ts-files.ps1 -Apply
#>

param(
    [switch]$Apply
)

$dryRun = -not $Apply

function Write-Action($msg) {
    if ($dryRun) {
        Write-Host "[DRYRUN] $msg" -ForegroundColor Yellow
    } else {
        Write-Host "[APPLY ] $msg" -ForegroundColor Green
    }
}

Get-ChildItem -Recurse -Filter *.ts | ForEach-Object {

    $file = $_
    $name = $file.Name
    $dir = $file.DirectoryName

    $first = $name.Substring(0,1)
    $lowerFirst = $first.ToLower()

    if ($first -eq $lowerFirst) {
        return
    }

    $targetName = $lowerFirst + $name.Substring(1)
    $targetPath = Join-Path $dir $targetName

    if (Test-Path $targetPath) {

        Write-Action "MERGE $($file.FullName) -> $targetPath"

        if (-not $dryRun) {

            $srcContent = Get-Content $file.FullName -Raw
            $dstContent = Get-Content $targetPath -Raw

            $merged = $srcContent + "`r`n`r`n" + $dstContent

            Set-Content $targetPath $merged
            Remove-Item $file.FullName
        }

    } else {

        Write-Action "RENAME $($file.FullName) -> $targetPath"

        if (-not $dryRun) {
            Rename-Item $file.FullName $targetName
        }
    }

}
