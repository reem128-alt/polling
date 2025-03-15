'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

type ToastVariant = 'default' | 'success' | 'destructive';

interface ToastProps {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

let toastId = 0;
const toastQueue: Array<{
  id: number;
  props: ToastProps;
}> = [];

// Function to add toast to queue
export function toast(props: ToastProps) {
  const id = toastId++;
  toastQueue.push({ id, props });
  
  // Dispatch event to notify ToastContainer
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('toast-added'));
  }
  
  // Auto-remove after duration
  setTimeout(() => {
    const index = toastQueue.findIndex(t => t.id === id);
    if (index !== -1) {
      toastQueue.splice(index, 1);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('toast-removed'));
      }
    }
  }, props.duration ?? 5000);
}

// Toast component
function Toast({ 
  id, 
  title, 
  description, 
  variant = 'default',
  onClose 
}: { 
  id: number; 
  title: string; 
  description?: string; 
  variant?: ToastVariant;
  onClose: () => void;
}) {
  const variantClasses = {
    default: 'bg-white border-gray-200',
    success: 'bg-green-50 border-green-200',
    destructive: 'bg-red-50 border-red-200'
  };
  
  const titleClasses = {
    default: 'text-gray-900',
    success: 'text-green-800',
    destructive: 'text-red-800'
  };
  
  const descriptionClasses = {
    default: 'text-gray-500',
    success: 'text-green-600',
    destructive: 'text-red-600'
  };
  
  return (
    <div 
      className={`flex items-start gap-2 rounded-lg border p-4 shadow-md ${variantClasses[variant]}`}
      role="alert"
    >
      <div className="flex-1">
        <h3 className={`font-medium ${titleClasses[variant]}`}>{title}</h3>
        {description && (
          <p className={`text-sm ${descriptionClasses[variant]}`}>{description}</p>
        )}
      </div>
      <button 
        onClick={onClose}
        className="text-gray-400 hover:text-gray-500"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// Toast container component
export function ToastContainer() {
  const [toasts, setToasts] = useState<Array<{ id: number; props: ToastProps }>>([]);
  
  useEffect(() => {
    const handleToastAdded = () => {
      setToasts([...toastQueue]);
    };
    
    const handleToastRemoved = () => {
      setToasts([...toastQueue]);
    };
    
    window.addEventListener('toast-added', handleToastAdded);
    window.addEventListener('toast-removed', handleToastRemoved);
    
    return () => {
      window.removeEventListener('toast-added', handleToastAdded);
      window.removeEventListener('toast-removed', handleToastRemoved);
    };
  }, []);
  
  const handleClose = (id: number) => {
    const index = toastQueue.findIndex(t => t.id === id);
    if (index !== -1) {
      toastQueue.splice(index, 1);
      setToasts([...toastQueue]);
    }
  };
  
  if (typeof window === 'undefined') {
    return null;
  }
  
  return createPortal(
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm" dir="rtl">
      {toasts.map(({ id, props }) => (
        <Toast
          key={id}
          id={id}
          title={props.title}
          description={props.description}
          variant={props.variant}
          onClose={() => handleClose(id)}
        />
      ))}
    </div>,
    document.body
  );
}
