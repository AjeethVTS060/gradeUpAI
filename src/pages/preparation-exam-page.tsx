import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockExamQuestions, Question } from '../lib/mock-exam-data';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { AlertTriangle, Check, ChevronsRight, Eye, EyeOff, Mic, MicOff, Timer as TimerIcon, Zap, BrainCircuit, PencilRuler, HelpCircle, Star, Moon, Sun, GripVertical, LayoutGrid } from 'lucide-react';
import ExamResultDisplay from '../components/exam-result-display';
import { useTheme } from '../hooks/use-theme';
import { useMediaQuery } from '../hooks/use-media-query';
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '../components/ui/drawer';

const Webcam = (props: any) => (
  <div {...props}>
    <div className="w-full h-full bg-gray-900/50 text-white flex items-center justify-center rounded-lg">
      <p className="text-sm">Webcam Feed</p>
    </div>
  </div>
);

const FunnyLoader = () => {
  const loaders = ["Charging brain cells...", "Compiling genius...", "Sharpening digital pencils...", "Consulting cosmic sages...", "Reticulating splines..."];
  const [currentLoader, setCurrentLoader] = useState(loaders[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLoader(loaders[Math.floor(Math.random() * loaders.length)]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 to-blue-900 flex flex-col items-center justify-center z-50 text-white">
      <Zap className="w-20 h-20 text-yellow-300 animate-pulse mb-6" />
      <p className="text-2xl font-bold">Preparing Your Challenge!</p>
      <AnimatePresence mode="wait">
        <motion.p key={currentLoader} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="text-blue-300 mt-2">
          {currentLoader}
        </motion.p>
      </AnimatePresence>
    </div>
  );
};

const initialTime = 30 * 60;

const ProctoringView = ({ isMobile, isCameraOn, setCameraOn, isMicOn, setMicOn, motionAlert }: any) => {
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
                    <Card className="w-40 sm:w-48 shadow-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200 dark:border-gray-700">
                        <CardHeader className="p-2 cursor-move flex-row items-center justify-center space-x-2">
                            <GripVertical className="w-4 h-4 text-gray-400" />
                            <CardTitle className="text-xs flex items-center justify-between w-full">
                                Proctoring
                                <div className="flex items-center gap-1">
                                    <button onClick={() => setCameraOn(!isCameraOn)} title={isCameraOn ? "Turn off camera" : "Turn on camera"}>{isCameraOn ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-red-500" />}</button>
                                    <button onClick={() => setMicOn(!isMicOn)} title={isMicOn ? "Turn off mic" : "Turn on mic"}>{isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4 text-red-500" />}</button>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-1 relative">
                            <div className="aspect-video bg-gray-800/80 rounded-md overflow-hidden border dark:border-gray-700">
                                {isCameraOn ? <Webcam className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-gray-900/50 text-gray-500"><p className="text-xs">Camera Off</p></div>}
                            </div>
                             <AnimatePresence>
                                {motionAlert && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute bottom-1.5 left-1.5 right-1.5 bg-yellow-500/80 text-yellow-900 p-1 rounded-md text-[10px] flex items-center gap-1 font-semibold">
                                    <AlertTriangle className="w-3 h-3"/> {motionAlert}
                                </motion.div>
                                )}
                            </AnimatePresence>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>
        );
    }

    // Desktop view
    return (
        <Card className="shadow-lg relative bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl">
            <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                    AI Proctoring
                    <div className="flex items-center gap-2">
                        <button onClick={() => setCameraOn(!isCameraOn)} title={isCameraOn ? "Turn off camera" : "Turn on camera"}>{isCameraOn ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5 text-red-500" />}</button>
                        <button onClick={() => setMicOn(!isMicOn)} title={isMicOn ? "Turn off mic" : "Turn on mic"}>{isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5 text-red-500" />}</button>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="aspect-video bg-gray-800/80 rounded-lg overflow-hidden border dark:border-gray-700">
                    {isCameraOn ? <Webcam className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-gray-900/50 text-gray-500"><p>Camera Off</p></div>}
                </div>
                <AnimatePresence>
                    {motionAlert && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute bottom-2 left-2 right-2 bg-yellow-500/80 text-yellow-900 p-2 rounded-lg text-xs flex items-center gap-2 font-semibold">
                        <AlertTriangle className="w-4 h-4" /> {motionAlert}
                    </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
};

const PreparationExamPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [questions] = useState<Question[]>(() => [...mockExamQuestions].sort(() => Math.random() - 0.5));
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | number>>({});
  const [statuses, setStatuses] = useState<Record<number, 'answered' | 'unanswered' | 'review'>>({});
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isCameraOn, setCameraOn] = useState(true);
  const [isMicOn, setMicOn] = useState(true);
  const [motionAlert, setMotionAlert] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const { theme, setTheme } = useTheme();
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const motionAlertTimeout = useRef<NodeJS.Timeout | null>(null);

  const resetState = () => {
    setIsLoading(true);
    setIsSubmitted(false);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setStatuses({});
    setTimeLeft(initialTime);
    setTimeout(() => setIsLoading(false), 2000);
  };

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 2500);
  }, []);

  useEffect(() => {
    if (isLoading || isSubmitted) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isLoading, isSubmitted]);

  useEffect(() => {
    if (isLoading || !isCameraOn || isSubmitted) return;
    const interval = setInterval(() => {
      if (Math.random() < 0.1) {
        const alerts = ["Are you practicing your dance moves? Stay focused!", "Excessive movement detected. Please remain still.", "Is there someone else in the room?"];
        setMotionAlert(alerts[Math.floor(Math.random() * alerts.length)]);
        if (motionAlertTimeout.current) clearTimeout(motionAlertTimeout.current);
        motionAlertTimeout.current = setTimeout(() => setMotionAlert(null), 5000);
      }
    }, 7000);

    return () => {
      clearInterval(interval);
      if (motionAlertTimeout.current) clearTimeout(motionAlertTimeout.current);
    }
  }, [isLoading, isCameraOn, isSubmitted]);

  const handleAnswerChange = (questionId: number, value: string | number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    if (statuses[questionId] !== 'answered') {
       setStatuses(prev => ({ ...prev, [questionId]: 'answered' }));
    }
  };

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index);
    }
  };

  const markForReview = () => {
    setStatuses(prev => ({ ...prev, [questions[currentQuestionIndex].id]: 'review' }));
    if (currentQuestionIndex < questions.length - 1) {
        goToQuestion(currentQuestionIndex + 1);
    }
  };

  const handleSubmit = () => {
    let correctAnswers = 0;
    questions.forEach(q => {
        if (q.type === 'MCQ') {
            const correctAnswerIndex = q.answer;
            const userAnswerIndex = Number(answers[q.id]);
            if (userAnswerIndex === correctAnswerIndex) {
                correctAnswers++;
            }
        } else {
            if (answers[q.id] && String(answers[q.id]).trim() !== '') {
                correctAnswers++;
            }
        }
    });
    setScore(correctAnswers);
    setIsSubmitted(true);
  }
  
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

  if (isLoading) return <FunnyLoader />;
  if (isSubmitted) return <ExamResultDisplay score={score} total={questions.length} isMainExam={false} onRetry={resetState} />;

  const currentQuestion = questions[currentQuestionIndex];
  
  const QuestionPaletteContent = () => (
    <>
      <CardHeader className="pb-2"><CardTitle className="text-base">Question Palette</CardTitle></CardHeader>
      <CardContent className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-5 gap-2">
        {questions.map((q, index) => {
          const status = statuses[q.id];
          const isCurrent = index === currentQuestionIndex;
          let bgColor = 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600';
          if (isCurrent) bgColor = 'bg-blue-500 text-white ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-gray-900';
          else if (status === 'answered') bgColor = 'bg-green-500/80 text-white';
          else if (status === 'review') bgColor = 'bg-yellow-500/80 text-black';
          
          return (
            <motion.button whileHover={{ scale: 1.15, y: -2 }} whileTap={{ scale: 0.95 }} key={q.id} onClick={() => goToQuestion(index)}
              className={`w-10 h-10 flex items-center justify-center rounded-md font-semibold text-sm transition-colors ${bgColor}`}>
              {index + 1}
            </motion.button>
          );
        })}
      </CardContent>
      <CardContent className="pt-4 border-t border-gray-200 dark:border-gray-800 mt-4">
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500/80"></div><span>Answered</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500/80"></div><span>Review</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gray-200 dark:bg-gray-700"></div><span>Unanswered</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div><span>Current</span></div>
          </div>
      </CardContent>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 font-sans transition-colors duration-500">
      <div className="fixed inset-0 bg-gradient-to-br from-blue-400/20 via-transparent to-purple-400/20 dark:from-blue-900/30 dark:to-purple-900/30 -z-10 animate-gradient-xy"></div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-12 gap-6 max-w-screen-2xl mx-auto"
      >
        <div className="col-span-12 lg:col-span-9">
          <Card className="shadow-xl border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between pb-2">
              <CardTitle className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500 mb-4 sm:mb-0">
                Practice Arena
              </CardTitle>
              <div className="flex items-center gap-2 md:gap-4">
                <div className="flex items-center gap-2 md:gap-4 bg-gray-200/50 dark:bg-gray-800/50 px-3 py-1.5 md:px-4 md:py-2 rounded-lg">
                    <TimerIcon className="w-5 h-5 md:w-6 md:h-6 text-blue-500 animate-pulse" />
                    <span className="text-xl md:text-2xl font-mono font-bold">{formatTime(timeLeft)}</span>
                </div>
                <Button variant="outline" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestion.id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                >
                  <h2 className="text-md md:text-lg font-semibold mb-4 flex items-center">
                    {getQuestionIcon(currentQuestion.type)}
                    Question {currentQuestionIndex + 1}/{questions.length}
                  </h2>
                  <p className="text-lg md:text-xl mb-6">{currentQuestion.question}</p>

                  {currentQuestion.type === 'MCQ' && currentQuestion.options && (
                    <RadioGroup value={String(answers[currentQuestion.id] || '')} onValueChange={(value) => handleAnswerChange(currentQuestion.id, parseInt(value))}>
                      {currentQuestion.options.map((option, index) => (
                        <motion.div key={index} whileHover={{x: 5}} className="flex items-center space-x-3 mb-3 p-3 rounded-lg hover:bg-blue-500/10 dark:hover:bg-blue-500/20 transition-colors cursor-pointer border border-transparent has-[:checked]:border-blue-500">
                          <RadioGroupItem value={String(index)} id={`q${currentQuestion.id}-o${index}`} />
                          <Label htmlFor={`q${currentQuestion.id}-o${index}`} className="flex-1 cursor-pointer text-base">{option}</Label>
                        </motion.div>
                      ))}
                    </RadioGroup>
                  )}
                  {(currentQuestion.type === 'SHORT' || currentQuestion.type === 'LONG') && (
                    <Textarea
                      placeholder={`Your ${currentQuestion.type === 'SHORT' ? 'brief' : 'detailed'} answer...`}
                      value={String(answers[currentQuestion.id] || '')}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      className={`min-h-[${currentQuestion.type === 'SHORT' ? '120px' : '200px'}] bg-transparent dark:bg-gray-800/50 text-base`}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
              <div className="flex flex-col sm:flex-row justify-between items-center mt-8 border-t border-gray-200 dark:border-gray-700 pt-6 gap-4">
                <Button variant="outline" onClick={() => goToQuestion(currentQuestionIndex - 1)} disabled={currentQuestionIndex === 0}>
                  Previous
                </Button>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Button variant="ghost" className="w-full" onClick={markForReview}>
                    <Star className="w-4 h-4 mr-2 text-yellow-400"/>
                    Mark for Review & Next
                  </Button>
                  <Button className="w-full" onClick={() => { if(currentQuestionIndex < questions.length -1) goToQuestion(currentQuestionIndex + 1)}}>
                    Save & Next <ChevronsRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="col-span-12 lg:col-span-3 lg:space-y-6">
            {isDesktop ? (
                <>
                    <ProctoringView isMobile={false} isCameraOn={isCameraOn} setCameraOn={setCameraOn} isMicOn={isMicOn} setMicOn={setMicOn} motionAlert={motionAlert} />
                    <Card className="shadow-lg bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl">
                        <QuestionPaletteContent />
                    </Card>
                    <Button size="lg" className="w-full text-lg font-bold bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white" onClick={handleSubmit}>
                        Submit & See Score <Check className="w-5 h-5 ml-2"/>
                    </Button>
                </>
            ) : (
                <>
                    <ProctoringView isMobile={true} isCameraOn={isCameraOn} setCameraOn={setCameraOn} isMicOn={isMicOn} setMicOn={setMicOn} motionAlert={motionAlert} />
                     <div className="fixed bottom-4 right-4 z-40">
                        <Drawer>
                            <DrawerTrigger asChild>
                                <Button variant="secondary" size="icon" className="rounded-full h-14 w-14 shadow-lg">
                                    <LayoutGrid className="w-6 h-6" />
                                </Button>
                            </DrawerTrigger>
                            <DrawerContent>
                                <div className="mx-auto w-full max-w-sm md:max-w-md lg:max-w-lg">
                                    <DrawerHeader>
                                        <DrawerTitle>Question Palette</DrawerTitle>
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
                    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-sm px-8">
                         <Button size="lg" className="w-full text-lg font-bold bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white shadow-lg" onClick={handleSubmit}>
                            Submit Test
                        </Button>
                    </div>
                </>
            )}
        </div>
      </motion.div>
    </div>
  );
};

export default PreparationExamPage;