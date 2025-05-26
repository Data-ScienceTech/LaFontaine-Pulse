
import React from 'react';
import { Car } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { currentEVData } from '@/data/evData';

interface EVAdoptionDisplayProps {
  evAdoption: number;
  t: {
    evAdoption: string;
  };
}

export const EVAdoptionDisplay: React.FC<EVAdoptionDisplayProps> = ({ evAdoption, t }) => {
  return (
    <Card className="bg-slate-800/90 border-slate-600 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-white flex items-center gap-2 text-lg">
          <Car className="text-green-400" size={20} />
          {t.evAdoption}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-400 mb-2">
            {Math.round(evAdoption * 10) / 10}%
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2 mb-3">
            <div 
              className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(evAdoption * 2.5, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-slate-300 mb-1">
            Plateau Montréal
          </p>
          <p className="text-xs text-slate-400">
            Target 2030: {currentEVData.montreal.target2030}%
          </p>
          <p className="text-xs text-green-400 mt-1">
            Growth: +{currentEVData.montreal.monthlyGrowth}%/month
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
