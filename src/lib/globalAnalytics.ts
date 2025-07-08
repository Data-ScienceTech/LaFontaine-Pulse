// Global analytics service that aggregates data from all users
// This service provides multiple backend options for collecting analytics

export interface AnalyticsEvent {
  siteId: string;
  sessionId: string;
  eventType: string;
  timestamp: string;
  url: string;
  referrer: string;
  userAgent: string;
  language: string;
  screenSize: string;
  windowSize: string;
  timezone: string;
  data: any;
}

export interface GlobalAnalyticsConfig {
  method: 'webhook' | 'supabase' | 'firebase' | 'localStorage';
  webhookUrl?: string;
  supabaseConfig?: {
    url: string;
    anonKey: string;
  };
  firebaseConfig?: any;
}

class GlobalAnalyticsService {
  private config: GlobalAnalyticsConfig;

  constructor(config: GlobalAnalyticsConfig) {
    this.config = config;
  }

  async sendEvent(event: AnalyticsEvent): Promise<boolean> {
    try {
      switch (this.config.method) {
        case 'webhook':
          return await this.sendToWebhook(event);
        case 'supabase':
          return await this.sendToSupabase(event);
        case 'firebase':
          return await this.sendToFirebase(event);
        case 'localStorage':
        default:
          return this.sendToLocalStorage(event);
      }
    } catch (error) {
      console.debug('Analytics error:', error);
      // Fallback to localStorage
      return this.sendToLocalStorage(event);
    }
  }

  private async sendToWebhook(event: AnalyticsEvent): Promise<boolean> {
    if (!this.config.webhookUrl) return false;

    try {
      const response = await fetch(this.config.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...event,
          timestamp: new Date().toISOString(),
          source: 'lafontaine-noise-pulse'
        })
      });

      return response.ok;
    } catch (error) {
      console.debug('Webhook send failed:', error);
      return false;
    }
  }

  private async sendToSupabase(event: AnalyticsEvent): Promise<boolean> {
    if (!this.config.supabaseConfig) return false;

    try {
      const response = await fetch(`${this.config.supabaseConfig.url}/rest/v1/analytics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.config.supabaseConfig.anonKey,
          'Authorization': `Bearer ${this.config.supabaseConfig.anonKey}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(event)
      });

      return response.ok;
    } catch (error) {
      console.debug('Supabase send failed:', error);
      return false;
    }
  }

  private async sendToFirebase(event: AnalyticsEvent): Promise<boolean> {
    // Implement Firebase Firestore sending
    // This would require Firebase SDK to be loaded
    console.debug('Firebase analytics not implemented yet');
    return false;
  }

  private sendToLocalStorage(event: AnalyticsEvent): boolean {
    try {
      const key = 'lafontaine_global_analytics';
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      existing.push(event);
      
      // Keep only last 5000 events
      if (existing.length > 5000) {
        existing.splice(0, existing.length - 5000);
      }
      
      localStorage.setItem(key, JSON.stringify(existing));
      return true;
    } catch (error) {
      console.debug('LocalStorage send failed:', error);
      return false;
    }
  }

  async getGlobalAnalytics(): Promise<AnalyticsEvent[]> {
    try {
      switch (this.config.method) {
        case 'webhook':
          return await this.getFromWebhook();
        case 'supabase':
          return await this.getFromSupabase();
        case 'firebase':
          return await this.getFromFirebase();
        case 'localStorage':
        default:
          return this.getFromLocalStorage();
      }
    } catch (error) {
      console.debug('Failed to get global analytics:', error);
      return this.getFromLocalStorage();
    }
  }

  private async getFromWebhook(): Promise<AnalyticsEvent[]> {
    if (!this.config.webhookUrl) return [];

    try {
      // Replace /api/analytics with /api/analytics for GET requests
      const getUrl = this.config.webhookUrl.replace('/api/analytics', '/api/analytics?siteId=lafontaine-noise-pulse&limit=1000');
      
      const response = await fetch(getUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.events || [];
      }
    } catch (error) {
      console.debug('Failed to get from webhook:', error);
    }
    
    return [];
  }

  private async getFromSupabase(): Promise<AnalyticsEvent[]> {
    if (!this.config.supabaseConfig) return [];

    try {
      const response = await fetch(
        `${this.config.supabaseConfig.url}/rest/v1/analytics?order=timestamp.desc&limit=1000`,
        {
          headers: {
            'apikey': this.config.supabaseConfig.anonKey,
            'Authorization': `Bearer ${this.config.supabaseConfig.anonKey}`,
          }
        }
      );

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.debug('Failed to get from Supabase:', error);
    }
    
    return [];
  }

  private async getFromFirebase(): Promise<AnalyticsEvent[]> {
    // Implement Firebase Firestore querying
    console.debug('Firebase analytics retrieval not implemented yet');
    return [];
  }

  private getFromLocalStorage(): AnalyticsEvent[] {
    try {
      return JSON.parse(localStorage.getItem('lafontaine_global_analytics') || '[]');
    } catch (error) {
      console.debug('Failed to get from localStorage:', error);
      return [];
    }
  }
}

// Configuration for different backends
export const analyticsConfigs = {
  // Azure Container Apps API (production)
  azure: {
    method: 'webhook' as const,
    webhookUrl: 'https://ca-wcqu6ch7fild4.calmmushroom-85bd2862.eastus2.azurecontainerapps.io/api/analytics'
  },

  // Free webhook service (Pipedream, Zapier, etc.)
  webhook: {
    method: 'webhook' as const,
    webhookUrl: 'https://eo9x1234example.m.pipedream.net' // Replace with your webhook URL
  },

  // Free Supabase (generous free tier)
  supabase: {
    method: 'supabase' as const,
    supabaseConfig: {
      url: 'https://your-project.supabase.co', // Replace with your Supabase URL
      anonKey: 'your-anon-key' // Replace with your Supabase anon key
    }
  },

  // Local storage fallback
  localStorage: {
    method: 'localStorage' as const
  }
};

// Default global analytics instance - always use Azure backend for real-time data collection
const defaultConfig = analyticsConfigs.azure;

export const globalAnalytics = new GlobalAnalyticsService(defaultConfig);

// Function to reconfigure the global analytics service
export function configureGlobalAnalytics(config: GlobalAnalyticsConfig) {
  const newService = new GlobalAnalyticsService(config);
  Object.setPrototypeOf(globalAnalytics, newService);
  Object.assign(globalAnalytics, newService);
}
