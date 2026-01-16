import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { ArrowLeft, Clock, Bookmark, Send, Sun, Moon, Settings, Book, Hash, ChevronRight, Zap, Brain, Flame, FileText, CheckCircle, Rocket, BrainCircuit, Bomb, Sparkles, Trophy, Menu } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { useTheme } from '../../hooks/use-theme';
import { Switch } from '../../components/ui/switch';
import { cn } from "../../lib/utils";
import { mockSubjects, mockUnits } from "../../lib/mockData";
import MinimalHeader from '../../components/minimal-header';
import { useLocation, Link } from "wouter";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "../../components/ui/dialog";

const initialQuizBank = [
    { id: 1, title: 'Algebra Basics', subject: 'Mathematics', subjectId: '1', questions: 15, difficulty: 'Easy', time: 10 },
    { id: 2, title: 'Newtonian Physics', subject: 'Physics', subjectId: '2', questions: 20, difficulty: 'Medium', time: 15 },
    { id: 3, title: 'Organic Chemistry Reactions', subject: 'Chemistry', subjectId: '3', questions: 25, difficulty: 'Hard', time: 20 },
    { id: 4, title: 'Cellular Biology', subject: 'Biology', subjectId: '4', questions: 15, difficulty: 'Easy', time: 10 },
    { id: 5, title: 'World War II', subject: 'History', subjectId: '6', questions: 30, difficulty: 'Medium', time: 25 },
    { id: 6, title: 'Data Structures', subject: 'Computer Science', subjectId: '7', questions: 20, difficulty: 'Hard', time: 15 },
];

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
    // ... more questions
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

interface QuizConfig {
  difficulty: string;
  subjectId: string;
  unitId: string;
  numQuestions: string;
  timeLimit: string;
}

const difficulties = [
    { name: "Easy", icon: <Rocket className="w-8 h-8" />, description: "A gentle start" },
    { name: "Medium", icon: <BrainCircuit className="w-8 h-8" />, description: "A balanced challenge" },
    { name: "Hard", icon: <Bomb className="w-8 h-8" />, description: "A true test of knowledge" },
];
const questionCounts = ["5", "10", "15", "20"];
const timeLimits = ["5", "10", "15", "30"];

interface EnrichedUnit {
    id: string; // e.g., "1-1"
    name: string; // e.g., "Algebra Basics"
    subjectName: string; // e.g., "Mathematics"
    subjectId: string;
}

const allUnits: EnrichedUnit[] = mockSubjects.flatMap(subject => {
    const units = mockUnits[subject.id.toString()] || [];
    return units.map(unit => ({
        id: `${subject.id}-${unit.id}`,
        name: unit.name,
        subjectName: subject.name,
        subjectId: subject.id.toString(),
    }));
});

const FunnyLoader = () => {
    const messages = [
        "Summoning the Quiz Master...",
        "Dusting off the ancient scrolls of knowledge...",
        "Waking up the trivia hamsters...",
        "Assembling questions from outer space...",
        "Don't worry, it's not rocket science... unless it is!",
    ];
    const [message, setMessage] = useState(messages[0]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setMessage(messages[Math.floor(Math.random() * messages.length)]);
        }, 2000);
        return () => clearInterval(intervalId);
    }, []);

    return (
    <motion.div
      className="flex flex-col items-center justify-center space-y-6 text-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
    >
        <div className="relative w-24 h-24">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            >
                <Book className="w-24 h-24 text-blue-500" />
            </motion.div>
            <motion.div
                className="absolute top-1/2 left-1/2 w-16 h-16"
                style={{x: '-50%', y: '-50%'}}
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
                <Sparkles className="w-16 h-16 text-yellow-400" />
            </motion.div>
        </div>
      <p className="text-xl font-semibold text-slate-700 dark:text-slate-300 w-64">{message}</p>
    </motion.div>
  );
}

const QuizSetupWizard = ({ onStartQuiz, onClose }: { onStartQuiz: (config: QuizConfig) => void; onClose: () => void; }) => {
    const [step, setStep] = useState(0);
    const [config, setConfig] = useState<QuizConfig>({
        difficulty: "Medium", subjectId: "", unitId: "", numQuestions: "10", timeLimit: "10",
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleStart = () => {
        setIsLoading(true);
        setTimeout(() => {
          onStartQuiz(config);
          setIsLoading(false);
        }, 3500);
    };

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const renderStep = () => {
        switch (step) {
            case 0: // Difficulty
                return (
                    <div className='text-center'>
                        <h2 className="text-3xl font-bold mb-4">Choose Your Challenge</h2>
                        <p className='text-slate-500 mb-10'>How brave are you feeling today?</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {difficulties.map((d) => (
                                <motion.div key={d.name} whileHover={{ y: -10, scale: 1.05 }} className='cursor-pointer' onClick={() => { setConfig({ ...config, difficulty: d.name }); nextStep(); }}>
                                    <Card className={cn("p-8 text-center transition-all duration-300 h-full", config.difficulty === d.name ? 'bg-blue-500 text-white shadow-blue-500/50 shadow-lg' : 'bg-white dark:bg-slate-800 hover:shadow-xl')}>
                                        <div className="flex justify-center mb-4">{d.icon}</div>
                                        <h3 className="text-xl font-bold">{d.name}</h3>
                                        <p className="text-sm opacity-80">{d.description}</p>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                );
            case 1: // Unit
                return (    
                    <div className='text-center'>
                        <h2 className="text-3xl font-bold mb-4">What do you want to practice?</h2>
                        <p className='text-slate-500 mb-10'>Choose a specific unit.</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {allUnits.map((u) => (
                                <motion.div key={u.id} whileHover={{ y: -5, scale: 1.05 }} className='cursor-pointer' onClick={() => { setConfig({ ...config, unitId: u.id, subjectId: u.subjectId }); nextStep(); }}>
                                    <Card className={cn("p-6 text-center transition-all duration-300 flex flex-col items-center justify-center h-32", config.unitId === u.id ? 'bg-blue-500 text-white' : 'bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700')}>
                                        <h3 className="font-semibold">{u.name}</h3>
                                        <p className="text-sm opacity-70 mt-1">{u.subjectName}</p>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                );
            case 2: // Questions & Time
                return (
                     <div className='text-center max-w-lg mx-auto'>
                        <h2 className="text-3xl font-bold mb-4">Final Touches</h2>
                        <p className='text-slate-500 mb-10'>Set the number of questions and time limit.</p>
                        <div className="space-y-8">
                             <div>
                                <h3 className="text-lg font-semibold mb-3">Number of Questions</h3>
                                <div className="flex justify-center gap-3">
                                    {questionCounts.map(count => (
                                        <Button key={count} size='lg' variant={config.numQuestions === count ? 'default' : 'outline'} onClick={() => setConfig({...config, numQuestions: count})} className='w-24 h-16 text-lg'>{count}</Button>
                                    ))}
                                </div>
                             </div>
                             <div>
                                <h3 className="text-lg font-semibold mb-3">Time Limit (Minutes)</h3>
                                <div className="flex justify-center gap-3">
                                    {timeLimits.map(time => (
                                        <Button key={time} size='lg' variant={config.timeLimit === time ? 'default' : 'outline'} onClick={() => setConfig({...config, timeLimit: time})} className='w-24 h-16 text-lg'>{time}</Button>
                                    ))}
                                </div>
                             </div>
                        </div>
                        <motion.div whileHover={{ scale: 1.05 }} className='mt-12'>
                             <Button size='lg' className='w-full h-16 text-xl bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white' onClick={handleStart}>
                                <Trophy className='mr-3'/> Launch Quiz!
                            </Button>
                        </motion.div>
                     </div>
                )
            default: return null;
        }
    }

    if (isLoading) {
        return (
            <div className="absolute inset-0 bg-slate-100 dark:bg-slate-900 z-50 flex items-center justify-center">
                <FunnyLoader />
            </div>
        )
    }

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-100 dark:bg-slate-900 z-40 p-8 flex flex-col items-center"
        >
            <div className='w-full max-w-4xl mx-auto'>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.5, type: 'spring' }}
                    >
                        {renderStep()}
                    </motion.div>
                </AnimatePresence>
            </div>
            <div className='mt-auto w-full max-w-4xl flex justify-between items-center'>
                {step > 0 && <Button variant='ghost' onClick={prevStep}><ArrowLeft className='mr-2'/> Back</Button>}
                <Button variant='ghost' onClick={onClose} className='ml-auto'>Cancel</Button>
            </div>
        </motion.div>
    )
}


const QuizSidebarContent = ({ 
    closeSidebar,
    theme,
    setTheme,
    currentQuestionIndex,
    questionStatuses,
    dummyQuestions,
    jumpToQuestion,
    handleMarkForLater,
    setCurrentQuestionIndex,
}: { 
    closeSidebar?: () => void,
    theme: string | undefined,
    setTheme: (theme: string) => void,
    currentQuestionIndex: number,
    questionStatuses: QuestionStatus[],
    dummyQuestions: typeof allDummyQuestions,
    jumpToQuestion: (index: number) => void,
    handleMarkForLater: () => void,
    setCurrentQuestionIndex: React.Dispatch<React.SetStateAction<number>>,
}) => {
    
    return (
        <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 h-full">
            <CardContent className="p-4 sm:p-6 flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Question Palette</h3>
                {closeSidebar && (
                    <Button variant="ghost" size="icon" onClick={closeSidebar}>
                        <ChevronRight className="h-5 w-5" />
                    </Button>
                )}
            </div>
            <div className="grid grid-cols-5 gap-2 mb-6">
                {dummyQuestions.map((_, index) => {
                const status = questionStatuses[index] || 'unanswered';
                const isCurrent = index === currentQuestionIndex;
                return (
                    <button
                    key={index}
                    onClick={() => jumpToQuestion(index)}
                    className={`h-10 w-10 sm:h-12 sm:w-12 rounded-md flex items-center justify-center font-bold text-base sm:text-lg transition-all
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
                <Button variant="outline" className="w-full bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 hidden md:flex" onClick={handleMarkForLater}>
                <Bookmark className="mr-2 h-4 w-4" />
                Mark for Later
                </Button>
                <div className="hidden md:flex gap-4">
                    <Button variant="secondary" className="w-full" onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))} disabled={currentQuestionIndex === 0}>Previous</Button>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => setCurrentQuestionIndex(prev => Math.min(dummyQuestions.length - 1, prev + 1))} disabled={currentQuestionIndex === dummyQuestions.length - 1}>Next</Button>
                </div>
                <div className="flex items-center justify-center gap-2 pt-4">
                    <Sun className="h-5 w-5" />
                    <Switch
                        checked={theme === 'dark'}
                        onCheckedChange={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                    />
                    <Moon className="h-5 w-5" />
                </div>
            </div>

            </CardContent>
        </Card>
    );
}

const QuizPage = ({ params }: { params?: { id?: string } }) => {
    const { theme, setTheme } = useTheme();
    const [location, setLocation] = useLocation();
    const [quizConfig, setQuizConfig] = useState<QuizConfig | null>(null);
    const [isSetupOpen, setIsSetupOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [quizStarted, setQuizStarted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    
    const [dummyQuestions, setDummyQuestions] = useState(allDummyQuestions.slice(0, 10));
    
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
    const [questionStatuses, setQuestionStatuses] = useState<QuestionStatus[]>([]);
    const [timeLeft, setTimeLeft] = useState(15 * 60);
    const [showResult, setShowResult] = useState(false);

    useEffect(() => {
        const quizId = params?.id;

        if (quizId) {
            const selectedQuiz = initialQuizBank.find(q => q.id.toString() === quizId);
            if (selectedQuiz) {
                const config: QuizConfig = {
                    difficulty: selectedQuiz.difficulty,
                    subjectId: selectedQuiz.subjectId,
                    unitId: '', // Assume no specific unit when starting from bank
                    numQuestions: selectedQuiz.questions.toString(),
                    timeLimit: selectedQuiz.time.toString(),
                };
                handleStartQuiz(config);
            } else {
                 setIsLoading(false);
            }
        } else {
            setIsLoading(false);
        }
    }, [params?.id]);

    const handleStartQuiz = (config: QuizConfig) => {
        setQuizConfig(config);
        const questionsCount = parseInt(config.numQuestions || '10', 10);
        const timeLimit = parseInt(config.timeLimit || '15', 10);
        
        setDummyQuestions(allDummyQuestions.slice(0, questionsCount));
        setTimeLeft(timeLimit * 60);
        setUserAnswers(Array(questionsCount).fill(null));
        setQuestionStatuses(Array(questionsCount).fill('unanswered'));
        
        setQuizStarted(true);
        setIsSetupOpen(false);
        setIsLoading(false);
    };

    useEffect(() => {
        if (!quizStarted || showResult || timeLeft === 0) {
            if(quizStarted && !showResult && timeLeft === 0) handleSubmit();
            return;
        };
        const timer = setInterval(() => {
        setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [quizStarted, showResult, timeLeft]);

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
            const question = dummyQuestions[index];
            if (question && question.correctAnswer !== undefined) {
                return answer === question.correctAnswer ? acc + 1 : acc;
            }
            return acc;
        }, 0);
        const percentage = (score / dummyQuestions.length) * 100;

        const result: QuizResult = {
            subject: quizConfig?.subjectId || 'Unknown',
            unit: quizConfig?.unitId || 'Unknown',
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

    const restartQuiz = () => {
        setShowResult(false);
        setQuizStarted(false);
        setQuizConfig(null);
        setCurrentQuestionIndex(0);
        setLocation("/studio/quiz-bank");
    }

    if (isLoading) {
        return (
             <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center justify-center">
                <FunnyLoader />
            </div>
        )
    }

    // const navigate = useNavigate(); // Removed as useNavigate is not imported from wouter

    if (showResult) {
        const score = userAnswers.reduce((acc, answer, index) => {
            const question = dummyQuestions[index];
            if (question && question.correctAnswer !== undefined) {
                return answer === question.correctAnswer ? acc + 1 : acc;
            }
            return acc;
        }, 0);
        const percentage = (score / dummyQuestions.length) * 100;

        return (
            <Dialog open={showResult} onOpenChange={setShowResult}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-center">Quiz Completed!</DialogTitle>
                        <DialogDescription className="text-center">
                            You have successfully submitted your answers.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center justify-center mb-4">
                        <Trophy className="h-16 w-16 text-yellow-500" />
                    </div>
                    <div className="grid grid-cols-1 gap-4 text-center">
                        <Card className="bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 p-8 shadow-2xl dark:shadow-blue-500/20">
                            <h2 className="text-2xl font-bold mb-4">Your Score</h2>
                            <div className="text-8xl font-bold text-green-500 dark:text-green-400 mb-2">{percentage.toFixed(0)}%</div>
                            <p className="text-slate-600 dark:text-slate-300 text-xl">{score} out of {dummyQuestions.length} correct</p>
                            <Progress value={percentage} className="mt-6 h-4" />
                        </Card>
                    </div>
                    <DialogFooter className="flex-col gap-2 pt-4">
                        <Button 
                            variant="outline" 
                            size="lg" 
                            className="w-full" 
                            onClick={() => {
                                setShowResult(false);
                                setQuizStarted(false);
                                setQuizConfig(null);
                                setCurrentQuestionIndex(0);
                                setLocation("/studio/quiz-bank");
                            }}
                        >
                            <ArrowLeft className="mr-2 h-5 w-5" />
                            Back to Quiz Bank
                        </Button>
                        <Button 
                            size="lg" 
                            className="w-full bg-blue-600 hover:bg-blue-700" 
                            onClick={() => {
                                setShowResult(false);
                                setQuizStarted(false);
                                setQuizConfig(null);
                                setCurrentQuestionIndex(0);
                                setLocation("/ai-tutor-page");
                            }}
                        >
                            <Brain className="mr-2 h-5 w-5" /> Go to AI Tutor
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )
    }
    if (!quizStarted) {
        return (
          <>

            <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center justify-center text-center overflow-hidden relative">

                
                <AnimatePresence>
                    {isSetupOpen && (
                        <QuizSetupWizard 
                            onStartQuiz={handleStartQuiz} 
                            onClose={() => setIsSetupOpen(false)} 
                        />
                    )}
                </AnimatePresence>
                <MinimalHeader currentTheme={theme} onThemeChange={setTheme} />
                <motion.div className="mt-2" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                 
                    <h1 className="text-4xl md:text-6xl font-extrabold text-gray-800 dark:text-white mb-4">Ready for a Challenge?</h1>
                    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                        Customize your quiz to focus on what you need to learn. Choose your subject, difficulty, and more.
                    </p>
                    <Button
                        onClick={() => setIsSetupOpen(true)}
                        size="lg"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-full text-lg transition-transform transform hover:scale-105 shadow-lg"
                    >
                        Start a New Quiz
                    </Button>
                </motion.div>
            </div>
            
            </>
        );
    }

    const currentQuestion = dummyQuestions[currentQuestionIndex];
    
    const sidebarProps = {
        theme,
        setTheme,
        currentQuestionIndex,
        questionStatuses,
        dummyQuestions,
        jumpToQuestion,
        handleMarkForLater,
        setCurrentQuestionIndex,
    };

    return (
        <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white flex flex-col items-center p-2 sm:p-4 font-sans">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-7xl"
        >
            {/* Header */}
            <header className="flex justify-between items-center mb-4 sm:mb-8 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <Link href="/studio/quiz-bank">
                    <Button variant="outline" size="sm" className="bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700">
                        <ArrowLeft className="mr-1 h-4 w-4" />
                        <span className="hidden sm:inline">Back</span>
                    </Button>
                </Link>
                <div className="flex items-center gap-2 sm:gap-4 p-2 px-3 sm:px-4 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <Clock className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                    <span className="font-mono text-base sm:text-lg">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                    <div className="hidden sm:flex items-center gap-2">
                        <Sun className="h-5 w-5" />
                        <Switch
                            checked={theme === 'dark'}
                            onCheckedChange={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                        />
                        <Moon className="h-5 w-5" />
                    </div>
                    <Button variant="destructive" size="sm" onClick={handleSubmit}>
                        <Send className="mr-1 h-4 w-4" />
                        <span className="hidden sm:inline">Submit</span>
                    </Button>
                    <Button variant="outline" className="md:hidden" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                        <Menu className="h-5 w-5" />
                    </Button>
                </div>
            </header>

            <div className="flex gap-8">
                {/* Main Content */}
                <div className="flex-1">
                    <main className="bg-white dark:bg-slate-800/50 p-4 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl dark:shadow-blue-500/10">
                        <AnimatePresence mode="wait">
                        <motion.div
                            key={currentQuestionIndex}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="mb-6 sm:mb-8">
                            <p className="text-blue-600 dark:text-blue-400 font-semibold mb-2 text-sm sm:text-base">Question {currentQuestionIndex + 1} of {dummyQuestions.length}</p>
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">
                                {currentQuestion.question}
                            </h2>
                            </div>
            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                            {currentQuestion.options.map((option, index) => (
                                <motion.button 
                                key={index}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleAnswerSelect(index)}
                                className={`p-4 sm:p-5 rounded-lg text-left text-sm sm:text-lg border transition-all duration-200 flex items-start
                                    ${userAnswers[currentQuestionIndex] === index
                                    ? 'bg-blue-500 dark:bg-blue-600 border-blue-500 text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700/50 hover:border-blue-500 dark:hover:border-blue-500'
                                    }
                                `}
                                >
                                <span className="font-semibold mr-3 sm:mr-4">{String.fromCharCode(65 + index)}.</span>
                                <span>{option}</span>
                                </motion.button>
                            ))}
                            </div>
                        </motion.div>
                        </AnimatePresence>
                    </main>
                    <div className="mt-4 space-y-4 md:hidden">
                        <Button variant="outline" className="w-full bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700" onClick={handleMarkForLater}>
                            <Bookmark className="mr-2 h-4 w-4" />
                            Mark for Later
                        </Button>
                        <div className="flex gap-4">
                            <Button variant="secondary" className="w-full" onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))} disabled={currentQuestionIndex === 0}>Previous</Button>
                            <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => setCurrentQuestionIndex(prev => Math.min(dummyQuestions.length - 1, prev + 1))} disabled={currentQuestionIndex === dummyQuestions.length - 1}>Next</Button>
                        </div>
                    </div>
                </div>
        
                {/* Right Sidebar */}
                <AnimatePresence>
                    {isSidebarOpen && (
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="fixed top-0 right-0 h-full w-full max-w-xs bg-white dark:bg-slate-900 z-50 md:hidden"
                        >
                            <QuizSidebarContent {...sidebarProps} closeSidebar={() => setIsSidebarOpen(false)} />
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="hidden md:block w-full max-w-sm">
                    <QuizSidebarContent {...sidebarProps} />
                </div>
            </div>
        </motion.div>
        </div>
    );
};



export default QuizPage;
