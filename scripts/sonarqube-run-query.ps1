<#
.SYNOPSIS
  Run a daily summary query against the SonarQube Postgres DB or call Sonar Web API.

.DESCRIPTION
  By default the script calls the SonarQube Web API to gather basic metrics for each project
  and writes JSON to `MonoRepro/tmp/sonar-daily-<date>.json`.
  If you provide `-SqlFile` and `-UseDocker`, the script will run the provided SQL file
  against the Postgres database using `psql` locally or inside the docker `db` container.

.PARAMETER SqlFile
  Optional path to a SQL file to run instead of the default API-based summary.

.PARAMETER UseDocker
  If specified, run `psql` inside the docker-compose `db` container instead of local psql.

.PARAMETER EnvFile
  Path to .env file (defaults to repo .env)
#>
param(
  [string]$SqlFile,
  [switch]$UseDocker,
  [string]$EnvFile = "$(Resolve-Path "$PSScriptRoot\..\..\..\.env" -ErrorAction SilentlyContinue)"
)

function Load-Env($path) {
  if (-not (Test-Path $path)) { Write-Error ".env not found: $path"; return $null }
  $map = @{}
  Get-Content $path | ForEach-Object {
    if ($_ -match '^\s*#' -or $_ -match '^\s*$') { return }
    $parts = $_ -split '='; if ($parts.Count -lt 2) { return }
    $k = $parts[0].Trim(); $v = ($parts[1..($parts.Count-1)] -join '=').Trim(); $map[$k]=$v
  }
  return $map
}

$envMap = Load-Env $EnvFile
if (-not $envMap) { exit 2 }

$sonarUrl = $envMap.SONAR_URL || $envMap.SONARQUBE_URL || "http://localhost:$($envMap.SONARQUBE_PORT -or '9000')"
$sonarToken = $envMap.SONAR_LOGIN || $envMap.SONAR_TOKEN || 'admin'
$outDir = Join-Path (Resolve-Path "$PSScriptRoot\..\..") 'tmp'
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }

# If no SQL provided, call Sonar API for summarised metrics
if (-not $SqlFile) {
  Write-Host "Gathering daily summary from SonarQube API: $sonarUrl"
  $projects = Invoke-RestMethod -Uri "$sonarUrl/api/projects/search?ps=500" -Method Get -UseBasicParsing -Headers @{ Authorization = "Basic " + [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("$sonarToken:")) }
  $result = @()
  foreach ($p in $projects.components) {
    $metrics = Invoke-RestMethod -Uri "$sonarUrl/api/measures/component?component=$($p.key)&metricKeys=coverage,bugs,code_smells,security_rating" -Method Get -UseBasicParsing -Headers @{ Authorization = "Basic " + [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("$sonarToken:")) }
    $result += [pscustomobject]@{
      project = $p.key
      name = $p.name
      metrics = $metrics.component.measures
    }
  }
  $date = (Get-Date).ToString('yyyyMMdd')
  $outFile = Join-Path $outDir "sonar-daily-$date.json"
  $result | ConvertTo-Json -Depth 6 | Out-File -FilePath $outFile -Encoding UTF8
  Write-Host "Wrote Sonar daily summary to $outFile"
  exit 0
}

# Run SQL path provided
if (-not (Test-Path $SqlFile)) { Write-Error "Sql file not found: $SqlFile"; exit 3 }

$compose = Join-Path (Resolve-Path "$PSScriptRoot\..\..\.") 'docker\tools\docker-compose.yml'
$pgUser = $envMap.SONAR_DB_USER || $envMap.POSTGRES_USER
$pgDb = $envMap.SONAR_DB_NAME || $envMap.POSTGRES_DB
$pgPort = $envMap.POSTGRES_PORT || '5432'

if ($UseDocker) {
  if (-not (Get-Command docker -ErrorAction SilentlyContinue)) { Write-Error "docker is not available"; exit 4 }
  Write-Host "Executing SQL inside docker-compose db container"
  docker compose -f $compose exec -T db sh -c "psql -U $pgUser -d $pgDb -f /workspace/MonoRepro/$SqlFile" | Out-File -FilePath (Join-Path $outDir 'sonar-sql-output.txt') -Encoding UTF8
  Write-Host "SQL executed; output at tmp/sonar-sql-output.txt"
  exit 0
} else {
  if (-not (Get-Command psql -ErrorAction SilentlyContinue)) { Write-Error "psql not found locally. Use -UseDocker or install psql."; exit 5 }
  $env:PGPASSWORD = $envMap.SONAR_DB_PASS || $envMap.POSTGRES_PASSWORD
  $args = @('-U', $pgUser, '-d', $pgDb, '-f', $SqlFile)
  Start-Process -FilePath psql -ArgumentList $args -Wait -NoNewWindow -WorkingDirectory (Split-Path $SqlFile -Parent)
  Write-Host "SQL executed locally"
  exit 0
}
