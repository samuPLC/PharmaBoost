$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw 'Instala Node.js 22 o superior.' }
if (Test-Path -LiteralPath '.env') {
    Write-Host 'Ya existe .env. Se conserva tu configuración. Usa npm start o edita .env si es necesario.'
    exit 0
}
npm.cmd ci --no-audit --no-fund
if ($LASTEXITCODE -ne 0) { throw 'No se pudieron instalar las dependencias.' }
$taskDbUser = Read-Host 'Usuario administrador de MySQL (Enter para root)'
if ([string]::IsNullOrWhiteSpace($taskDbUser)) { $taskDbUser = 'root' }
$taskDbSecret = Read-Host 'Contraseña MySQL (no se muestra ni se guarda la de root)' -AsSecureString
$taskDbPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($taskDbSecret)
try {
    $env:DB_SETUP_USER = $taskDbUser
    $env:DB_SETUP_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($taskDbPointer)
    node scripts/setup.js
    if ($LASTEXITCODE -ne 0) { throw 'Configuración incompleta. Revisa usuario, contraseña y servicio MySQL80.' }
} finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($taskDbPointer)
    Remove-Item Env:DB_SETUP_USER -ErrorAction SilentlyContinue
    Remove-Item Env:DB_SETUP_PASSWORD -ErrorAction SilentlyContinue
}
