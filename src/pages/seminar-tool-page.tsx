import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import {Zap,ChevronRight,BookOpen,Mic,Award,Star} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './seminar-tool-page.css';
import { MinimalHeader } from '../components/minimal-header';
import { useTheme } from '../hooks/use-theme';
import { cn } from '../lib/utils';

const seminarTopics = [
  { id: 1, title: 'The Art of Public Speaking', duration: 15, difficulty: 'Easy', completed: true, icon: '🎤' },
  { id: 2, title: 'Structuring Your Seminar', duration: 20, difficulty: 'Easy', completed: true, icon: '🏗️' },
  { id: 3, title: 'Engaging Your Audience', duration: 25, difficulty: 'Medium', completed: false, icon: '👋' },
  { id: 4, title: 'Advanced Presentation Skills', duration: 30, difficulty: 'Hard', completed: false, icon: '🚀' },
  { id: 5, title: 'AI-Powered Seminar Delivery', duration: 35, difficulty: 'Hard', completed: false, icon: '🤖' },
];

const SeminarToolPage = () => {
  const { theme } = useTheme();
  const [currentTopic, setCurrentTopic] = useState(3);
  const [view, setView] = useState('lessons'); // 'lessons' or 'challenge'
  const [lessonStarted, setLessonStarted] = useState(false);
  const completedTopics = seminarTopics.filter(t => t.completed).length;
  const progress = (completedTopics / seminarTopics.length) * 100;

  const handleStartLesson = () => {
    setLessonStarted(true);
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 50 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        type: 'spring',
        stiffness: 100,
      },
    }),
  };

  const pageVariants = {
    initial: { opacity: 0, x: '-100vw' },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: '100vw' },
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.8,
  };

  const renderLessonsView = () => (
    <motion.div
      key="lessons"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-400 dark:to-pink-600 flex items-center">
            <Award className="mr-4" size={50} />
            Seminar Training
          </h1>
          <div className="flex items-center space-x-6">
            <div className="flex items-center p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
              <Star className="text-yellow-500 dark:text-yellow-400 mr-2" size={28} />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">125</span>
            </div>
            <Button variant="outline" className="text-purple-500 border-purple-500 hover:bg-purple-500 hover:text-white dark:text-purple-400 dark:border-purple-400 dark:hover:bg-purple-400 dark:hover:text-gray-900 text-lg font-semibold rounded-full px-6 py-3">
              Leaderboard
            </Button>
          </div>
        </header>

        <Card className="bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 mb-8 p-2 rounded-2xl shadow-lg">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Your Progress</h2>
              <span className="text-purple-500 dark:text-purple-400 font-bold text-xl">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-4 bg-gray-200 dark:bg-gray-700 [&>div]:bg-gradient-to-r [&>div]:from-green-400 [&>div]:to-blue-500" />
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {seminarTopics.map((topic, index) => (
          <motion.div
            key={topic.id}
            custom={index}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="perspective-1000"
          >
            <div className={`card-3d ${topic.id === currentTopic ? 'card-3d-active' : ''} ${topic.completed ? 'card-3d-completed' : ''}`}>
              <Card
                className="card-3d-inner bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-all duration-300 rounded-2xl shadow-2xl"
              >
                <CardHeader className="flex flex-row justify-between items-start">
                  <div className='w-full'>
                    <div className="flex justify-between items-center">
                        <div className="text-5xl mb-3">{topic.icon}</div>
                         <span className={cn('px-3 py-1 rounded-full text-sm font-semibold', {
                            'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-300': topic.difficulty === 'Easy',
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-300': topic.difficulty === 'Medium',
                            'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-300': topic.difficulty === 'Hard',
                         })}>{topic.difficulty}</span>
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">{topic.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center h-full">
                   <div className="text-gray-500 dark:text-gray-400 mb-4">{topic.duration} min lesson</div>
                  {topic.id === currentTopic && !topic.completed && !lessonStarted && (
                    <Button size="lg" onClick={handleStartLesson} className="w-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold text-xl rounded-full py-8">
                      Start <Mic className="ml-2" size={20} />
                    </Button>
                  )}
                  {topic.id === currentTopic && !topic.completed && lessonStarted && (
                    <div className="text-green-500 dark:text-green-400 font-bold text-xl">Lesson in progress...</div>
                  )}
                  {topic.id !== currentTopic && !topic.completed && (
                    <Button size="lg" variant="outline" className="w-full text-gray-500 dark:text-gray-400 rounded-full py-8 text-xl" disabled>
                      Locked
                    </Button>
                  )}
                   {topic.completed && (
                    <Button size="lg" variant="ghost" className="w-full text-green-500 dark:text-green-400 text-xl rounded-full py-8">
                      Review
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </motion.div>
        ))}
      </div>
       <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: seminarTopics.length * 0.1 }}
        className="mt-12 flex justify-center"
      >
        <Button onClick={() => setView('challenge')} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-2xl px-12 py-8 rounded-full hover:scale-105 transition-transform duration-300">
          <Zap className="mr-4" size={30}/>
          Take the AI Seminar Challenge!
        </Button>
      </motion.div>
    </motion.div>
  );

  const renderChallengeView = () => (
    <motion.div
      key="challenge"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="text-center"
    >
        <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-6">
            AI Seminar Challenge
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
            You're about to be evaluated by our advanced AI on a random topic.
            Speak clearly, structure your points, and engage the virtual audience.
        </p>

        <Card className="bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 max-w-md mx-auto p-8 rounded-2xl shadow-lg">
            <CardHeader>
                <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">Ready to Begin?</CardTitle>
            </CardHeader>
            <CardContent>
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                        duration: 2,
                        ease: "easeInOut",
                        repeat: Infinity,
                    }}
                >
                    <Mic size={80} className="text-red-500 mx-auto mb-6"/>
                </motion.div>
                <Button size="lg" className="w-full bg-red-500 hover:bg-red-600 text-white font-bold text-xl rounded-full py-6">
                    Start Recording
                </Button>
            </CardContent>
        </Card>

        <Button onClick={() => setView('lessons')} className="mt-12 text-purple-500 dark:text-purple-300 font-semibold">
            &larr; Back to Lessons
        </Button>
    </motion.div>
  );

  return (
    <div className={cn("min-h-screen overflow-hidden", theme === 'dark' ? 'bg-gradient-to-b from-gray-900 to-black text-white' : 'bg-white text-gray-900')}>
        <MinimalHeader />
        <div className="p-8">
            <AnimatePresence mode="wait">
                {view === 'lessons' ? renderLessonsView() : renderChallengeView()}
            </AnimatePresence>
        </div>
    </div>
  );
};

export default SeminarToolPage;
