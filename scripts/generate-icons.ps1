Add-Type -AssemblyName System.Drawing

function Generate-PwaIcon {
    param(
        [int]$size,
        [string]$outputPath,
        [bool]$isMaskable
    )
    $bmp = New-Object System.Drawing.Bitmap $size, $size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

    # Background
    $rect = New-Object System.Drawing.Rectangle 0, 0, $size, $size
    $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.PointF 0, 0),
        (New-Object System.Drawing.PointF $size, $size),
        [System.Drawing.Color]::FromArgb(255, 26, 26, 30),
        [System.Drawing.Color]::FromArgb(255, 12, 12, 14)
    )
    $g.FillRectangle($bgBrush, $rect)

    # Accent Glow border
    $borderPad = if ($isMaskable) { [int]($size * 0.12) } else { [int]($size * 0.05) }
    $innerW = $size - ($borderPad * 2)
    $innerH = $size - ($borderPad * 2)
    
    # Outer frame card
    $cardBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 34, 34, 40))
    $cardPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(180, 225, 29, 72), [float]($size * 0.02))
    $g.FillRectangle($cardBrush, $borderPad, $borderPad, $innerW, $innerH)
    $g.DrawRectangle($cardPen, $borderPad, $borderPad, $innerW, $innerH)

    # Four-cut photo grid inside
    $slotPad = [int]($size * 0.025)
    $gridLeft = $borderPad + [int]($innerW * 0.18)
    $gridTop = $borderPad + [int]($innerH * 0.10)
    $gridW = [int]($innerW * 0.64)
    $gridH = [int]($innerH * 0.62)
    
    # Draw 4 vertical slots
    $slotH = [int](($gridH - ($slotPad * 3)) / 4)
    $slotBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.PointF 0, 0),
        (New-Object System.Drawing.PointF $gridW, 0),
        [System.Drawing.Color]::FromArgb(255, 245, 245, 240),
        [System.Drawing.Color]::FromArgb(255, 230, 235, 245)
    )
    
    for ($i = 0; $i -lt 4; $i++) {
        $sy = $gridTop + ($i * ($slotH + $slotPad))
        $g.FillRectangle($slotBrush, $gridLeft, $sy, $gridW, $slotH)
    }

    # Brand text 'PIC4U' at bottom
    $fontSize = [float]($size * 0.09)
    $font = New-Object System.Drawing.Font('Arial', $fontSize, [System.Drawing.FontStyle]::Bold)
    $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 250, 250, 250))
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
    
    $textRect = New-Object System.Drawing.RectangleF 0, ($gridTop + $gridH + [int]($innerH * 0.02)), $size, ($fontSize * 1.5)
    $g.DrawString('PIC4U', $font, $textBrush, $textRect, $sf)

    # Small star sparkle
    $sparkleBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 215, 0))
    $spX = $gridLeft + $gridW - [int]($size * 0.03)
    $spY = $gridTop - [int]($size * 0.03)
    $spSize = [int]($size * 0.08)
    $g.FillEllipse($sparkleBrush, $spX, $spY, $spSize, $spSize)

    $dir = [System.IO.Path]::GetDirectoryName($outputPath)
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force }
    $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Generated: $outputPath"
}

Generate-PwaIcon -size 192 -outputPath "$PSScriptRoot\..\public\icons\icon-192.png" -isMaskable $false
Generate-PwaIcon -size 512 -outputPath "$PSScriptRoot\..\public\icons\icon-512.png" -isMaskable $false
Generate-PwaIcon -size 512 -outputPath "$PSScriptRoot\..\public\icons\maskable-512.png" -isMaskable $true
Write-Host "All PWA PNG icons created successfully!"
