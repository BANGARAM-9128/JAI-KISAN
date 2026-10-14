import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from '../contexts/LanguageContext';
import { 
  CloudSun, 
  BarChart3, 
  Sprout, 
  Bot, 
  Layers 
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { language } = useTranslation();

  const navItems = [
    {
      to: '/dashboard',
      labelEn: 'Weather',
      labelTe: 'వాతావరణం',
      icon: CloudSun,
    },
    {
      to: '/forecast',
      labelEn: 'Forecast',
      labelTe: 'సూచన',
      icon: BarChart3,
    },
    {
      to: '/advisories',
      labelEn: 'Advisories',
      labelTe: 'సలహాలు',
      icon: Sprout,
    },
    {
      to: '/assistant',
      labelEn: 'Kisan AI',
      labelTe: 'AI సహాయం',
      icon: Bot,
    },
    {
      to: '/crops',
      labelEn: 'Crops',
      labelTe: 'పంటలు',
      icon: Layers,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 md:hidden pb-safe">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition-colors ${
                  isActive
                    ? 'text-green-700 bg-green-50/50'
                    : 'text-stone-500 hover:text-stone-800'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="truncate max-w-[64px]">
                {language === 'te' ? item.labelTe : item.labelEn}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
