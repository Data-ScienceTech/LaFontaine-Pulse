/**
 * Analytics Dashboard - Shows users what data is being collected
 * Promotes transparency and trust
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, BarChart3, Shield, Clock } from 'lucide-react';
import { analytics } from '@/lib/analytics';

interface AnalyticsDashboardProps {
  enabled: boolean;
  t: {
    analyticsTitle?: string;
    analyticsDescription?: string;
    sessionData?: string;
    showData?: string;
    hideData?: string;
  };
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ 
  enabled, 
  t 
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [sessionSummary, setSessionSummary] = useState<any>(null);

  useEffect(() => {
    if (enabled) {
      const summary = analytics.getSessionSummary();
      setSessionSummary(summary);
      
      // Update every 30 seconds
      const interval = setInterval(() => {
        setSessionSummary(analytics.getSessionSummary());
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [enabled]);

  if (!enabled || !sessionSummary) {
    return null;
  }

  return (
    <Card className="bg-slate-800/50 border-slate-600 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-white flex items-center gap-2 text-sm">
          <Shield className="text-green-400" size={16} />
          {t.analyticsTitle || "Privacy-First Analytics"}
        </CardTitle>
        <div className="flex items-center justify-between">
          <Badge 
            variant="outline" 
            className="bg-green-900/30 text-green-200 border-green-700 text-[10px]"
          >
            <BarChart3 size={10} className="mr-1" />
            Active
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="text-slate-400 hover:text-white text-xs p-1 h-auto"
          >
            {showDetails ? (
              <>
                <EyeOff size={12} className="mr-1" />
                {t.hideData || "Hide"}
              </>
            ) : (
              <>
                <Eye size={12} className="mr-1" />
                {t.showData || "Show"}
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      
      {showDetails && (
        <CardContent className="pt-0">
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Session ID:</span>
              <span className="text-slate-200 font-mono">{sessionSummary.sessionId}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Language:</span>
              <Badge variant="outline" className="text-[10px]">
                {sessionSummary.language.toUpperCase()}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Device:</span>
              <span className="text-slate-200">{sessionSummary.deviceType}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Timezone:</span>
              <span className="text-slate-200 text-[10px]">{sessionSummary.timezone}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Events:</span>
              <span className="text-slate-200">{sessionSummary.eventCount}</span>
            </div>
            
            <div className="pt-2 border-t border-slate-600">
              <p className="text-slate-500 text-[10px] leading-relaxed">
                {t.analyticsDescription || 
                  "All data is anonymized and used only for environmental research. No personal information is stored."}
              </p>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
