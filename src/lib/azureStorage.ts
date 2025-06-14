/**
 * Azure Storage Adapters for Analytics Data
 * Supports Azure Table Storage, Cosmos DB, and Azure Functions
 */

import { AnalyticsEvent, SessionData, StorageAdapter } from './storageAdapters';

// Azure Table Storage Configuration
interface AzureTableConfig {
  accountName: string;
  accountKey: string;
  tableName: string;
  sasToken?: string;
}

// Azure Cosmos DB Configuration
interface AzureCosmosConfig {
  endpoint: string;
  key: string;
  databaseName: string;
  containerName: string;
}

// Azure Functions API Configuration
interface AzureFunctionsConfig {
  functionAppUrl: string;
  functionKey?: string;
}

/**
 * Azure Table Storage Adapter
 * Great for simple analytics data with fast writes
 */
export class AzureTableStorageAdapter implements StorageAdapter {
  private config: AzureTableConfig;
  private baseUrl: string;

  constructor(config: AzureTableConfig) {
    this.config = config;
    this.baseUrl = `https://${config.accountName}.table.core.windows.net`;
  }

  async saveEvent(event: AnalyticsEvent): Promise<void> {
    const entity = {
      PartitionKey: this.getPartitionKey(event.timestamp),
      RowKey: `${event.sessionId}_${Date.now()}`,
      EventType: event.event,
      Timestamp: event.timestamp,
      SessionId: event.sessionId,
      EventData: JSON.stringify(event.data || {}),
      CreatedAt: new Date().toISOString()
    };

    try {
      const response = await fetch(
        `${this.baseUrl}/${this.config.tableName}${this.config.sasToken ? this.config.sasToken : ''}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'x-ms-version': '2020-12-06',
            ...(this.config.accountKey && {
              'Authorization': this.getAuthHeader('POST', `/${this.config.tableName}`)
            })
          },
          body: JSON.stringify(entity)
        }
      );

      if (!response.ok) {
        throw new Error(`Azure Table Storage error: ${response.status}`);
      }

      console.log('📊 Event saved to Azure Table Storage');
    } catch (error) {
      console.error('❌ Failed to save event to Azure Table Storage:', error);
      // Fallback to local storage
      this.saveToLocalStorage(event);
    }
  }

  async saveSession(session: SessionData): Promise<void> {
    const entity = {
      PartitionKey: 'sessions',
      RowKey: session.sessionId,
      SessionId: session.sessionId,
      StartTime: session.startTime,
      EndTime: session.endTime || '',
      Language: session.language,
      Timezone: session.timezone,
      DeviceType: session.deviceType,
      ScreenSize: session.screenSize,
      ConsentGiven: session.consentGiven,
      ConsentTime: session.consentTime || '',
      CreatedAt: new Date().toISOString()
    };

    try {
      const response = await fetch(
        `${this.baseUrl}/${this.config.tableName}${this.config.sasToken ? this.config.sasToken : ''}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'x-ms-version': '2020-12-06',
            ...(this.config.accountKey && {
              'Authorization': this.getAuthHeader('POST', `/${this.config.tableName}`)
            })
          },
          body: JSON.stringify(entity)
        }
      );

      if (!response.ok) {
        throw new Error(`Azure Table Storage error: ${response.status}`);
      }

      console.log('📊 Session saved to Azure Table Storage');
    } catch (error) {
      console.error('❌ Failed to save session to Azure Table Storage:', error);
    }
  }

  private getPartitionKey(timestamp: string): string {
    // Partition by date for better performance
    return new Date(timestamp).toISOString().split('T')[0]; // YYYY-MM-DD
  }

  private getAuthHeader(method: string, resource: string): string {
    // Simplified auth header - in production, use proper Azure SDK
    const date = new Date().toUTCString();
    const stringToSign = `${method}\n\n\n${date}\n${resource}`;
    // Note: This would need proper HMAC-SHA256 signing in production
    return `SharedKey ${this.config.accountName}:${btoa(stringToSign)}`;
  }

  private saveToLocalStorage(event: AnalyticsEvent): void {
    const events = JSON.parse(localStorage.getItem('azure_fallback_events') || '[]');
    events.push(event);
    localStorage.setItem('azure_fallback_events', JSON.stringify(events.slice(-100))); // Keep last 100
  }
}

/**
 * Azure Cosmos DB Adapter
 * Great for complex analytics with rich querying capabilities
 */
export class AzureCosmosAdapter implements StorageAdapter {
  private config: AzureCosmosConfig;

  constructor(config: AzureCosmosConfig) {
    this.config = config;
  }

  async saveEvent(event: AnalyticsEvent): Promise<void> {
    const document = {
      id: `${event.sessionId}_${Date.now()}`,
      type: 'event',
      eventType: event.event,
      timestamp: event.timestamp,
      sessionId: event.sessionId,
      data: event.data || {},
      partitionKey: this.getPartitionKey(event.timestamp),
      createdAt: new Date().toISOString(),
      ttl: 60 * 60 * 24 * 365 // 1 year TTL
    };

    try {
      const response = await fetch(
        `${this.config.endpoint}/dbs/${this.config.databaseName}/colls/${this.config.containerName}/docs`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': this.getCosmosAuthHeader('POST', 'docs', `dbs/${this.config.databaseName}/colls/${this.config.containerName}`),
            'x-ms-date': new Date().toUTCString(),
            'x-ms-version': '2020-07-15',
            'x-ms-documentdb-partitionkey': `["${document.partitionKey}"]`
          },
          body: JSON.stringify(document)
        }
      );

      if (!response.ok) {
        throw new Error(`Azure Cosmos DB error: ${response.status}`);
      }

      console.log('📊 Event saved to Azure Cosmos DB');
    } catch (error) {
      console.error('❌ Failed to save event to Azure Cosmos DB:', error);
      this.saveToLocalStorage(event);
    }
  }

  async saveSession(session: SessionData): Promise<void> {
    const document = {
      id: session.sessionId,
      type: 'session',
      ...session,
      partitionKey: 'sessions',
      createdAt: new Date().toISOString(),
      ttl: 60 * 60 * 24 * 365 // 1 year TTL
    };

    try {
      const response = await fetch(
        `${this.config.endpoint}/dbs/${this.config.databaseName}/colls/${this.config.containerName}/docs`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': this.getCosmosAuthHeader('POST', 'docs', `dbs/${this.config.databaseName}/colls/${this.config.containerName}`),
            'x-ms-date': new Date().toUTCString(),
            'x-ms-version': '2020-07-15',
            'x-ms-documentdb-partitionkey': '["sessions"]'
          },
          body: JSON.stringify(document)
        }
      );

      if (!response.ok) {
        throw new Error(`Azure Cosmos DB error: ${response.status}`);
      }

      console.log('📊 Session saved to Azure Cosmos DB');
    } catch (error) {
      console.error('❌ Failed to save session to Azure Cosmos DB:', error);
    }
  }

  private getPartitionKey(timestamp: string): string {
    // Partition by month for good distribution
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  private getCosmosAuthHeader(method: string, resourceType: string, resourceId: string): string {
    // Simplified auth header - in production, use Azure Cosmos SDK
    const date = new Date().toUTCString().toLowerCase();
    const stringToSign = `${method.toLowerCase()}\n${resourceType.toLowerCase()}\n${resourceId}\n${date}\n\n`;
    // Note: This would need proper HMAC-SHA256 signing in production
    return `type%3dmaster%26ver%3d1.0%26sig%3d${btoa(stringToSign)}`;
  }

  private saveToLocalStorage(event: AnalyticsEvent): void {
    const events = JSON.parse(localStorage.getItem('cosmos_fallback_events') || '[]');
    events.push(event);
    localStorage.setItem('cosmos_fallback_events', JSON.stringify(events.slice(-100)));
  }
}

/**
 * Azure Functions Adapter
 * Great for serverless analytics processing
 */
export class AzureFunctionsAdapter implements StorageAdapter {
  private config: AzureFunctionsConfig;

  constructor(config: AzureFunctionsConfig) {
    this.config = config;
  }

  async saveEvent(event: AnalyticsEvent): Promise<void> {
    const payload = {
      type: 'event',
      data: event,
      timestamp: new Date().toISOString()
    };

    try {
      const response = await fetch(
        `${this.config.functionAppUrl}/api/analytics-event${this.config.functionKey ? `?code=${this.config.functionKey}` : ''}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-ms-client-request-id': `${event.sessionId}_${Date.now()}`
          },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        throw new Error(`Azure Functions error: ${response.status}`);
      }

      console.log('📊 Event processed by Azure Functions');
    } catch (error) {
      console.error('❌ Failed to send event to Azure Functions:', error);
      this.saveToLocalStorage(event);
    }
  }

  async saveSession(session: SessionData): Promise<void> {
    const payload = {
      type: 'session',
      data: session,
      timestamp: new Date().toISOString()
    };

    try {
      const response = await fetch(
        `${this.config.functionAppUrl}/api/analytics-session${this.config.functionKey ? `?code=${this.config.functionKey}` : ''}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-ms-client-request-id': session.sessionId
          },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        throw new Error(`Azure Functions error: ${response.status}`);
      }

      console.log('📊 Session processed by Azure Functions');
    } catch (error) {
      console.error('❌ Failed to send session to Azure Functions:', error);
    }
  }

  private saveToLocalStorage(event: AnalyticsEvent): void {
    const events = JSON.parse(localStorage.getItem('functions_fallback_events') || '[]');
    events.push(event);
    localStorage.setItem('functions_fallback_events', JSON.stringify(events.slice(-100)));
  }
}

// Factory function to create Azure storage adapters
export const createAzureStorageAdapter = (
  type: 'table' | 'cosmos' | 'functions',
  config: AzureTableConfig | AzureCosmosConfig | AzureFunctionsConfig
): StorageAdapter => {
  switch (type) {
    case 'table':
      return new AzureTableStorageAdapter(config as AzureTableConfig);
    case 'cosmos':
      return new AzureCosmosAdapter(config as AzureCosmosConfig);
    case 'functions':
      return new AzureFunctionsAdapter(config as AzureFunctionsConfig);
    default:
      throw new Error(`Unsupported Azure storage type: ${type}`);
  }
};
