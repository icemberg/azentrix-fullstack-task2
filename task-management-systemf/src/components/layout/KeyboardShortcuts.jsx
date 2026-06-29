import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const KeyboardShortcuts = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input/textarea
      if (e.key === '?' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const shortcuts = [
    { key: '?', description: 'Show keyboard shortcuts' },
    { key: '⌘ + K', description: 'Search boards and cards' },
    { key: 'Esc', description: 'Close modals and popovers' },
    { key: 'Enter', description: 'Confirm edit or create' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-void/70 z-[100] flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="bg-surface border border-subtle rounded-xl p-6 w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="font-display font-semibold text-lg text-primary mb-4">Keyboard Shortcuts</h2>
              <div className="grid grid-cols-1 gap-3">
                {shortcuts.map((s, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="font-sans text-[13px] text-secondary">{s.description}</span>
                    <kbd className="bg-elevated border border-moderate rounded px-1.5 py-0.5 font-mono text-xs text-primary">
                      {s.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default KeyboardShortcuts;
