# Script PowerShell pour retirer les imports Swagger temporairement

$files = Get-ChildItem -Path ".\src\modules" -Filter "*.controller.ts" -Recurse

foreach ($file in $files) {
    Write-Host "Processing: $($file.FullName)"
    $content = Get-Content $file.FullName -Raw

    # Retirer l'import Swagger
    $content = $content -replace "import \{[^\}]*\} from '@nestjs/swagger';", ""

    # Retirer les décorateurs Swagger (ligne par ligne)
    $content = $content -replace "@ApiTags\([^\)]*\)", ""
    $content = $content -replace "@ApiOperation\([^\)]*\)", ""
    $content = $content -replace "@ApiResponse\([^\)]*\)", ""
    $content = $content -replace "@ApiBearerAuth\(\)", ""
    $content = $content -replace "@ApiQuery\([^\)]*\)", ""

    Set-Content -Path $file.FullName -Value $content
}

Write-Host "Swagger removed from all controllers!"
