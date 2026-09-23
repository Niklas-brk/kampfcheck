#Requires -Version 5.1
<# Baut eine kleine EXE zum Weitergeben. NSIS liegt nur im lokalen Build-Cache, nie in der App. #>
[CmdletBinding()]
param([string]$NsisCompiler)
$ErrorActionPreference = 'Stop'
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
if (-not $NsisCompiler) { $NsisCompiler = Join-Path $projectRoot '.cache\nsis-3.12\makensis.exe' }
if (-not (Test-Path -LiteralPath $NsisCompiler)) {
    throw 'NSIS 3.12 fehlt. Offizielles ZIP nach .cache entpacken oder -NsisCompiler angeben. Anleitung: ENTWICKLUNG.md.'
}
& node (Join-Path $projectRoot 'scripts\package-app.mjs')
if ($LASTEXITCODE -ne 0) { throw 'App-Paket konnte nicht erstellt werden.' }
$package = Get-Content -LiteralPath (Join-Path $projectRoot 'package.json') -Raw | ConvertFrom-Json
$payload = Join-Path $projectRoot ('release\payload-' + $package.version)
$share = Join-Path $projectRoot 'release\Testversion'
New-Item -ItemType Directory -Path $share -Force | Out-Null
$output = Join-Path $share ('Kampfcheck-' + $package.version + '-Test-Setup.exe')
& $NsisCompiler /V2 "/DAPP_VERSION=$($package.version)" "/DPAYLOAD_DIR=$payload" "/DOUTPUT_FILE=$output" (Join-Path $PSScriptRoot 'test-installer.nsi')
if ($LASTEXITCODE -ne 0) { throw 'NSIS konnte das Setup nicht erstellen.' }
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'TESTVERSION-LESEN.txt') -Destination $share -Force
$size = (Get-Item -LiteralPath $output).Length
if ($size -ge 20MB) { throw 'Setup ist groesser als die vorgesehene 20-MB-Grenze.' }
Write-Host ('Test-Setup: ' + $output + ' (' + [math]::Round($size / 1MB, 2) + ' MB)')
