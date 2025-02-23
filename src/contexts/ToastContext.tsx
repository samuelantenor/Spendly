import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast } from '../components/ui/Toast';

interface ToastContextType {
  showToast: (options: {
    title?: string;
    description?: string;
    type?: 'success' | 'error' | 'info';
    duration?: number;
  }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const [toastOptions, setToastOptions] = useState({
    title: '',
    description: '',
    type: 'info' as const,
  });

  const showToast = useCallback(({ 
    title, 
    description, 
    type = 'info',
    duration = 3000 
  }) => {
    setToastOptions({ title, description, type });
    setIsVisible(true);
    setTimeout(() => setIsVisible(false), duration);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast
        isVisible={isVisible}
        title={toastOptions.title}
        description={toastOptions.description}
        type={toastOptions.type}
        onClose={() => setIsVisible(false)}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}