# GitHub Pages Deployment Fix

## Issue: Deployment Failed with Status 422

The error "Validation Failed" typically means GitHub Pages isn't properly configured in the repository.

## Solution Steps

### Step 1: Configure GitHub Pages in Repository Settings
1. Go to: https://github.com/Data-ScienceTech/LaFontaine-Pulse/settings/pages
2. Under "Source", select **"GitHub Actions"**
3. Click **"Save"**

### Step 2: Ensure Repository is Public (if using free plan)
GitHub Pages requires public repositories on the free plan. If the repository is private:
1. Go to: https://github.com/Data-ScienceTech/LaFontaine-Pulse/settings
2. Scroll to "Danger Zone"
3. Click "Change visibility" → "Make public"

### Step 3: Check Repository Permissions
Ensure the organization has GitHub Pages enabled:
1. Go to organization settings: https://github.com/organizations/Data-ScienceTech/settings/member_privileges
2. Check if GitHub Pages is allowed

### Step 4: Manual Trigger (if needed)
1. Go to: https://github.com/Data-ScienceTech/LaFontaine-Pulse/actions
2. Click on "Deploy to GitHub Pages" workflow
3. Click "Run workflow" button

## Alternative: Simplified Workflow

If the issue persists, here's a simpler workflow that might work better:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ "main" ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build:gh-pages
      
      - name: Setup Pages
        uses: actions/configure-pages@v4
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
      
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

## Quick Fix Commands

If you want to try the simplified workflow:

```bash
# Copy the alternative workflow above and save it as .github/workflows/deploy.yml
# Then commit and push:
git add .github/workflows/deploy.yml
git commit -m "Simplify GitHub Pages deployment workflow"
git push origin main
```

## Expected Resolution

After configuring GitHub Pages in the repository settings and ensuring the repository is public (if needed), the deployment should work within 2-3 minutes.
