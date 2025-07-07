@echo off
echo 🚀 Setting up LaFontaine Noise Pulse for GitHub Pages deployment
echo ==================================================

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Please run this script from the project root.
    exit /b 1
)

echo 📋 Step 1: Checking dependencies...
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Git is not installed. Please install Git first.
    exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install Node.js and npm first.
    exit /b 1
)

echo ✅ Dependencies check passed

echo 📦 Step 2: Installing project dependencies...
npm install

echo 🏗️  Step 3: Testing build...
npm run build:gh-pages

if %errorlevel% neq 0 (
    echo ❌ Build failed. Please check the errors above.
    exit /b 1
)

echo ✅ Build successful!

echo 🔧 Step 4: Git repository setup...

REM Check if git is initialized
if not exist ".git" (
    echo Initializing Git repository...
    git init
    git add .
    git commit -m "Initial commit - LaFontaine Noise Pulse app"
)

echo 📝 Step 5: Setting up GitHub remote...
echo Please set up your GitHub repository manually:
echo.
echo 1. Create a new repository on GitHub:
echo    - Go to: https://github.com/organizations/data-sciencetech/repositories/new
echo    - Repository name: papineau-noise-pulse
echo    - Make it public (required for GitHub Pages on free plan)
echo    - Don't initialize with README (we already have one)
echo.
echo 2. Add the remote and push:
echo    git remote add origin https://github.com/data-sciencetech/papineau-noise-pulse.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo 3. Enable GitHub Pages:
echo    - Go to repository Settings ^> Pages
echo    - Source: GitHub Actions
echo    - The workflow will deploy automatically
echo.
echo 🌐 Your app will be available at:
echo    https://data-sciencetech.github.io/papineau-noise-pulse/
echo.
echo ✅ Setup complete! Follow the manual steps above to deploy.
echo.
echo 📚 For detailed instructions, see:
echo    ./docs/GITHUB_PAGES_DEPLOYMENT.md

pause
