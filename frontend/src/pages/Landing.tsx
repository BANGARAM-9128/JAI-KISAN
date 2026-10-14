import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../contexts/LanguageContext';
import { LanguageToggle } from '../components/LanguageToggle';
import { 
  CloudSun, 
  Sprout, 
  Languages, 
  Mic, 
  ArrowRight, 
  ShieldCheck, 
  Droplets, 
  CheckCircle2, 
  Compass, 
  ChevronRight 
} from 'lucide-react';

export const Landing: React.FC = () => {
  const { t, language } = useTranslation();

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col selection:bg-green-100 selection:text-green-900">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-700 flex items-center justify-center text-white shadow-md shadow-green-700/20">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-extrabold text-stone-900 tracking-tight">
                జై కిసాన్ <span className="text-green-700 text-sm font-semibold">| Jai Kisan</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LanguageToggle variant="compact" />
            <Link
              to="/login"
              className="text-sm font-semibold text-stone-700 hover:text-green-700 px-3 py-1.5 rounded-lg hover:bg-stone-100 transition-colors"
            >
              {t('login')}
            </Link>
            <Link
              to="/register"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-700 hover:bg-green-800 text-white text-sm font-bold shadow-md shadow-green-700/20 transition-all hover:scale-[1.02]"
            >
              <span>{t('getStarted')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:py-24 bg-gradient-to-b from-green-50/70 via-stone-50 to-stone-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-green-100 text-green-800 text-xs md:text-sm font-bold border border-green-200/80 shadow-sm animate-pulse-subtle">
            <span className="w-2 h-2 rounded-full bg-green-600 animate-ping"></span>
            <span>భారతీయ రైతుల కోసం విశ్వసనీయ వాతావరణ సలహా వేదిక</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-stone-900 tracking-tight leading-[1.15]">
            {t('landingHeroTitle')}
          </h1>

          <p className="text-base sm:text-xl text-stone-600 max-w-3xl mx-auto leading-relaxed">
            {t('landingHeroSubtitle')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-green-700 hover:bg-green-800 text-white text-base md:text-lg font-bold shadow-lg shadow-green-700/30 transition-all hover:scale-105"
            >
              <span>{t('landingCtaPrimary')}</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white hover:bg-stone-100 text-stone-800 text-base md:text-lg font-bold border border-stone-300 shadow-sm transition-all"
            >
              <span>{t('landingCtaSecondary')}</span>
            </Link>
          </div>

          {/* Trust Banner */}
          <p className="text-xs sm:text-sm text-stone-500 pt-4 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-green-600" />
            <span>{t('landingTrustedBy')}</span>
          </p>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-16 md:py-20 bg-white border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs uppercase font-bold text-green-700 tracking-wider bg-green-50 px-3 py-1 rounded-full border border-green-200">
              ఫీచర్లు / Core Features
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-stone-900">
              {language === 'te' ? 'రైతులకు పూర్తి సహకారం' : 'Everything a Farmer Needs'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 hover:border-green-300 transition-all shadow-sm group">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <CloudSun className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-2">
                {t('landingFeatureWeatherTitle')}
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                {t('landingFeatureWeatherDesc')}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 hover:border-green-300 transition-all shadow-sm group">
              <div className="w-12 h-12 rounded-xl bg-green-100 text-green-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Sprout className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-2">
                {t('landingFeatureAdvisoryTitle')}
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                {t('landingFeatureAdvisoryDesc')}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 hover:border-green-300 transition-all shadow-sm group">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Languages className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-2">
                {t('landingFeatureTeluguTitle')}
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                {t('landingFeatureTeluguDesc')}
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 hover:border-green-300 transition-all shadow-sm group">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Mic className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-2">
                {t('landingFeatureVoiceTitle')}
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                {t('landingFeatureVoiceDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Advisory Science Section */}
      <section className="py-16 md:py-20 bg-stone-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="bg-gradient-to-br from-green-800 to-green-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
            <div className="relative z-10 space-y-4 max-w-2xl">
              <span className="text-xs uppercase font-bold tracking-wider text-green-300 bg-green-900/60 px-3 py-1 rounded-full border border-green-700">
                శాస్త్రీయ వ్యవసాయ మార్గదర్శకాలు
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold leading-snug">
                ICAR & PJTSAU పరిశోధనలతో అనుసంధానించబడిన సలహాలు
              </h2>
              <p className="text-sm sm:text-base text-green-100 leading-relaxed">
                వాతావరణ మార్పుల వల్ల కలిగే నష్టాలను నివారించడానికి ప్రతి సలహా శాస్త్రీయ సూత్రాలపై ఆధారపడి ఉంటుంది. పురుగుమందుల పిచికారీ అనుకూల సమయం, నీటి యాజమాన్యం మరియు ఎరువుల మోతాదులను ఖచ్చితంగా నిర్ణయించండి.
              </p>
              <div className="pt-4 flex flex-wrap gap-4">
                <Link
                  to="/methodology"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-green-950 font-bold text-sm hover:bg-green-50 transition-colors"
                >
                  <span>{t('navMethodology')}</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-stone-200 bg-white py-8 text-stone-500 text-xs text-center">
        <div className="max-w-7xl mx-auto px-4 space-y-3">
          <div className="flex items-center justify-center gap-2 text-stone-700 font-bold text-base">
            <Sprout className="w-5 h-5 text-green-600" />
            <span>జై కిసాన్ | Jai Kisan</span>
          </div>
          <p>{t('appTagline')}</p>
          <div className="flex items-center justify-center gap-4 text-stone-400 pt-2">
            <Link to="/methodology" className="hover:text-green-700">
              {t('navMethodology')}
            </Link>
            <span>•</span>
            <Link to="/login" className="hover:text-green-700">
              {t('login')}
            </Link>
            <span>•</span>
            <Link to="/register" className="hover:text-green-700">
              {t('register')}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
