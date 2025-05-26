
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Car, Leaf, CloudLightning } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

const translations = {
  en: {
    title: "Lafontaine Park Noise Monitor",
    subtitle: "Real-time sound tracking at Papineau & Cartier intersection",
    currentLevel: "Current Noise Level",
    decibels: "dB",
    evAdoption: "EV Adoption Rate",
    liveData: "Live Data",
    lastUpdate: "Last updated",
    seconds: "seconds ago",
    consentTitle: "Privacy & Data Consent",
    consentDescription: "We collect anonymized sound level data to monitor environmental noise at Lafontaine Park. This data helps track the positive impact of electric vehicle adoption on urban noise pollution in Montreal's Plateau neighborhood.",
    consentText: "By using this application, you consent to the collection and processing of anonymized environmental data in accordance with Quebec's privacy regulations (Bill 64). No personal information is collected or stored.",
    accept: "Accept & Continue",
    decline: "Decline",
    language: "Language",
    noiseChart: "Noise Levels Over Time",
    park: "Lafontaine Park",
    location: "Papineau & Cartier Intersection",
    status: "Status: Active Monitoring"
  },
  fr: {
    title: "Moniteur de Bruit Parc Lafontaine",
    subtitle: "Suivi sonore en temps réel à l'intersection Papineau & Cartier",
    currentLevel: "Niveau de Bruit Actuel",
    decibels: "dB",
    evAdoption: "Taux d'Adoption VÉ",
    liveData: "Données en Temps Réel",
    lastUpdate: "Dernière mise à jour",
    seconds: "secondes",
    consentTitle: "Consentement Confidentialité & Données",
    consentDescription: "Nous collectons des données anonymisées de niveau sonore pour surveiller le bruit environnemental au Parc Lafontaine. Ces données aident à suivre l'impact positif de l'adoption des véhicules électriques sur la pollution sonore urbaine dans le quartier Plateau de Montréal.",
    consentText: "En utilisant cette application, vous consentez à la collecte et au traitement de données environnementales anonymisées conformément aux réglementations de confidentialité du Québec (Projet de loi 64). Aucune information personnelle n'est collectée ou stockée.",
    accept: "Accepter & Continuer",
    decline: "Refuser",
    language: "Langue",
    noiseChart: "Niveaux de Bruit dans le Temps",
    park: "Parc Lafontaine",
    location: "Intersection Papineau & Cartier",
    status: "Statut: Surveillance Active"
  }
};

const Index = () => {
  const [language, setLanguage] = useState<'en' | 'fr'>('en');
  const [showConsent, setShowConsent] = useState(true);
  const [consentGiven, setConsentGiven] = useState(false);
  const [currentNoise, setCurrentNoise] = useState(45);
  const [evAdoption, setEvAdoption] = useState(23);
  const [lastUpdate, setLastUpdate] = useState(0);
  const [noiseData, setNoiseData] = useState<Array<{time: string, noise: number}>>([]);

  const t = translations[language];

  // Simulate live data updates
  useEffect(() => {
    if (!consentGiven) return;

    const interval = setInterval(() => {
      const now = new Date();
      const time = now.toLocaleTimeString();
      const baseNoise = 40 + Math.sin(Date.now() / 10000) * 10;
      const variation = Math.random() * 10 - 5;
      const newNoise = Math.max(30, Math.min(70, baseNoise + variation));
      
      setCurrentNoise(Math.round(newNoise));
      setEvAdoption(23 + Math.sin(Date.now() / 50000) * 7);
      setLastUpdate(0);
      
      setNoiseData(prev => {
        const newData = [...prev, { time, noise: Math.round(newNoise) }];
        return newData.slice(-20); // Keep last 20 points
      });
    }, 3000);

    // Update "seconds ago" counter
    const updateCounter = setInterval(() => {
      setLastUpdate(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(updateCounter);
    };
  }, [consentGiven]);

  const handleConsent = (accepted: boolean) => {
    if (accepted) {
      setConsentGiven(true);
      setShowConsent(false);
    } else {
      window.close();
    }
  };

  const getNoiseColor = (level: number) => {
    if (level < 40) return 'text-green-400';
    if (level < 55) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (!consentGiven) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Dialog open={showConsent} onOpenChange={() => {}}>
          <DialogContent className="max-w-2xl bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-xl text-white flex items-center gap-2">
                <Leaf className="text-green-400" />
                {t.consentTitle}
              </DialogTitle>
              <DialogDescription className="text-slate-300 leading-relaxed">
                {t.consentDescription}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-slate-400 leading-relaxed">
                {t.consentText}
              </p>
            </div>
            <DialogFooter className="gap-2">
              <Button 
                variant="outline" 
                onClick={() => handleConsent(false)}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                {t.decline}
              </Button>
              <Button 
                onClick={() => handleConsent(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {t.accept}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto h-screen flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <CloudLightning className="text-blue-400" size={32} />
              {t.title}
            </h1>
            <p className="text-slate-400">{t.subtitle}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">{t.language}:</span>
              <div className="flex items-center gap-2">
                <span className={`text-sm ${language === 'en' ? 'text-white' : 'text-slate-500'}`}>EN</span>
                <Switch 
                  checked={language === 'fr'} 
                  onCheckedChange={(checked) => setLanguage(checked ? 'fr' : 'en')}
                />
                <span className={`text-sm ${language === 'fr' ? 'text-white' : 'text-slate-500'}`}>FR</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
          {/* Current Noise Level */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                {t.currentLevel}
              </CardTitle>
              <CardDescription className="text-slate-400">
                {t.park}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className={`text-6xl font-bold mb-2 ${getNoiseColor(currentNoise)}`}>
                  {currentNoise}
                </div>
                <div className="text-2xl text-slate-400 mb-4">{t.decibels}</div>
                <Badge variant="secondary" className="bg-slate-700 text-slate-300">
                  {t.lastUpdate}: {lastUpdate} {t.seconds}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Chart */}
          <Card className="lg:col-span-2 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-white">{t.noiseChart}</CardTitle>
              <CardDescription className="text-slate-400">
                {t.location}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={noiseData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickFormatter={(value) => value.split(':').slice(0, 2).join(':')}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    fontSize={12}
                    domain={[30, 70]}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '6px'
                    }}
                    labelStyle={{ color: '#F3F4F6' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="noise" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5, stroke: '#3B82F6', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* EV Adoption Rate */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2">
                <Car className="text-green-400" />
                {t.evAdoption}
              </CardTitle>
              <CardDescription className="text-slate-400">
                Plateau Montréal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-400 mb-2">
                  {Math.round(evAdoption)}%
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3 mb-4">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-400 h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${evAdoption}%` }}
                  ></div>
                </div>
                <p className="text-sm text-slate-400">
                  {t.status}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Info Cards */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 border-blue-700/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <CloudLightning className="text-blue-400" size={24} />
                  <h3 className="text-lg font-semibold text-white">Electric Future</h3>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Monitoring the correlation between electric vehicle adoption and reduced urban noise pollution in Montreal's green neighborhoods.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-900/30 to-green-800/30 border-green-700/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Leaf className="text-green-400" size={24} />
                  <h3 className="text-lg font-semibold text-white">Urban Sustainability</h3>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Real-time environmental data supporting Montreal's transition to sustainable transportation and improved quality of life.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
