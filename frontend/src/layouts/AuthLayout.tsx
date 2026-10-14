import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { LanguageToggle } from '../components/LanguageToggle';
import { Sprout } from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';

export const AuthLayout: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-stone-50 to-stone-100 flex flex-col justify-between p-4 sm:p-6">
      {/* Top Header */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between py-2">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-green-700 flex items-center justify-center text-white shadow group-hover:scale-105 transition-transform">
            <Sprout className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-stone-900 text-lg">
            జై కిసాన్ <span className="text-green-700 font-semibold text-sm">| Jai Kisan</span>
          </span>
        </Link>

        <LanguageToggle variant="compact" />
      </div>

      {/* Main Card */}
      <div className="max-w-md w-full mx-auto my-auto py-6">
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xl p-6 sm:p-8 space-y-6">
          <Outlet />
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-md w-full mx-auto text-center py-4 text-xs text-stone-400">
        <p>భారతీయ రైతుల కోసం రూపొందించబడిన వాతావరణ వేదిక</p>
        <p>Jai Kisan Agricultural Advisory System • {new Date().getFullYear()}</p>
      </div>
    </div>
  );
};
