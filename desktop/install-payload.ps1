#Requires -Version 5.1
<# Installiert ausschließlich das gebündelte Programm. Der Teamspeicher unter APPDATA bleibt unberührt. #>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$PayloadPath,
    [string]$DestinationPath,
    [string]$RuntimeArchive,
    [switch]$WithShortcuts
)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
# Andere aufrufende Programme koennen einen PSModulePath fuer PowerShell 7 vererben.
# Die Installation nutzt immer die mit Windows PowerShell gelieferten Systemmodule.
Import-Module (Join-Path $PSHOME 'Modules\Microsoft.PowerShell.Utility\Microsoft.PowerShell.Utility.psd1') -Force
Import-Module (Join-Path $PSHOME 'Modules\Microsoft.PowerShell.Archive\Microsoft.PowerShell.Archive.psd1') -Force
$manifest = Get-Content -LiteralPath (Join-Path $PayloadPath 'release.json') -Raw | ConvertFrom-Json
if ($manifest.version -notmatch '^\d+\.\d+\.\d+$') { throw 'Ungueltige App-Version.' }
if ($manifest.electronUrl -ne 'https://github.com/electron/electron/releases/download/v44.4.3/electron-v44.4.3-win32-x64.zip' -or
    $manifest.electronSha256 -ne '790a355b684d5c7cc8dc3cdd8c4cca7c4b2d054685427c7554a956879a82e70b') {
    throw 'Unbekannte Laufzeit. Installation abgebrochen.'
}
$appArchive = Join-Path $PayloadPath 'app.asar'
if ((Get-FileHash -LiteralPath $appArchive -Algorithm SHA256).Hash -ne $manifest.appSha256) {
    throw 'Das App-Paket ist beschaedigt. Bitte die Testversion erneut herunterladen.'
}
$localData = [Environment]::GetFolderPath('LocalApplicationData')
if ([string]::IsNullOrWhiteSpace($localData)) { throw 'Kein lokaler Benutzerordner vorhanden.' }
if (-not $DestinationPath) { $DestinationPath = Join-Path $localData ('Programs\Kampfcheck\' + $manifest.version) }
$destination = [IO.Path]::GetFullPath($DestinationPath)
$parent = Split-Path -Parent $destination
if (Test-Path -LiteralPath $destination) {
    # Derselbe Installer darf erneut starten, aber niemals eine andere Version ueberschreiben.
    $existing = Join-Path $destination 'resources\app.asar'
    if (-not (Test-Path -LiteralPath $existing) -or
        (Get-FileHash -LiteralPath $existing -Algorithm SHA256).Hash -ne $manifest.appSha256 -or
        -not (Test-Path -LiteralPath (Join-Path $destination 'Kampfcheck.exe'))) {
        throw 'Dieser Versionsordner enthaelt andere oder unvollstaendige Dateien. Vorhandene Dateien wurden nicht veraendert.'
    }
} else {
    $downloadCache = Join-Path $localData 'Kampfcheck-Installationscache'
    if (-not $RuntimeArchive) {
        New-Item -ItemType Directory -Path $downloadCache -Force | Out-Null
        $RuntimeArchive = Join-Path $downloadCache ('electron-v' + $manifest.electronVersion + '-win32-x64.zip')
        # Ein beschaedigter automatischer Cache darf keinen dauerhaften Fehler verursachen.
        # Zur Diagnose aufbewahren und einen frischen Download beginnen; nie ein fremdes Archiv aendern.
        if ((Test-Path -LiteralPath $RuntimeArchive) -and
            (Get-FileHash -LiteralPath $RuntimeArchive -Algorithm SHA256).Hash -ne $manifest.electronSha256) {
            Move-Item -LiteralPath $RuntimeArchive -Destination ($RuntimeArchive + '.invalid-' + [guid]::NewGuid().ToString('N'))
        }
        if (-not (Test-Path -LiteralPath $RuntimeArchive)) {
            [Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12
            $download = $RuntimeArchive + '.' + [guid]::NewGuid().ToString('N') + '.download'
            Write-Output 'Laufzeit wird geladen (ca. 151 MB). Bitte Internetverbindung beibehalten.'
            Invoke-WebRequest -Uri $manifest.electronUrl -OutFile $download -UseBasicParsing
            if ((Get-FileHash -LiteralPath $download -Algorithm SHA256).Hash -ne $manifest.electronSha256) { throw 'Pruefsumme des Downloads stimmt nicht.' }
            Move-Item -LiteralPath $download -Destination $RuntimeArchive
        }
    }
    if ((Get-FileHash -LiteralPath $RuntimeArchive -Algorithm SHA256).Hash -ne $manifest.electronSha256) { throw 'Pruefsumme der Laufzeit stimmt nicht.' }

    # Erst in einen neuen Nachbarordner entpacken und danach an den endgueltigen Ort verschieben.
    New-Item -ItemType Directory -Path $parent -Force | Out-Null
    $staging = [IO.Path]::GetFullPath((Join-Path $parent ('.install-' + [guid]::NewGuid().ToString('N'))))
    if (-not $staging.StartsWith($parent.TrimEnd('\') + '\', [StringComparison]::OrdinalIgnoreCase)) { throw 'Ungueltiger temporaerer Pfad.' }
    New-Item -ItemType Directory -Path $staging | Out-Null
    Write-Output 'Laufzeit geprueft. Programmdateien werden installiert.'
    Expand-Archive -LiteralPath $RuntimeArchive -DestinationPath $staging
    Rename-Item -LiteralPath (Join-Path $staging 'electron.exe') -NewName 'Kampfcheck.exe'
    Copy-Item -LiteralPath $appArchive -Destination (Join-Path $staging 'resources\app.asar')
    Copy-Item -LiteralPath (Join-Path $PayloadPath 'app.ico') -Destination (Join-Path $staging 'resources\app.ico')
    Copy-Item -LiteralPath (Join-Path $PayloadPath 'release.json') -Destination (Join-Path $staging 'release.json')
    # Beide absoluten Pfade sind innerhalb des geprueften Installations-Elternordners. Keine Loeschung.
    if (-not $destination.StartsWith($parent.TrimEnd('\') + '\', [StringComparison]::OrdinalIgnoreCase)) { throw 'Ungueltiger Zielpfad.' }
    Move-Item -LiteralPath $staging -Destination $destination
}
if ($WithShortcuts) {
    $shell = New-Object -ComObject WScript.Shell
    try {
        foreach ($folder in @([Environment]::GetFolderPath('DesktopDirectory'), [Environment]::GetFolderPath('Programs'))) {
            if ([string]::IsNullOrWhiteSpace($folder)) { throw 'Verknuepfungsordner fehlt.' }
            $shortcut = $shell.CreateShortcut((Join-Path $folder 'Kampfcheck.lnk'))
            $shortcut.TargetPath = Join-Path $destination 'Kampfcheck.exe'
            $shortcut.WorkingDirectory = $destination
            $shortcut.IconLocation = (Join-Path $destination 'resources\app.ico') + ',0'
            $shortcut.Description = 'Kampfcheck - Pokemon Champions'
            $shortcut.Save()
            [void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($shortcut)
        }
    } finally { [void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($shell) }
}
Write-Output ('Kampfcheck ' + $manifest.version + ' ist installiert: ' + $destination)
