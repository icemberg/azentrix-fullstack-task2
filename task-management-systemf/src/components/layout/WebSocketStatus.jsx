import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebSocketStore } from '../../store/websocket.store';
import { useLayoutStore } from '../../store/layout.store';

const WebSocketStatus = () => {
  const status = useWebSocketStore((state) => state.status);
  const { isCollapsed } = useLayoutStore();
  const [pulseKey, setPulseKey] = useState(0);
  
  // Track previous status to detect transitions to 'online'
  const [prevStatus, setPrevStatus] = useState(status);

  useEffect(() => {
    if (prevStatus !== 'online' && status === 'online') {
      setPulseKey((k) => k + 1); // Trigger the focus pulse
    }
    setPrevStatus(status);
  }, [status, prevStatus]);

  const config = {
    online: {
      color: 'bg-accent-emerald',
      textColor: 'text-accent-emerald',
      text: 'Live',
      dotAnim: { scale: [1, 1.4, 1], transition: { duration: 1.8, ease: 'easeInOut' } } // Pulses once on connect technically, but we'll handle the ring on the container
    },
    offline: {
      color: 'bg-accent-red',
      textColor: 'text-accent-red',
      text: 'Offline',
      dotAnim: { scale: 1 }
    },
    reconnecting: {
      color: 'bg-accent-amber',
      textColor: 'text-accent-amber',
      text: 'Reconnecting...',
      dotAnim: { scale: [1, 1.3, 1], transition: { duration: 1, ease: 'easeInOut', repeat: Infinity } }
    }
  };

  const currentConfig = config[status] || config.offline;

  return (
    <>
      <AnimatePresence>
        {status !== 'online' && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
            className={`fixed top-0 left-0 right-0 z-[100] flex items-center justify-center py-2 px-4 shadow-sm backdrop-blur-md border-b ${
              status === 'offline' 
                ? 'bg-accent-red/10 border-accent-red/20 text-accent-red' 
                : 'bg-accent-amber/10 border-accent-amber/20 text-accent-amber'
            }`}
          >
            <div className="flex items-center gap-2 text-sm font-medium">
              <div className={`w-2 h-2 rounded-full ${currentConfig.color} animate-pulse`} />
              {status === 'offline' 
                ? "You're offline. Changes won't sync until reconnected."
                : "Reconnecting to server... Changes will sync automatically."}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        key={pulseKey}
        className={`fixed bottom-4 z-50 flex items-center gap-1.5 bg-elevated border border-subtle rounded-md px-2.5 py-1.5 shadow-lg ${status === 'online' ? 'focus-pulse' : ''}`}
        style={{ '--tw-shadow-color': 'rgba(34, 201, 138, 0.4)' }} // Make the pulse emerald
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0, left: isCollapsed ? 64 : 236 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          animate={currentConfig.dotAnim}
          className={`w-1.5 h-1.5 rounded-full ${currentConfig.color}`}
        />
        <span className={`font-sans font-medium text-[11px] ${currentConfig.textColor}`}>
          {currentConfig.text}
        </span>
      </motion.div>
    </>
  );
};

export default WebSocketStatus;
