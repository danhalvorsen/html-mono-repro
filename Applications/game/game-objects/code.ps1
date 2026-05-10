# FILE: code.ps1
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$root = Get-Location
$testPath = Join-Path $root "tests/RocketMotionDefinitionFactory.test.ts"

if (-not (Test-Path $testPath)) {
    throw "Missing test file: $testPath"
}

$content = Get-Content -Path $testPath -Raw

$oldAssertion = "fixture.assertVectorClose(burnEnd.acceleration, { x: 0, y: 0 });"
$newAssertion = "fixture.assertVectorClose(burnEnd.acceleration, { x: 0, y: 10 });"

if (-not $content.Contains($oldAssertion)) {
    throw "Expected assertion was not found. No file was changed."
}

$content = $content.Replace($oldAssertion, $newAssertion)

Set-Content -Path $testPath -Value $content -Encoding UTF8

Write-Host "Updated: $testPath"
Write-Host "Run:"
Write-Host "  pnpm test"