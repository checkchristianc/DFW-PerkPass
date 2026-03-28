#!/bin/bash

# Change to your project folder
cd ~/DFW-PerkPass

# Your Railway backend URL
BACKEND_URL="https://dfwperkpassbackend-production.up.railway.app"

# Replace all fetch() calls in app/ and components/ to use the backend URL
grep -Rl "fetch(" app/ components/ | xargs sed -i "s|fetch(.*)|fetch('$BACKEND_URL', { method: 'GET' })|g"

echo "All fetch() calls updated to point to $BACKEND_URL"
