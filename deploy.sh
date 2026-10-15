#!/bin/bash
# Navigate to the food-log directory relative to this script
cd "$(dirname "$0")/food-log" || { echo "food-log directory not found!"; exit 1; }

# Set the GitHub repository URL to use HTTPS
REPO_URL="https://github.com/davidgma/food-log.git"

if [ ! -d ".git" ]; then
  echo "Initializing git repository..."
  git init
  git branch -M main
  git remote add origin "$REPO_URL"
else
  # Ensure the remote URL is updated in case it was previously set to SSH
  git remote set-url origin "$REPO_URL"
fi

echo "Adding all generated files..."
git add .

echo "Committing..."
git commit -m "Auto-deployed website updates: $(date)"

echo "Pushing to GitHub (overwriting remote main branch)..."
git push -f origin main

echo "Deployment complete!"
