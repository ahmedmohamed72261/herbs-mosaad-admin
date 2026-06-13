import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '@/store';

interface AppLoadingProps {
  show: boolean;
}

export default function AppLoading({ show }: AppLoadingProps) {
  const { language } = useAppStore();
  const label = language === 'ar' ? 'جاري التحميل...' : 'Loading...';

  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            className="fixed inset-x-0 top-0 z-[100] h-1 overflow-hidden bg-primary-500/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="h-full w-1/3 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 shadow-[0_0_12px_rgba(34,197,94,0.6)]"
              initial={{ x: '-100%' }}
              animate={{ x: '400%' }}
              transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
            />
          </motion.div>

          <motion.div
            className="fixed inset-0 z-[90] flex items-center justify-center bg-gray-950/25 backdrop-blur-[2px] dark:bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            aria-live="polite"
            aria-busy="true"
          >
            <motion.div
              className="flex flex-col items-center gap-4 rounded-3xl border border-white/50 bg-white/80 px-10 py-8 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-gray-900/80"
              initial={{ opacity: 0, scale: 0.92, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 4 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relative h-14 w-14">
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-primary-200 dark:border-primary-900"
                  aria-hidden
                />
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary-500 border-r-primary-400"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.85, repeat: Infinity, ease: 'linear' }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-black text-primary-600 dark:text-primary-400">H</span>
                </div>
              </div>
              <p className="text-sm font-semibold tracking-wide text-gray-700 dark:text-gray-200">
                {label}
              </p>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
