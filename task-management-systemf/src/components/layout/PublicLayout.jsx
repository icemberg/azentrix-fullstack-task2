import React from 'react';
import { Outlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import PageTransition from './PageTransition';

const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-void text-primary selection:bg-accent-blue/30 relative overflow-hidden">
      <AnimatePresence mode="wait">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </AnimatePresence>
    </div>
  );
};

export default PublicLayout;
