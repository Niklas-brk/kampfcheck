#Requires -Version 5.1
# Installiert das vorher erstellte App-Paket fuer den aktuellen Benutzer.
[CmdletBinding()]
param()
$ErrorActionPreference = 'Stop'
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$package = Get-Content -LiteralPath (Join-Path $projectRoot 'package.json') -Raw | ConvertFrom-Json
$payload = Join-Path $projectRoot ('release\payload-' + $package.version)
$cachedArchive = Join-Path $projectRoot '.cache\electron-v44.4.3-win32-x64.zip'
$arguments = @{ PayloadPath = $payload; WithShortcuts = $true }
if (Test-Path -LiteralPath $cachedArchive) { $arguments.RuntimeArchive = $cachedArchive }
& (Join-Path $PSScriptRoot 'install-payload.ps1') @arguments
