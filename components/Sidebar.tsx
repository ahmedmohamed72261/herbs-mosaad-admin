import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAppStore } from '@/store';
import { translations } from '@/lib/translations';
import {
  FiHome,
  FiPackage,
  FiLayers,
  FiUsers,
  FiAward,
  FiBook,
  FiMail,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiSun,
  FiMoon,
  FiGlobe,
  FiMapPin,
} from 'react-icons/fi';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar = ({ isOpen, onToggle }: SidebarProps) => {
  const router = useRouter();
  const { language, theme, setLanguage, toggleTheme, logout, user } = useAppStore();
  const t = translations[language];
  const isRtl = language === 'ar';

  const navItems = [
    { href: '/dashboard', label: t.nav.dashboard, icon: FiHome },
    { href: '/products', label: t.nav.products, icon: FiPackage },
    { href: '/categories', label: t.nav.categories, icon: FiLayers },
    { href: '/team', label: t.nav.team, icon: FiUsers },
    { href: '/export-countries', label: t.nav.exportCountries, icon: FiMapPin },
    { href: '/certificates', label: t.nav.certificates, icon: FiAward },
    { href: '/catalogs', label: t.nav.catalogs, icon: FiBook },
    { href: '/messages', label: t.nav.messages, icon: FiMail },
    { href: '/settings', label: t.nav.settings, icon: FiSettings },
  ];

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const mobileSlide = isOpen
    ? 'max-lg:translate-x-0'
    : 'max-lg:ltr:-translate-x-full max-lg:rtl:translate-x-full';

  const userInitial = user?.name?.charAt(0)?.toUpperCase() || 'A';

  return (
    <>
      <aside
        className={`glass-sidebar fixed inset-y-0 start-0 left-0 rtl:left-auto rtl:right-0 z-50 flex h-full w-[17.5rem] flex-col max-lg:transform max-lg:transition-transform max-lg:duration-300 max-lg:ease-out ${mobileSlide}`}
        aria-label={isRtl ? 'القائمة الجانبية' : 'Sidebar navigation'}
      >
        <div className="flex h-full flex-col">
          {/* Single header: brand + user */}
          <div className="relative mx-3 mt-5 mb-3 overflow-hidden rounded-2xl border border-white/50 bg-white/40 p-4 dark:border-white/10 dark:bg-white/5 backdrop-blur-sm">
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary-400/15 via-transparent to-secondary-500/10 dark:from-primary-500/20"
              aria-hidden
            />
            <div className="relative flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-emerald-600 text-lg font-bold text-white shadow-lg shadow-primary-500/25 ring-2 ring-white/40 dark:ring-white/10">
                {userInitial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400">
                  HERBS
                </p>
                <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                  {user?.name || 'Admin'}
                </p>
                <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                  {user?.email || 'admin@herbs.com'}
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2 custom-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = router.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onToggle}
                  className={`glass-nav-item ${
                    isActive ? 'glass-nav-item-active' : 'glass-nav-item-inactive'
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 shrink-0 ${isActive ? 'text-primary-600 dark:text-primary-400' : ''}`}
                  />
                  <span className="truncate">{item.label}</span>
                  {isActive && (
                    <span
                      className="ms-auto h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500 dark:bg-primary-400"
                      aria-hidden
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="space-y-2 border-t border-white/30 p-3 dark:border-white/10">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
                className="glass-pill-btn flex-1"
                title={language === 'en' ? 'Switch to Arabic' : 'Switch to English'}
              >
                <FiGlobe className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                <span>{language === 'en' ? 'English' : 'العربية'}</span>
              </button>
              <button
                type="button"
                onClick={toggleTheme}
                className="glass-pill-btn !px-3"
                title={theme === 'light' ? 'Dark mode' : 'Light mode'}
              >
                {theme === 'light' ? (
                  <FiMoon className="h-4 w-4" />
                ) : (
                  <FiSun className="h-4 w-4 text-amber-400" />
                )}
              </button>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl border border-red-200/60 bg-red-50/50 px-3.5 py-2.5 text-sm font-medium text-red-600 transition-all hover:bg-red-100/80 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-900/40"
            >
              <FiLogOut className="h-4 w-4 shrink-0" />
              <span>{t.nav.logout}</span>
            </button>
          </div>
        </div>
      </aside>

      <button
        type="button"
        onClick={onToggle}
        className="fixed top-4 start-4 z-40 flex h-11 w-11 items-center justify-center rounded-xl border border-white/50 bg-white/70 text-gray-800 shadow-lg backdrop-blur-xl transition-all hover:bg-white/90 dark:border-white/10 dark:bg-gray-900/70 dark:text-white lg:hidden"
        aria-label={isOpen ? (isRtl ? 'إغلاق القائمة' : 'Close menu') : isRtl ? 'فتح القائمة' : 'Open menu'}
      >
        {isOpen ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm transition-opacity lg:hidden dark:bg-black/60"
          onClick={onToggle}
          aria-hidden
        />
      )}
    </>
  );
};

export default Sidebar;
