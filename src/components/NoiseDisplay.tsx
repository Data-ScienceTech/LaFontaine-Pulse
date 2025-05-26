
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface NoiseDisplayProps {
  currentNoise: number;
  noiseReduction: number;
  lastUpdate: number;
  t: {
    currentLevel: string;
    decibels: string;
    evImpact: string;
    lastUpdate: string;
    quiet: string;
    moderate: string;
    loud: string;
    veryLoud: string;
  };
}

export const NoiseDisplay: React.FC<NoiseDisplayProps> = ({
  currentNoise,
  noiseReduction,
  lastUpdate,
  t
}) => {
  const getNoiseColor = (level: number) => {
    if (level < 40) return 'text-green-400';
    if (level < 50) return 'text-yellow-400';
    if (level < 60) return 'text-orange-400';
    return 'text-red-400';
  };

  const getNoiseDescription = (level: number) => {
    if (level < 40) return t.quiet;
    if (level < 50) return t.moderate;
    if (level < 60) return t.loud;
    return t.veryLoud;
  };

  return (
    <Card className="bg-slate-800/90 border-slate-600 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-white flex items-center gap-2 text-lg">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          {t.currentLevel}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <div className={`text-4xl font-bold mb-1 ${getNoiseColor(currentNoise)}`}>
            {Math.round(currentNoise)}
          </div>
          <div className="text-lg text-slate-300 mb-2">{t.decibels}</div>
          <Badge variant="secondary" className="bg-slate-700 text-slate-200 mb-2">
            {getNoiseDescription(currentNoise)}
          </Badge>
          <div className="text-xs text-green-400 mb-1">
            -{Math.round(noiseReduction * 10) / 10}dB {t.evImpact}
          </div>
          <div className="text-xs text-slate-400">
            {t.lastUpdate}: {lastUpdate}s
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
