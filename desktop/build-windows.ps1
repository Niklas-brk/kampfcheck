#Requires -Version 5.1
# Erstellt eine Windows-Ausgabe mit minimierter App im ASAR-Archiv.
[CmdletBinding()]
param()
$ErrorActionPreference = 'Stop'
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
& node (Join-Path $projectRoot 'scripts\package-app.mjs')
if ($LASTEXITCODE -ne 0) { throw 'App-Paket konnte nicht erstellt werden.' }
$package = Get-Content -LiteralPath (Join-Path $projectRoot 'package.json') -Raw | ConvertFrom-Json
$payload = Join-Path $projectRoot ('release\payload-' + $package.version)
$destination = Join-Path $projectRoot ('release\Kampfcheck-' + $package.version + '-win32-x64')
$cachedArchive = Join-Path $projectRoot '.cache\electron-v44.4.3-win32-x64.zip'
$arguments = @{ PayloadPath = $payload; DestinationPath = $destination }
if (Test-Path -LiteralPath $cachedArchive) { $arguments.RuntimeArchive = $cachedArchive }
& (Join-Path $PSScriptRoot 'install-payload.ps1') @arguments
