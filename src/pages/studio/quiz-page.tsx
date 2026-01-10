import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { ArrowLeft, Clock, Bookmark, Send, Sun, Moon } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { Card, CardContent } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { useTheme } from '../../hooks/use-theme';
import { Switch } from '../../components/ui/switch';

const allDummyQuestions = [
    {
        question: "What is the primary function of the mitochondria in a eukaryotic cell?",
        options: ['To store genetic information', 'To synthesize proteins', 'To generate ATP through cellular respiration', 'To break down waste materials'],
        correctAnswer: 2,
      },
      {
        question: "What is the capital of Japan?",
        options: ['Beijing', 'Seoul', 'Tokyo', 'Bangkok'],
        correctAnswer: 2,
      },
      {
        question: "Which planet is known as the Red Planet?",
        options: ['Earth', 'Mars', 'Jupiter', 'Saturn'],
        correctAnswer: 1,
      },
        {
        question: "What is the largest mammal in the world?",
        options: ['Elephant', 'Blue Whale', 'Giraffe', 'Great White Shark'],
        correctAnswer: 1,
      },
      {
        question: "Who wrote 'Hamlet'?",
        options: ['Charles Dickens', 'William Shakespeare', 'Leo Tolstoy', 'Mark Twain'],
        correctAnswer: 1,
      },
      {
        question: "What is the chemical symbol for water?",
        options: ['H2O', 'O2', 'CO2', 'NaCl'],
        correctAnswer: 0,
      },
      {
        question: "How many continents are there?",
        options: ['5', '6', '7', '8'],
        correctAnswer: 2,
      },
      {
        question: "What is the square root of 64?",
        options: ['6', '7', '8', '9'],
        correctAnswer: 2,
      },
      {
        question: "Who painted the Mona Lisa?",
        options: ['Vincent van Gogh', 'Pablo Picasso', 'Leonardo da Vinci', 'Claude Monet'],
        correctAnswer: 2,
      },
      {
        question: "What is the tallest mountain in the world?",
        options: ['K2', 'Mount Everest', 'Kangchenjunga', 'Lhotse'],
        correctAnswer: 1,
      },
];

type QuestionStatus = 'unanswered' | 'answered' | 'marked';

interface QuizResult {
    subject: string;
    unit: string;
    score: number;
    percentage: number;
    date: string;
    questionCount: number;
}

const QuizPage = () => {
  const { theme, setTheme } = useTheme();
  const [location] = useLocation();
  const [searchParams] = useState(new URLSearchParams(location.substring(location.indexOf('?'))));

  const [dummyQuestions, setDummyQuestions] = useState(allDummyQuestions.slice(0, 10));

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [questionStatuses, setQuestionStatuses] = useState<QuestionStatus[]>([]);
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const questionsCount = parseInt(searchParams.get('questions') || '10', 10);
    const timeLimit = parseInt(searchParams.get('time') || '15', 10);
    
    setDummyQuestions(allDummyQuestions.slice(0, questionsCount));
    setTimeLeft(timeLimit * 60);
    setUserAnswers(Array(questionsCount).fill(null));
    setQuestionStatuses(Array(questionsCount).fill('unanswered'));
  }, [searchParams]);

  useEffect(() => {
    if (showResult || timeLeft === 0) {
        if(!showResult) handleSubmit();
        return;
    };
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [showResult, timeLeft]);

  const handleAnswerSelect = (optionIndex: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setUserAnswers(newAnswers);

    const newStatuses = [...questionStatuses];
    newStatuses[currentQuestionIndex] = 'answered';
    setQuestionStatuses(newStatuses);
  };
  
  const handleMarkForLater = () => {
    const newStatuses = [...questionStatuses];
    if (questionStatuses[currentQuestionIndex] !== 'answered') {
      newStatuses[currentQuestionIndex] = 'marked';
    }
    setQuestionStatuses(newStatuses);
  };

  const jumpToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const handleSubmit = () => {
    setShowResult(true);
    const score = userAnswers.reduce((acc, answer, index) => {
        return answer === dummyQuestions[index].correctAnswer ? acc + 1 : acc;
    }, 0);
    const percentage = (score / dummyQuestions.length) * 100;

    const result: QuizResult = {
        subject: searchParams.get('subject') || 'Unknown',
        unit: searchParams.get('unit') || 'Unknown',
        score,
        percentage,
        date: new Date().toISOString(),
        questionCount: dummyQuestions.length,
    };

    try {
        const recentExams = JSON.parse(localStorage.getItem('recentExams') || '[]');
        recentExams.unshift(result);
        if(recentExams.length > 5) recentExams.pop();
        localStorage.setItem('recentExams', JSON.stringify(recentExams));
    } catch (error) {
        console.error("Failed to save recent exam", error);
    }
  };

  if (showResult) {
    const score = userAnswers.reduce((acc, answer, index) => {
      return answer === dummyQuestions[index].correctAnswer ? acc + 1 : acc;
    }, 0);
    const percentage = (score / dummyQuestions.length) * 100;

    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white flex flex-col items-center justify-center p-4 font-sans overflow-hidden">
        <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 100 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1]}}
            className="w-full max-w-2xl text-center"
        >
          <motion.h1 
            initial={{y: 20, opacity: 0}} animate={{y:0, opacity: 1}} transition={{delay: 0.2}}
            className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500"
            >
                Quiz Completed!
            </motion.h1>
          <motion.p 
            initial={{y: 20, opacity: 0}} animate={{y:0, opacity: 1}} transition={{delay: 0.3}}
            className="text-slate-500 dark:text-slate-400 mb-8 text-lg"
          >
              You have successfully submitted your answers.
          </motion.p>
          <motion.div initial={{y: 20, opacity: 0}} animate={{y:0, opacity: 1}} transition={{delay: 0.4}}>
            <Card className="bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 p-8 shadow-2xl dark:shadow-blue-500/20">
                <h2 className="text-2xl font-bold mb-4">Your Score</h2>
                <div className="text-8xl font-bold text-green-500 dark:text-green-400 mb-2">{percentage.toFixed(0)}%</div>
                <p className="text-slate-600 dark:text-slate-300 text-xl">{score} out of {dummyQuestions.length} correct</p>
                <Progress value={percentage} className="mt-6 h-4" />
            </Card>
          </motion.div>
          <motion.div initial={{y: 20, opacity: 0}} animate={{y:0, opacity: 1}} transition={{delay: 0.5}}>
            <Link href="/ai-tutor">
                <Button variant="outline" size="lg" className="mt-10 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-transform hover:scale-105">
                <ArrowLeft className="mr-2 h-5 w-5" />
                Take Another Exam
                </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  if(dummyQuestions.length === 0) {
    return (
        <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
            <p>Loading quiz...</p>
        </div>
    )
  }

  const currentQuestion = dummyQuestions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white flex flex-col items-center justify-center p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-6xl grid grid-cols-12 gap-8"
      >
        {/* Main Content */}
        <div className="col-span-12 lg:col-span-8">
          <header className="flex justify-between items-center mb-8">
            <Link href="/ai-tutor">
              <Button variant="outline" className="bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-4 p-2 px-4 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <Clock className="h-5 w-5 text-blue-500 dark:text-blue-400" />
              <span className="font-mono text-lg">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
            </div>
            <div className="flex items-center gap-4">
              <Sun className="h-5 w-5" />
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              />
              <Moon className="h-5 w-5" />
            </div>
            <Button variant="destructive" onClick={handleSubmit}>
              <Send className="mr-2 h-4 w-4" />
              Submit
            </Button>
          </header>

          <main className="bg-white dark:bg-slate-800/50 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl dark:shadow-blue-500/10">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <p className="text-blue-600 dark:text-blue-400 font-semibold mb-2">Question {currentQuestionIndex + 1} of {dummyQuestions.length}</p>
                  <h2 className="text-2xl md:text-3xl font-bold">
                    {currentQuestion.question}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentQuestion.options.map((option, index) => (
                    <motion.button 
                      key={index}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswerSelect(index)}
                      className={`p-5 rounded-lg text-left text-base md:text-lg border transition-all duration-200 flex items-start
                        ${userAnswers[currentQuestionIndex] === index
                          ? 'bg-blue-500 dark:bg-blue-600 border-blue-500 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700/50 hover:border-blue-500 dark:hover:border-blue-500'
                        }
                      `}
                    >
                      <span className="font-semibold mr-4">{String.fromCharCode(65 + index)}.</span>
                      <span>{option}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        {/* Right Sidebar */}
        <div className="col-span-12 lg:col-span-4">
          <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 h-full">
            <CardContent className="p-6 flex flex-col h-full">
              <h3 className="font-bold text-lg mb-4">Question Palette</h3>
              <div className="grid grid-cols-5 gap-2 mb-6">
                {dummyQuestions.map((_, index) => {
                  const status = questionStatuses[index];
                  const isCurrent = index === currentQuestionIndex;
                  return (
                    <button
                      key={index}
                      onClick={() => jumpToQuestion(index)}
                      className={`h-12 w-12 rounded-md flex items-center justify-center font-bold text-lg transition-all
                        ${isCurrent ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}
                        ${status === 'answered' ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300' : ''}
                        ${status === 'unanswered' ? 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600' : ''}
                        ${status === 'marked' ? 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300' : ''}
                      `}
                    >
                      {index + 1}
                    </button>
                  )
                })}
              </div>
              <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
                <div className="flex items-center"><div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-500/20 mr-2"></div> Answered</div>
                <div className="flex items-center"><div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 mr-2"></div> Not Answered</div>
                <div className="flex items-center"><div className="w-4 h-4 rounded-full bg-yellow-100 dark:bg-yellow-500/20 mr-2"></div> Marked for Later</div>
              </div>
              
              <div className="mt-auto space-y-4">
                 <Button variant="outline" className="w-full bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700" onClick={handleMarkForLater}>
                  <Bookmark className="mr-2 h-4 w-4" />
                  Mark for Later
                </Button>
                <div className="flex gap-4">
                    <Button variant="secondary" className="w-full" onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))} disabled={currentQuestionIndex === 0}>Previous</Button>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => setCurrentQuestionIndex(prev => Math.min(dummyQuestions.length - 1, prev + 1))} disabled={currentQuestionIndex === dummyQuestions.length - 1}>Next</Button>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

export default QuizPage;