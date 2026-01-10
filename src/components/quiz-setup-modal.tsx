
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Book,
  BrainCircuit,
  Clock,
  HelpCircle,
  ChevronDown,
  Wind,
  Feather,
  Zap,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useLocation } from "wouter";
import { mockSubjects } from "../lib/mockData";

const funnyLoaders = [
  "Reticulating Splines...",
  "Generating witty dialog...",
  "Charging flux capacitor...",
  "Asking the magic smoke...",
  "Aligning cosmic rays...",
  "Calibrating the doodads...",
];

const subjectUnits: { [key: string]: string[] } = {
  Mathematics: ["Algebra", "Geometry", "Calculus", "Trigonometry"],
  Physics: ["Mechanics", "Thermodynamics", "Electromagnetism", "Quantum Physics"],
  Chemistry: ["Organic", "Inorganic", "Physical", "Analytical"],
  Biology: ["Genetics", "Ecology", "Anatomy", "Botany"],
  "English Literature": ["Shakespeare", "Modernism", "Poetry", "The Novel"],
  History: ["Ancient", "Medieval", "Renaissance", "Modern"],
  "Computer Science": ["Algorithms", "Data Structures", "AI", "Networking"],
};

interface QuizSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QuizSetupModal: React.FC<QuizSetupModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [mode, setMode] = useState<string | null>(null);
  const [subject, setSubject] = useState<string | null>(null);
  const [unit, setUnit] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [questions, setQuestions] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loaderText, setLoaderText] = useState(funnyLoaders[0]);

  const [, setLocation] = useLocation();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setLoaderText(
          funnyLoaders[Math.floor(Math.random() * funnyLoaders.length)]
        );
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleTakeQuiz = () => {
    if (mode && subject && unit && time && questions) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        const query = new URLSearchParams({
            mode,
            subject,
            unit,
            time,
            questions
        }).toString();
        setLocation(`/studio/quiz?${query}`);
      }, 4000); // Simulate loading
    }
  };

  const isFormComplete = mode && subject && unit && time && questions;

  const getUnitsForSubject = (selectedSubject: string | null) => {
    return selectedSubject ? subjectUnits[selectedSubject] || [] : [];
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-white dark:bg-gray-900/90 border border-gray-200 dark:border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-2xl text-gray-900 dark:text-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            {isLoading ? (
              <div className="h-96 flex flex-col items-center justify-center text-center p-8">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <BrainCircuit className="h-20 w-20 text-purple-500" />
                </motion.div>
                <p className="text-xl font-semibold mt-6">{loaderText}</p>
              </div>
            ) : (
              <>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700/50 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <BrainCircuit className="h-8 w-8 text-purple-500" />
                    <h2 className="text-2xl font-bold tracking-tight">
                      Customize Your Challenge
                    </h2>
                  </div>
                  <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Mode */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-yellow-500" />
                      <label className="font-semibold">Mode</label>
                    </div>
                    <Select onValueChange={setMode} value={mode || undefined}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">
                          <div className="flex items-center gap-2">
                            <Feather className="h-4 w-4 text-green-500" /> Easy
                          </div>
                        </SelectItem>
                        <SelectItem value="medium">
                          <div className="flex items-center gap-2">
                            <Wind className="h-4 w-4 text-blue-500" /> Medium
                          </div>
                        </SelectItem>
                        <SelectItem value="hard">
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-red-500" /> Hard
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Subject */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Book className="h-5 w-5 text-blue-500" />
                      <label className="font-semibold">Subject</label>
                    </div>
                    <Select onValueChange={(value) => { setSubject(value); setUnit(null); }} value={subject || undefined}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockSubjects.map((s) => (
                          <SelectItem key={s.id} value={s.name}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Unit */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                      <label className="font-semibold">Unit</label>
                    </div>
                    <Select onValueChange={setUnit} value={unit || undefined} disabled={!subject}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={!subject ? "First, select a subject" : "Select unit"} />
                      </SelectTrigger>
                      <SelectContent>
                        {getUnitsForSubject(subject).map((u) => (
                          <SelectItem key={u} value={u}>
                            {u}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Time */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-indigo-500" />
                      <label className="font-semibold">Time Limit</label>
                    </div>
                    <Select onValueChange={setTime} value={time || undefined}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 minutes</SelectItem>
                        <SelectItem value="20">20 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Questions */}
                  <div className="space-y-3 col-span-1 md:col-span-2">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="h-5 w-5 text-green-500" />
                      <label className="font-semibold">Number of Questions</label>
                    </div>
                    <Select onValueChange={setQuestions} value={questions || undefined}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select number of questions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 Questions</SelectItem>
                        <SelectItem value="20">20 Questions</SelectItem>
                        <SelectItem value="30">30 Questions</SelectItem>
                        <SelectItem value="50">50 Questions</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700/50 flex justify-end">
                  <motion.div
                    whileHover={{ scale: isFormComplete ? 1.05 : 1 }}
                    whileTap={{ scale: isFormComplete ? 0.95 : 1 }}
                  >
                    <Button
                      size="lg"
                      onClick={handleTakeQuiz}
                      disabled={!isFormComplete}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold transition-all duration-300 shadow-lg disabled:bg-gray-400 disabled:shadow-none disabled:cursor-not-allowed"
                    >
                      Take Quiz
                    </Button>
                  </motion.div>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuizSetupModal;
