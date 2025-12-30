param(
    [string]$RootPath = "$(Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path))",
    [string]$OldScope = "@my-graphics",
    [string]$NewScope = "@monorepo"
)

function Read-File {
    param([string]$Path)
    $bytes = [System.IO.File]::ReadAllBytes($Path)
    if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
        return [System.Text.Encoding]::UTF8.GetString($bytes, 3, $bytes.Length - 3)
    }
    return [System.Text.Encoding]::UTF8.GetString($bytes)
}

function Write-File {
    param([string]$Path, [string]$Content)
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($Content)
    [System.IO.File]::WriteAllBytes($Path, $bytes)
}

$files = Get-ChildItem -LiteralPath "$RootPath/packages" -Filter package.json -Recurse -File
if ($files.Count -eq 0) {
    Write-Host "No package.json files found under $RootPath/packages"
    exit 1
}

$pattern = [regex]::Escape($OldScope) + '/'
foreach ($file in $files) {
    $content = Read-File -Path $file.FullName
    if ($content -match $pattern) {
        $updated = $content -replace $pattern, "$NewScope/"
        Write-File -Path $file.FullName -Content $updated
        Write-Host "Replaced scope in $($file.FullName)"
    }
}
