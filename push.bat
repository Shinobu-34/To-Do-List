@echo off
cd /d "%~dp0"
echo Pushing local commits to GitHub...
echo.
call git push -u origin HEAD
echo.
echo ======================================
echo  Done! Please check GitHub to verify.
echo ======================================
pause
