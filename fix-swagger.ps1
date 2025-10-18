# Script PowerShell pour retirer les imports Swagger temporairement

$files = Get-ChildItem -Path ".\backend\src\modules" -Filter "*.controller.ts" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw

    # Retirer l'import Swagger
    $content = $content -replace "import \{ .* \} from '@nestjs/swagger';", ""
    $content = $content -replace "import \{.*\} from '@nestjs/swagger';", ""

    # Retirer les décorateurs Swagger
    $content = $content -replace "@ApiTags\('.*?'\)`r?`n", ""
    $content = $content -replace "@ApiOperation\(.*?\)`r?`n", ""
    $content = $content -replace "@ApiResponse\(.*?\)`r?`n", ""
    $content = $content -replace "@ApiBearerAuth\(\)`r?`n", ""
    $content = $content -replace "@ApiQuery\(.*?\)`r?`n", ""
    $content = $content -replace "@ApiProperty\(.*?\)`r?`n", ""

    Set-Content -Path $file.FullName -Value $content
}

Write-Host "Swagger removed from all controllers!"
