Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\Users\guiro\Downloads\Projeto CLI\DeskFlow"
WshShell.Run "cmd /c npm start", 0, False
