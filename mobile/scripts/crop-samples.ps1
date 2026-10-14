# crop-samples.ps1
# Crops 5 sample cards according to exact user instruction:
# - Remove ONLY the bottom section (stars and ATK/DEF numbers)
# - DO NOT cut anything from the top (Y=0)
# - DO NOT cut anything from the width (X=0, W=200)
# - Source rect: X=0, Y=0, W=200, H=215
# - Target upscaled: 400x430 (HighQualityBicubic)
Add-Type -AssemblyName System.Drawing

$sampleCodes = @('4240_1', '4007_1', '4680_1', '5001_1', '5006_1')
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BaseDir = Resolve-Path "$ScriptDir\..\..\"
$CardInDir = Join-Path $BaseDir "Mege\card"
$ArtOutDir = Join-Path $ScriptDir "..\public\assets\cards-art"

$srcRect = New-Object System.Drawing.Rectangle(0, 0, 200, 215)
$targetW = 400
$targetH = 430
$destRect = New-Object System.Drawing.Rectangle(0, 0, $targetW, $targetH)

foreach ($code in $sampleCodes) {
    $srcPath = Join-Path $CardInDir ($code + ".bmp")
    $outPath = Join-Path $ArtOutDir ($code + ".png")
    if (Test-Path $srcPath) {
        $srcBmp = [System.Drawing.Image]::FromFile($srcPath)
        $destBmp = New-Object System.Drawing.Bitmap($targetW, $targetH, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
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
        Write-Host "Cropped exact top artwork for $code -> ${targetW}x${targetH} (Full top & full width, bottom removed)"
    }
}
