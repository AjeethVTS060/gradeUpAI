import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockExamQuestions, Question } from '../lib/mock-exam-data';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { AlertTriangle, Check, ChevronsRight, Eye, Mic, Shield, Timer as TimerIcon, Star, BrainCircuit, PencilRuler, HelpCircle, Sun, Moon, GripVertical, LayoutGrid } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import ExamResultDisplay from '../components/exam-result-display';
import { useTheme } from '../hooks/use-theme';
import { useMediaQuery } from '../hooks/use-media-query';
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '../components/ui/drawer';

const Webcam = (props: any) => (
  <div {...props}><div className="w-full h-full bg-black text-white flex items-center justify-center"><p className="text-xs text-gray-400">Secure Camera Feed</p></div></div>
);

const SeriousLoader = () => (
  <div className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center z-50 text-white">
    <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }} transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}>
      <Shield className="w-20 h-20 text-red-500 mb-4" />
    </motion.div>
    <p className="text-2xl font-semibold tracking-wider">Initializing Secure Exam Environment</p>
    <p className="text-gray-400 mt-2">Please wait. Do not close this window.</p>
  </div>
);

const initialTime = 60 * 60;

const ProctoringView = ({ isMobile }: { isMobile: boolean }) => {
    const constraintsRef = useRef(null);

    if (isMobile) {
        return (
             <motion.div ref={constraintsRef} className="fixed inset-0 pointer-events-none w-full h-full z-50">
                <motion.div
                    drag
                    dragConstraints={constraintsRef}
                    dragMomentum={false}
                    className="fixed top-4 right-4 z-50 pointer-events-auto"
                >
                    <Card className="w-40 sm:w-48 shadow-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-2 border-red-500/50">
                        <CardHeader className="p-2 cursor-move flex-row items-center justify-center space-x-2">
                            <GripVertical className="w-4 h-4 text-gray-400" />
                            <CardTitle className="text-xs flex items-center justify-between w-full">
                                System Status
                                <div className="flex items-center gap-2 text-green-500">
                                    <Eye className="w-4 h-4" />
                                    <Mic className="w-4 h-4" />
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-1">
                            <div className="aspect-video bg-black rounded-md overflow-hidden">
                                <Webcam className="w-full h-full object-cover" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>
        );
    }

    // Desktop view
    return (
        <Card className="shadow-lg border-red-500/50">
            <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between font-bold">
                    System Status
                    <div className="flex items-center gap-3 text-green-500"><Eye className="w-5 h-5"/><Mic className="w-5 h-5"/></div>
                </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-black rounded-lg overflow-hidden"><Webcam className="w-full h-full object-cover" /></div>
              <p className="text-xs text-center mt-2 text-green-500 font-semibold">AI Proctoring Enabled</p>
            </CardContent>
        </Card>
    );
};


const MainExamPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [questions] = useState<Question[]>(() => [...mockExamQuestions].sort(() => Math.random() - 0.5));
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | number>>({});
  const [statuses, setStatuses] = useState<Record<number, 'answered' | 'unanswered' | 'review'>>({});
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [motionAlert, setMotionAlert] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { theme, setTheme } = useTheme();
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const resetState = () => {
      window.location.href = '/dashboard';
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 3000);
  }, []);

  useEffect(() => {
    if (isLoading || isSubmitted) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isLoading, isSubmitted]);

  useEffect(() => {
    if (isLoading || isSubmitted) return;
    const interval = setInterval(() => {
      if (Math.random() < 0.15) {
        setMotionAlert("Potential misconduct detected: Unusual movement. A warning has been logged.");
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [isLoading, isSubmitted]);

  const handleAnswerChange = (questionId: number, value: string | number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    setStatuses(prev => ({ ...prev, [questionId]: 'answered' }));
  };

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index);
    }
  };

  const markForReview = () => {
    setStatuses(prev => ({ ...prev, [questions[currentQuestionIndex].id]: 'review' }));
    if(currentQuestionIndex < questions.length - 1) {
        goToQuestion(currentQuestionIndex + 1);
    }
  };
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuestionIcon = (type: Question['type']) => {
    switch (type) {
        case 'MCQ': return <HelpCircle className="w-5 h-5 mr-2 text-blue-400" />;
        case 'SHORT': return <PencilRuler className="w-5 h-5 mr-2 text-orange-400" />;
        case 'LONG': return <BrainCircuit className="w-5 h-5 mr-2 text-purple-400" />;
        default: return null;
    }
  }

  if (isLoading) return <SeriousLoader />;
  if (isSubmitted) return <ExamResultDisplay score={0} total={0} isMainExam={true} onRetry={resetState} />;

  const currentQuestion = questions[currentQuestionIndex];
  
  const QuestionPaletteContent = () => (
     <>
        <CardHeader className="pb-2"><CardTitle className="text-base font-bold">Question Status</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-8 lg:grid-cols-5 gap-2">
            {questions.map((q, index) => {
            const status = statuses[q.id];
            const isCurrent = index === currentQuestionIndex;
            let className = 'bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600';
            if (isCurrent) className = 'bg-blue-600 text-white ring-2 ring-offset-2 ring-blue-600 dark:ring-offset-black';
            else if (status === 'answered') className = 'bg-green-600 text-white';
            else if (status === 'review') className = 'bg-yellow-500 text-gray-800';
            
            return (
                <motion.button whileHover={{ y: -2 }} key={q.id} onClick={() => goToQuestion(index)}
                className={`w-10 h-10 flex items-center justify-center rounded-md font-bold text-sm transition-all ${className}`}>{index + 1}</motion.button>
            );
            })}
        </CardContent>
        <CardContent className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-600"></div><span>Answered</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500"></div><span>Review</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-700"></div><span>Unanswered</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-600"></div><span>Current</span></div>
            </div>
        </CardContent>
     </>
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-black text-gray-900 dark:text-gray-100 p-4 font-sans">
       <AlertDialog open={!!motionAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle className="w-6 h-6 text-red-500" /> Proctoring Alert</AlertDialogTitle>
            <AlertDialogDescription>{motionAlert} Please adhere to the examination rules. Repeated warnings may lead to disqualification.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter><AlertDialogAction onClick={() => setMotionAlert(null)}>I Understand</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-12 gap-6 max-w-screen-2xl mx-auto">
        <div className="col-span-12 lg:col-span-9">
          <Card className="shadow-2xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/80 backdrop-blur-sm">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between rounded-t-lg p-4 bg-gray-50 dark:bg-gray-800/50">
              <CardTitle className="text-xl md:text-2xl font-bold tracking-wide mb-4 sm:mb-0">Final Assessment</CardTitle>
              <div className="flex items-center gap-2 md:gap-4">
                <div className="flex items-center gap-2 md:gap-4 border-2 border-red-500/50 dark:border-red-500/80 px-3 py-1.5 md:px-4 md:py-2 rounded-lg bg-red-50 dark:bg-transparent">
                    <TimerIcon className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
                    <span className="text-2xl md:text-3xl font-mono font-bold text-red-500">{formatTime(timeLeft)}</span>
                </div>
                <Button variant="outline" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <AnimatePresence mode="wait">
                <motion.div key={currentQuestion.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
                  <h2 className="text-md md:text-lg font-semibold mb-2 flex items-center">{getQuestionIcon(currentQuestion.type)} Question {currentQuestionIndex + 1}</h2>
                  <p className="text-lg md:text-xl mb-6 font-serif">{currentQuestion.question}</p>

                  {currentQuestion.type === 'MCQ' && currentQuestion.options && (
                    <RadioGroup value={String(answers[currentQuestion.id] || '')} onValueChange={(value) => handleAnswerChange(currentQuestion.id, parseInt(value))} className="space-y-3">
                      {currentQuestion.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-3 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 has-[:checked]:bg-blue-50 dark:has-[:checked]:bg-blue-900/20 has-[:checked]:border-blue-500 transition-all">
                          <RadioGroupItem value={String(index)} id={`q${currentQuestion.id}-o${index}`} />
                          <Label htmlFor={`q${currentQuestion.id}-o${index}`} className="text-base flex-1 cursor-pointer">{option}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                  {(currentQuestion.type === 'SHORT' || currentQuestion.type === 'LONG') && (
                    <Textarea
                      placeholder={`Type your ${currentQuestion.type === 'SHORT' ? 'concise' : 'detailed'} answer here...`}
                      value={String(answers[currentQuestion.id] || '')}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      className={`min-h-[${currentQuestion.type === 'SHORT' ? '150px' : '250px'}] text-base p-4 border-2 border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500 bg-gray-50 dark:bg-gray-800/50`}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
              <div className="flex flex-col sm:flex-row justify-between items-center mt-8 border-t-2 border-gray-200 dark:border-gray-700 pt-6 gap-4">
                <Button variant="outline" onClick={() => goToQuestion(currentQuestionIndex - 1)} disabled={currentQuestionIndex === 0}>Previous</Button>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Button variant="outline" className="w-full" onClick={markForReview}><Star className="w-4 h-4 mr-2"/>Mark for Review & Next</Button>
                  <Button className="w-full" onClick={() => { if(currentQuestionIndex < questions.length -1) goToQuestion(currentQuestionIndex + 1)}}>Save & Next <ChevronsRight className="w-4 h-4 ml-2" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-3 lg:space-y-6">
           {isDesktop ? (
                <>
                    <ProctoringView isMobile={false} />
                    <Card className="shadow-lg">
                       <QuestionPaletteContent />
                    </Card>
                    <Button size="lg" className="w-full text-lg font-bold bg-red-600 hover:bg-red-700" onClick={handleSubmit}>SUBMIT</Button>
                </>
           ) : (
                <>
                    <ProctoringView isMobile={true} />
                     <div className="fixed bottom-4 right-4 z-40">
                        <Drawer>
                            <DrawerTrigger asChild>
                                <Button variant="secondary" size="icon" className="rounded-full h-14 w-14 shadow-lg">
                                    <LayoutGrid className="w-6 h-6" />
                                </Button>
                            </DrawerTrigger>
                            <DrawerContent>
                                <div className="mx-auto w-full max-w-sm md:max-w-md">
                                    <DrawerHeader>
                                        <DrawerTitle>Question Status</DrawerTitle>
                                    </DrawerHeader>
                                    <div className="p-4">
                                        <Card className="border-none shadow-none"><QuestionPaletteContent/></Card>
                                    </div>
                                    <DrawerFooter>
                                        <DrawerClose asChild><Button variant="outline">Close</Button></DrawerClose>
                                    </DrawerFooter>
                                </div>
                            </DrawerContent>
                        </Drawer>
                    </div>
                    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-xs px-4">
                         <Button size="lg" className="w-full text-lg font-bold bg-red-600 hover:bg-red-700 shadow-lg" onClick={handleSubmit}>
                            SUBMIT
                        </Button>
                    </div>
                </>
           )}
        </div>
      </motion.div>
    </div>
  );
};

export default MainExamPage;