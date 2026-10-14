import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/LanguageContext';
import { LanguageToggle } from '../components/LanguageToggle';
import { NotificationBell } from '../components/NotificationBell';
import { BottomNav } from '../components/BottomNav';
import { 
  Sprout, 
  MapPin, 
  LogOut, 
  Menu, 
  X, 
  User as UserIcon, 
  ShieldCheck, 
  FileText,
  BarChart3,
  Bot,
  Layers,
  MessageSquare,
  Settings,
  CloudSun
} from 'lucide-react';

export const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { t, language } = useTranslation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', label: t('navDashboard'), icon: CloudSun },
    { to: '/forecast', label: t('navForecast'), icon: BarChart3 },
    { to: '/advisories', label: t('navAdvisories'), icon: Sprout },
    { to: '/assistant', label: t('navAssistant'), icon: Bot },
    { to: '/crops', label: t('navCrops'), icon: Layers },
    { to: '/feedback', label: t('navFeedback'), icon: MessageSquare },
    { to: '/settings', label: t('navSettings'), icon: Settings },
    { to: '/methodology', label: t('navMethodology'), icon: FileText },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-800">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-green-700 to-green-500 flex items-center justify-center text-white shadow-md shadow-green-700/20 group-hover:scale-105 transition-transform">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-extrabold text-stone-900 tracking-tight flex items-center gap-1.5">
                <span className="text-green-700">జై కిసాన్</span>
                <span className="text-stone-400 font-normal text-sm hidden sm:inline">| Jai Kisan</span>
              </span>
              <span className="block text-[10px] text-stone-400 font-medium -mt-1">
                Agro-Weather Advisory
              </span>
            </div>
          </Link>

          {/* Location Badge (Desktop/Tablet) */}
          {user?.location && (
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-medium border border-stone-200">
              <MapPin className="w-3.5 h-3.5 text-green-600" />
              <span>
                {user.location.village ? `${user.location.village}, ` : ''}
                {user.location.district}
              </span>
            </div>
          )}

          {/* Right Controls: Notifications, Language, Profile/Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageToggle variant="compact" />
            <NotificationBell />

            {/* User details / Logout on Desktop */}
            <div className="hidden md:flex items-center gap-2 pl-2 border-l border-stone-200">
              <div className="text-right">
                <p className="text-xs font-bold text-stone-900 max-w-[120px] truncate">
                  {user?.full_name || 'రైతు / Farmer'}
                </p>
                <p className="text-[11px] text-stone-500 capitalize">
                  {user?.role || 'Farmer'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title={t('logout')}
                aria-label={t('logout')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-stone-600 hover:text-stone-900 md:hidden rounded-lg hover:bg-stone-100"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Desktop Navigation Row */}
        <div className="hidden md:block border-t border-stone-100 bg-stone-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center space-x-1 py-1.5 overflow-x-auto no-scrollbar">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-green-700 text-white shadow-sm'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}

            {user?.role === 'admin' && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-purple-700 text-white shadow-sm'
                      : 'text-purple-700 hover:bg-purple-50'
                  }`
                }
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{t('navAdmin')}</span>
              </NavLink>
            )}
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-5 space-y-1 shadow-lg">
            {user?.location && (
              <div className="flex items-center gap-2 py-2 px-3 bg-stone-50 rounded-lg text-xs text-stone-600 mb-2">
                <MapPin className="w-4 h-4 text-green-600" />
                <span>
                  {user.location.village ? `${user.location.village}, ` : ''}
                  {user.location.district}, {user.location.state}
                </span>
              </div>
            )}

            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium text-stone-700 hover:bg-stone-100"
                >
                  <Icon className="w-5 h-5 text-green-600" />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            {user?.role === 'admin' && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-semibold text-purple-700 hover:bg-purple-50"
              >
                <ShieldCheck className="w-5 h-5 text-purple-600" />
                <span>{t('navAdmin')}</span>
              </Link>
            )}

            <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
              <span className="text-sm font-medium text-stone-600">
                {user?.full_name}
              </span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                <span>{t('logout')}</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-12">
        <Outlet />
      </main>

      {/* Bottom Navigation for Mobile */}
      <BottomNav />

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-stone-100/70 text-stone-500 py-6 text-xs text-center hidden md:block">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-medium text-stone-600">
            జై కిసాన్ (Jai Kisan) — Agricultural Weather Advisory Platform for Indian Farmers
          </p>
          <p className="text-stone-400">
            Weather powered by Open-Meteo • Agronomic advisories calibrated with ICAR, PJTSAU & ANGRAU research
          </p>
          <div className="flex items-center justify-center gap-4 text-stone-500 pt-1">
            <Link to="/methodology" className="hover:text-green-700 underline">
              {t('navMethodology')}
            </Link>
            <span>•</span>
            <Link to="/feedback" className="hover:text-green-700 underline">
              {t('navFeedback')}
            </Link>
            <span>•</span>
            <Link to="/settings" className="hover:text-green-700 underline">
              {t('navSettings')}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
