import React, { useState } from 'react';
import { Search, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { motion, AnimatePresence } from 'framer-motion';

const Topbar = ({ leftContent }) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const logout = useAuthStore((state) => state.logout);
  const searchInputRef = React.useRef(null);

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      // Check for Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault(); // Prevent browser default search
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="h-14 bg-base border-b border-dim px-6 flex items-center justify-between shrink-0">
      <div className="flex-1 flex items-center">
        {leftContent || <h1 className="font-sans font-semibold text-base text-primary">Boards</h1>}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex items-center">
          <Search size={14} className="absolute left-2.5 text-muted pointer-events-none" />
          <motion.input
            ref={searchInputRef}
            type="text"
            placeholder="Search boards, cards..."
            className="h-8 bg-elevated border border-subtle rounded-md pl-8 pr-8 font-sans text-[13px] text-primary placeholder:text-muted focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors duration-150"
            animate={{ width: isSearchFocused ? 280 : 220 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
          <AnimatePresence>
            {!isSearchFocused && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute right-2.5 bg-surface border border-subtle rounded px-1.5 py-px pointer-events-none"
              >
                <span className="font-sans font-medium text-[11px] text-muted">⌘K</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-blue to-accent-violet flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2 focus:ring-offset-base transition-shadow"
          >
            <span className="font-sans font-semibold text-xs text-white">TF</span>
          </button>

          <AnimatePresence>
            {isMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute right-0 top-10 mt-1 w-[200px] bg-elevated border border-subtle rounded-lg p-1 shadow-xl z-50"
                >
                  <button className="w-full h-[34px] px-2.5 flex items-center text-[13px] text-secondary hover:bg-hover hover:text-primary rounded-md transition-colors duration-150">
                    Profile
                  </button>
                  <button className="w-full h-[34px] px-2.5 flex items-center text-[13px] text-secondary hover:bg-hover hover:text-primary rounded-md transition-colors duration-150">
                    Settings
                  </button>
                  <button className="w-full h-[34px] px-2.5 flex items-center text-[13px] text-secondary hover:bg-hover hover:text-primary rounded-md transition-colors duration-150">
                    Changelog
                  </button>
                  <div className="h-px bg-dim my-1 mx-1" />
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full h-[34px] px-2.5 flex items-center gap-2 text-[13px] text-accent-red hover:bg-hover rounded-md transition-colors duration-150"
                  >
                    <LogOut size={14} />
                    <span>Sign out</span>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
