# LaFontaine Analytics API

A simple Node.js API for collecting and aggregating analytics data from the LaFontaine Noise Pulse web application.

## Features

- **Event Collection**: Collects analytics events from the frontend
- **Data Aggregation**: Aggregates and summarizes analytics data
- **Rate Limiting**: Prevents abuse with request rate limiting
- **CORS Support**: Configured for GitHub Pages and custom domain
- **Health Checks**: Provides health status endpoint
- **Security**: Includes security headers and input validation

## API Endpoints

### POST /api/analytics
Collects analytics events from the frontend.

**Request Body:**
```json
{
  "siteId": "lafontaine-noise-pulse",
  "sessionId": "unique-session-id",
  "eventType": "page_view",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "url": "/",
  "data": {}
}
```

### GET /api/analytics
Retrieves analytics events (for admin dashboard).

**Query Parameters:**
- `siteId`: Filter by site ID
- `limit`: Number of events to return (default: 1000)
- `eventType`: Filter by event type

### GET /api/analytics/summary
Returns aggregated analytics summary.

**Query Parameters:**
- `siteId`: Filter by site ID

### GET /health
Health check endpoint.

## Environment Variables

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (production/development)

## Security

- Rate limiting: 100 requests per 15 minutes per IP
- CORS configured for allowed origins
- Security headers with Helmet
- Input validation and sanitization

## Deployment

This API is designed to be deployed as a Container App on Azure, with the infrastructure defined in the `/infra` folder.
