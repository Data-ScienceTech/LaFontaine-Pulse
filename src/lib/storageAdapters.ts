/**
 * Storage Adapters Interface for Analytics Data
 * Supports multiple backend storage options
 */

export interface AnalyticsEvent {
  event: string;
  timestamp: string;
  sessionId: string;
  data?: Record<string, any>;
}

export interface SessionData {
  sessionId: string;
  startTime: string;
  endTime?: string;
  language: string;
  timezone: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  screenSize: string;
  consentGiven: boolean;
  consentTime?: string;
}

export interface StorageAdapter {
  saveEvent(event: AnalyticsEvent): Promise<void>;
  saveSession(session: SessionData): Promise<void>;
}

/**
 * Local Storage Adapter - Privacy-first, data stays on device
 */
export class LocalStorageAdapter implements StorageAdapter {
  private eventsKey = 'noise_pulse_events';
  private sessionsKey = 'noise_pulse_sessions';
  private maxEvents = 1000; // Limit stored events

  async saveEvent(event: AnalyticsEvent): Promise<void> {
    try {
      const events = this.getStoredEvents();
      events.push(event);
      
      // Keep only the most recent events
      const recentEvents = events.slice(-this.maxEvents);
      
      localStorage.setItem(this.eventsKey, JSON.stringify(recentEvents));
      console.log('📊 Event saved to local storage');
    } catch (error) {
      console.error('❌ Failed to save event to local storage:', error);
    }
  }

  async saveSession(session: SessionData): Promise<void> {
    try {
      const sessions = this.getStoredSessions();
      
      // Update existing session or add new one
      const existingIndex = sessions.findIndex(s => s.sessionId === session.sessionId);
      if (existingIndex >= 0) {
        sessions[existingIndex] = session;
      } else {
        sessions.push(session);
      }
      
      // Keep only recent sessions (last 50)
      const recentSessions = sessions.slice(-50);
      
      localStorage.setItem(this.sessionsKey, JSON.stringify(recentSessions));
      console.log('📊 Session saved to local storage');
    } catch (error) {
      console.error('❌ Failed to save session to local storage:', error);
    }
  }

  getStoredEvents(): AnalyticsEvent[] {
    try {
      const stored = localStorage.getItem(this.eventsKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  getStoredSessions(): SessionData[] {
    try {
      const stored = localStorage.getItem(this.sessionsKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // Get analytics summary for the current session
  getAnalyticsSummary(): any {
    const events = this.getStoredEvents();
    const sessions = this.getStoredSessions();
    
    const currentSession = sessions[sessions.length - 1];
    const sessionEvents = events.filter(e => e.sessionId === currentSession?.sessionId);
    
    return {
      totalEvents: events.length,
      currentSessionEvents: sessionEvents.length,
      totalSessions: sessions.length,
      languages: [...new Set(sessions.map(s => s.language))],
      deviceTypes: [...new Set(sessions.map(s => s.deviceType))],
      lastActivity: events[events.length - 1]?.timestamp
    };
  }

  // Clear all stored data (for privacy/GDPR compliance)
  clearAllData(): void {
    localStorage.removeItem(this.eventsKey);
    localStorage.removeItem(this.sessionsKey);
    console.log('🗑️ All analytics data cleared');
  }
}

/**
 * IndexedDB Adapter - For larger datasets while keeping data local
 */
export class IndexedDBAdapter implements StorageAdapter {
  private dbName = 'NoisePulseAnalytics';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create events store
        if (!db.objectStoreNames.contains('events')) {
          const eventsStore = db.createObjectStore('events', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          eventsStore.createIndex('sessionId', 'sessionId', { unique: false });
          eventsStore.createIndex('timestamp', 'timestamp', { unique: false });
          eventsStore.createIndex('event', 'event', { unique: false });
        }
        
        // Create sessions store
        if (!db.objectStoreNames.contains('sessions')) {
          const sessionsStore = db.createObjectStore('sessions', { 
            keyPath: 'sessionId' 
          });
          sessionsStore.createIndex('startTime', 'startTime', { unique: false });
        }
      };
    });
  }

  async saveEvent(event: AnalyticsEvent): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['events'], 'readwrite');
      const store = transaction.objectStore('events');
      
      const eventWithId = { ...event, id: Date.now() + Math.random() };
      const request = store.add(eventWithId);
      
      request.onsuccess = () => {
        console.log('📊 Event saved to IndexedDB');
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  async saveSession(session: SessionData): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sessions'], 'readwrite');
      const store = transaction.objectStore('sessions');
      
      const request = store.put(session);
      
      request.onsuccess = () => {
        console.log('📊 Session saved to IndexedDB');
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }
}

/**
 * HTTP API Adapter - For custom backend endpoints
 */
export class HttpApiAdapter implements StorageAdapter {
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl: string, apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  async saveEvent(event: AnalyticsEvent): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify(event)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('📊 Event saved to HTTP API');
    } catch (error) {
      console.error('❌ Failed to save event to HTTP API:', error);
      // Fallback to local storage
      await new LocalStorageAdapter().saveEvent(event);
    }
  }

  async saveSession(session: SessionData): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify(session)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('📊 Session saved to HTTP API');
    } catch (error) {
      console.error('❌ Failed to save session to HTTP API:', error);
      // Fallback to local storage
      await new LocalStorageAdapter().saveSession(session);
    }
  }
}
