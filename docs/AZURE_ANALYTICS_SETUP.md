# Azure Analytics Setup Guide

This document explains how to set up Azure services for storing analytics data from the Papineau Noise Pulse application.

## 🎯 **Quick Start - Recommended: Azure Table Storage**

Azure Table Storage is the simplest and most cost-effective option for analytics data.

### 1. Create Azure Storage Account

```bash
# Create resource group
az group create --name noise-pulse-rg --location canadacentral

# Create storage account
az storage account create \
  --name noisepulsestorage \
  --resource-group noise-pulse-rg \
  --location canadacentral \
  --sku Standard_LRS

# Create table
az storage table create \
  --name analyticsdata \
  --account-name noisepulsestorage
```

### 2. Get Connection Info

```bash
# Get storage account key
az storage account keys list \
  --account-name noisepulsestorage \
  --resource-group noise-pulse-rg

# Or create SAS token (more secure)
az storage account generate-sas \
  --account-name noisepulsestorage \
  --account-key YOUR_ACCOUNT_KEY \
  --services t \
  --resource-types sco \
  --permission rwdlacup \
  --expiry 2025-12-31T23:59:59Z
```

### 3. Configure Environment

Create `.env.local`:
```env
VITE_AZURE_TABLE_ACCOUNT=noisepulsestorage
VITE_AZURE_TABLE_SAS=?sv=2021-06-08&ss=t&srt=sco&sp=rwdlacup&se=2025-12-31T23:59:59Z&st=2024-01-01T00:00:00Z&spr=https&sig=YOUR_SAS_TOKEN
```

## 🚀 **Advanced: Azure Cosmos DB**

For complex analytics and real-time queries.

### 1. Create Cosmos DB Account

```bash
# Create Cosmos DB account
az cosmosdb create \
  --name noise-pulse-cosmos \
  --resource-group noise-pulse-rg \
  --locations regionName=canadacentral

# Create database
az cosmosdb sql database create \
  --account-name noise-pulse-cosmos \
  --resource-group noise-pulse-rg \
  --name noise-pulse

# Create container
az cosmosdb sql container create \
  --account-name noise-pulse-cosmos \
  --resource-group noise-pulse-rg \
  --database-name noise-pulse \
  --name analytics \
  --partition-key-path "/partitionKey" \
  --throughput 400
```

### 2. Configure Environment

```env
VITE_AZURE_COSMOS_ENDPOINT=https://noise-pulse-cosmos.documents.azure.com:443/
VITE_AZURE_COSMOS_KEY=your_cosmos_primary_key
```

## ⚡ **Serverless: Azure Functions**

For serverless analytics processing.

### 1. Create Function App

```bash
# Create function app
az functionapp create \
  --resource-group noise-pulse-rg \
  --consumption-plan-location canadacentral \
  --runtime node \
  --runtime-version 18 \
  --functions-version 4 \
  --name noise-pulse-functions \
  --storage-account noisepulsestorage
```

### 2. Deploy Function Code

Create `function.json`:
```json
{
  "bindings": [
    {
      "authLevel": "function",
      "type": "httpTrigger",
      "direction": "in",
      "name": "req",
      "methods": ["post"]
    },
    {
      "type": "table",
      "direction": "out",
      "name": "outputTable",
      "tableName": "analyticsdata",
      "connection": "AzureWebJobsStorage"
    }
  ]
}
```

Create `index.js`:
```javascript
module.exports = async function (context, req) {
    const { type, data } = req.body;
    
    if (type === 'event') {
        context.bindings.outputTable = {
            PartitionKey: new Date(data.timestamp).toISOString().split('T')[0],
            RowKey: `${data.sessionId}_${Date.now()}`,
            ...data
        };
    }
    
    context.res = { status: 200, body: "Event processed" };
};
```

### 3. Configure Environment

```env
VITE_AZURE_FUNCTIONS_URL=https://noise-pulse-functions.azurewebsites.net
VITE_AZURE_FUNCTIONS_KEY=your_function_key
```

## 📊 **Data Structure**

### Events Table Schema
- `PartitionKey`: Date (YYYY-MM-DD) for efficient queries
- `RowKey`: Unique identifier (sessionId_timestamp)
- `EventType`: Type of event (page_view, feature_usage, etc.)
- `SessionId`: Anonymous session identifier
- `Timestamp`: ISO 8601 timestamp
- `EventData`: JSON string with event-specific data

### Sessions Table Schema
- `PartitionKey`: "sessions"
- `RowKey`: Session ID
- `Language`: User language preference
- `DeviceType`: mobile/tablet/desktop
- `Timezone`: User timezone
- `ConsentGiven`: Boolean
- `StartTime`/`EndTime`: Session duration

## 🔒 **Security Best Practices**

1. **Use SAS Tokens**: More secure than account keys
2. **Set Expiration**: SAS tokens should have reasonable expiry dates
3. **Minimal Permissions**: Only grant necessary permissions (rwdlacup for tables)
4. **HTTPS Only**: All requests use HTTPS
5. **No Personal Data**: Only anonymized environmental data

## 💰 **Cost Estimation**

### Azure Table Storage
- ~$0.045 per GB stored per month
- ~$0.0004 per 10,000 transactions
- **Estimated monthly cost for 10,000 sessions: <$1**

### Azure Cosmos DB
- 400 RU/s minimum: ~$24/month
- Storage: ~$0.25 per GB per month
- **Estimated monthly cost: $25-30**

### Azure Functions
- First 1M executions free
- $0.20 per million executions after
- **Estimated monthly cost for 10,000 sessions: <$1**

## 🛠️ **Development Tools**

### Query Data with Azure CLI

```bash
# List recent events
az storage entity query \
  --table-name analyticsdata \
  --account-name noisepulsestorage \
  --filter "Timestamp ge datetime'2024-01-01T00:00:00'"

# Export data
az storage entity query \
  --table-name analyticsdata \
  --account-name noisepulsestorage \
  --output table
```

### Azure Storage Explorer
Download Azure Storage Explorer for a GUI to browse your data:
https://azure.microsoft.com/en-us/features/storage-explorer/

## 🚨 **Troubleshooting**

### Common Issues

1. **CORS Errors**: Enable CORS in Azure Storage Account settings
2. **Authentication Failed**: Check SAS token expiry and permissions
3. **Table Not Found**: Ensure table is created before first request
4. **High Latency**: Consider using Azure CDN for static assets

### Enable CORS for Web Apps

```bash
az storage cors add \
  --account-name noisepulsestorage \
  --services t \
  --methods POST GET OPTIONS \
  --origins "*" \
  --allowed-headers "*" \
  --exposed-headers "*" \
  --max-age 3600
```
