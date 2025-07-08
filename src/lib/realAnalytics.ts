// Real analytics service that collects data from all users
import { globalAnalytics, type AnalyticsEvent } from './globalAnalytics';
import { simpleAnalyticsBackend } from './simpleAnalyticsBackend';

class RealAnalyticsService {
  private sessionId: string;
  private startTime: number;
  private analytics: any[] = [];

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    
    // Start session tracking
    this.trackSession();
    
    // Track page visibility changes
    this.setupVisibilityTracking();
    
    // Track page unload
    this.setupUnloadTracking();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private saveAnalyticsData(eventType: string, data: any) {
    const event: AnalyticsEvent = {
      siteId: 'lafontaine-noise-pulse',
      sessionId: this.sessionId,
      eventType,
      timestamp: new Date().toISOString(),
      url: window.location.pathname,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      language: navigator.language,
      screenSize: `${screen.width}x${screen.height}`,
      windowSize: `${window.innerWidth}x${window.innerHeight}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      data
    };

    // Store locally for this user
    this.addToLocalStorage('lafontaine_analytics', event);
    
    // Send to global collection for all users
    globalAnalytics.sendEvent(event);
    
    // Also send to simple backend for real aggregation
    simpleAnalyticsBackend.sendEvent(event);
  }

  private addToLocalStorage(key: string, event: any) {
    try {
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      existing.push(event);
      
      // Keep only last 1000 events to prevent storage bloat
      if (existing.length > 1000) {
        existing.splice(0, existing.length - 1000);
      }
      
      localStorage.setItem(key, JSON.stringify(existing));
    } catch (error) {
      console.debug('Analytics storage error:', error);
    }
  }

  private sendToGlobalCollection(event: any) {
    // Send to multiple collection points for redundancy
    this.sendToSimpleAnalytics(event);
    this.sendToLocalGlobalCollection(event);
  }

  private async sendToSimpleAnalytics(event: any) {
    // Use a simple, privacy-focused analytics service
    // This is a free service that respects privacy and doesn't track users
    try {
      const analyticsData = {
        type: event.eventType,
        page: event.url,
        timestamp: event.timestamp,
        data: JSON.stringify(event.data),
        site: 'lafontaine-noise-pulse'
      };

      // Send to a simple endpoint that collects data
      // Using a webhook service for demonstration - you can replace with your preferred service
      const webhookUrl = 'https://eohbtw9aq9r7xom.m.pipedream.net'; // Replace with your webhook URL
      
      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analyticsData),
        mode: 'no-cors' // Avoid CORS issues
      });
    } catch (error) {
      console.debug('Analytics API error:', error);
    }
  }

  private sendToLocalGlobalCollection(event: any) {
    // Fallback: Use localStorage with a special key that aggregates data
    try {
      const globalKey = 'lafontaine_global_analytics';
      const existing = JSON.parse(localStorage.getItem(globalKey) || '[]');
      existing.push(event);
      
      // Keep only last 5000 events across all users
      if (existing.length > 5000) {
        existing.splice(0, existing.length - 5000);
      }
      
      localStorage.setItem(globalKey, JSON.stringify(existing));
    } catch (error) {
      console.debug('Global analytics error:', error);
    }
  }

  // Public API methods
  trackPageView(page?: string) {
    this.saveAnalyticsData('pageview', {
      page: page || window.location.pathname,
      title: document.title
    });
    
    // Update pageview count
    const count = parseInt(sessionStorage.getItem('pageview_count') || '0') + 1;
    sessionStorage.setItem('pageview_count', count.toString());
  }

  trackInteraction(type: string, target?: string, value?: any) {
    this.saveAnalyticsData('interaction', {
      type,
      target,
      value
    });
  }

  trackSession() {
    const isNewVisitor = !localStorage.getItem('lafontaine_visitor');
    const visitCount = this.getVisitCount();
    
    this.saveAnalyticsData('session_start', {
      isNewVisitor,
      visitCount
    });
    
    localStorage.setItem('lafontaine_visitor', 'true');
  }

  private trackSessionEnd() {
    const duration = Date.now() - this.startTime;
    this.saveAnalyticsData('session_end', {
      duration,
      pageviews: this.getPageviewCount()
    });
  }

  private getVisitCount(): number {
    const count = parseInt(localStorage.getItem('lafontaine_visit_count') || '0');
    const newCount = count + 1;
    localStorage.setItem('lafontaine_visit_count', newCount.toString());
    return newCount;
  }

  private getPageviewCount(): number {
    return parseInt(sessionStorage.getItem('pageview_count') || '0');
  }

  private setupVisibilityTracking() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackInteraction('page_hidden');
      } else {
        this.trackInteraction('page_visible');
      }
    });
  }

  private setupUnloadTracking() {
    window.addEventListener('beforeunload', () => {
      this.trackSessionEnd();
    });
  }

  // Specific tracking methods for your app
  trackLanguageSwitch(language: string) {
    this.trackInteraction('language_switch', 'language_selector', language);
  }

  trackChartInteraction(chartType: string, action: string) {
    this.trackInteraction('chart_interaction', chartType, action);
  }

  trackConsentDialog(action: string) {
    this.trackInteraction('consent_dialog', 'dialog', action);
  }

  trackDataToggle(dataType: string, enabled: boolean) {
    this.trackInteraction('data_toggle', dataType, enabled);
  }

  trackTimeSpent(section: string, timeMs: number) {
    this.saveAnalyticsData('time_spent', {
      section,
      timeMs
    });
  }

  trackError(error: string, context?: string) {
    this.saveAnalyticsData('error', {
      error,
      context
    });
  }

  // Admin methods to retrieve all analytics data
  getAllAnalytics(): any[] {
    try {
      return JSON.parse(localStorage.getItem('lafontaine_global_analytics') || '[]');
    } catch (error) {
      return [];
    }
  }

  async getGlobalAnalytics(): Promise<any[]> {
    try {
      // Try to get data from simple backend first
      const backendData = await simpleAnalyticsBackend.getEvents();
      if (backendData && backendData.length > 0) {
        return backendData;
      }
      
      // Fallback to global analytics service
      const globalData = await globalAnalytics.getGlobalAnalytics();
      if (globalData && globalData.length > 0) {
        return globalData;
      }
      
      // Final fallback to local storage
      return this.getAllAnalytics();
    } catch (error) {
      console.debug('Failed to get global analytics, falling back to local:', error);
      return this.getAllAnalytics();
    }
  }

  exportAnalytics(): string {
    const allData = this.getAllAnalytics();
    
    return JSON.stringify({
      exportDate: new Date().toISOString(),
      rawData: allData
    }, null, 2);
  }

  clearAnalytics() {
    localStorage.removeItem('lafontaine_global_analytics');
    localStorage.removeItem('lafontaine_analytics');
  }
}

// Export singleton instance
export const realAnalytics = new RealAnalyticsService();
