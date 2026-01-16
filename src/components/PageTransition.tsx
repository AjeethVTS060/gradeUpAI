import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';

const PageTransition: React.FC<{ children: React.ReactNode; routeKey: string }> = ({ children, routeKey }) => {
  return (
    <AnimatePresence>
      <motion.div
        key={routeKey}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;
