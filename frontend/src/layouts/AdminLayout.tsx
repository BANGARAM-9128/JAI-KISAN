import React from 'react';
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/LanguageContext';
import { LanguageToggle } from '../components/LanguageToggle';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  FileText, 
  Users, 
  ArrowLeft, 
  LogOut,
  Activity,
  Database
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-stone-900 text-stone-200 p-5 flex flex-col justify-between border-r border-stone-800">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base">Admin Panel</h2>
              <span className="text-xs text-purple-400 font-medium">జై కిసాన్ నిర్వహణ</span>
            </div>
          </div>

          <nav className="space-y-1.5 pt-4 border-t border-stone-800">
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-purple-600 text-white'
                    : 'text-stone-400 hover:text-white hover:bg-stone-800'
                }`
              }
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>{t('adminTitle')}</span>
            </NavLink>

            <Link
              to="/dashboard"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('navDashboard')}</span>
            </Link>
          </nav>
        </div>

        <div className="pt-6 border-t border-stone-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-400">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="p-1.5 text-stone-400 hover:text-red-400 rounded-lg"
              title={t('logout')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Admin Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-stone-900">
            Jai Kisan Operations & Telemetry
          </h1>
          <div className="flex items-center gap-3">
            <LanguageToggle variant="compact" />
          </div>
        </header>

        <main className="p-4 md:p-8 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
