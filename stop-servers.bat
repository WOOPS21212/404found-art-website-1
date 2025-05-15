@echo off
echo Stopping all development servers...

:: Kill all Node.js processes (which includes Next.js and Strapi)
taskkill /F /IM node.exe /T

:: In case any npm processes are still running
taskkill /F /IM npm.exe /T

echo.
echo All development servers have been stopped.
echo If you see any "ERROR: The process..." messages, it just means that process wasn't running.
echo.
pause