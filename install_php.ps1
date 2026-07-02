$ErrorActionPreference = "Stop"

$phpUrl = "https://windows.php.net/downloads/releases/php-8.2.31-Win32-vs16-x64.zip"
$phpDir = "d:\Mubarak\SnapFlectMobileWebApp\Snapflect Assessment Portal\php"
$zipPath = "d:\Mubarak\SnapFlectMobileWebApp\Snapflect Assessment Portal\php.zip"

Write-Host "Downloading PHP..."
Invoke-WebRequest -Uri $phpUrl -OutFile $zipPath

Write-Host "Extracting PHP..."
Expand-Archive -Path $zipPath -DestinationPath $phpDir -Force
Remove-Item $zipPath

Write-Host "Configuring php.ini..."
Copy-Item "$phpDir\php.ini-development" "$phpDir\php.ini"

(Get-Content "$phpDir\php.ini") `
    -replace ';extension_dir = "ext"', 'extension_dir = "ext"' `
    -replace ';extension=mbstring', 'extension=mbstring' `
    -replace ';extension=openssl', 'extension=openssl' `
    -replace ';extension=pdo_mysql', 'extension=pdo_mysql' `
    -replace ';extension=pdo_sqlite', 'extension=pdo_sqlite' `
    -replace ';extension=fileinfo', 'extension=fileinfo' `
    -replace ';extension=curl', 'extension=curl' `
    -replace ';extension=sqlite3', 'extension=sqlite3' | Set-Content "$phpDir\php.ini"

Write-Host "Downloading Composer..."
Invoke-WebRequest -Uri "https://getcomposer.org/download/latest-stable/composer.phar" -OutFile "$phpDir\composer.phar"

Write-Host "Creating wrapper scripts..."
Set-Content -Path "$phpDir\composer.bat" -Value "@php `"%~dp0composer.phar`" %*"
Set-Content -Path "$phpDir\php.bat" -Value "@`"%~dp0php.exe`" %*"

Write-Host "Installation Complete."
