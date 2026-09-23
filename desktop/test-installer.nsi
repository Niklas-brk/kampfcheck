; Kleine Testversion: Programm im Setup, verifizierte Electron-Laufzeit als Download.
Unicode true
!include "MUI2.nsh"
!include "x64.nsh"
Name "Kampfcheck ${APP_VERSION} – Testversion"
OutFile "${OUTPUT_FILE}"
RequestExecutionLevel user
SetCompressor /SOLID lzma
Icon "${PAYLOAD_DIR}\app.ico"
VIProductVersion "${APP_VERSION}.0"
VIAddVersionKey /LANG=1031 "ProductName" "Kampfcheck Testversion"
VIAddVersionKey /LANG=1031 "FileDescription" "Kampfcheck Test-Setup"
VIAddVersionKey /LANG=1031 "FileVersion" "${APP_VERSION}"
VIAddVersionKey /LANG=1031 "LegalCopyright" "Inoffizielles Fanprojekt"
!define MUI_ABORTWARNING
!define MUI_WELCOMEPAGE_TEXT "Installiert Kampfcheck für Windows 10/11 (64 Bit), ohne Administratorrechte.$\r$\n$\r$\nBeim ersten Installieren wird die geprüfte Electron-Laufzeit heruntergeladen (ca. 151 MB). Bitte bleibe mit dem Internet verbunden.$\r$\n$\r$\nVorhandene Teams bleiben erhalten. Schließe eine bereits geöffnete Kampfcheck-Version vor dem Start der neuen Version."
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_INSTFILES
!define MUI_FINISHPAGE_TEXT "Kampfcheck ist über den Desktop und das Startmenü erreichbar.$\r$\n$\r$\nDie Anfängertipps kannst du oben in der App einschalten."
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_LANGUAGE "German"

Function .onInit
  ${IfNot} ${RunningX64}
    MessageBox MB_OK|MB_ICONSTOP "Diese Testversion benötigt Windows mit 64 Bit." /SD IDOK
    SetErrorLevel 1
    Abort
  ${EndIf}
FunctionEnd

Section "Kampfcheck"
  SetShellVarContext current
  InitPluginsDir
  SetOutPath "$PLUGINSDIR\payload"
  File "${PAYLOAD_DIR}\app.asar"
  File "${PAYLOAD_DIR}\app.ico"
  File "${PAYLOAD_DIR}\release.json"
  File "install-payload.ps1"
  DetailPrint "Laufzeit wird geprüft / heruntergeladen. Das kann einige Minuten dauern."
  ; NSIS ist 32 Bit. Sysnative startet bewusst die 64-Bit-PowerShell mit ihren Systemmodulen.
  nsExec::ExecToStack '"$WINDIR\Sysnative\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File "$PLUGINSDIR\payload\install-payload.ps1" -PayloadPath "$PLUGINSDIR\payload" -WithShortcuts'
  Pop $0
  Pop $1
  CreateDirectory "$LOCALAPPDATA\Kampfcheck-Installationscache"
  FileOpen $2 "$LOCALAPPDATA\Kampfcheck-Installationscache\installation.log" w
  FileWrite $2 "Exit: $0$\r$\n$1"
  FileClose $2
  ${If} $0 != 0
    DetailPrint "$1"
    MessageBox MB_OK|MB_ICONSTOP "Die Installation konnte nicht abgeschlossen werden.$\r$\n$1" /SD IDOK
    SetErrorLevel 1
    Abort
  ${EndIf}
  DetailPrint "Kampfcheck wurde installiert. Deine Teams bleiben erhalten."
SectionEnd
