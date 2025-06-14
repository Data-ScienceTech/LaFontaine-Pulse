/**
 * Privacy-compliant analytics utility for Papineau Noise Pulse
 * Collects only anonymized environmental and usage data as per consent
 * Now supports Azure storage backends
 */

import { 
  StorageAdapter, 
  LocalStorageAdapter,
  type AnalyticsEvent,
  type SessionData
} from './storageAdapters';
import { createAzureStorageAdapter } from './azureStorage';

class AnalyticsService {
  private sessionId: string;
  private sessionData: SessionData;
  private events: AnalyticsEvent[] = [];
  private isEnabled: boolean = false;
  private storage: StorageAdapter;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionData = {
      sessionId: this.sessionId,
      startTime: new Date().toISOString(),
      language: this.detectLanguage(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      deviceType: this.detectDeviceType(),
      screenSize: `${window.screen.width}x${window.screen.height}`,
      consentGiven: false,
    };

    // Initialize storage adapter
    this.initializeStorage();
  }

  private initializeStorage(): void {
    // Check for Azure configuration in environment variables
    const azureTableAccount = import.meta.env?.VITE_AZURE_TABLE_ACCOUNT;
    const azureTableKey = import.meta.env?.VITE_AZURE_TABLE_KEY;
    const azureTableSAS = import.meta.env?.VITE_AZURE_TABLE_SAS;
    
    const azureCosmosEndpoint = import.meta.env?.VITE_AZURE_COSMOS_ENDPOINT;
    const azureCosmosKey = import.meta.env?.VITE_AZURE_COSMOS_KEY;
    
    const azureFunctionsUrl = import.meta.env?.VITE_AZURE_FUNCTIONS_URL;
    const azureFunctionsKey = import.meta.env?.VITE_AZURE_FUNCTIONS_KEY;

    try {
      if (azureTableAccount && (azureTableKey || azureTableSAS)) {
        // Use Azure Table Storage
        this.storage = createAzureStorageAdapter('table', {
          accountName: azureTableAccount,
          accountKey: azureTableKey,
          sasToken: azureTableSAS,
          tableName: 'analyticsdata'
        });
        console.log('📊 Using Azure Table Storage for analytics');
        
      } else if (azureCosmosEndpoint && azureCosmosKey) {
        // Use Azure Cosmos DB
        this.storage = createAzureStorageAdapter('cosmos', {
          endpoint: azureCosmosEndpoint,
          key: azureCosmosKey,
          databaseName: 'noise-pulse',
          containerName: 'analytics'
        });
        console.log('📊 Using Azure Cosmos DB for analytics');
        
      } else if (azureFunctionsUrl) {
        // Use Azure Functions
        this.storage = createAzureStorageAdapter('functions', {
          functionAppUrl: azureFunctionsUrl,
          functionKey: azureFunctionsKey
        });
        console.log('📊 Using Azure Functions for analytics');
        
      } else {
        // Fallback to local storage
        this.storage = new LocalStorageAdapter();
        console.log('📊 Using local storage for analytics (no Azure config found)');
      }
    } catch (error) {
      console.warn('⚠️ Failed to initialize Azure storage, falling back to local storage:', error);
      this.storage = new LocalStorageAdapter();
    }
  }

  private generateSessionId(): string {
    // Generate a random session ID (not tied to user identity)
    return 'sess_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  private detectLanguage(): string {
    return navigator.language.startsWith('fr') ? 'fr' : 'en';
  }

  private detectDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const width = window.screen.width;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  /**
   * Enable analytics after user consent
   */
  enableAnalytics(): void {
    this.isEnabled = true;
    this.sessionData.consentGiven = true;
    this.sessionData.consentTime = new Date().toISOString();
    this.trackEvent('consent_given');
    
    // Save session data to storage
    this.storage.saveSession(this.sessionData);
    
    console.log('📊 Analytics enabled - respecting user privacy');
  }

  /**
   * Track a custom event
   */
  trackEvent(event: string, data?: Record<string, any>): void {
    if (!this.isEnabled) return;

    const analyticsEvent: AnalyticsEvent = {
      event,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      data: data ? this.sanitizeData(data) : undefined,
    };

    this.events.push(analyticsEvent);
    
    // Save to storage backend
    this.storage.saveEvent(analyticsEvent);
    
    console.log('📊 Event tracked:', analyticsEvent);
  }

  /**
   * Track page/section views
   */
  trackPageView(page: string): void {
    this.trackEvent('page_view', { page });
  }

  /**
   * Track feature interactions
   */
  trackFeatureUsage(feature: string, action: string, data?: Record<string, any>): void {
    this.trackEvent('feature_usage', { 
      feature, 
      action, 
      ...data 
    });
  }

  /**
   * Track environmental data interactions
   */
  trackEnvironmentalInteraction(type: 'noise_chart' | 'ev_data' | 'noise_level', data?: Record<string, any>): void {
    this.trackEvent('environmental_interaction', { 
      type, 
      ...data 
    });
  }

  /**
   * Track session duration and end session
   */
  endSession(): void {
    if (!this.isEnabled) return;

    this.sessionData.endTime = new Date().toISOString();
    const duration = Date.now() - new Date(this.sessionData.startTime).getTime();
    
    this.trackEvent('session_end', {
      duration_seconds: Math.floor(duration / 1000),
      total_events: this.events.length,
    });

    // Update session in storage
    this.storage.saveSession(this.sessionData);

    console.log('📊 Session ended:', {
      ...this.sessionData,
      duration_seconds: Math.floor(duration / 1000),
      total_events: this.events.length,
    });
  }

  /**
   * Remove any potentially sensitive data
   */
  private sanitizeData(data: Record<string, any>): Record<string, any> {
    const sanitized = { ...data };
    
    // Remove any fields that might contain personal info
    delete sanitized.ip;
    delete sanitized.userAgent;
    delete sanitized.email;
    delete sanitized.name;
    
    return sanitized;
  }

  /**
   * Get anonymized session summary for debugging
   */
  getSessionSummary() {
    return {
      sessionId: this.sessionId.substring(0, 12) + '...', // Partial ID for debugging
      language: this.sessionData.language,
      deviceType: this.sessionData.deviceType,
      timezone: this.sessionData.timezone,
      consentGiven: this.sessionData.consentGiven,
      eventCount: this.events.length,
      isEnabled: this.isEnabled,
      storageType: this.storage.constructor.name,
    };
  }

  /**
   * Get storage adapter info for transparency
   */
  getStorageInfo() {
    return {
      type: this.storage.constructor.name,
      isAzure: this.storage.constructor.name.includes('Azure'),
      isLocal: this.storage.constructor.name.includes('Local'),
    };
  }
}

// Create singleton instance
export const analytics = new AnalyticsService();

// Automatically track page unload
window.addEventListener('beforeunload', () => {
  analytics.endSession();
});

// Track visibility changes (user switching tabs, etc.)
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    analytics.trackEvent('tab_hidden');
  } else {
    analytics.trackEvent('tab_visible');
  }
});

export default analytics;
