# Material 3 Color Replacement Script
# This PowerShell script replaces old Tailwind colors with Material 3 tokens

$files = Get-ChildItem "i:\dailyalertsstocks\app\src" -Recurse -Include *.tsx,*.ts -File

$replacements = @(
    # Background colors
    @{Old = 'bg-white dark:bg-gray-800'; New = 'bg-[var(--surface-1)]'},
    @{Old = 'bg-white dark:bg-gray-900'; New = 'bg-[var(--surface-0)]'},
    @{Old = 'bg-gray-50 dark:bg-gray-900'; New = 'bg-[var(--surface-0)]'},
    @{Old = 'bg-gray-100 dark:bg-gray-800'; New = 'bg-[var(--surface-2)]'},
    @{Old = 'bg-white'; New = 'bg-[var(--surface-1)]'},
    @{Old = 'dark:bg-gray-800'; New = ''},
    @{Old = 'dark:bg-gray-900'; New = ''},
    
    # Borders
    @{Old = 'border-gray-200 dark:border-gray-700'; New = 'border-md-outline-variant'},
    @{Old = 'dark:border-gray-700'; New = ''},
    @{Old = 'border-gray-200'; New = 'border-md-outline-variant'},
    
    # Text colors
    @{Old = 'text-gray-700 dark:text-gray-200'; New = 'text-md-on-surface'},
    @{Old = 'text-gray-600 dark:text-gray-300'; New = 'text-md-on-surface-variant'},
    @{Old = 'dark:text-gray-200'; New = ''},
    @{Old = 'dark:text-gray-300'; New = ''},
    
    # Hover states
    @{Old = 'hover:bg-gray-100 dark:hover:bg-gray-700'; New = 'hover:bg-[var(--surface-2)]'},
    @{Old = 'dark:hover:bg-gray-700'; New = ''},
    @{Old = 'hover:bg-gray-100'; New = 'hover:bg-[var(--surface-2)]'}
)

Write-Host "Starting Material 3 color replacement..." -ForegroundColor Cyan
Write-Host "Files to process: $($files.Count)" -ForegroundColor Yellow

$totalReplacements = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $fileChanged = $false
    
    foreach ($replacement in $replacements) {
        if ($content -match [regex]::Escape($replacement.Old)) {
            $content = $content -replace [regex]::Escape($replacement.Old), $replacement.New
            $fileChanged = $true
            $totalReplacements++
        }
    }
    
    if ($fileChanged) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "  Updated: $($file.Name)" -ForegroundColor Green
    }
}

Write-Host "`nCompleted! Total replacements: $totalReplacements" -ForegroundColor Cyan
