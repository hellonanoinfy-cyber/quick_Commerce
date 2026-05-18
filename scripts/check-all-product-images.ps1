$missing = 0
$bad = 0
$page = 1
$total = 0
do {
  $r = Invoke-RestMethod "http://localhost:5181/api/v1/products?pageNumber=$page&pageSize=48" -TimeoutSec 30
  $total = [int]$r.data.totalCount
  foreach ($p in $r.data.items) {
    if ([string]::IsNullOrWhiteSpace($p.primaryImageUrl)) { $missing++ }
    elseif ($p.primaryImageUrl -match 'placehold|\.svg|/images/product') { $bad++ }
  }
  $page++
} while ($page -le $r.data.totalPages)

Write-Host "Scanned $total products. Missing URL: $missing. Bad/local URL: $bad."
