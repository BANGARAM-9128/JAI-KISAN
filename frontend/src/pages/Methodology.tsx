import React from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { 
  FileText, 
  CloudSun, 
  Sprout, 
  ShieldAlert, 
  ExternalLink, 
  BookOpen, 
  CheckCircle2, 
  HelpCircle 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Methodology: React.FC = () => {
  const { t, language } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold border border-green-200">
          <FileText className="w-4 h-4 text-green-700" />
          <span>శాస్త్రీయ పారదర్శకత / Scientific Transparency</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-stone-900 leading-tight">
          {t('methodologyTitle')}
        </h1>
        <p className="text-base text-stone-600 max-w-2xl">
          {t('methodologySubtitle')}
        </p>
      </div>

      {/* Section 1: Weather Data */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <CloudSun className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-stone-900">
              {t('weatherSourceTitle')}
            </h2>
            <span className="text-xs text-blue-600 font-semibold">Open-Meteo High Resolution NWP</span>
          </div>
        </div>

        <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
          {t('weatherSourceDesc')}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-1">
            <span className="font-bold text-stone-800 block">ECMWF Integrated Forecasting</span>
            <span className="text-stone-500">Global standard for 0-7 day medium-range forecasting</span>
          </div>
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-1">
            <span className="font-bold text-stone-800 block">NOAA GFS Ensembles</span>
            <span className="text-stone-500">Convective precipitation and cloud microphysics</span>
          </div>
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-1">
            <span className="font-bold text-stone-800 block">Downscaled Topography</span>
            <span className="text-stone-500">Corrected for local elevation and humidity traps</span>
          </div>
        </div>
      </div>

      {/* Section 2: Advisory Engine */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-stone-900">
              {t('advisoryEngineTitle')}
            </h2>
            <span className="text-xs text-green-600 font-semibold">ICAR / CRIDA / PJTSAU / ANGRAU</span>
          </div>
        </div>

        <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
          {t('advisoryEngineDesc')}
        </p>

        {/* Scientific Rules Table */}
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50 text-stone-700">
                <th className="py-2.5 px-3 font-bold">{language === 'te' ? 'వ్యవసాయ చర్య' : 'Field Operation'}</th>
                <th className="py-2.5 px-3 font-bold">{language === 'te' ? 'వాతావరణ ప్రమాణం' : 'Weather Parameter Threshold'}</th>
                <th className="py-2.5 px-3 font-bold">{language === 'te' ? 'శాస్త్రీయ హేతువు' : 'Scientific Rationale'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-600">
              <tr>
                <td className="py-3 px-3 font-semibold text-stone-900">
                  {language === 'te' ? 'పురుగు మందుల పిచికారీ' : 'Pesticide Foliar Spray'}
                </td>
                <td className="py-3 px-3">
                  {language === 'te' ? 'గాలి > 15 km/h లేదా వర్షం > 50%' : 'Wind > 15 km/h OR Rain Prob > 50%'}
                </td>
                <td className="py-3 px-3">
                  {language === 'te' ? 'మందు కొట్టుకుపోవడం మరియు డ్రిఫ్ట్ నివారణ' : 'Prevents spray drift and chemical wash-off (rain-fastness)'}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-stone-900">
                  {language === 'te' ? 'వరిలో నీటి నిర్వహణ' : 'Paddy Irrigation Control'}
                </td>
                <td className="py-3 px-3">
                  {language === 'te' ? 'రాబోయే 48 గంటల్లో వర్షం > 25 mm' : 'Rain Forecast > 25 mm in 48h'}
                </td>
                <td className="py-3 px-3">
                  {language === 'te' ? 'పూత దశలో ఎక్కువ నీరు నిలిస్తే తాలు గింజల నివారణ' : 'Avoids root zone hypoxia and spikelet sterility in flowering'}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-stone-900">
                  {language === 'te' ? 'పత్తిలో గులాబీ రంగు పురుగు' : 'Cotton Bollworm Alert'}
                </td>
                <td className="py-3 px-3">
                  {language === 'te' ? 'తేమ > 80% & ఉష్ణోగ్రత 26-32°C' : 'Humidity > 80% & Temp 26-32°C'}
                </td>
                <td className="py-3 px-3">
                  {language === 'te' ? 'తేమతో కూడిన వాతావరణం గుడ్లు పొదగడానికి అనుకూలం' : 'Optimum thermal-humidity band for egg oviposition'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 3: Official Disclaimers */}
      <div className="bg-amber-50/70 border border-amber-300 rounded-3xl p-6 sm:p-8 space-y-3">
        <div className="flex items-center gap-2 text-amber-950 font-bold text-lg">
          <ShieldAlert className="w-5 h-5 text-amber-600" />
          <h2>{t('disclaimerTitle')}</h2>
        </div>
        <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
          {t('disclaimerDesc')}
        </p>
      </div>

      {/* External Authority Links */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-3">
        <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
          {language === 'te' ? 'అధికారిక సంస్థల వెబ్‌సైట్లు' : 'Official Agricultural Portals'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
          <a
            href="https://icar.org.in"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-xl bg-stone-50 hover:bg-green-50 border border-stone-200 hover:border-green-300 text-stone-700 hover:text-green-800 transition-colors flex items-center justify-between"
          >
            <span>ICAR (Indian Council of Agricultural Research)</span>
            <ExternalLink className="w-4 h-4" />
          </a>

          <a
            href="https://pjtsau.edu.in"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-xl bg-stone-50 hover:bg-green-50 border border-stone-200 hover:border-green-300 text-stone-700 hover:text-green-800 transition-colors flex items-center justify-between"
          >
            <span>PJTSAU Telangana Agricultural University</span>
            <ExternalLink className="w-4 h-4" />
          </a>

          <a
            href="https://angrau.ac.in"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-xl bg-stone-50 hover:bg-green-50 border border-stone-200 hover:border-green-300 text-stone-700 hover:text-green-800 transition-colors flex items-center justify-between"
          >
            <span>ANGRAU Andhra Pradesh Agricultural University</span>
            <ExternalLink className="w-4 h-4" />
          </a>

          <a
            href="https://mausam.imd.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-xl bg-stone-50 hover:bg-green-50 border border-stone-200 hover:border-green-300 text-stone-700 hover:text-green-800 transition-colors flex items-center justify-between"
          >
            <span>IMD (India Meteorological Department)</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
