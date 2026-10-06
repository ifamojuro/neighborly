import React from 'react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in slide-in-from-bottom-2">
      <div className="px-4 py-2.5 rounded-2xl bg-charcoal text-white font-nunito font-extrabold text-xs sm:text-sm border-2 border-white shadow-hard flex items-center gap-2">
        <span>✓</span> {message}
      </div>
    </div>
  );
};
