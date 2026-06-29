import React from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const PageTransition = ({ children }) => {
  const location = useLocation();

  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.2, ease: 'easeOut' } }}
      exit={{ opacity: 0, transition: { duration: 0.15, ease: 'easeIn' } }}
      className="h-full w-full flex flex-col"
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
