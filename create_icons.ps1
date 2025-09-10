Add-Type -AssemblyName System.Drawing

# Create color icon (192x192)
$bitmap = New-Object System.Drawing.Bitmap(192,192)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(98,100,167))
$graphics.FillRectangle($brush, 0, 0, 192, 192)
$font = New-Object System.Drawing.Font('Arial', 60, [System.Drawing.FontStyle]::Bold)
$textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$graphics.DrawString('FP', $font, $textBrush, 45, 65)
$bitmap.Save('color.png', [System.Drawing.Imaging.ImageFormat]::Png)
$graphics.Dispose()
$bitmap.Dispose()

# Create outline icon (32x32)
$bitmap2 = New-Object System.Drawing.Bitmap(32,32)
$graphics2 = [System.Drawing.Graphics]::FromImage($bitmap2)
$pen = New-Object System.Drawing.Pen([System.Drawing.Color]::Black, 2)
$graphics2.DrawRectangle($pen, 2, 2, 28, 28)
$font2 = New-Object System.Drawing.Font('Arial', 10, [System.Drawing.FontStyle]::Bold)
$textBrush2 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::Black)
$graphics2.DrawString('FP', $font2, $textBrush2, 7, 10)
$bitmap2.Save('outline.png', [System.Drawing.Imaging.ImageFormat]::Png)
$graphics2.Dispose()
$bitmap2.Dispose()

Write-Host "Icons created successfully"