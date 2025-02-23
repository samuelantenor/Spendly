import { useState, useCallback } from 'react';

interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
  type?: 'success' | 'error' | 'info';
}

export function useToast() {
  const [isVisible, setIsVisible] = useState(false);
  const [toastOptions, setToastOptions] = useState<ToastOptions>({});

  const toast = useCallback((options: ToastOptions) => {
    setToastOptions(options);
    setIsVisible(true);
    
    setTimeout(() => {
      setIsVisible(false);
    }, options.duration || 3000);
  }, []);

  return {
    toast,
    isVisible,
    toastOptions,
  };
} 