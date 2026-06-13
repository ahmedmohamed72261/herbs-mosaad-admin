import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAppStore } from '@/store';
import Sidebar from './Sidebar';
import { PageTransition } from './Motion';
import { LoadingSpinner } from './Loading';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const Layout = ({ children, title }: LayoutProps) => {
  const router = useRouter();
  const { isAuthenticated, language } = useAppStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
    setAuthReady(true);
  }, [isAuthenticated, router]);

  if (!authReady) {
    return (
      <div className="admin-shell-bg flex min-h-screen items-center justify-center bg-gray-50/90 dark:bg-gray-950/95">
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-white/50 bg-white/75 px-10 py-8 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-gray-900/70">
          <LoadingSpinner size="lg" />
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {language === 'ar' ? 'جاري التحقق...' : 'Checking session...'}
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Head>
        <title>{title ? `${title} | Admin` : 'Admin Dashboard'}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="admin-shell-bg min-h-screen bg-gray-50/90 dark:bg-gray-950/95 transition-colors duration-300">
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className="min-h-screen w-full ps-0 lg:ps-[17.5rem] transition-[padding] duration-300">
          <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <PageTransition>{children}</PageTransition>
          </main>
        </div>
      </div>
    </>
  );
};

export default Layout;
