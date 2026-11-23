param(
  [int]$Port = 8080
)

$RootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$MimeTypes = @{
  ".html" = "text/html; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".js"   = "application/javascript; charset=utf-8"
  ".svg"  = "image/svg+xml"
  ".png"  = "image/png"
  ".jpg"  = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".json" = "application/json; charset=utf-8"
}

$Listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)
$Listener.Start()
Write-Host "Centro Diesel server listening at http://localhost:$Port/ (root: $RootDir)"

try {
  while ($true) {
    $Client = $Listener.AcceptTcpClient()
    try {
      $Stream = $Client.GetStream()
      $Reader = [System.IO.StreamReader]::new($Stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)
      $RequestLine = $Reader.ReadLine()
      if ([string]::IsNullOrWhiteSpace($RequestLine)) {
        $Client.Close()
        continue
      }

      while ($true) {
        $HeaderLine = $Reader.ReadLine()
        if ([string]::IsNullOrEmpty($HeaderLine)) { break }
      }

      $Parts = $RequestLine.Split(' ')
      $RawPath = if ($Parts.Length -ge 2) { $Parts[1] } else { "/" }
      $RelPath = ($RawPath.Split('?')[0]).TrimStart('/')
      if ([string]::IsNullOrWhiteSpace($RelPath)) { $RelPath = "index.html" }

      $RelPath = [System.Uri]::UnescapeDataString($RelPath).Replace('/', [System.IO.Path]::DirectorySeparatorChar)
      $FullPath = [System.IO.Path]::GetFullPath((Join-Path $RootDir $RelPath))

      if (-not $FullPath.StartsWith($RootDir, [System.StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path -LiteralPath $FullPath -PathType Leaf)) {
        $NotFound = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
        $Header = [System.Text.Encoding]::ASCII.GetBytes("HTTP/1.1 404 Not Found`r`nContent-Length: $($NotFound.Length)`r`nConnection: close`r`n`r`n")
        $Stream.Write($Header, 0, $Header.Length)
        $Stream.Write($NotFound, 0, $NotFound.Length)
      } else {
        $Ext = [System.IO.Path]::GetExtension($FullPath).ToLowerInvariant()
        $ContentType = if ($MimeTypes.ContainsKey($Ext)) { $MimeTypes[$Ext] } else { "application/octet-stream" }
        $Body = [System.IO.File]::ReadAllBytes($FullPath)
        $HeaderText = "HTTP/1.1 200 OK`r`nContent-Type: $ContentType`r`nContent-Length: $($Body.Length)`r`nCache-Control: no-cache`r`nConnection: close`r`n`r`n"
        $Header = [System.Text.Encoding]::ASCII.GetBytes($HeaderText)
        $Stream.Write($Header, 0, $Header.Length)
        $Stream.Write($Body, 0, $Body.Length)
      }
      $Stream.Flush()
    } finally {
      $Client.Close()
    }
  }
} finally {
  $Listener.Stop()
}
