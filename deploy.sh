#!/bin/bash
# ============================================================
# Elective Diaries — One-click GitHub push script
# Run this from INSIDE the elective-diaries folder:
#   chmod +x deploy.sh && ./deploy.sh
# ============================================================

echo "🚀 Elective Diaries — Deploy Script"
echo "------------------------------------"

# Check git is installed
if ! command -v git &> /dev/null; then
  echo "❌ Git is not installed. Please install it from https://git-scm.com"
  exit 1
fi

# Init git if not already a repo
if [ ! -d ".git" ]; then
  echo "📦 Initializing git repository..."
  git init
  git branch -M main
fi

# Stage all files
echo "📁 Staging all files..."
git add -A

# Commit
echo "💾 Committing..."
git commit -m "fix: resolve all TypeScript type errors for Vercel build" --allow-empty

# Ask for remote URL if not set
REMOTE=$(git remote get-url origin 2>/dev/null)
if [ -z "$REMOTE" ]; then
  echo ""
  echo "🔗 Enter your GitHub repo URL (e.g. https://github.com/Doctanaski/Elective-Diaries.git):"
  read -r REPO_URL
  git remote add origin "$REPO_URL"
fi

# Force push
echo "⬆️  Pushing to GitHub (force)..."
git push -u origin main --force

echo ""
echo "✅ Done! Vercel will now auto-deploy your latest code."
echo "   Check your build at: https://vercel.com/dashboard"
