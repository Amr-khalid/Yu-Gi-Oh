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
    '?' = @(
        "..##..###..", "###.....##.", "##......###", "........###", "........###",
        "........##.", ".......##..", "......##...", ".....#.....", "....##.....",
        "....#......", "....#......", "...........", "...........", "....##.....", "....##....."
    )
    'X' = @(
        ".######.....####", "..####.......##.", "...###......##..", "....###....##...",
        "....####...#....", ".....###..#.....", "......####......", ".......###......",
        ".......###......", "......#####.....", ".....##..###....", "....##...####...",
        "...##.....###...", "...#.......###..", "..##.......####.", "#####.....######"
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

        # If width difference is too big, skip
        if ([Math]::Abs($actW - $tplW) -gt 3) { continue }

        # Try alignments with offsets dx = -1, 0, 1 and dy = -1, 0, 1
        foreach ($dy in @(-1, 0, 1)) {
            foreach ($dx in @(-1, 0, 1)) {
                $score = 0
                $comparisons = 0
                for ($y = 0; $y -lt 16; $y++) {
                    $ay = $y + $dy
                    if ($ay -lt 0 -or $ay -ge $actH -or $y -ge $tplH) { continue }
                    for ($x = 0; $x -lt $tplW; $x++) {
                        $ax = $x + $dx
                        if ($ax -lt 0 -or $ax -ge $actW) { continue }
                        $a = ($actualGrid[$ay][$ax] -eq '#')
                        $t = ($tpl[$y][$x] -eq '#')
                        if ($a -eq $t) {
                            $score += 3
                        } else {
                            $score -= 4
                        }
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

function Read-Box($bmp, $minX, $maxX) {
    # Sample background color in the box corners
    $c1 = $bmp.GetPixel($minX + 2, 254); $lum1 = 0.299 * $c1.R + 0.587 * $c1.G + 0.114 * $c1.B
    $c2 = $bmp.GetPixel($maxX - 2, 254); $lum2 = 0.299 * $c2.R + 0.587 * $c2.G + 0.114 * $c2.B
    $bgLum = ($lum1 + $lum2) / 2
    $threshold = $bgLum * 0.65

    # 1. Segment columns
    $colHasDark = @{}
    for ($x = $minX; $x -le $maxX; $x++) {
        $has = $false
        for ($y = 252; $y -le 271; $y++) {
            $c = $bmp.GetPixel($x, $y)
            $lum = 0.299 * $c.R + 0.587 * $c.G + 0.114 * $c.B
            if ($lum -lt $threshold) {
                $has = $true
                break
            }
        }
        $colHasDark[$x] = $has
    }

    $chars = @()
    $inChar = $false
    $startX = 0
    for ($x = $minX; $x -le $maxX; $x++) {
        if ($colHasDark[$x] -and -not $inChar) {
            $inChar = $true
            $startX = $x
        } elseif (-not $colHasDark[$x] -and $inChar) {
            $inChar = $false
            $chars += @{ StartX = $startX; EndX = $x - 1 }
        }
    }
    if ($inChar) {
        $chars += @{ StartX = $startX; EndX = $maxX }
    }

    # Filter out tiny noise (width < 4)
    $validChars = @()
    foreach ($ch in $chars) {
        if (($ch.EndX - $ch.StartX + 1) -ge 4) {
            $validChars += $ch
        }
    }

    if ($validChars.Count -eq 0) { return "NONE" }

    $str = ""
    foreach ($ch in $validChars) {
        # Find exact vertical bounds
        $top = 271; $bottom = 252
        for ($y = 252; $y -le 271; $y++) {
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
        $m = Match-Char $grid
        $str += $m
    }
    return $str
}

function Parse-StatValue($str) {
    if ($str -eq "NONE") { return $null }
    if ($str -match '\?' -or $str -match 'X') { return -1 }
    $val = 0
    if ([int]::TryParse($str, [ref]$val)) {
        return $val
    }
    return $null
}

# Load cards.json
$jsonPath = "c:\Games\Game Files\mobile\src\data\cards.json"
$cardsJson = Get-Content $jsonPath -Raw | ConvertFrom-Json
$cardsDir = "c:\Games\Game Files\mobile\public\assets\cards"

Write-Host "Analyzing all 811 monsters in cards.json against card images..." -ForegroundColor Cyan

$mismatches = @()
$missingImages = @()
$processedCount = 0

foreach ($card in $cardsJson) {
    if ($card.type -ne 'monster') { continue }
    $processedCount++

    # Determine PNG image filename
    $pngName = ""
    if ($card.rawFile) {
        $pngName = [System.IO.Path]::ChangeExtension($card.rawFile, ".png")
    } elseif ($card.image) {
        $pngName = [System.IO.Path]::ChangeExtension($card.image, ".png")
    }

    $imgPath = Join-Path $cardsDir $pngName
    if (-not (Test-Path $imgPath)) {
        $missingImages += @{ Id = $card.id; Name = $card.name; File = $pngName }
        continue
    }

    $bmp = $null
    try {
        $bmp = [System.Drawing.Bitmap]::FromFile($imgPath)
        $atkStr = Read-Box $bmp 22 85
        $defStr = Read-Box $bmp 114 177

        $imgAtk = Parse-StatValue $atkStr
        $imgDef = Parse-StatValue $defStr

        $hasMismatch = $false
        if ($imgAtk -ne $null -and $imgAtk -ne $card.atk) {
            $hasMismatch = $true
        }
        if ($imgDef -ne $null -and $imgDef -ne $card.def) {
            $hasMismatch = $true
        }

        if ($hasMismatch) {
            $mismatches += [PSCustomObject]@{
                Id = $card.id
                Name = $card.name
                File = $pngName
                JsonATK = $card.atk
                ImgATK = $imgAtk
                ImgATK_Str = $atkStr
                JsonDEF = $card.def
                ImgDEF = $imgDef
                ImgDEF_Str = $defStr
            }
        }
    } catch {
        Write-Host "Error processing $($card.name): $_" -ForegroundColor Red
    } finally {
        if ($bmp) { $bmp.Dispose() }
    }

    if ($processedCount % 100 -eq 0) {
        Write-Host "  Processed $processedCount / 811 monsters..."
    }
}

Write-Host "`nAnalysis complete! Processed: $processedCount monsters." -ForegroundColor Green
Write-Host "Missing images: $($missingImages.Count)"
Write-Host "Total verified mismatches: $($mismatches.Count)" -ForegroundColor Yellow

# Save mismatches to JSON for inspection/fixing
$outJsonPath = "c:\Games\Game Files\mobile\scripts\mismatches.json"
$mismatches | ConvertTo-Json -Depth 5 | Set-Content $outJsonPath -Encoding utf8
Write-Host "Saved mismatches to $outJsonPath" -ForegroundColor Cyan

if ($mismatches.Count -gt 0) {
    Write-Host "`nDetailed list of mismatches:" -ForegroundColor Red
    $mismatches | Format-Table Id, Name, File, JsonATK, ImgATK_Str, JsonDEF, ImgDEF_Str -AutoSize
} else {
    Write-Host "ALL MONSTER STATS IN cards.json MATCH THEIR CARD IMAGES 100%!" -ForegroundColor Green
}
