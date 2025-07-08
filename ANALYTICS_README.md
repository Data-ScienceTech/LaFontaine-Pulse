# LaFontaine Analytics System

A complete analytics solution for the LaFontaine Noise Pulse web application, featuring real-time data collection, aggregation, and visualization.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Azure         │    │   Analytics     │
│   (GitHub Pages)│───▶│   Container App │───▶│   Dashboard     │
│                 │    │   (Node.js API) │    │   (Admin View)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Features

### 🔄 Real-time Data Collection
- **Page Views**: Track page visits and navigation patterns
- **User Interactions**: Monitor button clicks, form submissions, and user engagement
- **Session Tracking**: Collect session duration, bounce rates, and user journeys
- **Error Tracking**: Capture and log client-side errors
- **Performance Metrics**: Track loading times and user experience metrics

### 📊 Data Aggregation & Analytics
- **Session Analytics**: Unique visitors, session duration, page views per session
- **User Behavior**: Most visited pages, interaction patterns, user flows
- **Device & Browser**: Device breakdown, browser usage, screen resolutions
- **Geographic Data**: Language preferences, timezone information
- **Time-based Analytics**: Usage patterns by time of day and day of week

### 🛡️ Privacy & Security
- **Privacy-First**: No personal data collection, GDPR compliant
- **Rate Limiting**: Prevents abuse and ensures fair usage
- **Secure Transport**: HTTPS encryption for all data transmission
- **CORS Protection**: Restricted to authorized domains
- **Input Validation**: Sanitized data processing

### 🎯 Admin Dashboard
- **Real-time Metrics**: Live analytics dashboard with auto-refresh
- **Visual Charts**: Interactive charts and graphs for data visualization
- **Data Export**: Download analytics data as JSON for further analysis
- **Filter & Search**: Filter analytics by date, event type, or other criteria
- **Summary Reports**: Automated summary generation with key insights

## Quick Start

### 1. Deploy Analytics Backend

```powershell
# Run the deployment script
./deploy-analytics.ps1
```

### 2. Update Frontend Configuration

After deployment, update `src/lib/globalAnalytics.ts` with your API URL:

```typescript
// Replace with your actual API URL from deployment
const analyticsConfigs = {
  azure: {
    method: 'webhook' as const,
    webhookUrl: 'https://your-app-name.azurecontainerapps.io/api/analytics'
  }
};
```

### 3. Access Admin Dashboard

Navigate to `https://lafontaine.datasciencetech.ca/admin` and use the admin password to view analytics.

## File Structure

```
├── api/                    # Analytics API backend
│   ├── server.js          # Express.js server
│   ├── package.json       # Node.js dependencies
│   ├── Dockerfile         # Container configuration
│   └── README.md          # API documentation
├── infra/                 # Azure infrastructure
│   ├── main.bicep         # Bicep template
│   └── main.parameters.json # Parameters file
├── src/lib/               # Frontend analytics
│   ├── realAnalytics.ts   # Client-side analytics
│   └── globalAnalytics.ts # Backend communication
├── src/components/        # Admin dashboard
│   └── RealAnalyticsAdmin.tsx
├── azure.yaml             # Azure Developer CLI config
└── deploy-analytics.ps1   # Deployment script
```

## API Endpoints

### Analytics Collection
- `POST /api/analytics` - Collect analytics events
- `GET /api/analytics` - Retrieve analytics data
- `GET /api/analytics/summary` - Get aggregated summary
- `GET /health` - Health check endpoint

### Event Types Tracked
- `pageview` - Page visits
- `session_start` - Session initiation
- `session_end` - Session termination
- `interaction` - User interactions
- `time_spent` - Time spent on sections
- `error` - Client-side errors

## Configuration

### Environment Variables
- `NODE_ENV` - Environment (production/development)
- `PORT` - Server port (default: 3000)
- `AZURE_CLIENT_ID` - Managed identity client ID

### Frontend Configuration
- Update `globalAnalytics.ts` with your API URL
- Configure admin password in `AdminPage.tsx`
- Adjust tracking settings in `realAnalytics.ts`

## Security Considerations

### Rate Limiting
- 100 requests per 15 minutes per IP address
- Configurable limits in `api/server.js`

### CORS Policy
- Restricted to authorized domains
- Configurable in `api/server.js`

### Data Privacy
- No personal data collection
- Session IDs are anonymized
- IP addresses are not stored
- GDPR compliant by design

## Monitoring & Observability

### Health Checks
- `/health` endpoint for monitoring
- Container Apps health probes
- Log Analytics integration

### Logging
- Structured logging with timestamps
- Error tracking and alerting
- Performance monitoring

### Metrics
- Request/response metrics
- Error rates and latency
- Resource utilization

## Development

### Local Development
```bash
# Start the API server
cd api
npm install
npm run dev

# Start the frontend
npm run dev
```

### Testing
```bash
# Test analytics collection
curl -X POST http://localhost:3000/api/analytics \
  -H "Content-Type: application/json" \
  -d '{"siteId":"test","eventType":"pageview","sessionId":"test-session"}'

# Test health check
curl http://localhost:3000/health
```

## Deployment

### Prerequisites
- Azure CLI installed
- Azure Developer CLI (azd) installed
- Azure subscription with sufficient permissions

### Deployment Steps
1. Run `./deploy-analytics.ps1`
2. Follow the prompts to configure your environment
3. Update frontend configuration with API URL
4. Deploy frontend to GitHub Pages

### Post-Deployment
1. Verify health endpoint is accessible
2. Test analytics collection from frontend
3. Access admin dashboard to verify data
4. Monitor logs for any issues

## Troubleshooting

### Common Issues
- **CORS errors**: Check allowed origins in `api/server.js`
- **Rate limiting**: Increase limits or implement authentication
- **Data not showing**: Verify API URL configuration
- **Health check failures**: Check container logs

### Debugging
```bash
# Check Azure logs
azd logs

# Check health endpoint
curl https://your-app.azurecontainerapps.io/health

# Test analytics endpoint
curl https://your-app.azurecontainerapps.io/api/analytics
```

## Cost Optimization

### Azure Container Apps
- Uses consumption-based pricing
- Scales to zero when not in use
- Optimized for lightweight workloads

### Data Storage
- In-memory storage for demo purposes
- For production, consider Azure Cosmos DB or Azure Storage
- Implement data retention policies

## Future Enhancements

### Planned Features
- **Real-time Dashboard**: WebSocket-based live updates
- **Advanced Analytics**: Machine learning insights
- **A/B Testing**: Built-in experimentation framework
- **Alerts**: Automated alerts for anomalies
- **Data Export**: CSV/Excel export options

### Scaling Considerations
- **Database**: Replace in-memory storage with persistent database
- **Caching**: Add Redis for improved performance
- **CDN**: Use Azure CDN for global distribution
- **Load Balancing**: Multiple instances for high availability

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines and contribution process.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
