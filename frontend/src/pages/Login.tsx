import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/LanguageContext';
import { LogIn, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err: unknown) {
      setError(t('invalidCredentials'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemo = (role: 'farmer' | 'admin' = 'farmer') => {
    if (role === 'admin') {
      setEmail('admin@jaikisan.in');
      setPassword('Admin@123456');
    } else {
      setEmail('farmer@jaikisan.in');
      setPassword('Farmer@123456');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-black text-stone-900">
          {t('authWelcomeBack')}
        </h2>
        <p className="text-sm text-stone-500">
          {t('authLoginSubtitle')}
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
            {t('emailLabel')}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
              <Mail className="w-5 h-5" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="farmer@jaikisan.in"
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 text-stone-900 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
            {t('passwordLabel')}
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

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-green-700 hover:bg-green-800 text-white font-bold text-base shadow-md shadow-green-700/20 transition-all disabled:opacity-50"
        >
          {isSubmitting ? (
            <span>{t('loading')}</span>
          ) : (
            <>
              <LogIn className="w-5 h-5" />
              <span>{t('login')}</span>
            </>
          )}
        </button>
      </form>

      {/* Demo Credentials Quick-Fill */}
      <div className="pt-2 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => handleFillDemo('farmer')}
          className="py-2 px-2.5 border border-dashed border-green-300 rounded-xl bg-green-50/50 hover:bg-green-50 text-green-800 text-xs font-semibold transition-colors text-center"
        >
          ⚡ Farmer Login
        </button>
        <button
          type="button"
          onClick={() => handleFillDemo('admin')}
          className="py-2 px-2.5 border border-dashed border-purple-300 rounded-xl bg-purple-50/50 hover:bg-purple-50 text-purple-800 text-xs font-semibold transition-colors text-center"
        >
          🔑 Admin Login
        </button>
      </div>

      <div className="text-center pt-2 border-t border-stone-100">
        <p className="text-sm text-stone-600">
          {t('noAccount')}{' '}
          <Link
            to="/register"
            className="font-bold text-green-700 hover:text-green-800 underline inline-flex items-center gap-0.5"
          >
            <span>{t('register')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </p>
      </div>
    </div>
  );
};
