'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, X, AlertCircle, Info } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, isVisible, onClose, duration = 4000 }: ToastProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      setProgress(100);
      
      // Progress bar animation
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - (100 / (duration / 50));
          return newProgress <= 0 ? 0 : newProgress;
        });
      }, 50);
      
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => {
        clearTimeout(timer);
        clearInterval(progressInterval);
      };
    }
  }, [isVisible, duration]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 500);
  };

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-gradient-to-r from-green-500 to-emerald-600',
          icon: CheckCircle,
          iconColor: 'text-white',
          borderColor: 'border-green-400',
          shadowColor: 'shadow-green-500/25'
        };
      case 'error':
        return {
          bg: 'bg-gradient-to-r from-red-500 to-rose-600',
          icon: AlertCircle,
          iconColor: 'text-white',
          borderColor: 'border-red-400',
          shadowColor: 'shadow-red-500/25'
        };
      case 'info':
        return {
          bg: 'bg-gradient-to-r from-blue-500 to-indigo-600',
          icon: Info,
          iconColor: 'text-white',
          borderColor: 'border-blue-400',
          shadowColor: 'shadow-blue-500/25'
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-green-500 to-emerald-600',
          icon: CheckCircle,
          iconColor: 'text-white',
          borderColor: 'border-green-400',
          shadowColor: 'shadow-green-500/25'
        };
    }
  };

  const { bg, icon: Icon, iconColor, borderColor, shadowColor } = getToastStyles();

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div
        className={`
          ${bg} ${borderColor} ${shadowColor} text-white px-6 py-4 rounded-2xl shadow-2xl border-2
          flex items-center space-x-3 min-w-[320px] max-w-[420px]
          transform transition-all duration-500 ease-out backdrop-blur-sm
          ${
            isAnimating
              ? 'translate-x-0 opacity-100 scale-100 rotate-0'
              : 'translate-x-full opacity-0 scale-95 rotate-3'
          }
          hover:scale-105 hover:shadow-3xl
        `}
      >
        <div className="relative">
          <Icon className={`h-6 w-6 ${iconColor} flex-shrink-0 animate-pulse`} />
          <div className="absolute -inset-1 bg-white/20 rounded-full animate-ping opacity-75"></div>
        </div>
        <p className="text-sm font-semibold flex-1 leading-relaxed">{message}</p>
        <button
          onClick={handleClose}
          className="text-white hover:text-gray-200 transition-all duration-200 p-2 rounded-full hover:bg-white/20 hover:rotate-90 transform"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      
      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 rounded-b-2xl overflow-hidden">
        <div 
          className="h-full bg-white/60 transition-all duration-75 ease-linear"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}

// Hook untuk menggunakan toast
export function useToast() {
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    isVisible: boolean;
  }>({ message: '', type: 'success', isVisible: false });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  return {
    toast,
    showToast,
    hideToast
  };
}