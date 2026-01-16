import React from 'react';
import { motion } from 'framer-motion';

const AnimatedBackground: React.FC = () => {
  const shapes = Array.from({ length: 10 }).map((_, i) => (
    <motion.div
      key={i}
      className="absolute bg-blue-300 opacity-50 rounded-full"
      initial={{
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        scale: Math.random() * 0.5 + 0.2,
        opacity: Math.random() * 0.3 + 0.1,
      }}
      animate={{
        x: [
          Math.random() * window.innerWidth,
          Math.random() * window.innerWidth,
          Math.random() * window.innerWidth,
        ],
        y: [
          Math.random() * window.innerHeight,
          Math.random() * window.innerHeight,
          Math.random() * window.innerHeight,
        ],
        scale: [
          Math.random() * 0.5 + 0.2,
          Math.random() * 0.5 + 0.2,
          Math.random() * 0.5 + 0.2,
        ],
        opacity: [
          Math.random() * 0.3 + 0.1,
          Math.random() * 0.3 + 0.1,
          Math.random() * 0.3 + 0.1,
        ],
      }}
      transition={{
        duration: Math.random() * 10 + 20,
        repeat: Infinity,
        ease: 'linear',
        repeatType: 'reverse',
      }}
      style={{
        width: 50,
        height: 50,
        filter: 'blur(10px)',
        zIndex: -1,
      }}
    />
  ));

  return <div className="absolute inset-0 overflow-hidden">{shapes}</div>;
};

export default AnimatedBackground;