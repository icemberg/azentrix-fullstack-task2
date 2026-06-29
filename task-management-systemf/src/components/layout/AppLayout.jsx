import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import PageTransition from './PageTransition';
import WebSocketStatus from './WebSocketStatus';
import { useLayoutStore } from '../../store/layout.store';
import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '../../api/users.api';

const AppLayout = () => {
  const { isCollapsed, setSidebarCollapsed } = useLayoutStore();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: getCurrentUser,
  });

  useEffect(() => {
    if (user) {
      if (user.theme === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.add('dark');
      }
    }
  }, [user]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarCollapsed]);

  return (
    <div className="min-h-screen bg-base text-primary flex overflow-hidden">
      <Sidebar />
      <motion.div
        initial={false}
        animate={{ marginLeft: isCollapsed ? 48 : 220 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="flex-1 flex flex-col h-dvh overflow-hidden relative"
      >
        {/* We let pages render their own Topbar if they need custom leftContent, 
            or we render a default one here. But since Board has custom left content, 
            it's better to let pages render Topbar themselves, or pass a context/outlet context. 
            For simplicity in a layout, we can just omit Topbar here and let each page render it, 
            OR render it here and accept no custom left content. 
            Let's let each page render Topbar so they can customize it. */}
        
        <AnimatePresence mode="wait">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
        <WebSocketStatus />
      </motion.div>
    </div>
  );
};

export default AppLayout;
