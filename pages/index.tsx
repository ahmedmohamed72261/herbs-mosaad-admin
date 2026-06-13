import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAppStore } from '@/store';
import { translations } from '@/lib/translations';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { FiSun, FiMoon, FiGlobe } from 'react-icons/fi';
import { FadeIn } from '@/components/Motion';

const Login = () => {
  const router = useRouter();
  const { language, theme, setLanguage, toggleTheme, login, isAuthenticated } = useAppStore();
  const t = translations[language];
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/login', formData);
      login(response.data.user, response.data.access_token);
      toast.success(t.common.success);
      router.push('/dashboard');
    } catch (error) {
      toast.error(t.common.error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="admin-shell-bg min-h-screen flex items-center justify-center bg-gray-50/90 dark:bg-gray-950/95 px-4">
      <div className="absolute top-4 end-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
          className="glass-pill-btn"
        >
          <FiGlobe className="w-4 h-4 text-primary-600 dark:text-primary-400" />
          <span>{language === 'en' ? 'العربية' : 'English'}</span>
        </button>
        <button
          type="button"
          onClick={toggleTheme}
          className="glass-pill-btn !px-3"
        >
          {theme === 'light' ? <FiMoon className="w-4 h-4" /> : <FiSun className="w-4 h-4 text-amber-400" />}
        </button>
      </div>

      <FadeIn className="w-full max-w-md p-8 rounded-3xl border border-white/50 bg-white/70 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-gray-900/60">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
            HERBS
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t.auth.loginToAdmin}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              {t.auth.email}
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="admin@herbs.com"
              className="glass-input"
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              {t.auth.password}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              className="glass-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-6 py-3 font-semibold text-white shadow-lg shadow-primary-500/25 transition-all hover:from-primary-700 hover:to-primary-600 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? t.common.loading : t.auth.signIn}
          </button>
        </form>

        <div className="mt-6 rounded-xl border border-white/40 bg-white/40 p-4 dark:border-white/10 dark:bg-white/5">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Demo:</strong> admin@herbs.com / password123
          </p>
        </div>
      </FadeIn>
    </div>
  );
};

export default Login;
