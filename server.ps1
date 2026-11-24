param(
  [int]$Port = 8080
)

$RootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$DataFile = Join-Path $RootDir "data.json"
$UsersFile = Join-Path $RootDir "users.json"
$SessionsFile = Join-Path $RootDir "sessions.json"

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

$BlockedPaths = @(
  "/data.json",
  "/users.json",
  "/sessions.json",
  "/server.ps1",
  "/.gitignore"
)

$SyncLock = New-Object object

function Send-HttpResponse {
  param(
    [System.Net.Sockets.NetworkStream]$Stream,
    [string]$StatusLine,
    [string]$ContentType,
    [byte[]]$BodyBytes
  )
  $HeaderText = "HTTP/1.1 $StatusLine`r`nContent-Type: $ContentType`r`nContent-Length: $($BodyBytes.Length)`r`nCache-Control: no-store, no-cache`r`nAccess-Control-Allow-Origin: *`r`nAccess-Control-Allow-Methods: GET, POST, OPTIONS`r`nAccess-Control-Allow-Headers: Content-Type, Authorization`r`nConnection: close`r`n`r`n"
  $HeaderBytes = [System.Text.Encoding]::ASCII.GetBytes($HeaderText)
  $Stream.Write($HeaderBytes, 0, $HeaderBytes.Length)
  if ($BodyBytes.Length -gt 0) {
    $Stream.Write($BodyBytes, 0, $BodyBytes.Length)
  }
  $Stream.Flush()
}

function Send-Json {
  param(
    [System.Net.Sockets.NetworkStream]$Stream,
    [string]$StatusLine,
    [object]$Payload
  )
  $JsonStr = ConvertTo-Json -InputObject $Payload -Depth 12
  $Bytes = [System.Text.Encoding]::UTF8.GetBytes($JsonStr)
  Send-HttpResponse -Stream $Stream -StatusLine $StatusLine -ContentType "application/json; charset=utf-8" -BodyBytes $Bytes
}

function New-RandomToken {
  $Bytes = New-Object byte[] 32
  [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($Bytes)
  return [Convert]::ToBase64String($Bytes).Replace('+', '-').Replace('/', '_').TrimEnd('=')
}

function New-Salt {
  $Bytes = New-Object byte[] 16
  [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($Bytes)
  return [Convert]::ToBase64String($Bytes)
}

function Hash-Password {
  param([string]$Password, [string]$SaltBase64)
  $SaltBytes = [Convert]::FromBase64String($SaltBase64)
  $Kdf = New-Object System.Security.Cryptography.Rfc2898DeriveBytes($Password, $SaltBytes, 50000, [System.Security.Cryptography.HashAlgorithmName]::SHA256)
  try {
    return [Convert]::ToBase64String($Kdf.GetBytes(32))
  } finally {
    $Kdf.Dispose()
  }
}

function Test-Password {
  param([string]$Password, [string]$SaltBase64, [string]$ExpectedHash)
  if ([string]::IsNullOrEmpty($Password) -or [string]::IsNullOrEmpty($SaltBase64) -or [string]::IsNullOrEmpty($ExpectedHash)) {
    return $false
  }
  $Actual = [Convert]::FromBase64String((Hash-Password -Password $Password -SaltBase64 $SaltBase64))
  $Expected = [Convert]::FromBase64String($ExpectedHash)
  if ($Actual.Length -ne $Expected.Length) { return $false }
  $Diff = 0
  for ($i = 0; $i -lt $Actual.Length; $i++) {
    $Diff = $Diff -bor ($Actual[$i] -bxor $Expected[$i])
  }
  return ($Diff -eq 0)
}

function Mask-Email {
  param([string]$Email)
  if ([string]::IsNullOrWhiteSpace($Email) -or -not $Email.Contains('@')) { return '***' }
  $Parts = $Email.Split('@', 2)
  $Local = $Parts[0]
  $Domain = $Parts[1]
  if ($Local.Length -le 1) {
    return "*@$Domain"
  }
  return "$($Local.Substring(0, 1))***@$Domain"
}

function Read-JsonArrayFile {
  param([string]$Path)
  if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) { return @() }
  $Raw = [System.IO.File]::ReadAllText($Path, [System.Text.Encoding]::UTF8)
  if ([string]::IsNullOrWhiteSpace($Raw)) { return @() }
  $Parsed = ConvertFrom-Json -InputObject $Raw
  if ($null -eq $Parsed) { return @() }
  return @($Parsed)
}

function Write-JsonArrayFile {
  param([string]$Path, [object[]]$Items)
  $JsonStr = ConvertTo-Json -InputObject @($Items) -Depth 12
  [System.IO.File]::WriteAllText($Path, $JsonStr, [System.Text.UTF8Encoding]::new($false))
}

function Ensure-OwnerSeeded {
  $Users = @(Read-JsonArrayFile -Path $UsersFile)
  $HasOwner = @($Users | Where-Object { $_.role -eq "owner" }).Count -gt 0
  if (-not $HasOwner) {
    $Salt = New-Salt
    $Hash = Hash-Password -Password "CentroDiesel2026!" -SaltBase64 $Salt
    $Owner = [PSCustomObject]@{
      id           = "usr-owner-1"
      username     = "dono"
      fullName     = "Proprietário Centro Diesel"
      email        = "mfrcentrodiesel@gmail.com"
      phone        = "296 383 150"
      vehicle      = ""
      role         = "owner"
      salt         = $Salt
      passwordHash = $Hash
      createdAt    = (Get-Date).ToString("o")
    }
    $Users = @($Users) + @($Owner)
    Write-JsonArrayFile -Path $UsersFile -Items $Users
  }
  return @(Read-JsonArrayFile -Path $UsersFile)
}

function To-SafeUser {
  param([object]$User)
  return [PSCustomObject]@{
    id        = $User.id
    username  = $User.username
    fullName  = $User.fullName
    email     = $User.email
    phone     = $User.phone
    vehicle   = $User.vehicle
    role      = $User.role
    createdAt = $User.createdAt
  }
}

function Get-DefaultServicesList {
  return @(
    [PSCustomObject]@{ id = "srv-bi-01"; code = "BI-01"; name = "Teste e Calibração de Bomba Injetora em Bancada"; category = "Bombas Injetoras"; description = "Ensaio completo em bancada de testes com verificação de débito, pressão, avanço e estanquicidade."; price = 75; duration = "2h00"; warranty = "6 meses"; stock = "Disponível"; visible = $true; image = "http://www.mfrcentrodiesel.com/wp-content/uploads/2014/10/DSCF16091-1140x400.jpg"; fallback = "assets/bomba-injetora.svg" },
    [PSCustomObject]@{ id = "srv-bi-02"; code = "BI-02"; name = "Reparação Bomba Injetora Rotativa / Em Linha"; category = "Bombas Injetoras"; description = "Desmontagem total, substituição de vedantes, retentores e componentes desgastados com afinação final em bancada."; price = 340; duration = "1 dia"; warranty = "12 meses"; stock = "Disponível"; visible = $true; image = "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=900&q=80"; fallback = "assets/bomba-injetora.svg" },
    [PSCustomObject]@{ id = "srv-bi-03"; code = "BI-03"; name = "Reparação Bomba Alta Pressão Common Rail"; category = "Bombas Injetoras"; description = "Reconstrução especializada para bombas Bosch CP1/CP3/CP4, Delphi, Denso e Stanadyne com relatório de bancada."; price = 390; duration = "1-2 dias"; warranty = "12 meses"; stock = "Disponível"; visible = $true; image = "http://www.mfrcentrodiesel.com/wp-content/uploads/2014/10/audi_diesel_cars_2-1140x400.jpg"; fallback = "assets/bomba-injetora.svg" },
    [PSCustomObject]@{ id = "srv-inj-01"; code = "INJ-01"; name = "Teste Eletrónico de Injetor Common Rail (un.)"; category = "Injetores"; description = "Avaliação individual em bancada eletrónica de pré-injeção, débito máximo, marcha lenta e retorno."; price = 25; duration = "45 min"; warranty = "Relatório Técnico"; stock = "Disponível"; visible = $true; image = "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=900&q=80"; fallback = "assets/injetores-common-rail.svg" },
    [PSCustomObject]@{ id = "srv-inj-02"; code = "INJ-02"; name = "Limpeza por Ultrassons e Ajuste de Injetor (un.)"; category = "Injetores"; description = "Descarbonização profunda por ultrassons, substituição de anilhas corta-fogo e calibração de pressão."; price = 45; duration = "1h30"; warranty = "6 meses"; stock = "Disponível"; visible = $true; image = "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=900&q=80"; fallback = "assets/injetores-common-rail.svg" },
    [PSCustomObject]@{ id = "srv-inj-03"; code = "INJ-03"; name = "Reconstrução Completa de Injetor c/ Codificação IMA (un.)"; category = "Injetores"; description = "Substituição de válvula de controlo e ponteira original Bosch/Delphi/Denso com geração de novo código IMA."; price = 145; duration = "3h00"; warranty = "12 meses"; stock = "Disponível"; visible = $true; image = "https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?auto=format&fit=crop&w=900&q=80"; fallback = "assets/injetores-common-rail.svg" },
    [PSCustomObject]@{ id = "srv-dia-01"; code = "DIA-01"; name = "Auto-Diagnóstico Computorizado Multimarca"; category = "Auto-Diagnóstico"; description = "Leitura completa de centralinas Diesel e Gasolina, parâmetros em tempo real, regenerações e reset de avisos."; price = 35; duration = "45 min"; warranty = "Relatório Digital"; stock = "Disponível"; visible = $true; image = "http://www.mfrcentrodiesel.com/wp-content/uploads/2014/02/6-940x250.jpg"; fallback = "assets/diagnostico-auto.svg" },
    [PSCustomObject]@{ id = "srv-dia-02"; code = "DIA-02"; name = "Teste de Compressão e Fugas no Sistema de Injeção"; category = "Auto-Diagnóstico"; description = "Verificação mecânica de compressão por cilindro, pressão do rail e teste de retornos no veículo."; price = 65; duration = "1h30"; warranty = "Relatório Técnico"; stock = "Disponível"; visible = $true; image = "https://images.unsplash.com/photo-1625047509248-ec889cbff17f?auto=format&fit=crop&w=900&q=80"; fallback = "assets/diagnostico-auto.svg" },
    [PSCustomObject]@{ id = "srv-tur-01"; code = "TUR-01"; name = "Cravação de Tubos Hidráulicos de Alta Pressão"; category = "Turbos e Hidráulica"; description = "Fabrico e cravação à medida de tubagens flexíveis e rígidas para direção, óleo, travões e alta pressão."; price = 40; duration = "45 min"; warranty = "12 meses"; stock = "Disponível"; visible = $true; image = "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80"; fallback = "assets/turbocompressor.svg" },
    [PSCustomObject]@{ id = "srv-tur-02"; code = "TUR-02"; name = "Desmontagem e Revisão de Turbocompressor"; category = "Turbos e Hidráulica"; description = "Desmontagem, limpeza de geometria variável, calibragem do cartucho (CHRA) e verificação de lubrificação."; price = 280; duration = "1 dia"; warranty = "12 meses"; stock = "Stock Reduzido"; visible = $true; image = "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=900&q=80"; fallback = "assets/turbocompressor.svg" },
    [PSCustomObject]@{ id = "srv-rap-01"; code = "SRV-01"; name = "Revisão Completa (Óleo Sintético + Filtros)"; category = "Serviços Rápidos Auto"; description = "Mudança de óleo homologado, filtro de óleo, ar, gasóleo e habitáculo com verificação de 25 pontos."; price = 125; duration = "1h30"; warranty = "12 meses"; stock = "Disponível"; visible = $true; image = "http://www.mfrcentrodiesel.com/wp-content/uploads/2014/02/mudanca-oleo+filtro-640x250.jpg"; fallback = "assets/revisao-geral.svg" },
    [PSCustomObject]@{ id = "srv-rap-02"; code = "SRV-02"; name = "Substituição Kit Distribuição e Bomba de Água"; category = "Serviços Rápidos Auto"; description = "Troca completa de correia de distribuição, tensores, rolamentos e bomba de água com líquido refrigerante."; price = 290; duration = "4h00"; warranty = "24 meses"; stock = "Peça por Encomenda"; visible = $true; image = "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=900&q=80"; fallback = "assets/revisao-geral.svg" },
    [PSCustomObject]@{ id = "srv-rap-03"; code = "SRV-03"; name = "Limpeza Profissional Filtro de Partículas (DPF)"; category = "Serviços Rápidos Auto"; description = "Desentupimento e limpeza profunda do filtro DPF/FAP com medição de contrapressão e reposição na centralina."; price = 160; duration = "3h00"; warranty = "12 meses"; stock = "Disponível"; visible = $true; image = "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=900&q=80"; fallback = "assets/revisao-geral.svg" }
  )
}

function Get-DefaultWorkshopData {
  $Today = (Get-Date).ToString("yyyy-MM-dd")
  return [PSCustomObject]@{
    updatedAt = 0
    workshop  = [PSCustomObject]@{
      company = "Manuel Francisco Raposo & Ca. Lda."
      brand   = "Centro Diesel"
      address = "Zona Comercial dos Valados, Rua António de Medeiros Almeida – Lotes 23/24, 9500-652 Ponta Delgada"
      region  = "Ilha de São Miguel, Açores"
      phone   = "296 383 150"
      email   = "mfrcentrodiesel@gmail.com"
      hours   = "Segunda a Sexta: 08:30 – 12:30 | 14:00 – 18:00"
    }
    settings  = [PSCustomObject]@{
      ivaRate      = 16
      aiGreeting   = "Centro Diesel, Manuel Francisco Raposo & Companhia, bom dia! Está a falar com a assistente virtual da oficina em Ponta Delgada. Em que posso ajudar hoje?"
      aiNotes      = ""
      geminiApiKey = ""
      geminiModel  = "gemini-2.5-flash"
      useGemini    = $false
      ttsEnabled   = $true
      autoAnswer   = $true
    }
    services  = @(Get-DefaultServicesList)
    bays      = @(
      [PSCustomObject]@{ id = "bay-1"; name = "Bancada Bosch #1"; status = "Ocupada"; vehicle = "64-PZ-18 • Mercedes Sprinter (Exemplo)"; task = "Bomba Common Rail CP3" },
      [PSCustomObject]@{ id = "bay-2"; name = "Bancada Common Rail #2"; status = "Livre"; vehicle = "Disponível"; task = "Pronta para teste injetores" },
      [PSCustomObject]@{ id = "bay-3"; name = "Elevador Rápido #1"; status = "Ocupada"; vehicle = "AA-42-RT • VW Caddy 2.0 TDI (Exemplo)"; task = "Revisão + Limpeza DPF" },
      [PSCustomObject]@{ id = "bay-4"; name = "Diagnóstico Eletrónico"; status = "Reservada"; vehicle = "19-ML-83 • Renault Master (Exemplo)"; task = "Diagnóstico às 14:30" }
    )
    workOrders = @(
      [PSCustomObject]@{ id = "FO-2026-104"; client = "Transportes Atlântico Açores (Exemplo)"; phone = "917 440 212"; plate = "64-PZ-18"; vehicle = "Mercedes-Benz Sprinter 316 CDI"; status = "Em Bancada de Teste"; bay = "Bancada Bosch #1"; desc = "Registo de exemplo — pode limpar os dados fictícios nas Definições."; total = 672.80; createdAt = $Today }
    )
    bookings  = @(
      [PSCustomObject]@{ id = "AG-01"; userId = ""; username = ""; client = "Carlos Arruda (Exemplo)"; phone = "913 228 901"; vehicle = "19-ML-83 • Renault Master"; date = $Today; time = "14:30"; service = "Auto-Diagnóstico Computorizado Multimarca"; source = "Assistente IA"; status = "Confirmada" }
    )
    calls     = @(
      [PSCustomObject]@{
        id = "CH-1001"; userId = ""; username = ""; timestamp = "$Today 09:42"; phone = "913 228 901"; callerName = "Carlos Arruda (Exemplo)"; duration = "01:38"; intent = "Marcação Auto-Diagnóstico"; vehicle = "19-ML-83 • Renault Master"; quotedTotal = 40.60; status = "Convertida em Marcação"
        messages = @(
          [PSCustomObject]@{ sender = "ai"; text = "Centro Diesel, Manuel Francisco Raposo & Ca., bom dia! Em que podemos ajudar?" },
          [PSCustomObject]@{ sender = "caller"; text = "Bom dia, a minha Renault Master matrícula 19-ML-83 acendeu a luz de injeção." },
          [PSCustomObject]@{ sender = "ai"; text = "O Auto-Diagnóstico Computorizado Multimarca tem o valor base de 35,00 € (+ IVA)." }
        )
      }
    )
    quoteDraft = [PSCustomObject]@{
      number = "ORC-2026-001"; clientName = ""; clientPhone = ""; clientNif = ""; clientEmail = ""; vehiclePlate = ""; vehicleModel = ""; notes = ""; items = @(); extraParts = @()
    }
  }
}

function Read-WorkshopData {
  if (-not (Test-Path -LiteralPath $DataFile -PathType Leaf)) {
    return Get-DefaultWorkshopData
  }
  $Raw = [System.IO.File]::ReadAllText($DataFile, [System.Text.Encoding]::UTF8)
  if ([string]::IsNullOrWhiteSpace($Raw)) {
    return Get-DefaultWorkshopData
  }
  $Parsed = ConvertFrom-Json -InputObject $Raw
  if ($null -eq $Parsed -or $null -eq $Parsed.services) {
    return Get-DefaultWorkshopData
  }
  if ($null -eq $Parsed.bookings) { $Parsed | Add-Member -NotePropertyName bookings -NotePropertyValue @() -Force }
  if ($null -eq $Parsed.calls) { $Parsed | Add-Member -NotePropertyName calls -NotePropertyValue @() -Force }
  if ($null -eq $Parsed.workOrders) { $Parsed | Add-Member -NotePropertyName workOrders -NotePropertyValue @() -Force }
  return $Parsed
}

function Write-WorkshopData {
  param([object]$Data)
  $JsonStr = ConvertTo-Json -InputObject $Data -Depth 12
  [System.IO.File]::WriteAllText($DataFile, $JsonStr, [System.Text.UTF8Encoding]::new($false))
}

function Get-SessionUser {
  param([string]$AuthHeader)
  if ([string]::IsNullOrWhiteSpace($AuthHeader) -or -not $AuthHeader.StartsWith("Bearer ", [System.StringComparison]::OrdinalIgnoreCase)) {
    return $null
  }
  $Token = $AuthHeader.Substring(7).Trim()
  if ([string]::IsNullOrWhiteSpace($Token)) { return $null }
  $Sessions = @(Read-JsonArrayFile -Path $SessionsFile)
  $Sess = $Sessions | Where-Object { $_.token -eq $Token } | Select-Object -First 1
  if ($null -eq $Sess) { return $null }
  $Users = @(Ensure-OwnerSeeded)
  $User = $Users | Where-Object { $_.id -eq $Sess.userId } | Select-Object -First 1
  if ($null -eq $User) { return $null }
  return [PSCustomObject]@{ token = $Token; user = $User }
}

Ensure-OwnerSeeded | Out-Null

$Listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)
$Listener.Start()
Write-Host "Centro Diesel secure server listening at http://localhost:$Port/ (root: $RootDir)"

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
      $AuthHeader = ""
      foreach ($Line in $HeaderLines) {
        if ($Line -match '^Content-Length:\s*(\d+)$') {
          $ContentLength = [int]$Matches[1]
        } elseif ($Line -match '^Authorization:\s*(.+)$') {
          $AuthHeader = $Matches[1].Trim()
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
      $BodyText = if ($BodyBytes.Length -gt 0) { [System.Text.Encoding]::UTF8.GetString($BodyBytes) } else { "" }

      if ($Method -eq "OPTIONS") {
        Send-HttpResponse -Stream $Stream -StatusLine "204 No Content" -ContentType "text/plain" -BodyBytes ([byte[]]::new(0))
        continue
      }

      # Block direct static download of private files
      $LowerPath = $PathOnly.ToLowerInvariant()
      if ($BlockedPaths -contains $LowerPath -or $LowerPath.StartsWith("/.")) {
        Send-Json -Stream $Stream -StatusLine "403 Forbidden" -Payload ([PSCustomObject]@{ error = "Acesso proibido a ficheiros privados." })
        continue
      }

      # ---------------------------------------------------------------
      # API ROUTES
      # ---------------------------------------------------------------
      if ($PathOnly.StartsWith("/api/")) {
        [System.Threading.Monitor]::Enter($SyncLock)
        try {
          # 1. PUBLIC DATA (NO bookings, NO calls, NO users, NO emails, NO gemini key)
          if ($PathOnly -eq "/api/public" -and $Method -eq "GET") {
            $Data = Read-WorkshopData
            $VisibleServices = @($Data.services | Where-Object { $_.visible -ne $false })
            $PublicPayload = [PSCustomObject]@{
              updatedAt      = $Data.updatedAt
              workshop       = $Data.workshop
              publicSettings = [PSCustomObject]@{
                ivaRate    = $Data.settings.ivaRate
                aiGreeting = $Data.settings.aiGreeting
                aiNotes    = $Data.settings.aiNotes
                ttsEnabled = $Data.settings.ttsEnabled
                autoAnswer = $Data.settings.autoAnswer
              }
              services       = @($VisibleServices)
            }
            Send-Json -Stream $Stream -StatusLine "200 OK" -Payload $PublicPayload
            continue
          }

          # 2. CLIENT REGISTER
          if ($PathOnly -eq "/api/auth/register" -and $Method -eq "POST") {
            $InputObj = ConvertFrom-Json -InputObject $BodyText
            $Username = if ($InputObj.username) { $InputObj.username.Trim().ToLowerInvariant() } else { "" }
            $FullName = if ($InputObj.fullName) { $InputObj.fullName.Trim() } else { "" }
            $Email = if ($InputObj.email) { $InputObj.email.Trim().ToLowerInvariant() } else { "" }
            $Phone = if ($InputObj.phone) { $InputObj.phone.Trim() } else { "" }
            $Vehicle = if ($InputObj.vehicle) { $InputObj.vehicle.Trim() } else { "" }
            $Password = if ($InputObj.password) { [string]$InputObj.password } else { "" }

            if ($Username -notmatch '^[a-z0-9_.-]{3,24}$') {
              Send-Json -Stream $Stream -StatusLine "400 Bad Request" -Payload ([PSCustomObject]@{ error = "Nome de utilizador inválido (use 3 a 24 letras, números, ., _ ou -)." })
              continue
            }
            if ([string]::IsNullOrWhiteSpace($FullName) -or $Email -notmatch '^[^@\s]+@[^@\s]+\.[^@\s]+$') {
              Send-Json -Stream $Stream -StatusLine "400 Bad Request" -Payload ([PSCustomObject]@{ error = "Preencha nome completo e e-mail válido." })
              continue
            }
            if ($Password.Length -lt 6) {
              Send-Json -Stream $Stream -StatusLine "400 Bad Request" -Payload ([PSCustomObject]@{ error = "A palavra-passe deve ter pelo menos 6 caracteres." })
              continue
            }

            $Users = @(Ensure-OwnerSeeded)
            if (@($Users | Where-Object { $_.username -eq $Username }).Count -gt 0) {
              Send-Json -Stream $Stream -StatusLine "409 Conflict" -Payload ([PSCustomObject]@{ error = "Este nome de utilizador já está registado." })
              continue
            }
            if (@($Users | Where-Object { $_.email -eq $Email }).Count -gt 0) {
              Send-Json -Stream $Stream -StatusLine "409 Conflict" -Payload ([PSCustomObject]@{ error = "Este e-mail já pertence a uma conta existente." })
              continue
            }

            $Salt = New-Salt
            $Hash = Hash-Password -Password $Password -SaltBase64 $Salt
            $NewUser = [PSCustomObject]@{
              id           = "usr-" + [Guid]::NewGuid().ToString("N").Substring(0, 10)
              username     = $Username
              fullName     = $FullName
              email        = $Email
              phone        = $Phone
              vehicle      = $Vehicle
              role         = "client"
              salt         = $Salt
              passwordHash = $Hash
              createdAt    = (Get-Date).ToString("o")
            }
            $Users = @($Users) + @($NewUser)
            Write-JsonArrayFile -Path $UsersFile -Items $Users

            $Token = New-RandomToken
            $Sessions = @(Read-JsonArrayFile -Path $SessionsFile)
            $Sessions = @($Sessions) + @([PSCustomObject]@{
              token     = $Token
              userId    = $NewUser.id
              role      = "client"
              createdAt = (Get-Date).ToString("o")
            })
            Write-JsonArrayFile -Path $SessionsFile -Items $Sessions

            Send-Json -Stream $Stream -StatusLine "200 OK" -Payload ([PSCustomObject]@{
              token = $Token
              user  = (To-SafeUser -User $NewUser)
            })
            continue
          }

          # 3. CLIENT LOGIN
          if ($PathOnly -eq "/api/auth/login" -and $Method -eq "POST") {
            $InputObj = ConvertFrom-Json -InputObject $BodyText
            $Identifier = if ($InputObj.identifier) { $InputObj.identifier.Trim().ToLowerInvariant() } else { "" }
            $Password = if ($InputObj.password) { [string]$InputObj.password } else { "" }

            $Users = @(Ensure-OwnerSeeded)
            $User = $Users | Where-Object { $_.role -eq "client" -and ($_.username -eq $Identifier -or $_.email -eq $Identifier) } | Select-Object -First 1
            if ($null -eq $User -or -not (Test-Password -Password $Password -SaltBase64 $User.salt -ExpectedHash $User.passwordHash)) {
              Send-Json -Stream $Stream -StatusLine "401 Unauthorized" -Payload ([PSCustomObject]@{ error = "Utilizador ou palavra-passe incorretos." })
              continue
            }

            $Token = New-RandomToken
            $Sessions = @(Read-JsonArrayFile -Path $SessionsFile)
            $Sessions = @($Sessions) + @([PSCustomObject]@{
              token     = $Token
              userId    = $User.id
              role      = "client"
              createdAt = (Get-Date).ToString("o")
            })
            Write-JsonArrayFile -Path $SessionsFile -Items $Sessions

            Send-Json -Stream $Stream -StatusLine "200 OK" -Payload ([PSCustomObject]@{
              token = $Token
              user  = (To-SafeUser -User $User)
            })
            continue
          }

          # 4. CLIENT ME (STRICT ISOLATION: ONLY OWN PROFILE + OWN BOOKINGS/CALLS)
          if ($PathOnly -eq "/api/auth/me" -and $Method -eq "GET") {
            $SessInfo = Get-SessionUser -AuthHeader $AuthHeader
            if ($null -eq $SessInfo -or $SessInfo.user.role -ne "client") {
              Send-Json -Stream $Stream -StatusLine "401 Unauthorized" -Payload ([PSCustomObject]@{ error = "Sessão de cliente inválida ou expirada." })
              continue
            }
            $Data = Read-WorkshopData
            $MyBookings = @($Data.bookings | Where-Object { $_.userId -eq $SessInfo.user.id })
            $MyCalls = @($Data.calls | Where-Object { $_.userId -eq $SessInfo.user.id })
            Send-Json -Stream $Stream -StatusLine "200 OK" -Payload ([PSCustomObject]@{
              user       = (To-SafeUser -User $SessInfo.user)
              myBookings = @($MyBookings)
              myCalls    = @($MyCalls)
            })
            continue
          }

          # 5. CLIENT PROFILE UPDATE
          if ($PathOnly -eq "/api/auth/profile" -and $Method -eq "POST") {
            $SessInfo = Get-SessionUser -AuthHeader $AuthHeader
            if ($null -eq $SessInfo -or $SessInfo.user.role -ne "client") {
              Send-Json -Stream $Stream -StatusLine "401 Unauthorized" -Payload ([PSCustomObject]@{ error = "Não autenticado." })
              continue
            }
            $InputObj = ConvertFrom-Json -InputObject $BodyText
            $Users = @(Ensure-OwnerSeeded)
            $Idx = -1
            for ($i = 0; $i -lt $Users.Count; $i++) {
              if ($Users[$i].id -eq $SessInfo.user.id) { $Idx = $i; break }
            }
            if ($Idx -lt 0) {
              Send-Json -Stream $Stream -StatusLine "404 Not Found" -Payload ([PSCustomObject]@{ error = "Conta não encontrada." })
              continue
            }
            $Target = $Users[$Idx]

            if ($InputObj.email) {
              $NewEmail = $InputObj.email.Trim().ToLowerInvariant()
              if ($NewEmail -notmatch '^[^@\s]+@[^@\s]+\.[^@\s]+$') {
                Send-Json -Stream $Stream -StatusLine "400 Bad Request" -Payload ([PSCustomObject]@{ error = "E-mail inválido." })
                continue
              }
              $DupEmail = @($Users | Where-Object { $_.id -ne $Target.id -and $_.email -eq $NewEmail }).Count -gt 0
              if ($DupEmail) {
                Send-Json -Stream $Stream -StatusLine "409 Conflict" -Payload ([PSCustomObject]@{ error = "Este e-mail já está em uso." })
                continue
              }
              $Target.email = $NewEmail
            }
            if ($InputObj.fullName) { $Target.fullName = $InputObj.fullName.Trim() }
            if ($null -ne $InputObj.phone) { $Target.phone = $InputObj.phone.Trim() }
            if ($null -ne $InputObj.vehicle) { $Target.vehicle = $InputObj.vehicle.Trim() }

            if (-not [string]::IsNullOrEmpty($InputObj.newPassword)) {
              $CurPass = [string]$InputObj.currentPassword
              $NewPass = [string]$InputObj.newPassword
              if (-not (Test-Password -Password $CurPass -SaltBase64 $Target.salt -ExpectedHash $Target.passwordHash)) {
                Send-Json -Stream $Stream -StatusLine "401 Unauthorized" -Payload ([PSCustomObject]@{ error = "Palavra-passe atual incorreta." })
                continue
              }
              if ($NewPass.Length -lt 6) {
                Send-Json -Stream $Stream -StatusLine "400 Bad Request" -Payload ([PSCustomObject]@{ error = "A nova palavra-passe deve ter pelo menos 6 caracteres." })
                continue
              }
              $NewSalt = New-Salt
              $Target.salt = $NewSalt
              $Target.passwordHash = Hash-Password -Password $NewPass -SaltBase64 $NewSalt
            }

            $Users[$Idx] = $Target
            Write-JsonArrayFile -Path $UsersFile -Items $Users
            Send-Json -Stream $Stream -StatusLine "200 OK" -Payload ([PSCustomObject]@{ ok = $true; user = (To-SafeUser -User $Target) })
            continue
          }

          # 6. LOGOUT (CLIENT OR OWNER)
          if ($PathOnly -eq "/api/auth/logout" -and $Method -eq "POST") {
            $SessInfo = Get-SessionUser -AuthHeader $AuthHeader
            if ($null -ne $SessInfo) {
              $Sessions = @(Read-JsonArrayFile -Path $SessionsFile)
              $Remaining = @($Sessions | Where-Object { $_.token -ne $SessInfo.token })
              Write-JsonArrayFile -Path $SessionsFile -Items $Remaining
            }
            Send-Json -Stream $Stream -StatusLine "200 OK" -Payload ([PSCustomObject]@{ ok = $true })
            continue
          }

          # 7. CLIENT BOOKING SUBMISSION
          if ($PathOnly -eq "/api/client/booking" -and $Method -eq "POST") {
            $InputObj = ConvertFrom-Json -InputObject $BodyText
            $SessInfo = Get-SessionUser -AuthHeader $AuthHeader
            $Data = Read-WorkshopData
            $UserId = if ($null -ne $SessInfo -and $SessInfo.user.role -eq "client") { $SessInfo.user.id } else { "" }
            $Username = if ($null -ne $SessInfo -and $SessInfo.user.role -eq "client") { $SessInfo.user.username } else { "" }

            $NewBooking = [PSCustomObject]@{
              id       = "AG-" + (Get-Date).ToString("HHmmss") + "-" + (Get-Random -Minimum 10 -Maximum 99)
              userId   = $UserId
              username = $Username
              client   = if ($InputObj.client) { $InputObj.client.Trim() } else { "Cliente" }
              phone    = if ($InputObj.phone) { $InputObj.phone.Trim() } else { "" }
              vehicle  = if ($InputObj.vehicle) { $InputObj.vehicle.Trim() } else { "Por indicar" }
              date     = if ($InputObj.date) { $InputObj.date } else { (Get-Date).AddDays(1).ToString("yyyy-MM-dd") }
              time     = if ($InputObj.time) { $InputObj.time } else { "09:30" }
              service  = if ($InputObj.service) { $InputObj.service.Trim() } else { "Diagnóstico" }
              source   = if ($InputObj.source) { $InputObj.source } else { "Site Cliente" }
              status   = if ($InputObj.status) { $InputObj.status } else { "Pendente" }
            }
            $Data.bookings = @($NewBooking) + @($Data.bookings)
            $Data.updatedAt = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
            Write-WorkshopData -Data $Data
            Send-Json -Stream $Stream -StatusLine "200 OK" -Payload ([PSCustomObject]@{ ok = $true; booking = $NewBooking })
            continue
          }

          # 8. CLIENT CALL LOG SUBMISSION
          if ($PathOnly -eq "/api/client/call" -and $Method -eq "POST") {
            $InputObj = ConvertFrom-Json -InputObject $BodyText
            $SessInfo = Get-SessionUser -AuthHeader $AuthHeader
            $Data = Read-WorkshopData
            $UserId = if ($null -ne $SessInfo -and $SessInfo.user.role -eq "client") { $SessInfo.user.id } else { "" }
            $Username = if ($null -ne $SessInfo -and $SessInfo.user.role -eq "client") { $SessInfo.user.username } else { "" }

            $NewCall = [PSCustomObject]@{
              id          = "CH-" + (Get-Date).ToString("HHmmss")
              userId      = $UserId
              username    = $Username
              timestamp   = if ($InputObj.timestamp) { $InputObj.timestamp } else { (Get-Date).ToString("yyyy-MM-dd HH:mm") }
              phone       = if ($InputObj.phone) { $InputObj.phone } else { "Via Web" }
              callerName  = if ($InputObj.callerName) { $InputObj.callerName } else { "Visitante" }
              duration    = if ($InputObj.duration) { $InputObj.duration } else { "Web IA" }
              intent      = if ($InputObj.intent) { $InputObj.intent } else { "Consulta" }
              vehicle     = if ($InputObj.vehicle) { $InputObj.vehicle } else { "Não indicada" }
              quotedTotal = if ($null -ne $InputObj.quotedTotal) { [double]$InputObj.quotedTotal } else { 0 }
              status      = if ($InputObj.status) { $InputObj.status } else { "Consulta no Site" }
              messages    = @($InputObj.messages)
            }
            $Data.calls = @($NewCall) + @($Data.calls)
            $Data.updatedAt = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
            Write-WorkshopData -Data $Data
            Send-Json -Stream $Stream -StatusLine "200 OK" -Payload ([PSCustomObject]@{ ok = $true })
            continue
          }

          # 9. OWNER LOGIN (STRICT ROLE = OWNER)
          if ($PathOnly -eq "/api/owner/login" -and $Method -eq "POST") {
            $InputObj = ConvertFrom-Json -InputObject $BodyText
            $Identifier = if ($InputObj.identifier) { $InputObj.identifier.Trim().ToLowerInvariant() } else { "" }
            $Password = if ($InputObj.password) { [string]$InputObj.password } else { "" }

            $Users = @(Ensure-OwnerSeeded)
            $MatchedAny = $Users | Where-Object { $_.username -eq $Identifier -or $_.email -eq $Identifier } | Select-Object -First 1
            if ($null -ne $MatchedAny -and $MatchedAny.role -ne "owner") {
              Send-Json -Stream $Stream -StatusLine "403 Forbidden" -Payload ([PSCustomObject]@{ error = "Acesso negado: contas de cliente não podem entrar na Área do Dono." })
              continue
            }
            if ($null -eq $MatchedAny -or -not (Test-Password -Password $Password -SaltBase64 $MatchedAny.salt -ExpectedHash $MatchedAny.passwordHash)) {
              Send-Json -Stream $Stream -StatusLine "401 Unauthorized" -Payload ([PSCustomObject]@{ error = "Credenciais de proprietário inválidas." })
              continue
            }

            $Token = New-RandomToken
            $Sessions = @(Read-JsonArrayFile -Path $SessionsFile)
            $Sessions = @($Sessions) + @([PSCustomObject]@{
              token     = $Token
              userId    = $MatchedAny.id
              role      = "owner"
              createdAt = (Get-Date).ToString("o")
            })
            Write-JsonArrayFile -Path $SessionsFile -Items $Sessions

            Send-Json -Stream $Stream -StatusLine "200 OK" -Payload ([PSCustomObject]@{
              token = $Token
              user  = (To-SafeUser -User $MatchedAny)
            })
            continue
          }

          # 10. OWNER ME
          if ($PathOnly -eq "/api/owner/me" -and $Method -eq "GET") {
            $SessInfo = Get-SessionUser -AuthHeader $AuthHeader
            if ($null -eq $SessInfo -or $SessInfo.user.role -ne "owner") {
              Send-Json -Stream $Stream -StatusLine "403 Forbidden" -Payload ([PSCustomObject]@{ error = "Acesso exclusivo do Dono." })
              continue
            }
            Send-Json -Stream $Stream -StatusLine "200 OK" -Payload ([PSCustomObject]@{ user = (To-SafeUser -User $SessInfo.user) })
            continue
          }

          # 11. OWNER ACCOUNT UPDATE
          if ($PathOnly -eq "/api/owner/account" -and $Method -eq "POST") {
            $SessInfo = Get-SessionUser -AuthHeader $AuthHeader
            if ($null -eq $SessInfo -or $SessInfo.user.role -ne "owner") {
              Send-Json -Stream $Stream -StatusLine "403 Forbidden" -Payload ([PSCustomObject]@{ error = "Acesso exclusivo do Dono." })
              continue
            }
            $InputObj = ConvertFrom-Json -InputObject $BodyText
            $Users = @(Ensure-OwnerSeeded)
            $Idx = -1
            for ($i = 0; $i -lt $Users.Count; $i++) {
              if ($Users[$i].id -eq $SessInfo.user.id) { $Idx = $i; break }
            }
            $Target = $Users[$Idx]

            if ($InputObj.username) {
              $NewU = $InputObj.username.Trim().ToLowerInvariant()
              if ($NewU -notmatch '^[a-z0-9_.-]{3,24}$') {
                Send-Json -Stream $Stream -StatusLine "400 Bad Request" -Payload ([PSCustomObject]@{ error = "Nome de utilizador inválido." })
                continue
              }
              if (@($Users | Where-Object { $_.id -ne $Target.id -and $_.username -eq $NewU }).Count -gt 0) {
                Send-Json -Stream $Stream -StatusLine "409 Conflict" -Payload ([PSCustomObject]@{ error = "Nome de utilizador já existe." })
                continue
              }
              $Target.username = $NewU
            }
            if ($InputObj.fullName) { $Target.fullName = $InputObj.fullName.Trim() }
            if ($InputObj.email) { $Target.email = $InputObj.email.Trim().ToLowerInvariant() }

            if (-not [string]::IsNullOrEmpty($InputObj.newPassword)) {
              $CurPass = [string]$InputObj.currentPassword
              $NewPass = [string]$InputObj.newPassword
              if (-not (Test-Password -Password $CurPass -SaltBase64 $Target.salt -ExpectedHash $Target.passwordHash)) {
                Send-Json -Stream $Stream -StatusLine "401 Unauthorized" -Payload ([PSCustomObject]@{ error = "Palavra-passe atual incorreta." })
                continue
              }
              if ($NewPass.Length -lt 6) {
                Send-Json -Stream $Stream -StatusLine "400 Bad Request" -Payload ([PSCustomObject]@{ error = "A nova palavra-passe deve ter pelo menos 6 caracteres." })
                continue
              }
              $NewSalt = New-Salt
              $Target.salt = $NewSalt
              $Target.passwordHash = Hash-Password -Password $NewPass -SaltBase64 $NewSalt
            }

            $Users[$Idx] = $Target
            Write-JsonArrayFile -Path $UsersFile -Items $Users
            Send-Json -Stream $Stream -StatusLine "200 OK" -Payload ([PSCustomObject]@{ ok = $true; user = (To-SafeUser -User $Target) })
            continue
          }

          # 12. OWNER CLIENTS DIRECTORY (MASKED EMAILS, ZERO PASSWORDS)
          if ($PathOnly -eq "/api/owner/clients" -and $Method -eq "GET") {
            $SessInfo = Get-SessionUser -AuthHeader $AuthHeader
            if ($null -eq $SessInfo -or $SessInfo.user.role -ne "owner") {
              Send-Json -Stream $Stream -StatusLine "403 Forbidden" -Payload ([PSCustomObject]@{ error = "Acesso exclusivo do Dono." })
              continue
            }
            $Users = @(Ensure-OwnerSeeded)
            $SafeClients = @($Users | Where-Object { $_.role -eq "client" } | ForEach-Object {
              [PSCustomObject]@{
                id          = $_.id
                username    = $_.username
                fullName    = $_.fullName
                emailMasked = (Mask-Email -Email $_.email)
                phone       = $_.phone
                vehicle     = $_.vehicle
                createdAt   = $_.createdAt
              }
            })
            Send-Json -Stream $Stream -StatusLine "200 OK" -Payload ([PSCustomObject]@{ clients = @($SafeClients) })
            continue
          }

          # 13. OWNER WORKSHOP STATE (STRICT OWNER TOKEN REQUIRED)
          if ($PathOnly -eq "/api/owner/state") {
            $SessInfo = Get-SessionUser -AuthHeader $AuthHeader
            if ($null -eq $SessInfo -or $SessInfo.user.role -ne "owner") {
              Send-Json -Stream $Stream -StatusLine "403 Forbidden" -Payload ([PSCustomObject]@{ error = "Autenticação de proprietário obrigatória." })
              continue
            }
            if ($Method -eq "GET") {
              $Data = Read-WorkshopData
              Send-Json -Stream $Stream -StatusLine "200 OK" -Payload $Data
              continue
            }
            if ($Method -eq "POST") {
              $NewData = ConvertFrom-Json -InputObject $BodyText
              if ($null -eq $NewData -or $null -eq $NewData.services) {
                Send-Json -Stream $Stream -StatusLine "400 Bad Request" -Payload ([PSCustomObject]@{ error = "Estado inválido." })
                continue
              }
              Write-WorkshopData -Data $NewData
              Send-Json -Stream $Stream -StatusLine "200 OK" -Payload ([PSCustomObject]@{ ok = $true })
              continue
            }
          }

          Send-Json -Stream $Stream -StatusLine "404 Not Found" -Payload ([PSCustomObject]@{ error = "Endpoint não encontrado." })
          continue
        } finally {
          [System.Threading.Monitor]::Exit($SyncLock)
        }
      }

      # ---------------------------------------------------------------
      # STATIC FILES
      # ---------------------------------------------------------------
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
