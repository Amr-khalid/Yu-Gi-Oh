# convert-assets.ps1
# Converts card BMPs from Mege/card and Mege/mini to PNG/WebP format

Add-Type -AssemblyName System.Drawing

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BaseDir = Resolve-Path "$ScriptDir\..\..\"
$CardInDir = Join-Path $BaseDir "Mege\card"
$MiniInDir = Join-Path $BaseDir "Mege\mini"
$CardOutDir = Join-Path $ScriptDir "..\public\assets\cards"
$MiniOutDir = Join-Path $ScriptDir "..\public\assets\cards-mini"

# Create output directories
New-Item -ItemType Directory -Force -Path $CardOutDir | Out-Null
New-Item -ItemType Directory -Force -Path $MiniOutDir | Out-Null

Write-Host "🖼️ Starting image conversion to PNG..." -ForegroundColor Cyan

# Convert Mini images first (fast preview)
$miniFiles = Get-ChildItem -Path $MiniInDir -Filter "*.bmp"
Write-Host "Converting $($miniFiles.Count) mini card thumbnails..." -ForegroundColor Yellow
$count = 0
foreach ($f in $miniFiles) {
    $outPath = Join-Path $MiniOutDir ($f.BaseName + ".png")
    if (-not (Test-Path $outPath)) {
        try {
            $img = [System.Drawing.Image]::FromFile($f.FullName)
            $img.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
            $img.Dispose()
        } catch {
            Write-Host "Failed: $($f.Name)" -ForegroundColor Red
        }
    }
    $count++
    if ($count % 200 -eq 0) {
        Write-Host "  $count / $($miniFiles.Count) mini thumbnails converted..."
    }
}
Write-Host "✅ Mini thumbnails conversion complete!" -ForegroundColor Green

# Convert Full Card images (key decks and cards)
$cardFiles = Get-ChildItem -Path $CardInDir -Filter "*.bmp"
Write-Host "Converting $($cardFiles.Count) full card images..." -ForegroundColor Yellow
$count = 0
foreach ($f in $cardFiles) {
    $outPath = Join-Path $CardOutDir ($f.BaseName + ".png")
    if (-not (Test-Path $outPath)) {
        try {
            $img = [System.Drawing.Image]::FromFile($f.FullName)
            $img.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
            $img.Dispose()
        } catch {
            Write-Host "Failed: $($f.Name)" -ForegroundColor Red
        }
    }
    $count++
    if ($count % 200 -eq 0) {
        Write-Host "  $count / $($cardFiles.Count) full cards converted..."
    }
}
Write-Host "🎉 All images successfully converted!" -ForegroundColor Green
