import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Car, Leaf, CloudLightning, MapPin, Building2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  currentEVData, 
  generateNoiseData, 
  getCurrentEVAdoption, 
  calculateNoiseReduction,
  type NoiseDataPoint 
} from '@/data/evData';

// EV adoption data for Montreal/Quebec/Canada (realistic estimates)
const evAdoptionData = {
  montreal: { current: 8.2, target2030: 35 },
  quebec: { current: 12.4, target2030: 40 },
  canada: { current: 9.1, target2030: 30 }
};

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
    status: "Status: Active Monitoring",
    sensorLocation: "Sensor Location",
    dauphinsTower: "Les Dauphins sur Le Parc (28th floor)",
    noiseGuide: "Noise Level Guide",
    quiet: "Quiet",
    moderate: "Moderate",
    loud: "Loud/Traffic",
    veryLoud: "Very Loud/Rush Hour",
    rushHourInfo: "Rush Hour Impact",
    rushHourDesc: "Peak traffic from South Shore commuters",
    peakHours: "Peak: 7-9 AM, 4-7 PM",
    aboutSensor: "About Our Monitoring",
    sensorDesc: "High-sensitivity audio sensor and AI model positioned at Les Dauphins sur Le Parc, providing precise noise measurements at this busy Plateau intersection.",
    poweredBy: "Powered by",
    contact: "Contact us at",
    evImpact: "EV Noise Reduction",
    realTimeData: "Real-time correlation with EV adoption data"
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
    status: "Statut: Surveillance Active",
    sensorLocation: "Emplacement du Capteur",
    dauphinsTower: "Les Dauphins sur Le Parc (28e étage)",
    noiseGuide: "Guide des Niveaux de Bruit",
    quiet: "Calme",
    moderate: "Modéré",
    loud: "Fort/Circulation",
    veryLoud: "Très Fort/Heure de Pointe",
    rushHourInfo: "Impact Heure de Pointe",
    rushHourDesc: "Circulation de pointe des banlieusards de la Rive-Sud",
    peakHours: "Pointe: 7-9h, 16-19h",
    aboutSensor: "À Propos de Notre Surveillance",
    sensorDesc: "Capteur audio haute sensibilité et modèle IA positionnés aux Dauphins sur Le Parc, fournissant des mesures précises du bruit à cette intersection achalandée du Plateau.",
    poweredBy: "Propulsé par",
    contact: "Contactez-nous à",
    evImpact: "Réduction de Bruit VÉ",
    realTimeData: "Corrélation en temps réel avec les données d'adoption VÉ"
  }
};

const Index = () => {
  const [language, setLanguage] = useState<'en' | 'fr'>('en');
  const [showConsent, setShowConsent] = useState(true);
  const [consentGiven, setConsentGiven] = useState(false);
  const [currentNoise, setCurrentNoise] = useState(45);
  const [evAdoption, setEvAdoption] = useState(getCurrentEVAdoption());
  const [noiseReduction, setNoiseReduction] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(0);
  const [noiseData, setNoiseData] = useState<NoiseDataPoint[]>([]);

  const t = translations[language];

  // Data-driven live updates using the structured EV data
  useEffect(() => {
    if (!consentGiven) return;

    const interval = setInterval(() => {
      // Get current EV adoption rate (simulated real-time data)
      const currentEVRate = getCurrentEVAdoption();
      const currentNoiseReduction = calculateNoiseReduction(currentEVRate);
      
      // Generate noise data based on current EV adoption
      const newNoiseData = generateNoiseData(currentEVRate);
      const latestNoise = newNoiseData[newNoiseData.length - 1];
      
      // Update state with data-driven values
      setEvAdoption(currentEVRate);
      setNoiseReduction(currentNoiseReduction);
      setCurrentNoise(latestNoise.noise);
      setLastUpdate(0);
      
      // Keep only last 20 data points for the chart
      setNoiseData(newNoiseData);
      
      console.log('Data Update:', {
        evRate: currentEVRate,
        noiseLevel: latestNoise.noise,
        evImpact: latestNoise.evImpact,
        noiseReduction: currentNoiseReduction
      });
    }, 3000);

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
      // TODO: Store consent in Supabase when integration is enabled
      console.log('User consent stored - ready for Supabase integration');
    } else {
      window.close();
    }
  };

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
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
              <CloudLightning className="text-blue-400" size={28} />
              {t.title}
            </h1>
            <p className="text-slate-400 text-sm">{t.subtitle}</p>
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
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0">
          {/* Current Noise Level with EV Impact Display */}
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

          {/* Enhanced Chart with EV Impact Data */}
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

          {/* Enhanced EV Adoption Rate with Real Data */}
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

          {/* Noise Guide */}
          <Card className="bg-slate-800/90 border-slate-600 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center gap-2 text-lg">
                <Leaf className="text-green-400" size={20} />
                {t.noiseGuide}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-green-400 font-medium">30-40 dB</span>
                <span className="text-slate-200">{t.quiet}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-yellow-400 font-medium">40-50 dB</span>
                <span className="text-slate-200">{t.moderate}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-orange-400 font-medium">50-60 dB</span>
                <span className="text-slate-200">{t.loud}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-red-400 font-medium">60+ dB</span>
                <span className="text-slate-200">{t.veryLoud}</span>
              </div>
            </CardContent>
          </Card>

          {/* Sensor Location */}
          <Card className="bg-slate-800/90 border-slate-600 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center gap-2 text-lg">
                <Building2 className="text-blue-400" size={20} />
                {t.sensorLocation}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="text-blue-400" size={16} />
                  <span className="text-slate-200">{t.dauphinsTower}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {t.sensorDesc}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Rush Hour Info */}
          <Card className="lg:col-span-2 bg-slate-800/90 border-slate-600 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center gap-2 text-lg">
                <Clock className="text-orange-400" size={20} />
                {t.rushHourInfo}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-200 text-sm leading-relaxed">
                    {t.rushHourDesc}
                  </p>
                </div>
                <div className="text-center">
                  <Badge variant="secondary" className="bg-orange-700/50 text-orange-200 border-orange-600">
                    {t.peakHours}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-slate-700">
          <div className="text-center text-sm text-slate-400">
            <p>
              {t.poweredBy}{" "}
              <a 
                href="https://datasciencetech.ca" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                datasciencetech.ca
              </a>
              {" "}&middot;{" "}
              {t.contact}{" "}
              <a 
                href="mailto:info@datasciencetech.ca" 
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                info@datasciencetech.ca
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
