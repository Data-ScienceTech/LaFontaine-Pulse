#!/bin/bash

# Azure Analytics Setup Script for Papineau Noise Pulse
# This script sets up Azure Table Storage for analytics data collection

set -e

# Configuration
RESOURCE_GROUP="noise-pulse-rg"
STORAGE_ACCOUNT="noisepulsestorage$(date +%s | tail -c 5)"  # Add random suffix
LOCATION="canadacentral"
TABLE_NAME="analyticsdata"

echo "🚀 Setting up Azure Analytics for Papineau Noise Pulse"
echo "Resource Group: $RESOURCE_GROUP"
echo "Storage Account: $STORAGE_ACCOUNT"
echo "Location: $LOCATION"

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI is not installed. Please install it first:"
    echo "https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Login check
if ! az account show &> /dev/null; then
    echo "🔐 Please login to Azure first:"
    az login
fi

echo "✅ Azure CLI authenticated"

# Create resource group
echo "📦 Creating resource group..."
az group create \
    --name "$RESOURCE_GROUP" \
    --location "$LOCATION" \
    --output table

# Create storage account
echo "💾 Creating storage account..."
az storage account create \
    --name "$STORAGE_ACCOUNT" \
    --resource-group "$RESOURCE_GROUP" \
    --location "$LOCATION" \
    --sku Standard_LRS \
    --kind StorageV2 \
    --access-tier Hot \
    --output table

# Enable CORS for web access
echo "🌐 Configuring CORS..."
az storage cors add \
    --account-name "$STORAGE_ACCOUNT" \
    --services table \
    --methods POST GET OPTIONS \
    --origins "*" \
    --allowed-headers "*" \
    --exposed-headers "*" \
    --max-age 3600

# Create analytics table
echo "📊 Creating analytics table..."
az storage table create \
    --name "$TABLE_NAME" \
    --account-name "$STORAGE_ACCOUNT" \
    --output table

# Generate SAS token (valid for 1 year)
echo "🔑 Generating SAS token..."
EXPIRY_DATE=$(date -d "+1 year" -u +%Y-%m-%dT%H:%M:%SZ)
SAS_TOKEN=$(az storage account generate-sas \
    --account-name "$STORAGE_ACCOUNT" \
    --services table \
    --resource-types service,container,object \
    --permission read,write,delete,list,add,create,update,process \
    --expiry "$EXPIRY_DATE" \
    --https-only \
    --output tsv)

# Create environment file
echo "📝 Creating environment configuration..."
cat > .env.azure << EOF
# Azure Analytics Configuration - Generated $(date)
VITE_AZURE_TABLE_ACCOUNT=$STORAGE_ACCOUNT
VITE_AZURE_TABLE_SAS=?$SAS_TOKEN
EOF

echo ""
echo "🎉 Azure Analytics Setup Complete!"
echo ""
echo "📋 Configuration Summary:"
echo "  Resource Group: $RESOURCE_GROUP"
echo "  Storage Account: $STORAGE_ACCOUNT"
echo "  Table Name: $TABLE_NAME"
echo "  SAS Token Expiry: $EXPIRY_DATE"
echo ""
echo "📁 Environment file created: .env.azure"
echo "   Copy this file to .env.local to activate Azure storage"
echo ""
echo "🔍 View your data:"
echo "   Azure Portal: https://portal.azure.com"
echo "   Storage Explorer: https://azure.microsoft.com/features/storage-explorer/"
echo ""
echo "💰 Estimated monthly cost: <$1 for typical usage"
echo ""
echo "⚠️  Important:"
echo "   - Keep your SAS token secure"
echo "   - SAS token expires on: $EXPIRY_DATE"
echo "   - Only anonymized data is collected"
echo ""

# Optional: Test the connection
read -p "🧪 Test the Azure connection? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🧪 Testing Azure Table Storage connection..."
    
    # Create a test entity
    az storage entity insert \
        --account-name "$STORAGE_ACCOUNT" \
        --table-name "$TABLE_NAME" \
        --entity PartitionKey=test RowKey=setup EventType=setup_test Timestamp="$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
        --if-exists replace \
        --output table
    
    echo "✅ Test successful! Azure analytics is ready to use."
fi

echo ""
echo "🚀 Next steps:"
echo "1. Copy .env.azure to .env.local"
echo "2. Deploy your application"
echo "3. Monitor analytics in Azure Portal"
