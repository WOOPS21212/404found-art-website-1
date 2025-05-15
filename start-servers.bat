@echo off
echo Starting 404 Found Art Portfolio servers...

:: Start the backend server in a new command window
start cmd /k "cd /d K:\404found-art\404found-art-website-1\backend && echo Starting Strapi backend server... && npm run dev"

:: Wait 5 seconds to allow backend to initialize first
timeout /t 5 /nobreak > nul

:: Start the frontend server in a new command window
start cmd /k "cd /d K:\404found-art\404found-art-website-1\frontend && echo Starting Next.js frontend server... && npm run dev"

echo Servers are starting in separate windows. You can close this window.
timeout /t 3 > nul