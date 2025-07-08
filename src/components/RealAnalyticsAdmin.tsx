import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { realAnalytics } from '@/lib/realAnalytics';
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
    
    // Refresh data every 30 seconds
    const interval = setInterval(loadAnalyticsData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadAnalyticsData = async () => {
    try {
      // Try to get data from global analytics (real backend)
      const globalData = await realAnalytics.getGlobalAnalytics();
      
      if (globalData && globalData.length > 0) {
        // Use global data if available
        setRawData(globalData);
        const summary = generateSummaryFromRawData(globalData);
        setData(summary);
      } else {
        // Fallback to local data
        const allData = realAnalytics.getAllAnalytics();
        const summary = generateSummaryFromRawData(allData);
        setData(summary);
        setRawData(allData);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      // Fallback to local data on error
      const allData = realAnalytics.getAllAnalytics();
      const summary = generateSummaryFromRawData(allData);
      setData(summary);
      setRawData(allData);
      setLoading(false);
    }
  };

  const generateSummaryFromRawData = (rawData: any[]): AnalyticsData => {
    const sessions = rawData.filter(d => d.eventType === 'session_start');
    const interactions = rawData.filter(d => d.eventType === 'interaction');
    const pageviews = rawData.filter(d => d.eventType === 'pageview');
    const timeSpent = rawData.filter(d => d.eventType === 'time_spent');
    
    const uniqueSessions = new Set(rawData.map(d => d.sessionId)).size;
    const totalDuration = rawData
      .filter(d => d.eventType === 'session_end')
      .reduce((acc, d) => acc + (d.data?.duration || 0), 0);

    return {
      totalEvents: rawData.length,
      uniqueSessions,
      totalPageviews: pageviews.length,
      totalInteractions: interactions.length,
      avgSessionDuration: totalDuration / sessions.length || 0,
      topPages: getTopItems(pageviews, 'data.page'),
      topInteractions: getTopItems(interactions, 'data.type'),
      languages: getTopItems(rawData, 'language'),
      devices: getDeviceBreakdown(rawData),
      timeRanges: getTimeBreakdown(rawData),
      recentActivity: rawData.slice(-20).reverse()
    };
  };

  const getTopItems = (data: any[], path: string): Record<string, number> => {
    return data.reduce((acc, item) => {
      const value = getNestedValue(item, path);
      if (value) {
        acc[value] = (acc[value] || 0) + 1;
      }
      return acc;
    }, {});
  };

  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current && current[key], obj);
  };

  const getDeviceBreakdown = (data: any[]): Record<string, number> => {
    return data.reduce((acc, item) => {
      const isMobile = /Mobile|Android|iPhone|iPad/.test(item.userAgent);
      const device = isMobile ? 'Mobile' : 'Desktop';
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {});
  };

  const getTimeBreakdown = (data: any[]): Record<string, number> => {
    return data.reduce((acc, item) => {
      const hour = new Date(item.timestamp).getHours();
      const timeRange = hour < 6 ? 'Night' : hour < 12 ? 'Morning' : hour < 18 ? 'Afternoon' : 'Evening';
      acc[timeRange] = (acc[timeRange] || 0) + 1;
      return acc;
    }, {});
  };

  const exportData = () => {
    const exportString = realAnalytics.exportAnalytics();
    const blob = new Blob([exportString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lafontaine-analytics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearData = () => {
    if (confirm('Are you sure you want to clear all analytics data? This cannot be undone.')) {
      realAnalytics.clearAnalytics();
      loadAnalyticsData();
    }
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  const formatChartData = (obj: Record<string, number>) => {
    return Object.entries(obj).map(([name, value]) => ({ name, value }));
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Real Analytics...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Analytics Data</CardTitle>
          <CardDescription>No analytics data available yet. Data will appear as users visit your site.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            🚀 Live Site Analytics
            <div className="flex gap-2">
              <Button onClick={loadAnalyticsData} variant="outline" size="sm">
                🔄 Refresh
              </Button>
              <Button onClick={exportData} variant="outline" size="sm">
                📥 Export
              </Button>
              <Button onClick={clearData} variant="destructive" size="sm">
                🗑️ Clear
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Real-time analytics from https://lafontaine.datasciencetech.ca
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{data.uniqueSessions}</div>
              <div className="text-sm text-gray-600">Unique Sessions</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{data.totalPageviews}</div>
              <div className="text-sm text-gray-600">Page Views</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{data.totalInteractions}</div>
              <div className="text-sm text-gray-600">Interactions</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {formatDuration(data.avgSessionDuration)}
              </div>
              <div className="text-sm text-gray-600">Avg Session</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{data.totalEvents}</div>
              <div className="text-sm text-gray-600">Total Events</div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Top Interactions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top Interactions</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={formatChartData(data.topInteractions)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Device Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Device Types</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={formatChartData(data.devices)}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {formatChartData(data.devices).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Time Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Usage by Time of Day</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={formatChartData(data.timeRanges)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Language Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Language Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(data.languages).map(([lang, count]) => (
                    <div key={lang} className="flex justify-between items-center">
                      <span className="font-medium">{lang.toUpperCase()}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {data.recentActivity.map((activity, i) => (
                  <div key={i} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                    <div>
                      <span className="font-medium">{activity.eventType}</span>
                      {activity.data?.type && ` → ${activity.data.type}`}
                      {activity.data?.page && ` → ${activity.data.page}`}
                    </div>
                    <div className="text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Raw Data Toggle */}
          <div className="flex justify-between items-center">
            <Button 
              onClick={() => setShowRawData(!showRawData)} 
              variant="outline" 
              size="sm"
            >
              {showRawData ? 'Hide' : 'Show'} Raw Data ({rawData.length} events)
            </Button>
            <p className="text-sm text-gray-500">
              Data refreshes automatically every 30 seconds
            </p>
          </div>

          {showRawData && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Raw Analytics Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 p-4 rounded max-h-96 overflow-auto">
                  <pre className="text-xs">{JSON.stringify(rawData, null, 2)}</pre>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
