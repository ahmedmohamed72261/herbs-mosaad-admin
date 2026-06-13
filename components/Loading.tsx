import React from 'react';
import { motion } from 'motion/react';
import { useAppStore } from '@/store';

interface SkeletonProps {
  className?: string;
  count?: number;
  circle?: boolean;
}

const Skeleton: React.FC<SkeletonProps> = ({
  className = 'h-12 w-full',
  count = 1,
  circle = false,
}) => {
  const skeletons = Array.from({ length: count });

  return (
    <>
      {skeletons.map((_, i) => (
        <div
          key={i}
          className={`bg-gray-200 dark:bg-gray-700 animate-pulse rounded ${
            circle ? 'rounded-full' : ''
          } ${className}`}
        />
      ))}
    </>
  );
};

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'text-primary-600 dark:text-primary-400',
  className = '',
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <svg
      className={`animate-spin ${sizes[size]} ${color} ${className}`}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

interface PageLoaderProps {
  className?: string;
  label?: string;
}

const PageLoader: React.FC<PageLoaderProps> = ({ className = '', label }) => {
  const { language } = useAppStore();
  const text = label ?? (language === 'ar' ? 'جاري تحميل البيانات...' : 'Loading data...');

  return (
    <div
      className={`flex min-h-[280px] flex-col items-center justify-center gap-4 rounded-2xl border border-white/50 bg-white/50 p-12 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 ${className}`}
    >
      <LoadingSpinner size="lg" />
      <motion.p
        className="text-sm font-medium text-gray-600 dark:text-gray-400"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.6, repeat: Infinity }}
      >
        {text}
      </motion.p>
    </div>
  );
};

export { Skeleton, LoadingSpinner, PageLoader };
