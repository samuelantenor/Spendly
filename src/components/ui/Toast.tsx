import React from 'react';
import { X } from 'lucide-react';

interface ToastProps {
  isVisible: boolean;
  title?: string;
  description?: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

export function Toast({ isVisible, title, description, type = 'info', onClose }: ToastProps) {
  if (!isVisible) return null;

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  }[type];

  return (
    <div className={`fixed bottom-4 right-4 p-4 rounded-lg text-white shadow-lg ${bgColor} transition-all duration-300`}>
      <button onClick={onClose} className="absolute top-2 right-2">
        <X size={16} />
      </button>
      {title && <h4 className="font-semibold">{title}</h4>}
      {description && <p className="mt-1 text-sm">{description}</p>}
    </div>
  );
} 