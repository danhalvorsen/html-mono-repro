# FILE: download-pid-stencil-xml.ps1

$ErrorActionPreference = "Stop"

$destinationDirectory = "C:\Users\danha\source\repos\HTML\MonoRepro\packages\core-pdf-modules\core-pid-stencils-modules\read-xml-create-svg\data"

$files = @(
    "agitators.xml",
    "apparatus_elements.xml",
    "centrifuges.xml",
    "compressors.xml",
    "compressors_iso.xml",
    "crushers_grinding.xml",
    "driers.xml",
    "engines.xml",
    "feeders.xml",
    "filters.xml",
    "fittings.xml",
    "flow_sensors.xml",
    "heat_exchangers.xml",
    "instruments.xml",
    "misc.xml",
    "mixers.xml",
    "piping.xml",
    "pumps.xml",
    "pumps_din.xml",
    "pumps_iso.xml",
    "separators.xml",
    "shaping_machines.xml",
    "valves.xml",
    "vessels.xml"
)

$baseUrl = "https://raw.githubusercontent.com/jgraph/drawio/24468c3911ae9c9a43716c7b588514b48ebd0711/src/main/webapp/stencils/pid"

if (-not (Test-Path $destinationDirectory)) {
    New-Item -ItemType Directory -Path $destinationDirectory -Force | Out-Null
}

foreach ($file in $files) {
    $url = "$baseUrl/$file"
    $outputPath = Join-Path $destinationDirectory $file

    try {
        Invoke-WebRequest `
            -Uri $url `
            -OutFile $outputPath `
            -UseBasicParsing `
            -ErrorAction Stop

        Write-Host "Downloaded: $file"
    }
    catch {
        throw "Failed to download '$file' from '$url'. Error: $($_.Exception.Message)"
    }
}

Write-Host ""
Write-Host "Downloaded $($files.Count) XML files to:"
Write-Host $destinationDirectory