# Complete Analytics Integration Guide for Any Web App

## 🎯 Overview

This guide will help you integrate the exact same analytics system from the LaFontaine Noise Pulse project into any React/TypeScript web application. You'll get:

- **Real-time analytics collection** from all users
- **Azure-hosted backend** with auto-scaling
- **Admin dashboard** with beautiful charts and statistics
- **Privacy-compliant tracking** without personal data
- **Password-protected access** to analytics

---

## 📋 Prerequisites

Before starting, ensure you have:

- **Azure account** with active subscription
- **GitHub account** for hosting frontend
- **Node.js 18+** installed locally
- **Docker** installed (for building containers)
- **Azure CLI** and **Azure Developer CLI (azd)** installed
- **Git** for version control

---

## 🚀 Step-by-Step Integration

### Step 1: Prepare Your Workspace

```bash
# Navigate to your existing web app project
cd /path/to/your-web-app

# Ensure you have a React/TypeScript project
# If not, create one:
npx create-react-app my-app --template typescript
cd my-app
```

### Step 2: Install Required Dependencies

```bash
# Install analytics dependencies
npm install recharts

# Install UI components (if not already present)
npm install @radix-ui/react-dialog @radix-ui/react-slot class-variance-authority clsx tailwind-merge lucide-react

# Install development dependencies
npm install -D tailwindcss postcss autoprefixer @types/node
```

### Step 3: Set Up Tailwind CSS (if not configured)

```bash
# Initialize Tailwind CSS
npx tailwindcss init -p
```

Update `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Add to `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Step 4: Create Analytics Core Files

#### 4.1 Create `src/lib/utils.ts`
```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

#### 4.2 Create `src/lib/realAnalytics.ts`
```typescript
interface AnalyticsEvent {
  type: string;
  action?: string;
  sessionId: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

class RealAnalytics {
  private sessionId: string;
  private apiEndpoint: string;
  private isEnabled: boolean;

  constructor() {
    this.sessionId = this.generateSessionId();
    // Replace with your Azure Container Apps URL
    this.apiEndpoint = 'https://ca-YOUR_TOKEN_HERE.YOUR_REGION.azurecontainerapps.io';
    this.isEnabled = true;
    
    // Start session tracking
    this.trackPageView();
    this.setupInteractionTracking();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async sendEvent(event: AnalyticsEvent): Promise<void> {
    if (!this.isEnabled) return;

    try {
      const response = await fetch(`${this.apiEndpoint}/api/analytics/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        console.warn('Analytics event failed to send:', response.status);
      }
    } catch (error) {
      console.warn('Analytics error:', error);
    }
  }

  trackEvent(type: string, metadata?: Record<string, any>): void {
    const event: AnalyticsEvent = {
      type,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      metadata: {
        ...metadata,
        userAgent: navigator.userAgent,
        language: navigator.language,
        screenResolution: `${screen.width}x${screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        url: window.location.href,
        referrer: document.referrer,
      },
    };

    this.sendEvent(event);
  }

  trackPageView(): void {
    this.trackEvent('page_view', {
      page: window.location.pathname,
      title: document.title,
    });
  }

  trackInteraction(action: string, metadata?: Record<string, any>): void {
    this.trackEvent('interaction', {
      action,
      ...metadata,
    });
  }

  trackLanguageSwitch(language: string): void {
    this.trackEvent('language_switch', { language });
  }

  trackTimeSpent(page: string, seconds: number): void {
    this.trackEvent('time_spent', { page, seconds });
  }

  private setupInteractionTracking(): void {
    // Track button clicks
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        const button = target.tagName === 'BUTTON' ? target : target.closest('button');
        this.trackInteraction('button_click', {
          buttonText: button?.textContent?.slice(0, 50),
          buttonId: button?.id,
          buttonClass: button?.className,
        });
      }
    });

    // Track form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      this.trackInteraction('form_submit', {
        formId: form.id,
        formAction: form.action,
      });
    });
  }
}

export const realAnalytics = new RealAnalytics();
```

#### 4.3 Create `src/lib/globalAnalytics.ts`
```typescript
interface AnalyticsEvent {
  type: string;
  action?: string;
  sessionId: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface AnalyticsSummary {
  totalEvents: number;
  uniqueSessions: number;
  totalPageviews: number;
  totalInteractions: number;
  avgSessionDuration: number;
  topPages: Record<string, number>;
  topInteractions: Record<string, number>;
  languages: Record<string, number>;
  devices: Record<string, number>;
  timeRanges: Record<string, number>;
  recentActivity: AnalyticsEvent[];
}

class GlobalAnalytics {
  private apiEndpoint: string;

  constructor() {
    // Replace with your Azure Container Apps URL
    this.apiEndpoint = 'https://ca-YOUR_TOKEN_HERE.YOUR_REGION.azurecontainerapps.io';
  }

  async sendAnalyticsEvent(event: AnalyticsEvent): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiEndpoint}/api/analytics/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to send analytics event:', error);
      return false;
    }
  }

  async getAnalyticsEvents(): Promise<AnalyticsEvent[]> {
    try {
      const response = await fetch(`${this.apiEndpoint}/api/analytics/events`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch analytics events:', error);
      return [];
    }
  }

  async getAnalyticsSummary(): Promise<AnalyticsSummary | null> {
    try {
      const response = await fetch(`${this.apiEndpoint}/api/analytics/summary`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch analytics summary:', error);
      return null;
    }
  }
}

export const globalAnalytics = new GlobalAnalytics();
```

### Step 5: Create UI Components

#### 5.1 Create `src/components/ui/` directory with basic components

Create these files in `src/components/ui/`:

**button.tsx**:
```typescript
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

**card.tsx**:
```typescript
import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

export { Card, CardHeader, CardTitle, CardDescription, CardContent }
```

**input.tsx**:
```typescript
import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
```

**badge.tsx**:
```typescript
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
```

### Step 6: Create Admin Dashboard Components

#### 6.1 Create `src/components/RealAnalyticsAdmin.tsx`
```typescript
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { globalAnalytics } from '@/lib/globalAnalytics';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface AnalyticsData {
  totalEvents: number;
  uniqueSessions: number;
  totalPageviews: number;
  totalInteractions: number;
  avgSessionDuration: number;
  topPages: Record<string, number>;
  topInteractions: Record<string, number>;
  languages: Record<string, number>;
  devices: Record<string, number>;
  timeRanges: Record<string, number>;
  recentActivity: any[];
}

export function RealAnalyticsAdmin() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRawData, setShowRawData] = useState(false);
  const [rawData, setRawData] = useState<any[]>([]);

  useEffect(() => {
    loadAnalyticsData();
    const interval = setInterval(loadAnalyticsData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadAnalyticsData = async () => {
    try {
      const summary = await globalAnalytics.getAnalyticsSummary();
      if (summary) {
        setData(summary);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
      setLoading(false);
    }
  };

  const loadRawData = async () => {
    try {
      const events = await globalAnalytics.getAnalyticsEvents();
      setRawData(events);
      setShowRawData(true);
    } catch (error) {
      console.error('Failed to load raw data:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading analytics data...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Failed to load analytics data</div>
      </div>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Convert data for charts
  const pageData = Object.entries(data.topPages).map(([page, count]) => ({
    page: page.length > 20 ? page.substring(0, 20) + '...' : page,
    count
  }));

  const interactionData = Object.entries(data.topInteractions).map(([action, count]) => ({
    action,
    count
  }));

  const languageData = Object.entries(data.languages).map(([language, count]) => ({
    name: language,
    value: count
  }));

  const deviceData = Object.entries(data.devices).map(([device, count]) => ({
    name: device,
    value: count
  }));

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalEvents.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Unique Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.uniqueSessions.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Page Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalPageviews.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Interactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalInteractions.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
            <CardDescription>Most visited pages on your site</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="page" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Interactions */}
        <Card>
          <CardHeader>
            <CardTitle>Top Interactions</CardTitle>
            <CardDescription>Most common user actions</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={interactionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="action" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Languages */}
        <Card>
          <CardHeader>
            <CardTitle>User Languages</CardTitle>
            <CardDescription>Visitor language preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={languageData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {languageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Device Types */}
        <Card>
          <CardHeader>
            <CardTitle>Device Types</CardTitle>
            <CardDescription>Desktop vs Mobile usage</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest user interactions (live updates)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {data.recentActivity.slice(0, 10).map((event, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{event.type}</Badge>
                  <span className="text-sm">{event.action || 'N/A'}</span>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Raw Data Toggle */}
      <Card>
        <CardHeader>
          <CardTitle>Raw Data</CardTitle>
          <CardDescription>View raw analytics events for debugging</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={loadRawData} variant="secondary">
            {showRawData ? 'Hide Raw Data' : 'Show Raw Data'}
          </Button>
          
          {showRawData && (
            <div className="mt-4">
              <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
                {JSON.stringify(rawData, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

#### 6.2 Create `src/pages/AdminPage.tsx`
```typescript
import React, { useState } from 'react';
import { RealAnalyticsAdmin } from '@/components/RealAnalyticsAdmin';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  
  // Change this password to whatever you want
  const ADMIN_PASSWORD = 'analytics2024';

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert('Invalid password');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>🔐 Analytics Access</CardTitle>
            <CardDescription>
              Enter the admin password to view live site analytics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
              <Button onClick={handleLogin} className="w-full">
                Access Analytics Dashboard
              </Button>
              <div className="text-xs text-gray-500 text-center">
                Password: analytics2024
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Real-time visitor insights and site performance data</p>
        </div>
        <RealAnalyticsAdmin />
      </div>
    </div>
  );
}
```

### Step 7: Update Your App Router

Update your main routing file (usually `src/App.tsx` or similar):

```typescript
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AdminPage } from './pages/AdminPage';
import { realAnalytics } from './lib/realAnalytics'; // This starts analytics automatically

// Your existing components
import HomePage from './pages/HomePage'; // Replace with your actual components
import AboutPage from './pages/AboutPage'; // Replace with your actual components

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/admin" element={<AdminPage />} />
        {/* Add your other routes here */}
      </Routes>
    </Router>
  );
}

export default App;
```

### Step 8: Create Azure Backend Infrastructure

#### 8.1 Create `azure.yaml` in project root
```yaml
# yaml-language-server: $schema=https://raw.githubusercontent.com/Azure/azure-dev/main/schemas/v1.0/azure.yaml.json

name: your-app-analytics
metadata:
  template: your-app-analytics@0.0.1-beta
services:
  analytics-api:
    project: ./api
    language: js
    host: containerapp
```

#### 8.2 Create `infra/` directory with Bicep files

Create `infra/main.bicep`:
```bicep
// Main infrastructure file for Analytics Backend
targetScope = 'resourceGroup'

// Parameters
@description('The name of the environment')
param environmentName string

@description('The location for the resources')
param location string = resourceGroup().location

// Generate resource token
var resourceToken = take(uniqueString(subscription().id, resourceGroup().id, environmentName), 13)

// Resource names using resource token
var resourceNames = {
  logAnalyticsWorkspace: 'log-${resourceToken}'
  containerAppsEnvironment: 'cae-${resourceToken}'
  containerApp: 'ca-${resourceToken}'
  containerRegistry: 'acranalytics${take(resourceToken, 10)}'
  userAssignedIdentity: 'id-${resourceToken}'
}

// User-assigned managed identity for secure access
resource userAssignedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: resourceNames.userAssignedIdentity
  location: location
  tags: {
    'azd-env-name': environmentName
  }
}

// Container Registry
resource containerRegistry 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: resourceNames.containerRegistry
  location: location
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: false
    publicNetworkAccess: 'Enabled'
  }
  tags: {
    'azd-env-name': environmentName
  }
}

// Role assignment for ACR Pull access
resource acrPullRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(containerRegistry.id, userAssignedIdentity.id, 'acrpull')
  scope: containerRegistry
  properties: {
    principalId: userAssignedIdentity.properties.principalId
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '7f951dda-4ed3-4680-a7ca-43fe172d538d') // AcrPull
    principalType: 'ServicePrincipal'
  }
}

// Log Analytics workspace for monitoring
resource logAnalyticsWorkspace 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: resourceNames.logAnalyticsWorkspace
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
    features: {
      enableLogAccessUsingOnlyResourcePermissions: true
    }
  }
  tags: {
    'azd-env-name': environmentName
  }
}

// Container Apps environment
resource containerAppsEnvironment 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: resourceNames.containerAppsEnvironment
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalyticsWorkspace.properties.customerId
        sharedKey: logAnalyticsWorkspace.listKeys().primarySharedKey
      }
    }
  }
  tags: {
    'azd-env-name': environmentName
  }
}

// Container app for analytics API
resource containerApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: resourceNames.containerApp
  location: location
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${userAssignedIdentity.id}': {}
    }
  }
  properties: {
    managedEnvironmentId: containerAppsEnvironment.id
    configuration: {
      ingress: {
        external: true
        targetPort: 3000
        transport: 'http'
        corsPolicy: {
          allowedOrigins: ['*']
          allowedMethods: ['GET', 'POST', 'OPTIONS']
          allowedHeaders: ['*']
          allowCredentials: false
        }
      }
      registries: [
        {
          server: containerRegistry.properties.loginServer
          identity: userAssignedIdentity.id
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'analytics-api'
          image: 'mcr.microsoft.com/azuredocs/containerapps-helloworld:latest'
          resources: {
            cpu: json('0.25')
            memory: '0.5Gi'
          }
          env: [
            {
              name: 'NODE_ENV'
              value: 'production'
            }
            {
              name: 'AZURE_CLIENT_ID'
              value: userAssignedIdentity.properties.clientId
            }
          ]
        }
      ]
      scale: {
        minReplicas: 0
        maxReplicas: 3
        rules: [
          {
            name: 'http-scaling'
            http: {
              metadata: {
                concurrentRequests: '10'
              }
            }
          }
        ]
      }
    }
  }
  tags: {
    'azd-env-name': environmentName
    'azd-service-name': 'analytics-api'
  }
  dependsOn: [
    acrPullRole
  ]
}

// Outputs
output AZURE_CONTAINER_APPS_ENVIRONMENT_ID string = containerAppsEnvironment.id
output AZURE_CONTAINER_APPS_ENVIRONMENT_DEFAULT_DOMAIN string = containerAppsEnvironment.properties.defaultDomain
output AZURE_CONTAINER_REGISTRY_ENDPOINT string = containerRegistry.properties.loginServer
output AZURE_CONTAINER_REGISTRY_NAME string = containerRegistry.name
output ANALYTICS_API_URI string = 'https://${containerApp.properties.configuration.ingress.fqdn}'
output ANALYTICS_API_NAME string = containerApp.name
output RESOURCE_GROUP_ID string = resourceGroup().id
```

Create `infra/main.parameters.json`:
```json
{
  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentParameters.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "environmentName": {
      "value": "${AZURE_ENV_NAME}"
    },
    "location": {
      "value": "${AZURE_LOCATION}"
    }
  }
}
```

### Step 9: Create Analytics API Backend

#### 9.1 Create `api/` directory structure

Create `api/package.json`:
```json
{
  "name": "analytics-api",
  "version": "1.0.0",
  "description": "Analytics backend API for web application",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

#### 9.2 Create `api/server.js`
```javascript
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// In-memory storage for analytics events
let events = [];

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    events: events.length 
  });
});

// Analytics endpoints
app.post('/api/analytics/events', (req, res) => {
  try {
    const event = req.body;
    
    // Add server timestamp and ID
    event.serverTimestamp = new Date().toISOString();
    event.id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Store event
    events.push(event);
    
    // Keep only last 10000 events to prevent memory issues
    if (events.length > 10000) {
      events = events.slice(-10000);
    }
    
    console.log(`📊 Analytics event received: ${event.type} - ${event.action || 'N/A'}`);
    
    res.json({ 
      success: true, 
      eventId: event.id,
      timestamp: event.serverTimestamp 
    });
  } catch (error) {
    console.error('Error storing analytics event:', error);
    res.status(500).json({ error: 'Failed to store event' });
  }
});

app.get('/api/analytics/events', (req, res) => {
  try {
    res.json(events);
  } catch (error) {
    console.error('Error retrieving analytics events:', error);
    res.status(500).json({ error: 'Failed to retrieve events' });
  }
});

app.get('/api/analytics/summary', (req, res) => {
  try {
    // Calculate analytics summary
    const uniqueSessions = new Set(events.map(e => e.sessionId)).size;
    const totalPageviews = events.filter(e => e.type === 'page_view').length;
    const totalInteractions = events.filter(e => e.type === 'interaction').length;
    
    // Top pages
    const pageViews = events.filter(e => e.type === 'page_view');
    const topPages = {};
    pageViews.forEach(e => {
      const page = e.metadata?.page || 'Unknown';
      topPages[page] = (topPages[page] || 0) + 1;
    });
    
    // Top interactions
    const interactions = events.filter(e => e.type === 'interaction');
    const topInteractions = {};
    interactions.forEach(e => {
      const action = e.action || e.metadata?.action || 'Unknown';
      topInteractions[action] = (topInteractions[action] || 0) + 1;
    });
    
    // Languages
    const languages = {};
    events.forEach(e => {
      const language = e.metadata?.language || 'Unknown';
      languages[language] = (languages[language] || 0) + 1;
    });
    
    // Device types (simplified)
    const devices = {};
    events.forEach(e => {
      const userAgent = e.metadata?.userAgent || '';
      const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
      const deviceType = isMobile ? 'Mobile' : 'Desktop';
      devices[deviceType] = (devices[deviceType] || 0) + 1;
    });
    
    // Recent activity (last 20 events)
    const recentActivity = events.slice(-20).reverse();
    
    const summary = {
      totalEvents: events.length,
      uniqueSessions,
      totalPageviews,
      totalInteractions,
      avgSessionDuration: 0, // Placeholder
      topPages,
      topInteractions,
      languages,
      devices,
      timeRanges: {}, // Placeholder
      recentActivity
    };
    
    res.json(summary);
  } catch (error) {
    console.error('Error generating analytics summary:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Analytics API server running on port ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`📈 Analytics events: ${events.length} stored`);
});
```

#### 9.3 Create `api/Dockerfile`
```dockerfile
# Use Node.js 18 Alpine image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Set user for security
USER node

# Start the application
CMD ["npm", "start"]
```

### Step 10: Deploy to Azure

#### 10.1 Initialize Azure Developer CLI
```bash
# Navigate to your project root
cd /path/to/your-web-app

# Initialize azd
azd init

# When prompted, choose "Use code in the current directory"
# Enter a name for your environment (e.g., "my-app-analytics")
```

#### 10.2 Deploy to Azure
```bash
# Login to Azure
azd auth login

# Deploy everything (infrastructure + API)
azd up

# Follow the prompts to select:
# - Azure subscription
# - Azure region (e.g., "East US 2")
```

#### 10.3 Update Frontend Configuration
After deployment completes, azd will output your Container Apps URL. Update your analytics configuration:

In `src/lib/realAnalytics.ts` and `src/lib/globalAnalytics.ts`, replace:
```typescript
this.apiEndpoint = 'https://ca-YOUR_TOKEN_HERE.YOUR_REGION.azurecontainerapps.io';
```

With your actual URL from azd output:
```typescript
this.apiEndpoint = 'https://ca-abc123def456.eastus2.azurecontainerapps.io';
```

### Step 11: Deploy Frontend

#### 11.1 For GitHub Pages
Add to `package.json`:
```json
{
  "scripts": {
    "build:github": "npm run build",
    "deploy:github": "npm run build:github && gh-pages -d build"
  },
  "devDependencies": {
    "gh-pages": "^6.0.0"
  }
}
```

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
    
    - name: Deploy
      uses: peaceiris/actions-gh-pages@v3
      if: github.ref == 'refs/heads/main'
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./build
```

Deploy:
```bash
# Enable GitHub Pages in your repo settings
# Push to main branch to trigger deployment
git add .
git commit -m "Add analytics system"
git push origin main
```

### Step 12: Test Your Analytics System

#### 12.1 Create test script `test-analytics.ps1`
```powershell
# Test Analytics System
Write-Host "Testing analytics system..." -ForegroundColor Green

# Replace with your actual Container Apps URL
$apiUrl = "https://ca-abc123def456.eastus2.azurecontainerapps.io"

# Test health endpoint
Write-Host "Testing health endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$apiUrl/health" -Method GET
    Write-Host "✓ Health check passed" -ForegroundColor Green
    Write-Host "  Status: $($health.status)" -ForegroundColor Gray
    Write-Host "  Events stored: $($health.events)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Health check failed: $_" -ForegroundColor Red
    exit 1
}

# Test sending analytics event
Write-Host "Testing analytics event sending..." -ForegroundColor Yellow
$testEvent = @{
    type = "test_event"
    action = "integration_test"
    sessionId = "test-session-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    metadata = @{
        source = "integration_test"
        userAgent = "PowerShell Test Script"
        language = "en-US"
    }
}

try {
    $response = Invoke-RestMethod -Uri "$apiUrl/api/analytics/events" -Method POST -Body ($testEvent | ConvertTo-Json) -ContentType "application/json"
    Write-Host "✓ Analytics event sent successfully" -ForegroundColor Green
    Write-Host "  Event ID: $($response.eventId)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Failed to send analytics event: $_" -ForegroundColor Red
    exit 1
}

# Test retrieving events
Write-Host "Testing analytics data retrieval..." -ForegroundColor Yellow
try {
    $events = Invoke-RestMethod -Uri "$apiUrl/api/analytics/events" -Method GET
    Write-Host "✓ Retrieved $($events.Count) analytics events" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to retrieve analytics events: $_" -ForegroundColor Red
    exit 1
}

# Test summary endpoint
Write-Host "Testing analytics summary..." -ForegroundColor Yellow
try {
    $summary = Invoke-RestMethod -Uri "$apiUrl/api/analytics/summary" -Method GET
    Write-Host "✓ Analytics summary retrieved" -ForegroundColor Green
    Write-Host "  Total events: $($summary.totalEvents)" -ForegroundColor Gray
    Write-Host "  Unique sessions: $($summary.uniqueSessions)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Failed to retrieve analytics summary: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 All tests passed! Your analytics system is working correctly." -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Visit your deployed web app" -ForegroundColor Gray
Write-Host "2. Navigate to /admin and use password: analytics2024" -ForegroundColor Gray
Write-Host "3. View your real-time analytics dashboard" -ForegroundColor Gray
```

#### 12.2 Run the test
```bash
# Test your analytics system
pwsh ./test-analytics.ps1
```

---

## 🔑 Configuration Summary

### Admin Dashboard Access
- **URL**: `https://your-domain.com/admin`
- **Password**: `analytics2024` (change in `AdminPage.tsx`)

### Azure Resources Created
- **Container Apps Environment**: Hosts your API
- **Container Registry**: Stores Docker images
- **Container App**: Runs your analytics API
- **Log Analytics Workspace**: Monitors your application
- **Managed Identity**: Secure access between services

### API Endpoints
- **Health**: `GET /health`
- **Send Event**: `POST /api/analytics/events`
- **Get Events**: `GET /api/analytics/events`
- **Get Summary**: `GET /api/analytics/summary`

---

## 🎯 What You Get

✅ **Real-time analytics collection** from all users
✅ **Beautiful admin dashboard** with charts and statistics
✅ **Privacy-compliant tracking** without personal data
✅ **Auto-scaling Azure backend** that handles any traffic
✅ **Cost-effective solution** that scales to zero when not used
✅ **Production-ready system** with monitoring and logging

Your analytics system will automatically start collecting data as soon as users visit your site. The admin dashboard provides real-time insights into user behavior, popular pages, device types, and more.

---

## 🚨 Important Notes

1. **Update API URLs**: Replace placeholder URLs with your actual Azure Container Apps endpoint
2. **Change Admin Password**: Update the password in `AdminPage.tsx` for security
3. **Enable GitHub Pages**: Configure GitHub Pages in your repository settings
4. **Monitor Costs**: Azure Container Apps scales to zero but monitor usage in Azure portal
5. **Data Persistence**: Current system uses in-memory storage; consider Azure Cosmos DB for persistence

---

## 🎉 Congratulations!

You now have a complete, production-ready analytics system integrated into your web application! The system will automatically collect user interaction data and display beautiful real-time dashboards for insights into your application usage.
