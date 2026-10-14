Add-Type -AssemblyName System.Drawing

$assetsDir = (Resolve-Path "mobile\public\assets").Path
$fields = @('fie_desert.bmp', 'fie_yami.bmp', 'fie_sanctu.bmp', 'fie_normal.bmp', 'fie_shine.bmp')
foreach ($f in $fields) {
    $src = "Mege\y\duel\field\$f"
    if (Test-Path $src) {
        $img = [System.Drawing.Image]::FromFile((Resolve-Path $src).Path)
        $outName = $f.Replace('.bmp', '.png')
        $dest = Join-Path $assetsDir $outName
        $img.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
        $img.Dispose()
        Write-Host "Converted field: $outName"
    }
}

$titleSrc = "Mege\y\title\title_1_e.bmp"
if (Test-Path $titleSrc) {
    $img = [System.Drawing.Image]::FromFile((Resolve-Path $titleSrc).Path)
    $dest = Join-Path $assetsDir "title_bg.png"
    $img.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
    $img.Dispose()
    Write-Host "Converted title background: title_bg.png"
}
