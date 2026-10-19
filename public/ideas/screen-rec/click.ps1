param([int]$x, [int]$y, [string]$label = "click")
# OS-level click at screen coords + timestamp to log.txt (for synthetic cursor in Remotion)
Add-Type @"
using System; using System.Runtime.InteropServices;
public class M { [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);
[DllImport("user32.dll")] public static extern void mouse_event(uint f, uint x, uint y, uint d, IntPtr e); }
"@
$t = [DateTimeOffset]::Now.ToUnixTimeMilliseconds()
Add-Content -Path "$PSScriptRoot\log.txt" -Value "click $x $y $label $t"
[M]::SetCursorPos($x, $y) | Out-Null
Start-Sleep -Milliseconds 60
[M]::mouse_event(2, 0, 0, 0, [IntPtr]::Zero)
Start-Sleep -Milliseconds 60
[M]::mouse_event(4, 0, 0, 0, [IntPtr]::Zero)
