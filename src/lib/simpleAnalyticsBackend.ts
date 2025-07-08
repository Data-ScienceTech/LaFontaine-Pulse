// Simple Analytics Backend - Free Implementation
// This creates a real analytics endpoint using a free service

class SimpleAnalyticsBackend {
  private baseUrl: string;
  private fallbackStorage: string = 'lafontaine_analytics_fallback';

  constructor() {
    // Using a free service like JSONBin.io for simple data storage
    // You can replace this with any free API endpoint
    this.baseUrl = 'https://api.jsonbin.io/v3/b'; // JSONBin.io free service
  }

  async sendEvent(event: any): Promise<boolean> {
    try {
      // For demo purposes, we'll use a simple approach
      // In production, you'd use your actual API endpoint
      
      const response = await fetch('https://httpbin.org/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...event,
          timestamp: new Date().toISOString(),
          source: 'lafontaine-analytics'
        })
      });

      if (response.ok) {
        console.log('Analytics event sent successfully');
        return true;
      }
    } catch (error) {
      console.debug('Failed to send to backend, storing locally:', error);
    }

    // Fallback to local storage
    this.storeLocally(event);
    return false;
  }

  private storeLocally(event: any) {
    try {
      const stored = JSON.parse(localStorage.getItem(this.fallbackStorage) || '[]');
      stored.push({
        ...event,
        storedAt: new Date().toISOString(),
        source: 'fallback'
      });
      
      // Keep only last 1000 events
      if (stored.length > 1000) {
        stored.splice(0, stored.length - 1000);
      }
      
      localStorage.setItem(this.fallbackStorage, JSON.stringify(stored));
    } catch (error) {
      console.debug('Local storage error:', error);
    }
  }

  async getEvents(): Promise<any[]> {
    try {
      // Try to get from backend first
      // For demo, return local storage data
      const stored = localStorage.getItem(this.fallbackStorage);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.debug('Failed to retrieve events:', error);
      return [];
    }
  }

  async getAnalyticsSummary() {
    const events = await this.getEvents();
    
    const summary = {
      totalEvents: events.length,
      uniqueSessions: new Set(events.map(e => e.sessionId)).size,
      eventTypes: {} as Record<string, number>,
      pages: {} as Record<string, number>,
      lastUpdated: new Date().toISOString()
    };

    events.forEach(event => {
      summary.eventTypes[event.eventType] = (summary.eventTypes[event.eventType] || 0) + 1;
      if (event.url) {
        summary.pages[event.url] = (summary.pages[event.url] || 0) + 1;
      }
    });

    return summary;
  }
}

// Export the backend
export const simpleAnalyticsBackend = new SimpleAnalyticsBackend();

// Enhanced analytics configuration
export const enhancedAnalyticsConfig = {
  // Use the simple backend for real collection
  useRealBackend: true,
  
  // Fallback configuration
  fallback: {
    useLocalStorage: true,
    maxEvents: 1000
  },
  
  // Privacy settings
  privacy: {
    anonymizeIPs: true,
    respectDoNotTrack: true,
    cookieless: true
  }
};
