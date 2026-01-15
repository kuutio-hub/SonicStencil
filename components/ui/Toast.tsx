
import React from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export const ToastContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="fixed top-20 right-4 z-50 space-y-2">
    {children}
  </div>
);

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const baseClasses = "flex items-center w-full max-w-xs p-4 text-gray-200 rounded-lg shadow-lg";
  const typeClasses = {
    success: 'bg-green-500/80 backdrop-blur-sm',
    error: 'bg-red-500/80 backdrop-blur-sm'
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`} role="alert">
      <div className="ms-3 text-sm font-normal">{message}</div>
      <button
        type="button"
        className="ms-auto -mx-1.5 -my-1.5 bg-white/20 text-gray-200 hover:text-white rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-white/30 inline-flex items-center justify-center h-8 w-8"
        onClick={onClose}
        aria-label="Close"
      >
        <span className="sr-only">Close</span>
        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
        </svg>
      </button>
    </div>
  );
};
