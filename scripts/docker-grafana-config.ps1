$datasourceUrl = "$pgHost:$pgPort"

$yaml = @"
apiVersion: 1
datasources:
  - name: SonarDB
    type: postgres
    access: proxy
    url: $datasourceUrl
    database: $pgDb
    user: $pgUser
    secureJsonData:
      password: $pgPass
    isDefault: false
    jsonData:
      sslmode: disable
"@

$yaml | Out-File -FilePath $outFile -Encoding UTF8
Write-Host "Wrote Grafana datasource provisioning file to $outFile"
$sonarUrl = if ($envMap.SONAR_URL) { $envMap.SONAR_URL } else { "http://localhost:$($envMap.SONARQUBE_PORT -or '9000')" }
Write-Host "SonarQube URL: $sonarUrl"
Write-Host "Postgres for Grafana: $datasourceUrl (db=$pgDb user=$pgUser)"
Write-Host "If Grafana is running in Docker, mount the provisioning directory into /etc/grafana/provisioning/datasources/"

exit 0
$pgHost = 'db'
$pgPort = if ($envMap.POSTGRES_INTERNAL_PORT) { $envMap.POSTGRES_INTERNAL_PORT } else { '5432' }
$pgUser = if ($envMap.SONAR_DB_USER) { $envMap.SONAR_DB_USER } else { 'sonar' }
$pgPass = if ($envMap.SONAR_DB_PASS) { $envMap.SONAR_DB_PASS } elseif ($envMap.POSTGRES_PASSWORD) { $envMap.POSTGRES_PASSWORD } else { 'sonar' }
$pgDb   = if ($envMap.SONAR_DB_NAME) { $envMap.SONAR_DB_NAME } else { 'sonar' }

# Prepare output directory
if (-not (Test-Path $OutDir)) { New-Item -ItemType Directory -Path $OutDir -Force | Out-Null }
$outFile = Join-Path $OutDir 'sonar-postgres.yaml'

$yaml = @"
apiVersion: 1
datasources:
"@
$datasourceUrl = "$pgHost:$pgPort"

$yaml = @"
apiVersion: 1
datasources:
  - name: SonarDB
    type: postgres
    access: proxy
    url: $datasourceUrl
    database: $pgDb
    user: $pgUser
    secureJsonData:
      password: $pgPass
    isDefault: false
    jsonData:
      sslmode: disable
"@
"@

$yaml | Out-File -FilePath $outFile -Encoding UTF8
Write-Host "Wrote Grafana datasource provisioning file to $outFile"
$sonarUrl = if ($envMap.SONAR_URL) { $envMap.SONAR_URL } else { "http://localhost:$($envMap.SONARQUBE_PORT -or '9000')" }
Write-Host "SonarQube URL: $sonarUrl"
Write-Host "Postgres for Grafana: $datasourceUrl (db=$pgDb user=$pgUser)"
Write-Host "If Grafana is running in Docker, mount the provisioning directory into /etc/grafana/provisioning/datasources/"

exit 0
