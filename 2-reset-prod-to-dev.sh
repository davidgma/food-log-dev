#!/bin/bash

# Script to be run in the prod code tree to bring the production 
# code tree to being exactly the same as the current development code tree.

# Uncomment the following 2 lines only when running in a new clone of the prod code tree:
# git remote add dev https://github.com/davidgma/food-log-dev.git
# git remote -v

git fetch dev main
git reset --hard dev/main
echo "food-log.freshfood.rocks" > public/CNAME
git add public/CNAME
git add 2-reset-prod-to-dev.sh
git commit -m "Set CNAME to prod domain and keep reset-prod-to-dev script"
git push --force origin main
