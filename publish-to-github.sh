#!/bin/bash

# Script to publish Wedding Cost Estimator Widget to GitHub
# Run this after accepting the Xcode license with: sudo xcodebuild -license

set -e  # Exit on error

REPO_DIR="/Users/nickgiulioni/Library/CloudStorage/SynologyDrive-macbookpro/Cursor/Weddings 2"
cd "$REPO_DIR"

echo "🚀 Setting up Git repository..."

# Initialize git if not already initialized
if [ ! -d .git ]; then
    git init
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

# Configure git user (update these with your actual GitHub info)
git config user.name "nickgiulioni" || true
# git config user.email "your-email@example.com" || true

# Add all files (respecting .gitignore)
echo "📦 Adding files..."
git add .

# Check if there are changes to commit
if git diff --cached --quiet; then
    echo "ℹ️  No changes to commit"
else
    # Make initial commit
    echo "📝 Creating initial commit..."
    git commit -m "Initial commit: Wedding Cost Estimator Widget
    
    - Lightweight embeddable widget for The Wilds and Laural Mill
    - Real-time cost calculations
    - Fully accessible (WCAG 2.1 AA)
    - Export to CSV and print/PDF
    - Comprehensive test coverage"
    
    echo "✅ Initial commit created"
fi

# Check if remote already exists
if git remote get-url origin >/dev/null 2>&1; then
    echo "ℹ️  Remote 'origin' already configured: $(git remote get-url origin)"
else
    echo ""
    echo "⚠️  No GitHub remote configured yet."
    echo ""
    echo "To complete the setup, run:"
    echo "  git remote add origin <YOUR_GITHUB_REPO_URL>"
    echo ""
    echo "Then push with:"
    echo "  git branch -M main"
    echo "  git push -u origin main"
    echo ""
fi

echo ""
echo "✅ Git repository is ready!"
echo ""
echo "Next steps:"
echo "1. Create a repository on GitHub (if you haven't already)"
echo "2. Run: git remote add origin <YOUR_GITHUB_REPO_URL>"
echo "3. Run: git branch -M main"
echo "4. Run: git push -u origin main"

