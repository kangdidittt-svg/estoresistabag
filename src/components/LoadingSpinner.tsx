'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  overlay?: boolean;
  className?: string;
  color?: 'white' | 'primary' | 'accent';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  overlay = false,
  className = '',
  color = 'white'
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-6 h-6 border-2';
      case 'large':
        return 'w-16 h-16 border-4';
      default:
        return 'w-12 h-12 border-3';
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'primary':
        return 'border-theme-primary border-opacity-20 border-t-theme-primary';
      case 'accent':
        return 'border-accent-mint border-opacity-20 border-t-accent-mint';
      default:
        return 'border-white border-opacity-20 border-t-white';
    }
  };

  const spinner = (
    <div 
      className={`
        ${getSizeClasses()}
        ${getColorClasses()}
        rounded-full 
        animate-spin
        ${className}
      `}
      style={{
        animation: 'spin 1s linear infinite'
      }}
    />
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-theme-main bg-opacity-80 flex items-center justify-center z-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-white border-opacity-20 border-t-white rounded-full animate-spin" style={{ animation: 'spin 1s linear infinite' }}></div>
          <p className="text-white text-sm font-medium animate-pulse">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center p-4">
      <div className="w-8 h-8 border-3 border-accent-peach border-opacity-20 border-t-accent-peach rounded-full animate-spin"></div>
    </div>
  );
};

export default LoadingSpinner;

// Hook untuk loading state
export const useLoading = () => {
  const [isLoading, setIsLoading] = React.useState(false);

  const startLoading = () => setIsLoading(true);
  const stopLoading = () => setIsLoading(false);

  return {
    isLoading,
    startLoading,
    stopLoading
  };
};

// Loading wrapper component
export const LoadingWrapper: React.FC<{
  isLoading: boolean;
  children: React.ReactNode;
  overlay?: boolean;
}> = ({ isLoading, children, overlay = true }) => {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <LoadingSpinner overlay={overlay} />
      )}
    </div>
  );
};