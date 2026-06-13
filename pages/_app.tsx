import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Toaster } from 'react-hot-toast';
import { useAppStore } from '@/store';
import AppLoading from '@/components/AppLoading';

export default function App({ Component, pageProps }: AppProps) {
  const { theme, language } = useAppStore();
  const router = useRouter();
  const [routeLoading, setRouteLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    const handleStart = () => setRouteLoading(true);
    const handleStop = () => setRouteLoading(false);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleStop);
    router.events.on('routeChangeError', handleStop);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleStop);
      router.events.off('routeChangeError', handleStop);
    };
  }, [router.events]);

  useEffect(() => {
    const timer = window.setTimeout(() => setInitialLoad(false), 400);
    return () => window.clearTimeout(timer);
  }, []);

  const showLoader = routeLoading || initialLoad;

  return (
    <>
      <AppLoading show={showLoader} />
      <Component {...pageProps} />
      <Toaster position={language === 'ar' ? 'top-left' : 'top-right'} />
    </>
  );
}
