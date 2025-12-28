<#
.SYNOPSIS
  Verify SonarQube Postgres database connectivity.

.DESCRIPTION
  Attempts to verify database connectivity using either local `psql` (if available)
  or by invoking `pg_isready`/`psql` inside the docker-compose `db` container.

.PARAMETER EnvFile
  Path to .env file (defaults to repository root .env).

.EXAMPLE
  .\sonarqube-check-db.ps1
#>
param(
  [string]$EnvFile = "$(Resolve-Path "$PSScriptRoot\..\..\..\.env" -ErrorAction SilentlyContinue)"
)

function Load-EnvFile($path) {
  $env = @{}
  if (-not (Test-Path $path)) { Write-Error "Env file not found: $path"; return $null }
  Get-Content $path | ForEach-Object {
    if ($_ -match '^\s*#') { return }
    if ($_ -match '^\s*$') { return }
    $parts = $_ -split '='; if ($parts.Count -lt 2) { return }
    $k = $parts[0].Trim(); $v = ($parts[1..($parts.Count-1)] -join '=').Trim()
    $env[$k] = $v
  }
  return $env
}

$envMap = Load-EnvFile $EnvFile
if (-not $envMap) { exit 2 }

$pgHost = $envMap.POSTGRES_HOST | ForEach-Object { if ($_ -and $_ -ne '') { $_ } else { 'localhost' } }
$pgPort = $envMap.POSTGRES_PORT || '5432'
$pgUser = $envMap.SONAR_DB_USER || $envMap.POSTGRES_USER || 'sonar'
$pgDb   = $envMap.SONAR_DB_NAME || $envMap.POSTGRES_DB || 'sonar'
$pgPass = $envMap.SONAR_DB_PASS || $envMap.POSTGRES_PASSWORD || $envMap.SONAR_DB_PASS

Write-Host "Checking Postgres connectivity to $pgHost:$pgPort (db=$pgDb user=$pgUser)"

# If psql exists locally, try connecting
if (Get-Command psql -ErrorAction SilentlyContinue) {
  Write-Host "Using local psql to verify connectivity..."
  $env:PGPASSWORD = $pgPass
  $args = @("-h", $pgHost, "-p", $pgPort, "-U", $pgUser, "-d", $pgDb, "-c", "SELECT 1;")
  $proc = Start-Process -FilePath psql -ArgumentList $args -NoNewWindow -Wait -PassThru -ErrorAction SilentlyContinue
  if ($proc.ExitCode -eq 0) { Write-Host "Local psql: connection ok"; exit 0 } else { Write-Warning "Local psql failed (exit $($proc.ExitCode))" }
}

# Fall back to docker-compose container commands
if (Get-Command docker -ErrorAction SilentlyContinue) {
  Write-Host "Trying pg_isready inside docker-compose 'db' container..."
  $compose = Join-Path (Resolve-Path "$PSScriptRoot\..\..") 'docker\tools\docker-compose.yml'
  if (-not (Test-Path $compose)) { Write-Warning "Compose file not found: $compose. Trying 'docker ps' to find a postgres container." }

  # Attempt docker compose exec pg_isready
  try {
    docker compose -f $compose exec -T db pg_isready -U $pgUser -d $pgDb -h localhost
    if ($LASTEXITCODE -eq 0) { Write-Host "pg_isready: OK"; exit 0 }
  } catch {
    Write-Warning "pg_isready inside compose failed: $_"
  }

  # Try running psql inside container (may require postgres client to be installed in image)
  try {
    $cmd = "psql -U $pgUser -d $pgDb -c \"SELECT 1;\""
    docker compose -f $compose exec -T db sh -c $cmd
    if ($LASTEXITCODE -eq 0) { Write-Host "psql (inside container): OK"; exit 0 }
  } catch {
    Write-Warning "psql inside container failed: $_"
  }
}

Write-Error "Unable to verify Postgres connectivity. Ensure Postgres is running and credentials in .env are correct."
exit 1
