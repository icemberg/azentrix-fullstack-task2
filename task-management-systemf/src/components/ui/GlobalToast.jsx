import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToastStore } from '../../store/toast.store';
import { X, RefreshCw } from 'lucide-react';

const GlobalToast = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col-reverse gap-2 pointer-events-none">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const ToastItem = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove();
    }, toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [onRemove, toast.duration]);

  const isError = toast.type === 'error';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative pointer-events-auto bg-elevated border border-subtle rounded-lg p-3 w-[280px] shadow-lg flex gap-2.5 ${
        isError ? 'border-l-[3px] border-l-accent-red' : ''
      }`}
    >
      {toast.avatar && (
        <img src={toast.avatar} alt="Avatar" className="w-7 h-7 rounded-full shrink-0" />
      )}
      
      <div className="flex-1 flex flex-col justify-center">
        <p className="font-sans text-[13px] text-secondary">
          {toast.message}
          {toast.onRetry && (
            <button onClick={toast.onRetry} className="ml-2 inline-flex items-center text-accent-blue hover:underline">
              <RefreshCw size={12} className="mr-1" /> Retry
            </button>
          )}
        </p>
        {toast.action && (
          <button 
            onClick={() => {
              toast.action.onClick();
              onRemove();
            }} 
            className="mt-1.5 w-max text-[12px] font-medium text-accent-blue hover:underline"
          >
            {toast.action.label}
          </button>
        )}
        {toast.timestamp && (
          <span className="font-mono text-[11px] text-muted mt-0.5">{toast.timestamp}</span>
        )}
      </div>

      <button
        onClick={onRemove}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted hover:text-primary"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
};

export default GlobalToast;
