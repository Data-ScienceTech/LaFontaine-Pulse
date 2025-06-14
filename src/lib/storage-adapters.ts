/**
 * Storage adapters for analytics data
 * Supports local storage, Supabase, and custom APIs
 */

export interface StorageAdapter {
  store(event: any): Promise<void>;
  storeSession(session: any): Promise<void>;
  isAvailable(): boolean;
  getName(): string;
}

/**
 * Local Storage Adapter - Stores data locally in browser
 * Good for privacy-first approach and immediate implementation
 */
export class LocalStorageAdapter implements StorageAdapter {
  private readonly EVENTS_KEY = 'papineau_analytics_events';
  private readonly SESSIONS_KEY = 'papineau_analytics_sessions';
  private readonly MAX_EVENTS = 1000; // Prevent infinite growth

  async store(event: any): Promise<void> {
    try {
      const events = this.getStoredEvents();
      events.push({
        ...event,
        stored_at: new Date().toISOString()
      });

      // Keep only the most recent events
      if (events.length > this.MAX_EVENTS) {
        events.splice(0, events.length - this.MAX_EVENTS);
      }

      localStorage.setItem(this.EVENTS_KEY, JSON.stringify(events));
      console.log('📱 Event stored locally:', event.event);
    } catch (error) {
      console.warn('Failed to store event locally:', error);
    }
  }

  async storeSession(session: any): Promise<void> {
    try {
      const sessions = this.getStoredSessions();
      const existingIndex = sessions.findIndex(s => s.sessionId === session.sessionId);
      
      if (existingIndex >= 0) {
        sessions[existingIndex] = { ...session, updated_at: new Date().toISOString() };
      } else {
        sessions.push({ ...session, created_at: new Date().toISOString() });
      }

      // Keep only last 50 sessions
      if (sessions.length > 50) {
        sessions.splice(0, sessions.length - 50);
      }

      localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(sessions));
      console.log('📱 Session stored locally:', session.sessionId);
    } catch (error) {
      console.warn('Failed to store session locally:', error);
    }
  }

  isAvailable(): boolean {
    try {
      const test = 'test';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  getName(): string {
    return 'localStorage';
  }

  // Helper methods for data retrieval
  getStoredEvents(): any[] {
    try {
      const data = localStorage.getItem(this.EVENTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  getStoredSessions(): any[] {
    try {
      const data = localStorage.getItem(this.SESSIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  // Get analytics summary for display
  getAnalyticsSummary() {
    const events = this.getStoredEvents();
    const sessions = this.getStoredSessions();
    
    return {
      totalEvents: events.length,
      totalSessions: sessions.length,
      lastEventDate: events.length > 0 ? events[events.length - 1].timestamp : null,
      eventTypes: [...new Set(events.map(e => e.event))],
      storageSize: this.calculateStorageSize()
    };
  }

  private calculateStorageSize(): string {
    const events = JSON.stringify(this.getStoredEvents());
    const sessions = JSON.stringify(this.getStoredSessions());
    const totalBytes = events.length + sessions.length;
    
    if (totalBytes < 1024) return `${totalBytes} bytes`;
    if (totalBytes < 1024 * 1024) return `${(totalBytes / 1024).toFixed(1)} KB`;
    return `${(totalBytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  // Clear all stored data
  clearAllData(): void {
    localStorage.removeItem(this.EVENTS_KEY);
    localStorage.removeItem(this.SESSIONS_KEY);
    console.log('🗑️ All local analytics data cleared');
  }
}

/**
 * Supabase Adapter - For when you set up Supabase backend
 */
export class SupabaseAdapter implements StorageAdapter {
  private supabase: any = null;
  private isInitialized: boolean = false;

  constructor(supabaseUrl?: string, supabaseKey?: string) {
    // Only initialize if credentials are provided
    if (supabaseUrl && supabaseKey) {
      this.initializeSupabase(supabaseUrl, supabaseKey);
    }
  }

  private async initializeSupabase(url: string, key: string) {
    try {
      // Dynamic import to avoid bundle issues if Supabase isn't installed
      const { createClient } = await import('@supabase/supabase-js');
      this.supabase = createClient(url, key);
      this.isInitialized = true;
      console.log('✅ Supabase analytics adapter initialized');
    } catch (error) {
      console.warn('❌ Failed to initialize Supabase:', error);
      this.isInitialized = false;
    }
  }

  async store(event: any): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error('Supabase not available');
    }

    try {
      const { error } = await this.supabase
        .from('analytics_events')
        .insert([{
          event_type: event.event,
          session_id: event.sessionId,
          timestamp: event.timestamp,
          data: event.data,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;
      console.log('🚀 Event stored in Supabase:', event.event);
    } catch (error) {
      console.error('Failed to store event in Supabase:', error);
      throw error;
    }
  }

  async storeSession(session: any): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error('Supabase not available');
    }

    try {
      const { error } = await this.supabase
        .from('analytics_sessions')
        .upsert([{
          session_id: session.sessionId,
          start_time: session.startTime,
          end_time: session.endTime,
          language: session.language,
          timezone: session.timezone,
          device_type: session.deviceType,
          screen_size: session.screenSize,
          consent_given: session.consentGiven,
          consent_time: session.consentTime,
          updated_at: new Date().toISOString()
        }], { onConflict: 'session_id' });

      if (error) throw error;
      console.log('🚀 Session stored in Supabase:', session.sessionId);
    } catch (error) {
      console.error('Failed to store session in Supabase:', error);
      throw error;
    }
  }

  isAvailable(): boolean {
    return this.isInitialized && this.supabase !== null;
  }

  getName(): string {
    return 'Supabase';
  }
}

/**
 * HTTP API Adapter - For custom backends
 */
export class HTTPAdapter implements StorageAdapter {
  private apiUrl: string;
  private apiKey?: string;

  constructor(apiUrl: string, apiKey?: string) {
    this.apiUrl = apiUrl.replace(/\/$/, ''); // Remove trailing slash
    this.apiKey = apiKey;
  }

  async store(event: any): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify({
          ...event,
          stored_at: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('🌐 Event stored via HTTP API:', event.event);
    } catch (error) {
      console.error('Failed to store event via HTTP API:', error);
      throw error;
    }
  }

  async storeSession(session: any): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify({
          ...session,
          stored_at: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('🌐 Session stored via HTTP API:', session.sessionId);
    } catch (error) {
      console.error('Failed to store session via HTTP API:', error);
      throw error;
    }
  }

  isAvailable(): boolean {
    return Boolean(this.apiUrl);
  }

  getName(): string {
    return `HTTP API (${this.apiUrl})`;
  }
}

/**
 * Multi-adapter that tries storage methods in order
 */
export class MultiStorageAdapter implements StorageAdapter {
  private adapters: StorageAdapter[];
  private primaryAdapter: StorageAdapter | null = null;

  constructor(adapters: StorageAdapter[]) {
    this.adapters = adapters;
    this.findPrimaryAdapter();
  }

  private findPrimaryAdapter(): void {
    this.primaryAdapter = this.adapters.find(adapter => adapter.isAvailable()) || null;
    if (this.primaryAdapter) {
      console.log(`📊 Using storage adapter: ${this.primaryAdapter.getName()}`);
    } else {
      console.warn('⚠️ No storage adapters available!');
    }
  }

  async store(event: any): Promise<void> {
    if (!this.primaryAdapter) {
      console.warn('No storage adapter available for event:', event.event);
      return;
    }

    try {
      await this.primaryAdapter.store(event);
    } catch (error) {
      console.error(`Primary adapter (${this.primaryAdapter.getName()}) failed, trying fallbacks:`, error);
      
      // Try other adapters as fallbacks
      for (const adapter of this.adapters) {
        if (adapter !== this.primaryAdapter && adapter.isAvailable()) {
          try {
            await adapter.store(event);
            console.log(`✅ Fallback storage successful with ${adapter.getName()}`);
            return;
          } catch (fallbackError) {
            console.warn(`Fallback ${adapter.getName()} also failed:`, fallbackError);
          }
        }
      }
      
      console.error('❌ All storage adapters failed for event:', event.event);
    }
  }

  async storeSession(session: any): Promise<void> {
    if (!this.primaryAdapter) {
      console.warn('No storage adapter available for session:', session.sessionId);
      return;
    }

    try {
      await this.primaryAdapter.storeSession(session);
    } catch (error) {
      console.error(`Primary adapter (${this.primaryAdapter.getName()}) failed for session, trying fallbacks:`, error);
      
      // Try other adapters as fallbacks
      for (const adapter of this.adapters) {
        if (adapter !== this.primaryAdapter && adapter.isAvailable()) {
          try {
            await adapter.storeSession(session);
            console.log(`✅ Fallback session storage successful with ${adapter.getName()}`);
            return;
          } catch (fallbackError) {
            console.warn(`Fallback ${adapter.getName()} also failed:`, fallbackError);
          }
        }
      }
      
      console.error('❌ All storage adapters failed for session:', session.sessionId);
    }
  }

  isAvailable(): boolean {
    return this.primaryAdapter !== null;
  }

  getName(): string {
    return this.primaryAdapter ? this.primaryAdapter.getName() : 'None available';
  }

  // Get the localStorage adapter for local data access
  getLocalStorageAdapter(): LocalStorageAdapter | null {
    return this.adapters.find(adapter => adapter instanceof LocalStorageAdapter) as LocalStorageAdapter || null;
  }
}
