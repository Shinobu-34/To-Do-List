@echo off
cd /d "%~dp0"
echo Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: npm install failed. Make sure Node.js is installed.
    pause
    exit /b 1
)
echo.
echo ======================================
echo  Dependencies installed successfully!
echo  Now run: npm run dev
echo ======================================
pause
