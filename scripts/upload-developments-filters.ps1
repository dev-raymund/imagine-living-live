# Upload developments filter files to the Fasthosts VPS.
# Usage:
#   .\scripts\upload-developments-filters.ps1
#   .\scripts\upload-developments-filters.ps1 -UsePassword   # prompt for ploi password (if enabled on server)

param(
    [string]$Key = "$env:USERPROFILE\.ssh\imagineliving_deploy",
    [switch]$UsePassword
)

$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$RemoteHost = "ploi@77.68.64.22"
$RemotePath = "/home/ploi/imagineliving.co.uk"

$sshArgs = @("-o", "StrictHostKeyChecking=accept-new", "-o", "BatchMode=yes")
$scpArgs = @("-o", "StrictHostKeyChecking=accept-new", "-o", "BatchMode=yes")

if (-not $UsePassword) {
    if (-not (Test-Path $Key)) {
        Write-Host ""
        Write-Host "SSH key not found: $Key" -ForegroundColor Red
        Write-Host ""
        Write-Host "Fix (pick one):" -ForegroundColor Yellow
        Write-Host "  1. Create a key and add it on the VPS — see DEPLOY.md sections 3–4"
        Write-Host "  2. Run with password:  .\scripts\upload-developments-filters.ps1 -UsePassword"
        Write-Host "  3. Upload with WinSCP (SFTP, host 77.68.64.22, user ploi) — no script needed"
        Write-Host ""
        exit 1
    }
    $sshArgs = @("-i", $Key) + $sshArgs
    $scpArgs = @("-i", $Key) + $scpArgs
} else {
    $sshArgs = @("-o", "StrictHostKeyChecking=accept-new")
    $scpArgs = @("-o", "StrictHostKeyChecking=accept-new")
}

$files = @(
    "app/Scopes/DevelopmentsListingFilters.php",
    "app/Console/Commands/SyncDevelopmentPrices.php",
    "app/Console/Kernel.php",
    "app/Providers/AppServiceProvider.php",
    "resources/views/developments.antlers.html",
    "resources/views/partials/_developments-results.antlers.html",
    "resources/views/components/developments/developmentsFilter.css",
    "resources/views/components/showcasecard/developmentsResults.css",
    "resources/blueprints/collections/developments/development.yaml",
    "public/css/site.css"
)

Set-Location $ProjectRoot

function Test-SshConnection {
    Write-Host "Testing SSH to $RemoteHost ..."
    & ssh @sshArgs $RemoteHost "echo ok"
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "SSH failed: Permission denied (publickey) means the server does not have your key." -ForegroundColor Red
        Write-Host ""
        Write-Host "On the VPS (Fasthosts web console), run:" -ForegroundColor Yellow
        Write-Host "  mkdir -p ~/.ssh && chmod 700 ~/.ssh"
        Write-Host "  nano ~/.ssh/authorized_keys"
        Write-Host "  # paste ONE line from: $Key.pub"
        Write-Host "  chmod 600 ~/.ssh/authorized_keys"
        Write-Host ""
        Write-Host "Or use WinSCP with your ploi password from Fasthosts/Ploi panel."
        Write-Host ""
        exit 1
    }
}

Test-SshConnection

Write-Host "Creating remote folders if needed..."
& ssh @sshArgs $RemoteHost "mkdir -p $RemotePath/app/Console/Commands $RemotePath/app/Scopes $RemotePath/app/Providers $RemotePath/resources/views/partials $RemotePath/resources/blueprints/collections/developments"
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

foreach ($rel in $files) {
    $local = Join-Path $ProjectRoot $rel
    if (-not (Test-Path $local)) {
        Write-Error "Missing local file: $local"
    }
    Write-Host "Uploading $rel ..."
    & scp @scpArgs $local "${RemoteHost}:${RemotePath}/$($rel -replace '\\','/')"
    if ($LASTEXITCODE -ne 0) {
        Write-Error "scp failed for $rel (exit $LASTEXITCODE)"
    }
}

Write-Host ""
Write-Host "Upload complete. On the VPS run:" -ForegroundColor Green
Write-Host "  cd $RemotePath"
Write-Host "  composer dump-autoload -o"
Write-Host "  php artisan developments:sync-prices"
Write-Host "  php please stache:clear"
Write-Host "  php artisan view:clear"
Write-Host "  php artisan cache:clear"
