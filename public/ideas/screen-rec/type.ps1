param([string]$text, [int]$delayMs = 70, [string]$log = "$PSScriptRoot\log.txt")
# Types unicode text char by char via SendInput; logs start/end time
Add-Type @"
using System; using System.Runtime.InteropServices;
public class K {
 [StructLayout(LayoutKind.Sequential)] public struct KI { public ushort vk, scan; public uint flags, time; public IntPtr extra; }
 [StructLayout(LayoutKind.Explicit, Size=40)] public struct IN { [FieldOffset(0)] public uint type; [FieldOffset(8)] public KI ki; }
 [DllImport("user32.dll")] static extern uint SendInput(uint n, IN[] i, int s);
 public static void Ch(char c){ var a=new IN[2]; a[0].type=1; a[0].ki.scan=c; a[0].ki.flags=4; a[1].type=1; a[1].ki.scan=c; a[1].ki.flags=6; SendInput(2,a,Marshal.SizeOf(typeof(IN))); }
}
"@
Add-Content $log "type_start $([DateTimeOffset]::Now.ToUnixTimeMilliseconds())"
foreach ($c in $text.ToCharArray()) { [K]::Ch($c); Start-Sleep -Milliseconds $delayMs }
Add-Content $log "type_end $([DateTimeOffset]::Now.ToUnixTimeMilliseconds())"
