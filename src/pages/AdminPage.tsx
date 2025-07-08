import React, { useState } from 'react';
import { RealAnalyticsAdmin } from '@/components/RealAnalyticsAdmin';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  
  // Simple password protection - you can change this
  const ADMIN_PASSWORD = 'lafontaine2024';

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
              Enter the admin password to view live site analytics from lafontaine.datasciencetech.ca
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
                Access Real Analytics Dashboard
              </Button>
              <div className="text-xs text-gray-500 text-center">
                Analytics are collected from all visitors to your live site
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
          <h1 className="text-3xl font-bold text-gray-900">LaFontaine Noise Pulse Analytics</h1>
          <p className="text-gray-600">Real-time visitor insights and site performance data</p>
          <div className="mt-2 text-sm text-gray-500">
            🌐 Collecting data from: <strong>https://lafontaine.datasciencetech.ca</strong>
          </div>
        </div>
        <RealAnalyticsAdmin />
      </div>
    </div>
  );
}
