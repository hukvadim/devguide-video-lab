' Тихо запускає локальний сервер Flow B-roll (без вікна консолі). Ярлик на цей файл лежить у папці Автозавантаження.
Set fso = CreateObject("Scripting.FileSystemObject")
dir = fso.GetParentFolderName(WScript.ScriptFullName)
CreateObject("WScript.Shell").Run "cmd /c node """ & dir & "\server.js"" >> """ & dir & "\server.log"" 2>&1", 0, False
