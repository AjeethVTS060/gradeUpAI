import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Button } from "../components/ui/button";
import { Loader2, Settings, Book, Clock, Hash, ChevronRight, Zap, Brain, Flame, FileText, CheckCircle } from "lucide-react";
import { mockSubjects, mockUnits } from "../lib/mockData";
import { cn } from "../lib/utils";


interface QuizConfig {
  difficulty: string;
  subjectId: string;
  unitId: string;
  numQuestions: string;
  timeLimit: string;
}

interface QuizSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartQuiz: (config: QuizConfig) => void;
}

const difficulties = [
    { name: "Easy", icon: <Zap className="w-5 h-5" /> },
    { name: "Medium", icon: <Brain className="w-5 h-5" /> },
    { name: "Hard", icon: <Flame className="w-5 h-5" /> },
];
const questionCounts = ["5", "10", "15", "20"];
const timeLimits = ["5", "10", "15", "30"];

const FunnyLoader = () => (
    <motion.div
      className="flex flex-col items-center justify-center space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
        <div className="relative">
            <Book className="w-16 h-16 text-blue-500 animate-bounce" />
            <motion.div
                className="absolute top-0 left-0 w-full h-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
                <FileText className="w-6 h-6 text-green-500 absolute top-0 right-0" />
                <Hash className="w-6 h-6 text-red-500 absolute bottom-0 left-0" />
                <Clock className="w-6 h-6 text-yellow-500 absolute -top-2 -left-2" />
            </motion.div>
        </div>
      <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Crafting your challenge...</p>
    </motion.div>
  );

export function QuizSetupModal({ isOpen, onClose, onStartQuiz }: QuizSetupModalProps) {
  const [config, setConfig] = useState<QuizConfig>({
    difficulty: "Medium",
    subjectId: "",
    unitId: "",
    numQuestions: "10",
    timeLimit: "10",
  });
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (config.subjectId) {
      setUnits(mockUnits[config.subjectId] || []);
      setConfig(c => ({ ...c, unitId: "" }));
    } else {
      setUnits([]);
    }
  }, [config.subjectId]);

  const handleStart = () => {
    setIsLoading(true);
    // Simulate loading
    setTimeout(() => {
      onStartQuiz(config);
      setIsLoading(false);
      onClose();
    }, 2500);
  };

  const isFormValid = config.subjectId && config.unitId;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border-none">
        <motion.div initial="hidden" animate="visible" variants={containerVariants}>
          <DialogHeader>
            <motion.div variants={itemVariants} className="flex flex-col items-center text-center">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-3">
                    <Settings className="h-8 w-8 text-blue-500 dark:text-blue-400" />
                </div>
                <DialogTitle className="text-2xl font-bold text-slate-800 dark:text-white">
                    Craft Your Quiz
                </DialogTitle>
                <p className="text-sm text-slate-500 dark:text-slate-400">Personalize your practice session for the best results.</p>
            </motion.div>
          </DialogHeader>

          <AnimatePresence mode="wait">
            {isLoading ? (
                <motion.div key="loader" className="h-80 flex items-center justify-center">
                    <FunnyLoader />
                </motion.div>
            ) : (
            <motion.div
                key="form"
                className="grid gap-6 py-6"
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                exit={{opacity: 0}}
            >
                <motion.div variants={itemVariants} className="px-4">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2 block text-center">Select Difficulty</label>
                    <div className="grid grid-cols-3 gap-2">
                        {difficulties.map((d) => (
                            <motion.div key={d.name} whileHover={{scale: 1.05}} whileTap={{scale: 0.95}}>
                                <Button
                                variant="outline"
                                onClick={() => setConfig({ ...config, difficulty: d.name })}
                                className={cn("w-full h-16 flex flex-col gap-1 transition-all duration-300",
                                    config.difficulty === d.name ? "bg-blue-500 text-white shadow-lg" : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
                                )}
                                >
                                {d.icon}
                                <span className="text-sm">{d.name}</span>
                                </Button>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 px-4">
                    <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2 block">Subject</label>
                        <Select value={config.subjectId} onValueChange={(value) => setConfig({ ...config, subjectId: value })}>
                            <SelectTrigger className="w-full">
                                <Book className="w-4 h-4 mr-2 text-slate-500" />
                                <SelectValue placeholder="Choose..." />
                            </SelectTrigger>
                            <SelectContent>
                                {mockSubjects.map((s) => (
                                    <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2 block">Unit</label>
                        <Select value={config.unitId} onValueChange={(value) => setConfig({ ...config, unitId: value })} disabled={!config.subjectId}>
                            <SelectTrigger className="w-full" disabled={!config.subjectId}>
                                <FileText className="w-4 h-4 mr-2 text-slate-500" />
                                <SelectValue placeholder="Choose..." />
                            </SelectTrigger>
                            <SelectContent>
                                {units.map((u) => (
                                    <SelectItem key={u.id} value={u.id.toString()}>{u.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 px-4">
                <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2 block">Questions</label>
                        <Select value={config.numQuestions} onValueChange={(value) => setConfig({ ...config, numQuestions: value })}>
                            <SelectTrigger className="w-full">
                                <Hash className="w-4 h-4 mr-2 text-slate-500" />
                                <SelectValue placeholder="#..." />
                            </SelectTrigger>
                            <SelectContent>
                                {questionCounts.map((c) => (
                                    <SelectItem key={c} value={c}>{c} questions</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2 block">Time</label>
                        <Select value={config.timeLimit} onValueChange={(value) => setConfig({ ...config, timeLimit: value })}>
                            <SelectTrigger className="w-full">
                                <Clock className="w-4 h-4 mr-2 text-slate-500" />
                                <SelectValue placeholder="Mins..." />
                            </SelectTrigger>
                            <SelectContent>
                                {timeLimits.map((t) => (
                                    <SelectItem key={t} value={t}>{t} minutes</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </motion.div>

            </motion.div>
            )}
          </AnimatePresence>


          <DialogFooter>
            <motion.div variants={itemVariants} className="w-full">
                <Button
                onClick={handleStart}
                disabled={!isFormValid || isLoading}
                className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-xl transition-all duration-300 transform hover:scale-105 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:scale-100"
                >
                {isLoading ? (
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                ) : (
                    <>
                    Start Challenge
                    <ChevronRight className="ml-2 h-5 w-5" />
                    </>
                )}
                </Button>
            </motion.div>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}