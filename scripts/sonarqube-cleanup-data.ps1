<#
.SYNOPSIS
  Clean up SonarQube data volumes and optionally vacuum the Postgres DB.

.DESCRIPTION
  This script helps with safe cleanup operations for SonarQube development instances:
  - Offers to back up the Postgres DB (via docker exec pg_dump)
  - Optionally removes the SonarQube data volumes (sonarqube_data, sonarqube_extensions, sonarqube_conf)
  - Optionally runs VACUUM FULL on the database to reclaim space

.PARAMETER RemoveVolumes
  If specified, removes the SonarQube data volumes after backing up.

.PARAMETER VacuumDB
  If specified, runs VACUUM FULL on the SonarQube database inside the Postgres container.

.EXAMPLE
  .\sonarqube-cleanup-data.ps1 -RemoveVolumes -VacuumDB
#>
param(
  [switch]$RemoveVolumes,
  [switch]$VacuumDB
)

$repoRoot = Resolve-Path "$PSScriptRoot\..\.."
$compose = Join-Path $repoRoot 'docker\tools\docker-compose.yml'
$envFile = Join-Path $repoRoot '.env'

if (-not (Test-Path $compose)) { Write-Error "Compose file not found: $compose"; exit 2 }
if (-not (Test-Path $envFile)) { Write-Error ".env not found: $envFile"; exit 2 }

# Load env
$envMap = @{}
Get-Content $envFile | ForEach-Object {
  if ($_ -match '^\s*#' -or $_ -match '^\s*$') { return }
  $parts = $_ -split '='; if ($parts.Count -lt 2) { return }
  $envMap[$parts[0].Trim()] = ($parts[1..($parts.Count-1)] -join '=').Trim()
}

# Backup DB
$backupDir = Join-Path $repoRoot 'tmp'\'backups'
if (-not (Test-Path $backupDir)) { New-Item -ItemType Directory -Path $backupDir | Out-Null }
$timestamp = (Get-Date).ToString('yyyyMMddHHmm')
$backupFile = Join-Path $backupDir "sonar-db-backup-$timestamp.sql"

Write-Host "Creating DB backup to $backupFile (via docker exec pg_dump)"
try {
  docker compose -f $compose exec -T db pg_dump -U $($envMap.SONAR_DB_USER) -d $($envMap.SONAR_DB_NAME) > $backupFile
  Write-Host "Backup created"
} catch {
  Write-Warning "Backup via docker failed: $_"
}

if ($VacuumDB) {
  Write-Host "Running VACUUM FULL on Sonar DB (may take time)..."
  try {
    docker compose -f $compose exec -T db psql -U $($envMap.SONAR_DB_USER) -d $($envMap.SONAR_DB_NAME) -c "VACUUM FULL;"
    Write-Host "VACUUM FULL completed"
  } catch {
    Write-Warning "VACUUM failed: $_"
  }
}

if ($RemoveVolumes) {
  Write-Host "Stopping compose services..."
  docker compose -f $compose down
  Write-Host "Removing SonarQube volumes: sonarqube_data sonarqube_extensions sonarqube_conf postgres_data"
  docker volume rm sonarqube_data sonarqube_extensions sonarqube_conf postgres_data -f || Write-Warning "Some volumes may not exist or could not be removed."
  Write-Host "Removed volumes. Start services again with docker compose -f $compose up -d"
}

Write-Host "Cleanup complete. Backups are in $backupDir"
exit 0
