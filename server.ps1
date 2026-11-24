param(
  [int]$Port = 8080
)

$RootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$DataFile = Join-Path $RootDir "data.json"
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

function Send-HttpResponse {
  param(
    [System.Net.Sockets.NetworkStream]$Stream,
    [string]$StatusLine,
    [string]$ContentType,
    [byte[]]$BodyBytes
  )
  $HeaderText = "HTTP/1.1 $StatusLine`r`nContent-Type: $ContentType`r`nContent-Length: $($BodyBytes.Length)`r`nCache-Control: no-store, no-cache`r`nAccess-Control-Allow-Origin: *`r`nAccess-Control-Allow-Methods: GET, POST, OPTIONS`r`nAccess-Control-Allow-Headers: Content-Type`r`nConnection: close`r`n`r`n"
  $HeaderBytes = [System.Text.Encoding]::ASCII.GetBytes($HeaderText)
  $Stream.Write($HeaderBytes, 0, $HeaderBytes.Length)
  if ($BodyBytes.Length -gt 0) {
    $Stream.Write($BodyBytes, 0, $BodyBytes.Length)
  }
  $Stream.Flush()
}

$Listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)
$Listener.Start()
Write-Host "Centro Diesel server listening at http://localhost:$Port/ (root: $RootDir)"

try {
  while ($true) {
    $Client = $Listener.AcceptTcpClient()
    $Client.ReceiveTimeout = 5000
    try {
      $Stream = $Client.GetStream()
      $HeaderMem = [System.IO.MemoryStream]::new()
      $Buf = New-Object byte[] 4096
      $HeaderEndIndex = -1

      while ($HeaderEndIndex -lt 0) {
        $BytesRead = $Stream.Read($Buf, 0, $Buf.Length)
        if ($BytesRead -le 0) { break }
        $HeaderMem.Write($Buf, 0, $BytesRead)
        $AllSoFar = $HeaderMem.ToArray()
        for ($i = 0; $i -le ($AllSoFar.Length - 4); $i++) {
          if ($AllSoFar[$i] -eq 13 -and $AllSoFar[$i+1] -eq 10 -and $AllSoFar[$i+2] -eq 13 -and $AllSoFar[$i+3] -eq 10) {
            $HeaderEndIndex = $i
            break
          }
        }
        if ($AllSoFar.Length -gt 65536) { break }
      }

      if ($HeaderEndIndex -lt 0) {
        $Client.Close()
        continue
      }

      $AllBytes = $HeaderMem.ToArray()
      $HeaderStr = [System.Text.Encoding]::ASCII.GetString($AllBytes, 0, $HeaderEndIndex)
      $HeaderLines = $HeaderStr -split "`r`n"
      $RequestParts = $HeaderLines[0].Split(' ')
      $Method = if ($RequestParts.Length -ge 1) { $RequestParts[0].ToUpperInvariant() } else { "GET" }
      $RawPath = if ($RequestParts.Length -ge 2) { $RequestParts[1] } else { "/" }
      $PathOnly = ($RawPath.Split('?')[0])

      $ContentLength = 0
      foreach ($Line in $HeaderLines) {
        if ($Line -match '^Content-Length:\s*(\d+)$') {
          $ContentLength = [int]$Matches[1]
        }
      }

      $BodyStartIndex = $HeaderEndIndex + 4
      $BodyBytes = New-Object byte[] 0
      if ($ContentLength -gt 0) {
        $BodyMem = [System.IO.MemoryStream]::new()
        $InitialExtra = $AllBytes.Length - $BodyStartIndex
        if ($InitialExtra -gt 0) {
          $Take = [Math]::Min($InitialExtra, $ContentLength)
          $BodyMem.Write($AllBytes, $BodyStartIndex, $Take)
        }
        while ($BodyMem.Length -lt $ContentLength) {
          $Need = [Math]::Min($Buf.Length, $ContentLength - [int]$BodyMem.Length)
          $ReadNow = $Stream.Read($Buf, 0, $Need)
          if ($ReadNow -le 0) { break }
          $BodyMem.Write($Buf, 0, $ReadNow)
        }
        $BodyBytes = $BodyMem.ToArray()
      }

      if ($Method -eq "OPTIONS") {
        Send-HttpResponse -Stream $Stream -StatusLine "204 No Content" -ContentType "text/plain" -BodyBytes ([byte[]]::new(0))
        continue
      }

      if ($PathOnly -eq "/api/state") {
        if ($Method -eq "GET") {
          if (Test-Path -LiteralPath $DataFile -PathType Leaf) {
            $JsonBytes = [System.IO.File]::ReadAllBytes($DataFile)
            Send-HttpResponse -Stream $Stream -StatusLine "200 OK" -ContentType "application/json; charset=utf-8" -BodyBytes $JsonBytes
          } else {
            $EmptyBytes = [System.Text.Encoding]::UTF8.GetBytes('{"empty":true}')
            Send-HttpResponse -Stream $Stream -StatusLine "200 OK" -ContentType "application/json; charset=utf-8" -BodyBytes $EmptyBytes
          }
          continue
        }
        if ($Method -eq "POST") {
          $JsonText = [System.Text.Encoding]::UTF8.GetString($BodyBytes)
          if ([string]::IsNullOrWhiteSpace($JsonText)) {
            $ErrBytes = [System.Text.Encoding]::UTF8.GetBytes('{"ok":false,"error":"Empty body"}')
            Send-HttpResponse -Stream $Stream -StatusLine "400 Bad Request" -ContentType "application/json; charset=utf-8" -BodyBytes $ErrBytes
          } else {
            [System.IO.File]::WriteAllText($DataFile, $JsonText, [System.Text.UTF8Encoding]::new($false))
            $OkBytes = [System.Text.Encoding]::UTF8.GetBytes('{"ok":true}')
            Send-HttpResponse -Stream $Stream -StatusLine "200 OK" -ContentType "application/json; charset=utf-8" -BodyBytes $OkBytes
          }
          continue
        }
      }

      $RelPath = $PathOnly.TrimStart('/')
      if ([string]::IsNullOrWhiteSpace($RelPath)) { $RelPath = "index.html" }
      $RelPath = [System.Uri]::UnescapeDataString($RelPath).Replace('/', [System.IO.Path]::DirectorySeparatorChar)
      $FullPath = [System.IO.Path]::GetFullPath((Join-Path $RootDir $RelPath))

      if (-not $FullPath.StartsWith($RootDir, [System.StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path -LiteralPath $FullPath -PathType Leaf)) {
        $NotFound = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
        Send-HttpResponse -Stream $Stream -StatusLine "404 Not Found" -ContentType "text/plain; charset=utf-8" -BodyBytes $NotFound
      } else {
        $Ext = [System.IO.Path]::GetExtension($FullPath).ToLowerInvariant()
        $ContentType = if ($MimeTypes.ContainsKey($Ext)) { $MimeTypes[$Ext] } else { "application/octet-stream" }
        $FileBytes = [System.IO.File]::ReadAllBytes($FullPath)
        Send-HttpResponse -Stream $Stream -StatusLine "200 OK" -ContentType $ContentType -BodyBytes $FileBytes
      }
    } catch {
      Write-Warning "Request error: $($_.Exception.Message)"
    } finally {
      $Client.Close()
    }
  }
} finally {
  $Listener.Stop()
}
