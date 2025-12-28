# Powershell wrapper to start docker-compose and run scans inside tools container
Param()

$compose = Join-Path $PSScriptRoot '..\..\docker\tools\docker-compose.yml'
Write-Host "Bringing up docker-compose services..."
docker compose -f $compose up -d --build

Write-Host "Opening shell in the tools container to run scans script..."
# exec the shell script inside the tools container
docker compose -f $compose exec -T tools /bin/sh -c "/workspace/MonoRepro/scripts/run-scans-in-docker.sh"

Write-Host "Scans complete. Logs are in MonoRepro/tmp/sonar"
