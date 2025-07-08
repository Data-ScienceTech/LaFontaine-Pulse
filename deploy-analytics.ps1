#!/usr/bin/env pwsh

# LaFontaine Analytics Deployment Script
# This script deploys the analytics backend to Azure Container Apps

Write-Host "🚀 Starting LaFontaine Analytics deployment..." -ForegroundColor Green

# Check if Azure CLI is installed
if (!(Get-Command az -ErrorAction SilentlyContinue)) {
    Write-Error "Azure CLI is not installed. Please install it first: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
}

# Check if azd is installed
if (!(Get-Command azd -ErrorAction SilentlyContinue)) {
    Write-Error "Azure Developer CLI (azd) is not installed. Please install it first: https://docs.microsoft.com/en-us/azure/developer/azure-developer-cli/install-azd"
    exit 1
}

try {
    Write-Host "📋 Initializing azd environment..." -ForegroundColor Yellow
    
    # Initialize azd if not already done
    if (!(Test-Path ".azure")) {
        azd init --template minimal
    }

    Write-Host "🔧 Setting up environment..." -ForegroundColor Yellow
    
    # Set default environment name if not set
    if (!(azd env list | Select-String "default")) {
        azd env new default
        azd env select default
    }

    Write-Host "☁️  Provisioning Azure resources..." -ForegroundColor Yellow
    
    # Provision infrastructure
    azd provision --preview
    
    # Ask for confirmation
    $confirmation = Read-Host "Do you want to proceed with deployment? (y/N)"
    if ($confirmation -ne "y" -and $confirmation -ne "Y") {
        Write-Host "Deployment cancelled." -ForegroundColor Yellow
        exit 0
    }

    # Deploy the application
    Write-Host "🚀 Deploying application..." -ForegroundColor Yellow
    azd up

    Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
    
    # Get the analytics API URL
    $apiUrl = azd show | Select-String "ANALYTICS_API_URI" | ForEach-Object { $_.ToString().Split(":")[1].Trim() }
    
    if ($apiUrl) {
        Write-Host ""
        Write-Host "🎉 Your analytics API is now available at:" -ForegroundColor Green
        Write-Host "   $apiUrl" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "📝 Next steps:" -ForegroundColor Yellow
        Write-Host "   1. Update your frontend globalAnalytics.ts with the API URL above"
        Write-Host "   2. Redeploy your frontend to GitHub Pages"
        Write-Host "   3. Test the analytics collection"
        Write-Host ""
    }

} catch {
    Write-Error "Deployment failed: $_"
    Write-Host "❌ Please check the error messages above and try again." -ForegroundColor Red
    exit 1
}
