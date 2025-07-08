const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: [
    'https://lafontaine.datasciencetech.ca',
    'https://data-sciencetech.github.io',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parser
app.use(express.json({ limit: '1mb' }));

// In-memory storage for demo purposes
// In production, this should be replaced with a database
let analyticsData = [];

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'lafontaine-analytics-api'
  });
});

// Analytics collection endpoint
app.post('/api/analytics', (req, res) => {
  try {
    const event = req.body;
    
    // Basic validation
    if (!event || !event.siteId || !event.eventType) {
      return res.status(400).json({ 
        error: 'Invalid event data',
        required: ['siteId', 'eventType']
      });
    }

    // Add server timestamp and ID
    const enrichedEvent = {
      ...event,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      serverTimestamp: new Date().toISOString(),
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent') || ''
    };

    // Store event (in production, save to database)
    analyticsData.push(enrichedEvent);
    
    // Keep only last 10000 events to prevent memory issues
    if (analyticsData.length > 10000) {
      analyticsData = analyticsData.slice(-10000);
    }

    console.log(`Analytics event received: ${event.eventType} from ${event.siteId}`);

    res.json({ 
      success: true, 
      eventId: enrichedEvent.id,
      timestamp: enrichedEvent.serverTimestamp
    });

  } catch (error) {
    console.error('Error processing analytics event:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to process analytics event'
    });
  }
});

// Analytics retrieval endpoint (for admin dashboard)
app.get('/api/analytics', (req, res) => {
  try {
    const { siteId, limit = 1000, eventType } = req.query;
    
    let filteredData = analyticsData;
    
    // Filter by siteId if provided
    if (siteId) {
      filteredData = filteredData.filter(event => event.siteId === siteId);
    }
    
    // Filter by eventType if provided
    if (eventType) {
      filteredData = filteredData.filter(event => event.eventType === eventType);
    }
    
    // Sort by timestamp (newest first) and limit results
    const sortedData = filteredData
      .sort((a, b) => new Date(b.serverTimestamp) - new Date(a.serverTimestamp))
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      count: sortedData.length,
      total: analyticsData.length,
      events: sortedData
    });

  } catch (error) {
    console.error('Error retrieving analytics data:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to retrieve analytics data'
    });
  }
});

// Analytics summary endpoint
app.get('/api/analytics/summary', (req, res) => {
  try {
    const { siteId } = req.query;
    
    let filteredData = analyticsData;
    if (siteId) {
      filteredData = filteredData.filter(event => event.siteId === siteId);
    }

    // Calculate summary statistics
    const summary = {
      totalEvents: filteredData.length,
      uniqueSessions: new Set(filteredData.map(e => e.sessionId)).size,
      eventTypes: {},
      pages: {},
      languages: {},
      lastUpdated: new Date().toISOString()
    };

    // Count event types
    filteredData.forEach(event => {
      summary.eventTypes[event.eventType] = (summary.eventTypes[event.eventType] || 0) + 1;
      
      if (event.url) {
        summary.pages[event.url] = (summary.pages[event.url] || 0) + 1;
      }
      
      if (event.language) {
        summary.languages[event.language] = (summary.languages[event.language] || 0) + 1;
      }
    });

    res.json({
      success: true,
      summary
    });

  } catch (error) {
    console.error('Error generating analytics summary:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to generate analytics summary'
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    message: 'The requested endpoint does not exist'
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: 'An unexpected error occurred'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`LaFontaine Analytics API listening on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});
