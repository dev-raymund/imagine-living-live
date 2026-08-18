# Upload development detail + preview listing to the live VPS.
# Usage:
#   .\scripts\upload-development-detail.ps1
#   .\scripts\upload-development-detail.ps1 -UsePassword

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
        Write-Host "See DEPLOY.md or DEPLOY-DEVELOPMENT-DETAIL-PREVIEW.md" -ForegroundColor Yellow
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
    "app/Console/Commands/SeedPreviewDevelopmentExamples.php",
    "app/Console/Commands/ClearDevelopmentDetailFields.php",
    "app/Console/Commands/DisableDevelopmentDetailPages.php",
    "app/Console/Commands/EnableDevelopmentDetailPages.php",
    "resources/blueprints/collections/developments/development.yaml",
    "resources/fieldsets/development_detail.yaml",
    "resources/fieldsets/property_unit.yaml",
    "resources/views/development-detail.antlers.html",
    "resources/views/developments-preview.antlers.html",
    "resources/views/components/showcasecard/_showcase-card-detail.antlers.html",
    "resources/views/components/showcasecard/_showcase-card.antlers.html",
    "resources/views/components/showcasecard/_showcase-card-specs.antlers.html",
    "resources/views/components/showcasecard/showcaseCard.css",
    "resources/views/components/developments/_development-sidebar-cta.antlers.html",
    "resources/views/components/developments/_development-property-unit-card.antlers.html",
    "resources/views/components/developments/_development-panel-templates.antlers.html",
    "resources/views/components/developments/_development-unit-specs.antlers.html",
    "resources/views/components/developments/_development-property-card.antlers.html",
    "resources/views/components/developments/developmentDetail.css",
    "resources/views/components/developments/developmentDetail.js",
    "content/collections/pages/developments-preview.md",
    "content/trees/collections/pages.yaml",
    "content/collections/developments/a-cityview-point.md",
    "content/collections/developments/a-bow-green.md",
    "content/collections/developments/a-ark-house.md",
    "content/collections/developments/a-east-thames-house.md",
    "content/collections/developments/a-portway-house.md",
    "content/collections/developments/a-rigel-house.md",
    "content/collections/developments/a-vincent-wharf.md",
    "content/collections/developments/a-ymcc-house.md",
    "content/collections/developments/east-thames-house.md",
    "content/collections/developments/regent-place.md",
    "public/site.generated.css",
    "public/site.js",
    "public/css/site.css",
    # The live layout references /css/site.css and /js/site.js, so both
    # synced copies must ship - not just the Parcel output at public root.
    "public/js/site.js"
)

Set-Location $ProjectRoot

Write-Host "Testing SSH to $RemoteHost ..."
& ssh @sshArgs $RemoteHost "echo ok"
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Creating remote folders if needed..."
& ssh @sshArgs $RemoteHost @"
mkdir -p $RemotePath/app/Scopes $RemotePath/app/Console/Commands
mkdir -p $RemotePath/resources/fieldsets
mkdir -p $RemotePath/resources/views/components/showcasecard
mkdir -p $RemotePath/resources/views/components/developments
mkdir -p $RemotePath/resources/blueprints/collections/developments
mkdir -p $RemotePath/content/collections/pages
mkdir -p $RemotePath/content/collections/developments
mkdir -p $RemotePath/content/trees/collections
mkdir -p $RemotePath/public/css
"@
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

foreach ($rel in $files) {
    $local = Join-Path $ProjectRoot $rel
    if (-not (Test-Path $local)) {
        Write-Error "Missing local file: $local (run npm run build first for CSS/JS)"
    }
    Write-Host "Uploading $rel ..."
    & scp @scpArgs $local "${RemoteHost}:${RemotePath}/$($rel -replace '\\','/')"
    if ($LASTEXITCODE -ne 0) {
        Write-Error "scp failed for $rel (exit $LASTEXITCODE)"
    }
}

Write-Host ""
Write-Host "Running post-deploy on VPS ..."
& ssh @sshArgs $RemoteHost @"
set -e
cd $RemotePath
composer dump-autoload -o --no-interaction
php artisan developments:clear-detail-fields
php please stache:clear
php artisan view:clear
php artisan cache:clear
echo 'Done.'
"@
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ""
Write-Host "Upload complete. Verify on live:" -ForegroundColor Green
Write-Host "  /developments              (live listing unchanged)"
Write-Host "  /developments-preview      (10 preview listings)"
Write-Host "  /developments/a-cityview-point  (detail page example)"
