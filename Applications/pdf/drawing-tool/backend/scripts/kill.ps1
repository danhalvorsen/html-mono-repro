param(
    [int]$Port = 3000
)

$connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue

if (-not $connections) {
    Write-Host "No processes found listening on port $Port"
    return
}

$processIds = $connections | Select-Object -ExpandProperty OwningProcess -Unique

foreach ($processId in $processIds) {
    try {
        $process = Get-Process -Id $processId -ErrorAction Stop
        Write-Host "Stopping PID $processId ($($process.ProcessName)) on port $Port"
        Stop-Process -Id $processId -Force -ErrorAction Stop
    } catch {
        Write-Warning "Failed to stop PID $processId : $_"
    }
}

Write-Host "Done."