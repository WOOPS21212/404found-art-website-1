#!/bin/bash

echo "Starting 404 Found Art Portfolio servers..."

# Start the backend server in a new terminal window
osascript -e 'tell application "Terminal"
    do script "cd '$(pwd)'/backend && echo Starting Strapi backend server... && npm run dev"
end tell'

# Wait 5 seconds to allow backend to initialize first
sleep 5

# Start the frontend server in a new terminal window
osascript -e 'tell application "Terminal"
    do script "cd '$(pwd)'/frontend && echo Starting Next.js frontend server... && npm run dev"
end tell'

echo "Servers are starting in separate Terminal windows. You can close this window."
sleep 3 