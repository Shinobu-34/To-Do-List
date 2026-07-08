@echo off
cd /d "%~dp0"
echo Removing node_modules from git cache...
call git rm -r --cached node_modules
echo.
echo Staging .gitignore...
call git add .gitignore
echo.
echo Committing changes...
call git commit -m "chore: remove node_modules from tracking and add gitignore"
echo.
echo ======================================
echo  Done! node_modules is no longer tracked.
echo ======================================
pause
