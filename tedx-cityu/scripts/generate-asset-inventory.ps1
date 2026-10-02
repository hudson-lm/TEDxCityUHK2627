param(
  [string]$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$assetRoot = Join-Path $ProjectRoot 'src\Assets'
$buildManifestPath = Join-Path $ProjectRoot 'build\asset-manifest.json'
$outputDirectory = Join-Path $ProjectRoot 'docs'
$csvPath = Join-Path $outputDirectory 'website-asset-inventory.csv'
$summaryPath = Join-Path $outputDirectory 'website-asset-inventory.md'

New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null

$manifestNames = @{}
if (Test-Path $buildManifestPath) {
  $manifest = Get-Content -Raw $buildManifestPath | ConvertFrom-Json
  foreach ($property in $manifest.files.PSObject.Properties) {
    if ($property.Name -like 'static/media/*') {
      $manifestNames[[System.IO.Path]::GetFileName($property.Name).ToLowerInvariant()] = $true
    }
  }
}

$sourceFiles = Get-ChildItem -Recurse -File (Join-Path $ProjectRoot 'src') |
  Where-Object { $_.FullName -notlike "$assetRoot*" -and $_.Extension -in '.js', '.jsx', '.css', '.json' }

$sourceDocuments = foreach ($sourceFile in $sourceFiles) {
  [pscustomobject]@{
    Path = $sourceFile.FullName
    RelativePath = $sourceFile.FullName.Substring($ProjectRoot.Length + 1).Replace('\', '/')
    Content = Get-Content -Raw $sourceFile.FullName
  }
}

function Get-PageLabel([string]$referencePath) {
  switch -Wildcard ($referencePath.ToLowerInvariant()) {
    '*pages/homepage*' { return 'Home' }
    '*components/banner*' { return 'Home banner' }
    '*components/counter*' { return 'Home' }
    '*components/sponsor*' { return 'Home sponsors' }
    '*components/abouttedx*' { return 'About' }
    '*pages/aboutpage*' { return 'About' }
    '*pages/pasteventpage*' { return 'Past Events' }
    '*pages/teampage*' { return 'Crew' }
    '*components/membercard*' { return 'Crew' }
    '*data/creativedata*' { return 'Crew' }
    '*data/curatordata*' { return 'Crew' }
    '*data/eventmanagementprocurementdata*' { return 'Crew' }
    '*data/financesponsorshipdata*' { return 'Crew' }
    '*data/humanresourcesdata*' { return 'Crew' }
    '*data/marketingcommunicationdata*' { return 'Crew' }
    '*data/speakerrelationsdata*' { return 'Crew' }
    '*data/technicaldata*' { return 'Crew' }
    '*pages/speakerpage*' { return 'Speakers' }
    '*components/speaker*' { return 'Speakers' }
    '*data/speakerdata*' { return 'Speakers' }
    '*pages/performerpage*' { return 'Performers' }
    '*components/performer*' { return 'Performers' }
    '*data/performerdata*' { return 'Performers' }
    '*pages/registrationpage*' { return 'Event registration' }
    '*components/navbar*' { return 'Shared navigation' }
    '*components/footer*' { return 'Shared footer' }
    default { return 'Shared / needs review' }
  }
}

function Get-Recommendation([string]$relativePath, [string]$extension, [double]$sizeMb, [bool]$bundled) {
  if (-not $bundled) {
    return [pscustomobject]@{ Action = 'Archive candidate'; Priority = 'Archive'; Target = 'Keep original in Drive; remove from website source after review' }
  }

  if ($extension -in '.svg', '.pdf' -or $sizeMb -le 0.15) {
    return [pscustomobject]@{ Action = 'Keep as-is'; Priority = 'Low'; Target = 'No conversion needed unless visual review finds an issue' }
  }

  if ($relativePath -like 'Members/*') {
    $target = 'WebP portrait, about 600-800 px wide'
  } elseif ($relativePath -like 'PastEvents/*') {
    $target = 'WebP, max 1600 px wide; consider splitting very tall artwork'
  } elseif ($relativePath -match 'background|TEDxTeam|TEDTeam|TeamCrew') {
    $target = 'Responsive WebP hero/background, 1280 and 1920 px variants'
  } elseif ($relativePath -like 'About/*') {
    $target = 'WebP, max 1200-1400 px wide'
  } else {
    $target = 'WebP sized to its displayed dimensions'
  }

  $priority = if ($sizeMb -ge 5) { 'Critical' } elseif ($sizeMb -ge 1) { 'High' } else { 'Medium' }
  return [pscustomobject]@{ Action = 'Optimize'; Priority = $priority; Target = $target }
}

$inventory = foreach ($asset in (Get-ChildItem -Recurse -File $assetRoot)) {
  $relativePath = $asset.FullName.Substring($assetRoot.Length + 1).Replace('\', '/')
  $extension = $asset.Extension.ToLowerInvariant()
  $width = $null
  $height = $null

  if ($extension -in '.png', '.jpg', '.jpeg') {
    try {
      $image = [System.Drawing.Image]::FromFile($asset.FullName)
      $width = $image.Width
      $height = $image.Height
      $image.Dispose()
    } catch {
      $width = $null
      $height = $null
    }
  }

  $references = @($sourceDocuments | Where-Object {
    $_.Content.IndexOf($asset.Name, [System.StringComparison]::OrdinalIgnoreCase) -ge 0
  })

  $pageLabels = @($references | ForEach-Object { Get-PageLabel $_.RelativePath } | Sort-Object -Unique)
  $bundled = $manifestNames.ContainsKey($asset.Name.ToLowerInvariant())
  $sizeMb = [math]::Round($asset.Length / 1MB, 3)
  $recommendation = Get-Recommendation $relativePath $extension $sizeMb $bundled
  $driveDirectory = [System.IO.Path]::GetDirectoryName($relativePath).Replace('\', '/')
  if ([string]::IsNullOrWhiteSpace($driveDirectory)) { $driveDirectory = 'Root' }

  [pscustomobject]@{
    Asset = $relativePath
    Type = $extension.TrimStart('.').ToUpperInvariant()
    'Size MB' = $sizeMb
    Width = $width
    Height = $height
    'In production build' = if ($bundled) { 'Yes' } else { 'No' }
    'Page / area' = if ($pageLabels.Count) { $pageLabels -join '; ' } else { 'No active reference found' }
    'Referenced by' = if ($references.Count) { ($references.RelativePath | Sort-Object -Unique) -join '; ' } else { '' }
    Recommendation = $recommendation.Action
    Priority = $recommendation.Priority
    'Suggested web target' = $recommendation.Target
    'Suggested Drive archive' = "Website/2526/Originals/$driveDirectory"
  }
}

$inventory = @($inventory | Sort-Object @{ Expression = { $_.'In production build' -eq 'Yes' }; Descending = $true }, @{ Expression = { [double]$_.'Size MB' }; Descending = $true })
$inventory | Export-Csv -NoTypeInformation -Encoding UTF8 $csvPath

$bundledAssets = @($inventory | Where-Object { $_.'In production build' -eq 'Yes' })
$archiveCandidates = @($inventory | Where-Object { $_.'In production build' -eq 'No' })
$criticalAssets = @($inventory | Where-Object { $_.Priority -eq 'Critical' })
$highAssets = @($inventory | Where-Object { $_.Priority -eq 'High' })
$bundledMb = [math]::Round(($bundledAssets | Measure-Object 'Size MB' -Sum).Sum, 1)
$allMb = [math]::Round(($inventory | Measure-Object 'Size MB' -Sum).Sum, 1)

$topRows = foreach ($item in ($bundledAssets | Select-Object -First 20)) {
  $assetCell = $item.Asset.Replace('|', '\|')
  $areaCell = $item.'Page / area'.Replace('|', '\|')
  "| $assetCell | $($item.'Size MB') | $($item.Width)×$($item.Height) | $areaCell | $($item.Priority) |"
}

$summary = @"
# Website asset inventory

Generated from the current production build and `src/Assets`. No assets were moved, uploaded, converted, or deleted.

## Snapshot

- Total source assets: $($inventory.Count) files / $allMb MB
- Included in the current production build: $($bundledAssets.Count) files / $bundledMb MB
- Critical optimization targets (5 MB or larger): $($criticalAssets.Count)
- High-priority targets (1-5 MB): $($highAssets.Count)
- Not present in the production build: $($archiveCandidates.Count) archive candidates

## First-pass recommendation

1. Archive untouched originals under `Website/2526/Originals`, preserving the current subfolder structure.
2. Optimize the critical files first, starting with Home, Past Events, and large Crew portraits.
3. Put only web-sized derivatives in the website repository.
4. Review every archive candidate before removing anything from the repository.

## Twenty largest production assets

| Asset | MB | Dimensions | Page / area | Priority |
|---|---:|---:|---|---|
$($topRows -join "`r`n")

The complete inventory, including source references and suggested Drive destinations, is in `docs/website-asset-inventory.csv`.
"@

Set-Content -Path $summaryPath -Value $summary -Encoding UTF8
Write-Output "Created $csvPath"
Write-Output "Created $summaryPath"
