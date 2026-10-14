import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/LanguageContext';
import { User, Mail, Lock, Phone, AlertCircle, UserPlus, ArrowRight } from 'lucide-react';
import { Language } from '../types';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const { t, language, setLanguage } = useTranslation();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [prefLang, setPrefLang] = useState<Language>(language);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError(t('passwordsDoNotMatch'));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      setLanguage(prefLang);
      await register({
        full_name: fullName,
        email,
        phone_number: phone,
        password,
        language: prefLang,
      });
      navigate('/onboarding', { replace: true });
    } catch {
      setError('Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-black text-stone-900">
          {t('authRegisterTitle')}
        </h2>
        <p className="text-sm text-stone-500">
          {t('authRegisterSubtitle')}
        </p>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs sm:text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
            {t('fullNameLabel')} *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
              <User className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. రమేష్ నాయుడు / Ramesh Naidu"
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 text-stone-900 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
            {t('emailLabel')} *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
              <Mail className="w-5 h-5" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="farmer@example.com"
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 text-stone-900 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
            {t('phoneNumberLabel')}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
              <Phone className="w-5 h-5" />
            </div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 text-stone-900 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              {t('passwordLabel')} *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 text-stone-900 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              {t('confirmPasswordLabel')} *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 text-stone-900 text-sm"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
            {t('preferredLanguage')}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPrefLang('te')}
              className={`py-2 px-3 rounded-xl border text-sm font-bold transition-all ${
                prefLang === 'te'
                  ? 'bg-green-50 border-green-600 text-green-800 ring-2 ring-green-600/20'
                  : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
            >
              తెలుగు (Telugu)
            </button>
            <button
              type="button"
              onClick={() => setPrefLang('en')}
              className={`py-2 px-3 rounded-xl border text-sm font-bold transition-all ${
                prefLang === 'en'
                  ? 'bg-green-50 border-green-600 text-green-800 ring-2 ring-green-600/20'
                  : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
            >
              English
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-green-700 hover:bg-green-800 text-white font-bold text-base shadow-md shadow-green-700/20 transition-all disabled:opacity-50 pt-3"
        >
          {isSubmitting ? (
            <span>{t('submitting')}</span>
          ) : (
            <>
              <UserPlus className="w-5 h-5" />
              <span>{t('register')}</span>
            </>
          )}
        </button>
      </form>

      <div className="text-center pt-2 border-t border-stone-100">
        <p className="text-sm text-stone-600">
          {t('alreadyHaveAccount')}{' '}
          <Link
            to="/login"
            className="font-bold text-green-700 hover:text-green-800 underline inline-flex items-center gap-0.5"
          >
            <span>{t('login')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </p>
      </div>
    </div>
  );
};
