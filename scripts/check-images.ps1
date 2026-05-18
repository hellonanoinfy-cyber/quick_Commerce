$r = Invoke-RestMethod 'http://localhost:5181/api/v1/products?pageSize=500' -TimeoutSec 60
$items = $r.data.items
$missing = $items | Where-Object { [string]::IsNullOrWhiteSpace($_.primaryImageUrl) }
Write-Host "Total: $($r.data.totalCount) Page items: $($items.Count) Missing primaryImageUrl: $($missing.Count)"
if ($missing.Count -gt 0) {
  $missing | Select-Object -First 5 name, sku | Format-Table
}
$bad = @()
foreach ($p in $items) {
  if ($p.primaryImageUrl -match 'placehold|\.svg|/images/') { $bad += $p }
}
Write-Host "Low-quality/local URLs on page: $($bad.Count)"
