$urls = @(
  'https://images.unsplash.com/photo-1766918780914-5df4a5a98c44?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1584839404042-8bc21d240e91?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1726726192148-af52008ff663?auto=format&fit=crop&w=900&q=85'
)
foreach ($u in $urls) {
  try {
    $h = Invoke-WebRequest -Uri $u -Method Head -UseBasicParsing -TimeoutSec 15
    Write-Host "OK $($h.StatusCode) $($u.Substring(0, 70))"
  } catch {
    Write-Host "FAIL $($u.Substring(0, 70)) $($_.Exception.Message)"
  }
}
