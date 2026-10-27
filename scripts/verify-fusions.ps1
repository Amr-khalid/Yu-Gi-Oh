Add-Type -AssemblyName System.Drawing

$TEMPLATES = @{
    '0' = @(
        "...#######...", ".###.....##..", ".##......###.", "###.......##.", "###.......###",
        "###.......###", "###.......###", "###.......###", "###.......###", "###.......###",
        "###.......###", "###.......###", "###.......##.", ".##......###.", ".###.....##..", "...#######..."
    )
    '1' = @(
        "...#...", ".####..", ".####..", "..###..", "..###..", "..###..", "..###..", "..###..",
        "..###..", "..###..", "..###..", "..###..", "..###..", "..###..", "..###..", "#######"
    )
    '2' = @(
        "..########..", ".##.....###.", "###......###", ".#.......###", ".........###",
        "........###.", ".......###..", "......###...", ".....###....", "...###......",
        "..##........", "..#.........", ".##........#", "##.........#", "############", "###########."
    )
    '3' = @(
        "..###.####..", ".##.....###.", "###......##.", "##.......##.", ".........##.",
        "........###.", ".......##...", "....####....", "........##..", ".........##.",
        ".........###", "..........##", "##........##", "##.......###", "###......##.", "..##...###.."
    )
    '4' = @(
        ".......###..", ".......###..", "......####..", ".....#.###..", "....#..###..",
        "....#..###..", ".......###..", "..#....###..", "..#....##...", ".#.....##...",
        "#......###..", "############", ".......##...", ".......##...", ".......###..", ".....#######"
    )
    '5' = @(
        "...#########", "..#########.", "..#.........", "..#.........", "..#.........",
        "..#...#.....", "..########..", ".##......##.", ".........###", ".........###",
        "..........##", "..........##", ".#.......###", "###......###", ".###....###.", "..########.."
    )
    '6' = @(
        ".....####....", "...##....##..", "..##......##.", ".##.......##.", ".##..........",
        ".##..........", "#########....", "###......##..", "###.......##.", "###.......###",
        ".##.......###", ".##.......###", ".##.......##.", "..##......##.", "..###....##..", ".....####...."
    )
    '7' = @(
        "###########", "##......##.", "........##.", ".......##..", ".......#...",
        "......##...", ".....##....", ".....##....", "....##.....", "....##.....",
        "...###.....", "...###.....", "...##......", "...##......", "..###......", "..###......"
    )
    '8' = @(
        "...######...", ".##.....###.", ".##......##.", "##........##", "###......###",
        ".###.....##.", "..####.##...", "...#####....", "...#.#####..", ".##....####.",
        "##.......###", "##.......###", "##.......###", "##.......##.", ".##.....##..", "...#####...."
    )
    '9' = @(
        ".....####....", "..##....###..", ".##......##..", ".##.......##.", "###.......##.",
        "###.......##.", ".##.......###", ".##.......###", "..##.....####", "....###.#####",
        "..........###", "..........##.", ".##.......##.", ".##......##..", "..##....##...", "....####....."
    )
}

function Match-Char($actualGrid) {
    $bestChar = '?'
    $bestScore = -999999
    $actH = $actualGrid.Count
    $actW = $actualGrid[0].Length

    foreach ($k in $TEMPLATES.Keys) {
        $tpl = $TEMPLATES[$k]
        $tplH = $tpl.Count
        $tplW = $tpl[0].Length
        if ([Math]::Abs($actW - $tplW) -gt 3) { continue }

        foreach ($dy in @(-1, 0, 1)) {
            foreach ($dx in @(-1, 0, 1)) {
                $score = 0; $comparisons = 0
                for ($y = 0; $y -lt 16; $y++) {
                    $ay = $y + $dy
                    if ($ay -lt 0 -or $ay -ge $actH -or $y -ge $tplH) { continue }
                    for ($x = 0; $x -lt $tplW; $x++) {
                        $ax = $x + $dx
                        if ($ax -lt 0 -or $ax -ge $actW) { continue }
                        $a = ($actualGrid[$ay][$ax] -eq '#')
                        $t = ($tpl[$y][$x] -eq '#')
                        if ($a -eq $t) { $score += 3 } else { $score -= 4 }
                        $comparisons++
                    }
                }
                if ($comparisons -gt 30 -and $score -gt $bestScore) {
                    $bestScore = $score
                    $bestChar = $k
                }
            }
        }
    }
    return $bestChar
}

function Read-Adaptive-Box($bmp, $minX, $maxX) {
    $c1 = $bmp.GetPixel($minX + 2, 254); $lum1 = 0.299 * $c1.R + 0.587 * $c1.G + 0.114 * $c1.B
    $c2 = $bmp.GetPixel($maxX - 2, 254); $lum2 = 0.299 * $c2.R + 0.587 * $c2.G + 0.114 * $c2.B
    $bgLum = ($lum1 + $lum2) / 2
    $threshold = $bgLum * 0.65

    # Scan columns
    $colHasDark = @{}
    for ($x = $minX; $x -le $maxX; $x++) {
        $has = $false
        for ($y = 252; $y -le 270; $y++) {
            $c = $bmp.GetPixel($x, $y)
            $lum = 0.299 * $c.R + 0.587 * $c.G + 0.114 * $c.B
            if ($lum -lt $threshold) { $has = $true; break }
        }
        $colHasDark[$x] = $has
    }

    $chars = @()
    $inChar = $false
    $startX = 0
    for ($x = $minX; $x -le $maxX; $x++) {
        if ($colHasDark[$x] -and -not $inChar) { $inChar = $true; $startX = $x }
        elseif (-not $colHasDark[$x] -and $inChar) { $inChar = $false; $chars += @{ StartX = $startX; EndX = $x - 1 } }
    }
    if ($inChar) { $chars += @{ StartX = $startX; EndX = $maxX } }

    $valid = @($chars | Where-Object { ($_.EndX - $_.StartX + 1) -ge 4 })
    if ($valid.Count -eq 0) { return "NONE" }

    $str = ""
    foreach ($ch in $valid) {
        $top = 270; $bottom = 252
        for ($y = 252; $y -le 270; $y++) {
            for ($x = $ch.StartX; $x -le $ch.EndX; $x++) {
                $c = $bmp.GetPixel($x, $y)
                $lum = 0.299 * $c.R + 0.587 * $c.G + 0.114 * $c.B
                if ($lum -lt $threshold) {
                    if ($y -lt $top) { $top = $y }
                    if ($y -gt $bottom) { $bottom = $y }
                }
            }
        }
        if ($top -gt $bottom) { continue }
        $grid = @()
        for ($y = $top; $y -le $bottom; $y++) {
            $row = ""
            for ($x = $ch.StartX; $x -le $ch.EndX; $x++) {
                $c = $bmp.GetPixel($x, $y)
                $lum = 0.299 * $c.R + 0.587 * $c.G + 0.114 * $c.B
                if ($lum -lt $threshold) { $row += "#" } else { $row += "." }
            }
            $grid += $row
        }
        $str += Match-Char $grid
    }
    return $str
}

$fusionFiles = @(
    "4448_1.png", "4174_1.png", "4036_1.png", "4785_1.png", "4433_1.png",
    "4121_1.png", "4049_1.png", "4570_1.png", "4571_1.png", "4539_1.png",
    "4473_1.png", "4075_1.png", "4075_2.png", "4471_1.png", "4578_1.png",
    "4537_1.png", "4443_1.png", "4645_1.png", "4713_1.png", "4551_1.png",
    "4479_1.png", "5208_1.png", "4624_1.png", "4619_1.png", "4477_1.png",
    "4527_1.png", "4391_1.png", "4229_1.png", "4600_1.png", "4092_1.png",
    "5062_1.png", "4195_1.png", "4515_1.png", "4488_1.png", "4223_1.png",
    "4493_1.png", "4386_1.png", "4139_1.png", "4021_1.png", "4021_2.png",
    "4300_1.png", "4395_1.png", "4278_1.png", "4623_1.png", "4098_1.png",
    "4501_1.png", "4376_1.png", "4514_1.png", "4415_1.png", "4719_1.png",
    "4756_1.png", "4724_1.png", "4464_1.png", "4043_1.png", "4236_1.png"
)

$cardsJson = Get-Content "c:\Games\Game Files\mobile\src\data\cards.json" -Raw | ConvertFrom-Json
$baseDir = "c:\Games\Game Files\mobile\public\assets\cards"

$diffs = 0
foreach ($ff in $fusionFiles) {
    $bmp = [System.Drawing.Bitmap]::FromFile((Join-Path $baseDir $ff))
    $atkStr = Read-Adaptive-Box $bmp 22 84
    $defStr = Read-Adaptive-Box $bmp 114 176
    $bmp.Dispose()

    $card = $cardsJson | Where-Object { ($_.rawFile -and $_.rawFile.Replace('.bmp','.png') -eq $ff) -or ($_.image -and $_.image.Replace('.webp','.png') -eq $ff) } | Select-Object -First 1
    
    $jAtk = if ($card) { $card.atk } else { "N/A" }
    $jDef = if ($card) { $card.def } else { "N/A" }

    $match = ($atkStr -eq [string]$jAtk -and $defStr -eq [string]$jDef)
    if (-not $match) {
        $diffs++
        Write-Host "MISMATCH in $ff ($($card.name)): Image=[$atkStr / $defStr] vs Json=[$jAtk / $jDef]" -ForegroundColor Yellow
    }
}
Write-Host "Done testing $($fusionFiles.Count) fusion/special cards. Total non-matches: $diffs" -ForegroundColor Cyan
