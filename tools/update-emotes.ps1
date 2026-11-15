# Run this from the BonakVT site directory (Windows PowerShell):
#   .\tools\update-emotes.ps1
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$images = Get-ChildItem -LiteralPath (Join-Path $root 'emotes') -File |
  Where-Object { $_.Extension -match '^\.(png|jpg|jpeg|webp|gif|avif)$' } |
  Sort-Object Name |
  Select-Object -ExpandProperty Name
$json = ConvertTo-Json -InputObject @($images) -Depth 3
[System.IO.File]::WriteAllText((Join-Path $root 'emotes.json'), $json, (New-Object System.Text.UTF8Encoding($false)))
Write-Host "Created emotes.json with $(@($images).Count) emotes."
