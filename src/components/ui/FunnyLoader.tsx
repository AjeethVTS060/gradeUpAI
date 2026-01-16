import { motion } from 'framer-motion';
import React from 'react';

const loaderVariants = {
  animationOne: {
    y: ["0%", "-50%", "0%"],
    rotate: [0, 180, 360],
    transition: {
      duration: 1.5,
      ease: "easeInOut",
      repeat: Infinity,
      repeatDelay: 0.1,
    },
  },
  animationTwo: {
    y: ["0%", "50%", "0%"],
    rotate: [360, 180, 0],
    transition: {
      duration: 1.8,
      ease: "easeInOut",
      repeat: Infinity,
      repeatDelay: 0.2,
    },
  },
  animationThree: {
    y: ["0%", "-70%", "0%"],
    rotate: [0, 270, 0],
    transition: {
      duration: 1.3,
      ease: "easeInOut",
      repeat: Infinity,
      repeatDelay: 0.3,
    },
  },
};

const FunnyLoader: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-200 to-purple-200">
      <motion.div
        className="flex space-x-4"
        variants={{
          start: { transition: { staggerChildren: 0.2 } },
          end: { transition: { staggerChildren: 0.2 } },
        }}
        initial="start"
        animate="end"
      >
        <motion.div
          className="w-10 h-10 bg-red-500 rounded-full"
          variants={loaderVariants.animationOne}
        ></motion.div>
        <motion.div
          className="w-10 h-10 bg-green-500 rounded-md"
          variants={loaderVariants.animationTwo}
        ></motion.div>
        <motion.div
          className="w-10 h-10 bg-yellow-500"
          style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
          variants={loaderVariants.animationThree}
        ></motion.div>
      </motion.div>
    </div>
  );
};

export default FunnyLoader;

