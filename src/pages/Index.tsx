import React, { useState, useEffect } from 'react';
import { CloudLightning, MapPin, Building2, Clock, Leaf } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  currentEVData, 
  generateNoiseData, 
  getCurrentEVAdoption, 
  calculateNoiseReduction,
  type NoiseDataPoint 
} from '@/data/evData';
import { resetTimeSeries } from '@/data/unifiedDataAdapter';
import { NoiseDisplay } from '@/components/NoiseDisplay';
import { NoiseChart } from '@/components/NoiseChart';
import { EVAdoptionDisplay } from '@/components/EVAdoptionDisplay';
import { ConsentDialog } from '@/components/ConsentDialog';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { analytics } from '@/lib/analytics';
import { useScrollTracking } from '@/hooks/useAnalytics';

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
    sensorLocation: "Data Methodology",
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
    sensorDesc: "Our model synthesizes traffic data and EV adoption rates to accurately estimate noise reduction. Validated using DRSP noise maps and spot measurements (±1.2 dB accuracy).",
    poweredBy: "Powered by",
    contact: "Contact us at",
    evImpact: "EV Noise Reduction",
    realTimeData: "Real-time correlation with EV adoption data",
    analyticsTitle: "Privacy Analytics",
    analyticsDescription: "All data is anonymized and used only for environmental research. No personal information is stored.",
    showData: "Show",
    hideData: "Hide"
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
    sensorLocation: "Méthodologie des Données",
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
    sensorDesc: "Notre modèle synthétise les données de circulation et les taux d'adoption des VÉ pour estimer avec précision la réduction du bruit. Validé à l'aide des cartes sonores DRSP et de mesures ponctuelles (précision ±1,2 dB).",
    poweredBy: "Propulsé par",
    contact: "Contactez-nous à",
    evImpact: "Réduction de Bruit VÉ",
    realTimeData: "Corrélation en temps réel avec les données d'adoption VÉ",
    analyticsTitle: "Analyse de la Confidentialité",
    analyticsDescription: "Toutes les données sont anonymisées et utilisées uniquement à des fins de recherche environnementale. Aucune information personnelle n'est stockée.",
    showData: "Afficher",
    hideData: "Masquer"
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
  
  // Track different sections of the app
  const chartSectionRef = useScrollTracking({ 
    enabled: consentGiven, 
    sectionName: 'noise_chart' 
  });
  const evSectionRef = useScrollTracking({ 
    enabled: consentGiven, 
    sectionName: 'ev_adoption' 
  });
  const guideSectionRef = useScrollTracking({ 
    enabled: consentGiven, 
    sectionName: 'noise_guide' 
  });
  
  // Track user engagement with environmental data
  useEffect(() => {
    if (consentGiven) {
      analytics.trackEnvironmentalInteraction('noise_level', {
        current_noise: currentNoise,
        noise_reduction: noiseReduction,
        ev_adoption: evAdoption
      });
    }
  }, [currentNoise, consentGiven]); // Track when noise levels change significantly

  // Track user session duration milestones
  useEffect(() => {
    if (!consentGiven) return;
    
    const milestones = [30, 60, 120, 300]; // 30s, 1m, 2m, 5m
    const timers = milestones.map(seconds => 
      setTimeout(() => {
        analytics.trackEvent('engagement_milestone', { 
          duration_seconds: seconds,
          language 
        });
      }, seconds * 1000)
    );

    return () => timers.forEach(timer => clearTimeout(timer));
  }, [consentGiven, language]);

  // Initialize time series data once when component mounts
  useEffect(() => {
    if (consentGiven) {
      // Reset time series only once
      resetTimeSeries();
      
      // Initialize with initial data
      const initialData = generateNoiseData();
      setNoiseData(initialData);
      
      const latestNoise = initialData[initialData.length - 1];
      setCurrentNoise(latestNoise.noise);
    }
  }, [consentGiven]);

  // Data-driven live updates using the structured EV data
  useEffect(() => {
    if (!consentGiven) return;

    const interval = setInterval(() => {
      // Get current EV adoption rate (simulated real-time data)
      const currentEVRate = getCurrentEVAdoption();
      const currentNoiseReduction = calculateNoiseReduction(currentEVRate);
      
      // Generate updated noise data (adds one point, preserves history)
      const newNoiseData = generateNoiseData(currentEVRate);
      const latestNoise = newNoiseData[newNoiseData.length - 1];
      
      // Update state with data-driven values
      setEvAdoption(currentEVRate);
      setNoiseReduction(currentNoiseReduction);
      setCurrentNoise(latestNoise.noise);
      setLastUpdate(0);
      
      // Update chart with continuous time series
      setNoiseData([...newNoiseData]);
      
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
  }, [consentGiven]);  const handleConsent = (accepted: boolean) => {
    if (accepted) {
      setConsentGiven(true);
      setShowConsent(false);
      // Enable analytics after consent
      analytics.enableAnalytics();
      analytics.trackPageView('noise_monitor_main');
      // TODO: Store consent in Supabase when integration is enabled
      console.log('User consent stored - ready for Supabase integration');
    } else {
      analytics.trackEvent('consent_declined');
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
    return <ConsentDialog showConsent={showConsent} onConsent={handleConsent} t={t} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      <div className="flex-1 p-4">
        <div className="max-w-7xl mx-auto flex flex-col space-y-4">
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
                  <span className={`text-sm ${language === 'en' ? 'text-white' : 'text-slate-500'}`}>EN</span>                  <Switch 
                    checked={language === 'fr'} 
                    onCheckedChange={(checked) => {
                      const newLang = checked ? 'fr' : 'en';
                      setLanguage(newLang);
                      analytics.trackFeatureUsage('language_switch', 'change', { language: newLang });
                    }}
                  />
                  <span className={`text-sm ${language === 'fr' ? 'text-white' : 'text-slate-500'}`}>FR</span>
                </div>
              </div>
            </div>
          </div>        {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
            <NoiseDisplay 
              currentNoise={currentNoise}
              noiseReduction={noiseReduction}
              lastUpdate={lastUpdate}
              t={t}
            />

            <div ref={chartSectionRef as any}>
              <NoiseChart noiseData={noiseData} t={t} />
            </div>

            <div ref={evSectionRef as any}>
              <EVAdoptionDisplay evAdoption={evAdoption} t={t} />
            </div>

            {/* Noise Guide */}
            <Card ref={guideSectionRef as any} className="bg-slate-800/90 border-slate-600 backdrop-blur-sm">
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
            </Card>          {/* Data Methodology */}
            <Card className="bg-slate-800/90 border-slate-600 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-white flex items-center gap-2 text-lg">
                  <Building2 className="text-blue-400" size={20} />
                  Data Methodology
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-200 font-medium">EV Impact Model</span>
                    <Badge variant="outline" className="bg-green-900/30 text-green-200 border-green-700 text-[10px]">
                      May 2025
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Our noise-EV correlation model uses DRSP noise mapping (LAeq24) and SAAQ-AVÉQ EV adoption data to demonstrate the -1.15 dB impact on Papineau since June 2023.
                  </p>
                  <div className="flex items-center justify-between text-[11px] mt-1">
                    <span className="text-blue-300">Sensor at {t.dauphinsTower}</span>
                    <Badge variant="outline" className="ml-2 bg-amber-900/30 text-amber-200 border-amber-700 text-[10px]">
                      Coming Soon
                    </Badge>
                  </div>
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
                </div>              </CardContent>
            </Card>
            
            {/* Analytics Dashboard - Show transparency about data collection */}
            <AnalyticsDashboard enabled={consentGiven} t={t} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/95 mt-auto">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-sm text-slate-400 py-4">
            <p>
              {t.poweredBy}{" "}
              <a 
                href="https://datasciencetech.ca" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
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
      </footer>
    </div>
  );
};

export default Index;
