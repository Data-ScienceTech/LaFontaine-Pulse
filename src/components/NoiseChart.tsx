
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type NoiseDataPoint } from '@/data/evData';

interface NoiseChartProps {
  noiseData: NoiseDataPoint[];
  t: {
    noiseChart: string;
    realTimeData: string;
  };
}

export const NoiseChart: React.FC<NoiseChartProps> = ({ noiseData, t }) => {
  return (
    <Card className="lg:col-span-2 bg-slate-800/90 border-slate-600 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-lg">{t.noiseChart}</CardTitle>
        <CardDescription className="text-slate-300 text-sm">
          {t.realTimeData}
        </CardDescription>
      </CardHeader>
      <CardContent className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={noiseData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis 
              dataKey="time" 
              stroke="#94A3B8"
              fontSize={10}
              tickFormatter={(value) => value.split(':').slice(0, 2).join(':')}
            />
            <YAxis 
              stroke="#94A3B8"
              fontSize={10}
              domain={[30, 75]}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1E293B',
                border: '1px solid #475569',
                borderRadius: '6px',
                color: '#F1F5F9'
              }}
              labelStyle={{ color: '#F1F5F9' }}
              formatter={(value: any, name: string) => [
                `${value} dB`,
                name === 'noise' ? 'Noise Level' : name
              ]}
            />
            <Line 
              type="monotone" 
              dataKey="noise" 
              stroke="#3B82F6" 
              strokeWidth={2}
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 2 }}
              activeDot={{ r: 4, stroke: '#3B82F6', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
