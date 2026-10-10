$WshShell = New-Object -ComObject WScript.Shell
$DesktopPath = [System.Environment]::GetFolderPath('Desktop')
$ShortcutPath = Join-Path $DesktopPath 'DeskFlow.lnk'
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = 'wscript.exe'
$Shortcut.Arguments = '""C:\Users\guiro\Downloads\Projeto CLI\DeskFlow\DeskFlow.vbs""'
$Shortcut.WorkingDirectory = 'C:\Users\guiro\Downloads\Projeto CLI\DeskFlow'
$Shortcut.IconLocation = 'C:\Users\guiro\Downloads\Projeto CLI\DeskFlow\icon.ico,0'
$Shortcut.Description = 'DeskFlow - Brutalist PC Decompression & Wellness'
$Shortcut.Save()

# Also copy to OneDrive Desktop if synced
$OneDriveDesktop = "C:\Users\guiro\OneDrive\Área de Trabalho\DeskFlow.lnk"
if (Test-Path "C:\Users\guiro\OneDrive\Área de Trabalho") {
    Copy-Item $ShortcutPath $OneDriveDesktop -Force
}

# Also standard Desktop
if (Test-Path "C:\Users\guiro\Desktop") {
    Copy-Item $ShortcutPath "C:\Users\guiro\Desktop\DeskFlow.lnk" -Force
}

Write-Output "SUCCESS: Updated shortcut with proper quoted paths"
