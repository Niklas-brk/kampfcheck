#Requires -Version 5.1
[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [string]$SourcePath
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$projectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
if ([string]::IsNullOrWhiteSpace($SourcePath)) {
    $SourcePath = Join-Path $projectRoot 'release\Kampfcheck-win32-x64'
}
if (-not (Test-Path -LiteralPath $SourcePath -PathType Container)) {
    throw "Build folder not found: $SourcePath. Run desktop\build-windows.ps1 first, or pass -SourcePath."
}
$resolvedSource = (Resolve-Path -LiteralPath $SourcePath).ProviderPath
$appVersion = '1.0.0'
$localAppData = [Environment]::GetFolderPath([Environment+SpecialFolder]::LocalApplicationData)
if ([string]::IsNullOrWhiteSpace($localAppData)) {
    throw 'The current user has no LocalApplicationData folder. Installation cannot continue.'
}
$installRoot = Join-Path $localAppData 'Programs\Kampfcheck'
$installPath = Join-Path $installRoot $appVersion
if (Test-Path -LiteralPath $installPath) {
    throw "Kampfcheck $appVersion already has an installation folder: $installPath. Existing installations are never deleted or overwritten."
}

$requiredFiles = @(
    'Kampfcheck.exe',
    'LICENSE',
    'LICENSES.chromium.html',
    'resources\app\package.json',
    'resources\app\dist\index.html',
    'resources\app\desktop\main.cjs',
    'resources\app\desktop\icon.ico',
    'resources\app\desktop\icon.png'
)
foreach ($relativePath in $requiredFiles) {
    if (-not (Test-Path -LiteralPath (Join-Path $resolvedSource $relativePath) -PathType Leaf)) {
        throw "The source is not a complete Kampfcheck build. Missing file: $relativePath"
    }
}
if (-not (Test-Path -LiteralPath (Join-Path $resolvedSource 'locales') -PathType Container)) {
    throw 'The source is not a complete Electron build: the locales folder is missing.'
}
$packagePath = Join-Path $resolvedSource 'resources\app\package.json'
$package = Get-Content -LiteralPath $packagePath -Raw | ConvertFrom-Json
if ($package.version -ne $appVersion -or $package.main -ne 'desktop/main.cjs') {
    throw "This installer expects Kampfcheck version $appVersion with desktop/main.cjs as its entry point."
}

$desktopPath = [Environment]::GetFolderPath([Environment+SpecialFolder]::DesktopDirectory)
$startMenuPath = [Environment]::GetFolderPath([Environment+SpecialFolder]::Programs)
if ([string]::IsNullOrWhiteSpace($desktopPath) -or [string]::IsNullOrWhiteSpace($startMenuPath)) {
    throw 'The current user has no Desktop or Start Menu Programs folder. Shortcuts cannot be created.'
}

# Create the version folder without -Force so concurrent installs also fail safely.
New-Item -ItemType Directory -Path $installRoot -Force | Out-Null
New-Item -ItemType Directory -Path $installPath | Out-Null

# Copy runtime files and known distribution folders only; do not copy user-data,
# cache, profile, logs, or any unrelated source directories into the installation.
$runtimeFiles = Get-ChildItem -LiteralPath $resolvedSource -File | Where-Object {
    $_.Name -match '^(?:Kampfcheck\.exe|(?:chrome_)?crashpad_handler\.exe|LICENSE(?:S\.chromium\.html)?|version|vk_swiftshader_icd\.json)$' -or
    $_.Extension -in @('.dll', '.pak', '.bin', '.dat')
}
foreach ($file in $runtimeFiles) {
    Copy-Item -LiteralPath $file.FullName -Destination $installPath
}
Copy-Item -LiteralPath (Join-Path $resolvedSource 'locales') -Destination $installPath -Recurse

$sourceApp = Join-Path $resolvedSource 'resources\app'
$installedApp = Join-Path $installPath 'resources\app'
$installedDesktop = Join-Path $installedApp 'desktop'
New-Item -ItemType Directory -Path $installedDesktop -Force | Out-Null
Copy-Item -LiteralPath (Join-Path $sourceApp 'dist') -Destination $installedApp -Recurse
Copy-Item -LiteralPath $packagePath -Destination $installedApp
foreach ($fileName in @('main.cjs', 'icon.ico', 'icon.png')) {
    Copy-Item -LiteralPath (Join-Path $sourceApp "desktop\$fileName") -Destination $installedDesktop
}
$defaultApp = Join-Path $resolvedSource 'resources\default_app.asar'
if (Test-Path -LiteralPath $defaultApp -PathType Leaf) {
    Copy-Item -LiteralPath $defaultApp -Destination (Join-Path $installPath 'resources')
}

$installedExe = Join-Path $installPath 'Kampfcheck.exe'
$installedIcon = Join-Path $installedDesktop 'icon.ico'
$shell = New-Object -ComObject WScript.Shell
try {
    foreach ($shortcutFolder in @($desktopPath, $startMenuPath)) {
        New-Item -ItemType Directory -Path $shortcutFolder -Force | Out-Null
        $shortcut = $shell.CreateShortcut((Join-Path $shortcutFolder 'Kampfcheck.lnk'))
        $shortcut.TargetPath = $installedExe
        $shortcut.WorkingDirectory = $installPath
        $shortcut.IconLocation = "$installedIcon,0"
        $shortcut.Description = 'Kampfcheck - Pokemon Champions team builder and battle calculator'
        $shortcut.Save()
        [void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($shortcut)
    }
}
finally {
    [void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($shell)
}

Write-Host "Kampfcheck $appVersion installed for the current user: $installPath"
Write-Host 'Desktop and Start Menu shortcuts were created. The application was not started.'
