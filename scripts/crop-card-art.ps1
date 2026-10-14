# crop-card-art.ps1
# Crops the 144x144 artwork from all 200x290 Yu-Gi-Oh card images with HighQualityBicubic upscaling to 288x288
Add-Type -AssemblyName System.Drawing

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BaseDir = Resolve-Path "$ScriptDir\..\..\"
$CardInDir = Join-Path $BaseDir "Mege\card"
$ArtOutDir = Join-Path $ScriptDir "..\public\assets\cards-art"

if (-not (Test-Path $ArtOutDir)) {
    New-Item -ItemType Directory -Force -Path $ArtOutDir | Out-Null
}

$files = Get-ChildItem -Path $CardInDir -Filter "*.bmp"
Write-Host "Found $($files.Count) cards in $CardInDir"

# Crop rect in source image (200x290):
# Full top (Y=0), full width (X=0, W=200), bottom section (stars & stats below Y=215) completely removed
$srcRect = New-Object System.Drawing.Rectangle(0, 0, 200, 215)

# Upscaled target dimensions: 400x430 (2x crisp resolution with aspect ratio 200/215)
$targetWidth = 400
$targetHeight = 430
$destRect = New-Object System.Drawing.Rectangle(0, 0, $targetWidth, $targetHeight)

$sw = [System.Diagnostics.Stopwatch]::StartNew()
$count = 0

foreach ($f in $files) {
    $outPath = Join-Path $ArtOutDir ($f.BaseName + ".png")
    try {
        $srcBmp = [System.Drawing.Image]::FromFile($f.FullName)
        $destBmp = New-Object System.Drawing.Bitmap($targetWidth, $targetHeight, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
        $g = [System.Drawing.Graphics]::FromImage($destBmp)
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $g.DrawImage($srcBmp, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
        
        if (Test-Path $outPath) { Remove-Item $outPath -Force }
        $destBmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
        
        $g.Dispose()
        $destBmp.Dispose()
        $srcBmp.Dispose()
    } catch {
        Write-Host "Error processing $($f.Name): $_"
    }
    $count++
    if ($count % 200 -eq 0) {
        Write-Host "Processed $count / $($files.Count) cards ($($sw.ElapsedMilliseconds) ms)..."
    }
}

$sw.Stop()
Write-Host "Completed cropping and upscaling $count cards in $($sw.ElapsedMilliseconds) ms!"
