import * as React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
  label = 'Loading...',
}) => {
  return (
    <div 
      role="status" 
      aria-live="polite"
      className={cn('flex items-center justify-center gap-2', className)}
    >
      <Loader2 
        className={cn('animate-spin text-primary', sizeClasses[size])} 
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
};

interface LoadingOverlayProps {
  isLoading: boolean;
  label?: string;
  children: React.ReactNode;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  label = 'Loading...',
  children,
}) => {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div 
          className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
          role="progressbar"
          aria-busy="true"
          aria-label={label}
        >
          <LoadingSpinner size="lg" label={label} />
        </div>
      )}
    </div>
  );
};
