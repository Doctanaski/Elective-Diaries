Set-Location "D:\New Folder\Elective Diaries\elective-diaries"
$files = Get-ChildItem -Path "app","components" -Filter "*.tsx" -Recurse
$total = 0
foreach ($file in $files) {
  $lines = Get-Content $file.FullName
  $joined = $lines -join "`n"
  $changed = $false

  # Remove card/section borders (border border-white/5 pattern)
  if ($joined -match "border border-white/5") {
    $joined = $joined -replace " border border-white/5", ""
    $changed = $true
  }

  # Remove standalone border-white/5 (when it's not preceded by another border class)
  if ($joined -match "border-white/5") {
    $joined = $joined -replace "border-white/5", ""
    $changed = $true
  }

  # Replace muted text with primary red
  if ($joined -match "text-on-surface-variant") {
    $joined = $joined -replace "text-on-surface-variant", "text-primary"
    $changed = $true
  }

  if ($changed) {
    $joined | Set-Content $file.FullName
    Write-Host ("Updated: " + $file.Name + " at " + $file.FullName)
    $total++
  }
}
Write-Host ("Done. Files updated: " + $total)
