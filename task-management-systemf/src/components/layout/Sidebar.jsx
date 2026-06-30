import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutGrid, CheckSquare, Users, Settings, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLayoutStore } from '../../store/layout.store';
import TeamSwitcher from './TeamSwitcher';

const Sidebar = () => {
  const { isCollapsed, toggleSidebar, setSidebarCollapsed } = useLayoutStore();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarCollapsed]);

  const navItems = [
    { name: 'Boards', path: '/dashboard', icon: LayoutGrid },
    { name: 'Teams', path: '/teams', icon: Users },
    { name: 'My Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 48 : 220 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="fixed left-0 top-0 h-dvh bg-surface border-r border-dim z-40 overflow-hidden flex flex-col"
    >
      <div className="h-16 px-4 flex items-center border-b border-dim shrink-0">
        <img src="/favicon.svg" alt="TaskFlow" className="w-7 h-7 rounded-[7px] shrink-0 object-contain" />
        <motion.span
          animate={{ opacity: isCollapsed ? 0 : 1 }}
          transition={{ duration: 0.1 }}
          className="ml-2.5 font-display font-semibold text-[17px] text-primary whitespace-nowrap"
        >
          TaskFlow
        </motion.span>
      </div>
      
      <TeamSwitcher isCollapsed={isCollapsed} />
      
      <div className="h-px bg-dim mx-3 mb-2 shrink-0" />
      
      <nav className="flex-1 p-2 flex flex-col gap-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `h-9 rounded-md px-2.5 flex items-center transition-colors duration-150 overflow-hidden ${
                isActive
                  ? 'bg-accent-blue/10 text-accent-blue'
                  : 'text-secondary hover:bg-hover hover:text-primary'
              }`
            }
            title={isCollapsed ? item.name : undefined}
          >
            {({ isActive }) => (
              <>
                <item.icon
                  size={16}
                  className={`shrink-0 transition-colors duration-150 ${
                    isActive ? 'text-accent-blue' : 'text-muted group-hover:text-primary'
                  }`}
                />
                <motion.span
                  initial={false}
                  animate={{ 
                    opacity: isCollapsed ? 0 : 1,
                    width: isCollapsed ? 0 : 'auto',
                    marginLeft: isCollapsed ? 0 : 10
                  }}
                  transition={{ duration: 0.2 }}
                  className="font-sans font-medium text-[13px] whitespace-nowrap overflow-hidden"
                >
                  {item.name}
                </motion.span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-dim shrink-0">
        <button
          onClick={toggleSidebar}
          className="w-full h-9 flex items-center justify-center rounded-md text-secondary hover:bg-hover hover:text-primary transition-colors overflow-hidden"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <div className="flex items-center justify-center w-full">
            {isCollapsed ? (
              <PanelLeftOpen size={16} className="text-muted shrink-0" />
            ) : (
              <div className="flex items-center gap-2.5">
                <PanelLeftClose size={16} className="text-muted shrink-0" />
                <span className="font-sans font-medium text-[13px] whitespace-nowrap">Collapse</span>
              </div>
            )}
          </div>
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
