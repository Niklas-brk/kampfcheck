#Requires -Version 5.1
[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$projectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$electronVersion = '44.4.3'
$archiveName = "electron-v$electronVersion-win32-x64.zip"
$releaseUrl = "https://github.com/electron/electron/releases/download/v$electronVersion"
$cacheRoot = Join-Path $projectRoot '.cache'
$releaseRoot = Join-Path $projectRoot 'release'
$outputPath = Join-Path $releaseRoot 'Kampfcheck-win32-x64'

if (Test-Path -LiteralPath $outputPath) {
    throw "Build output already exists: $outputPath. Move it elsewhere or remove it yourself before building again. No existing files were changed."
}

$requiredFiles = @('package.json', 'dist\index.html', 'desktop\main.cjs', 'desktop\icon.ico', 'desktop\icon.png')
foreach ($relativePath in $requiredFiles) {
    $requiredPath = Join-Path $projectRoot $relativePath
    if (-not (Test-Path -LiteralPath $requiredPath -PathType Leaf)) {
        throw "Required application file is missing: $requiredPath"
    }
}

$package = Get-Content -LiteralPath (Join-Path $projectRoot 'package.json') -Raw | ConvertFrom-Json
if ($package.main -ne 'desktop/main.cjs') {
    throw 'package.json must use desktop/main.cjs as its main entry point.'
}

[Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12
New-Item -ItemType Directory -Path $cacheRoot -Force | Out-Null
New-Item -ItemType Directory -Path $releaseRoot -Force | Out-Null

$checksumPath = Join-Path $cacheRoot "electron-v$electronVersion-SHASUMS256.txt"
$archivePath = Join-Path $cacheRoot $archiveName

Write-Host "Downloading official Electron $electronVersion checksums..."
Invoke-WebRequest -Uri "$releaseUrl/SHASUMS256.txt" -OutFile $checksumPath -UseBasicParsing
$checksumPattern = '^([a-fA-F0-9]{64})\s+\*?' + [regex]::Escape($archiveName) + '\s*$'
$matchingLines = @(Get-Content -LiteralPath $checksumPath | Where-Object { $_ -match $checksumPattern })
if ($matchingLines.Count -ne 1) {
    throw "The official checksum list does not contain exactly one entry for $archiveName."
}
$expectedHash = [regex]::Match($matchingLines[0], $checksumPattern).Groups[1].Value

if (-not (Test-Path -LiteralPath $archivePath -PathType Leaf)) {
    # The cache is only promoted after the downloaded archive has been verified.
    $downloadPath = Join-Path $cacheRoot ($archiveName + '.' + [guid]::NewGuid().ToString('N') + '.download')
    Write-Host "Downloading official Electron $electronVersion for Windows x64..."
    Invoke-WebRequest -Uri "$releaseUrl/$archiveName" -OutFile $downloadPath -UseBasicParsing
    $downloadHash = (Get-FileHash -LiteralPath $downloadPath -Algorithm SHA256).Hash
    if ($downloadHash -ne $expectedHash) {
        throw "SHA256 verification failed. The download was not unpacked: $downloadPath"
    }
    Move-Item -LiteralPath $downloadPath -Destination $archivePath
}

$actualHash = (Get-FileHash -LiteralPath $archivePath -Algorithm SHA256).Hash
if ($actualHash -ne $expectedHash) {
    throw "Cached Electron archive failed SHA256 verification: $archivePath. Remove that file yourself and retry. Nothing was unpacked."
}

# Refuse to reuse even a partially completed build. No recursive deletion occurs.
New-Item -ItemType Directory -Path $outputPath | Out-Null
Write-Host 'Checksum verified. Unpacking Electron...'
Expand-Archive -LiteralPath $archivePath -DestinationPath $outputPath

$electronExe = Join-Path $outputPath 'electron.exe'
if (-not (Test-Path -LiteralPath $electronExe -PathType Leaf)) {
    throw "The extracted archive does not contain electron.exe. Incomplete output was left at $outputPath."
}

$appRoot = Join-Path $outputPath 'resources\app'
$appDesktop = Join-Path $appRoot 'desktop'
New-Item -ItemType Directory -Path $appDesktop -Force | Out-Null
Copy-Item -LiteralPath (Join-Path $projectRoot 'dist') -Destination $appRoot -Recurse
Copy-Item -LiteralPath (Join-Path $projectRoot 'package.json') -Destination $appRoot
foreach ($fileName in @('main.cjs', 'icon.ico', 'icon.png')) {
    Copy-Item -LiteralPath (Join-Path $projectRoot "desktop\$fileName") -Destination $appDesktop
}
Rename-Item -LiteralPath $electronExe -NewName 'Kampfcheck.exe'

# Electron's LICENSE and LICENSES.chromium.html remain in the extracted output.
Write-Host "Build complete: $(Join-Path $outputPath 'Kampfcheck.exe')"
Write-Host 'No application was started. Use desktop\install-windows.ps1 to install for the current user.'
