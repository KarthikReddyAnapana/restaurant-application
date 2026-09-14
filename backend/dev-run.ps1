# Stops any previous backend on 8080, then starts Spring Boot (avoids H2 lock + port conflicts)
$ErrorActionPreference = "Stop"
$port = 8080

$listeners = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess -Unique

foreach ($procId in $listeners) {
    if (-not $procId -or $procId -eq 0) { continue }
    $proc = Get-Process -Id $procId -ErrorAction SilentlyContinue
    if ($proc -and ($proc.ProcessName -eq 'java' -or $proc.ProcessName -eq 'javaw')) {
        Write-Host "Stopping existing backend on port $port (PID $procId)..."
        Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
    }
}

Set-Location $PSScriptRoot
Write-Host "Starting Restaurant backend on http://localhost:$port ..."
mvn spring-boot:run
