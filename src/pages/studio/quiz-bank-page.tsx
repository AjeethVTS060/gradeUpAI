import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { ArrowLeft, Book, BookCheck, Filter, Search, Wand2, Smile, Meh, Frown, PartyPopper, Loader2, Eye } from 'lucide-react';
import { Link } from 'wouter';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';


const initialQuizBank = [
    { id: 1, title: 'Algebra Basics', subject: 'Mathematics', questions: 15, difficulty: 'Easy' },
    { id: 2, title: 'Newtonian Physics', subject: 'Physics', questions: 20, difficulty: 'Medium' },
    { id: 3, title: 'Organic Chemistry Reactions', subject: 'Chemistry', questions: 25, difficulty: 'Hard' },
    { id: 4, title: 'Cellular Biology', subject: 'Biology', questions: 15, difficulty: 'Easy' },
    { id: 5, title: 'World War II', subject: 'History', questions: 30, difficulty: 'Medium' },
    { id: 6, title: 'Data Structures', subject: 'Computer Science', questions: 20, difficulty: 'Hard' },
];

const allQuestions = {
    1: [
        { q: "What is the value of x in the equation 2x + 3 = 7?", a: "x = 2" },
        { q: "What is the slope of the line given by the equation y = 3x - 2?", a: "The slope is 3." },
        { q: "Factor the expression: x^2 - 4", a: "(x - 2)(x + 2)" },
    ],
    2: [
        { q: "What is Newton's Second Law of Motion?", a: "Force equals mass times acceleration (F=ma)." },
        { q: "What is the unit of electrical resistance?", a: "Ohm (Ω)" },
    ],
    3: [
        { q: "What is the chemical formula for water?", a: "H2O" },
        { q: "What is the most abundant gas in Earth's atmosphere?", a: "Nitrogen (about 78%)." },
    ],
    4: [
        { q: "What is the powerhouse of the cell?", a: "The Mitochondrion." },
    ],
    5: [
        { q: "Who was the first President of the United States?", a: "George Washington." },
    ],
    6: [
        { q: "What does 'HTML' stand for?", a: "HyperText Markup Language." },
        { q: "In Python, what keyword is used to define a function?", a: "def" },
    ],
};

const difficultyIcons = {
    Easy: <Smile className="text-green-400 h-5 w-5" />,
    Medium: <Meh className="text-yellow-400 h-5 w-5" />,
    Hard: <Frown className="text-red-400 h-5 w-5" />,
};

const FunnyLoader = () => (
    <div className="flex flex-col items-center justify-center gap-4">
        <motion.div
            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        >
            <PartyPopper className="h-16 w-16 text-purple-400" />
        </motion.div>
        <p className="text-lg font-semibold text-slate-300">Summoning knowledge... a moment please!</p>
    </div>
);

const QuestionCard = ({ qa, index }) => {
    const [showAnswer, setShowAnswer] = useState(false);
    return (
        <motion.div
            className="bg-slate-800/70 p-4 rounded-lg mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
        >
            <p className="font-semibold text-slate-200">{index + 1}. {qa.q}</p>
            <AnimatePresence>
                {showAnswer && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        className="mt-3 pt-3 pl-4 border-l-2 border-green-400"
                    >
                        <p className="text-green-300 font-bold">{qa.a}</p>
                    </motion.div>
                )}
            </AnimatePresence>
            <Button variant="link" className="p-0 h-auto text-purple-400 mt-2 text-sm transition-all hover:text-purple-300" onClick={() => setShowAnswer(!showAnswer)}>
                {showAnswer ? 'Hide Answer' : 'Show Answer'}
            </Button>
        </motion.div>
    );
};


const QuizBankPage = () => {
    const [quizzes, setQuizzes] = useState(initialQuizBank);
    const [searchTerm, setSearchTerm] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState('all');
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    
    const [newQuizTitle, setNewQuizTitle] = useState('');
    const [newQuizSubject, setNewQuizSubject] = useState('');
    const [newQuizDifficulty, setNewQuizDifficulty] = useState('Easy');
    const [isCreating, setIsCreating] = useState(false);

    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [viewingQuiz, setViewingQuiz] = useState(false);
    const [loadingQuestions, setLoadingQuestions] = useState(false);

    const filteredQuizzes = useMemo(() => {
        return quizzes
            .filter(quiz => quiz.title.toLowerCase().includes(searchTerm.toLowerCase()))
            .filter(quiz => difficultyFilter === 'all' || quiz.difficulty === difficultyFilter);
    }, [quizzes, searchTerm, difficultyFilter]);

    const handleCreateQuiz = () => {
        if (!newQuizTitle || !newQuizSubject) return;
        setIsCreating(true);
        setTimeout(() => {
            const newQuiz = {
                id: quizzes.length + 1,
                title: newQuizTitle,
                subject: newQuizSubject,
                questions: Math.floor(Math.random() * 20) + 5,
                difficulty: newQuizDifficulty,
            };
            setQuizzes(prev => [newQuiz, ...prev]);
            setIsCreating(false);
            setCreateModalOpen(false);
            setNewQuizTitle('');
            setNewQuizSubject('');
            setNewQuizDifficulty('Easy');
        }, 2500);
    };

    const handleViewQuiz = (quiz) => {
        setSelectedQuiz(quiz);
        setLoadingQuestions(true);
        setViewingQuiz(true);
        setTimeout(() => {
            setLoadingQuestions(false);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-8 font-sans overflow-hidden">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="max-w-7xl mx-auto"
            >
                <header className="flex flex-wrap justify-between items-center gap-4 mb-8">
                    <Link href="/ai-tutor">
                        <Button variant="outline" className="bg-slate-800 border-slate-700 hover:bg-slate-700 transition-all duration-300">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Studio
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold flex items-center gap-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                        <Book />
                        Quiz Bank
                    </h1>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Input placeholder="Search quizzes..." className="bg-slate-800 border-slate-700 pl-10 w-40 sm:w-auto" onChange={(e) => setSearchTerm(e.target.value)} />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="bg-slate-800 border-slate-700 hover:bg-slate-700">
                                    <Filter className="mr-2 h-4 w-4" />
                                    Filter
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56 bg-slate-800 border-slate-700 text-white">
                                <DropdownMenuRadioGroup value={difficultyFilter} onValueChange={setDifficultyFilter}>
                                    <DropdownMenuRadioItem value="all">All Difficulties</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="Easy">Easy</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="Medium">Medium</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="Hard">Hard</DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 transition-all duration-300 transform hover:scale-105" onClick={() => setCreateModalOpen(true)}>
                            <Wand2 className="mr-2 h-4 w-4" />
                            Create Quiz
                        </Button>
                    </div>
                </header>

                <AnimatePresence>
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } }}}
                        initial="hidden"
                        animate="show"
                    >
                        {filteredQuizzes.map((quiz) => (
                            <motion.div
                                key={quiz.id}
                                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                                layout
                            >
                                <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500 transition-colors h-full flex flex-col group">
                                    <CardContent className="p-6 flex-grow flex flex-col">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-300">{quiz.subject}</span>
                                            <div className="flex items-center gap-2">
                                                {difficultyIcons[quiz.difficulty]}
                                                <span className={`text-xs font-bold text-slate-300`}>{quiz.difficulty}</span>
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-bold mb-2 text-slate-100 group-hover:text-purple-400 transition-colors">{quiz.title}</h3>
                                        <p className="text-slate-400 text-sm mb-4 flex-grow">{quiz.questions} Questions</p>
                                        <div className="flex justify-end items-center mt-auto pt-4">
                                            <Button size="sm" onClick={() => handleViewQuiz(quiz)} className="w-full bg-slate-700 hover:bg-purple-600 transition-all duration-300 transform hover:scale-105 group-hover:bg-purple-600">
                                                <Eye className="mr-2 h-4 w-4"/>
                                                View Questions
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                </AnimatePresence>

                 {filteredQuizzes.length === 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center col-span-full py-20"
                    >
                        <Book className="mx-auto h-24 w-24 text-slate-600" />
                        <h2 className="mt-6 text-2xl font-bold text-slate-400">No Quizzes Found!</h2>
                        <p className="mt-2 text-slate-500">Try adjusting your search or filters, or create a new quiz!</p>
                    </motion.div>
                )}
            </motion.div>

            <AnimatePresence>
                {isCreateModalOpen && (
                    <Dialog open={isCreateModalOpen} onOpenChange={setCreateModalOpen}>
                        <DialogContent className="bg-slate-900 border-slate-700 text-white">
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                                {isCreating ? (
                                    <div className="h-64 flex items-center justify-center">
                                        <FunnyLoader />
                                    </div>
                                ) : (
                                    <>
                                        <DialogHeader>
                                            <DialogTitle className="flex items-center gap-2 text-2xl">
                                                <Wand2 className="text-purple-400"/>
                                                Create a New Quiz
                                            </DialogTitle>
                                            <DialogDescription>
                                                Fill in the details below to create a magical new quiz for your students.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <label htmlFor="title" className="text-right">Title</label>
                                                <Input id="title" value={newQuizTitle} onChange={(e) => setNewQuizTitle(e.target.value)} className="col-span-3 bg-slate-800 border-slate-700" />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <label htmlFor="subject" className="text-right">Subject</label>
                                                <Input id="subject" value={newQuizSubject} onChange={(e) => setNewQuizSubject(e.target.value)} className="col-span-3 bg-slate-800 border-slate-700" />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <label className="text-right">Difficulty</label>
                                                <div className="col-span-3 flex gap-2">
                                                    {Object.entries(difficultyIcons).map(([level, icon]) => (
                                                        <Button key={level} variant="outline" onClick={() => setNewQuizDifficulty(level)} className={`transition-all ${newQuizDifficulty === level ? 'bg-purple-500/30 border-purple-500' : 'bg-slate-800 border-slate-700'}`}>
                                                            {icon} <span className="ml-2">{level}</span>
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button type="submit" onClick={handleCreateQuiz} className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600">
                                                {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PartyPopper className="mr-2 h-4 w-4"/>}
                                                Create Quiz
                                            </Button>
                                        </DialogFooter>
                                    </>
                                )}
                            </motion.div>
                        </DialogContent>
                    </Dialog>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {viewingQuiz && selectedQuiz && (
                    <Dialog open={viewingQuiz} onOpenChange={setViewingQuiz}>
                        <DialogContent className="bg-slate-900/80 backdrop-blur-sm border-slate-700 text-white max-w-3xl">
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ease: "circOut", duration: 0.3}}>
                                {loadingQuestions ? (
                                    <div className="h-96 flex items-center justify-center">
                                        <FunnyLoader />
                                    </div>
                                ) : (
                                    <>
                                        <DialogHeader>
                                            <DialogTitle className="flex items-center gap-3 text-2xl bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                                                <BookCheck className="h-8 w-8 text-purple-400"/>
                                                {selectedQuiz.title}
                                            </DialogTitle>
                                            <DialogDescription>
                                                Here are the questions and answers for this quiz. Study them well!
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="my-4 h-[60vh] overflow-y-auto p-2 pr-4 rounded-lg">
                                            {allQuestions[selectedQuiz.id] && allQuestions[selectedQuiz.id].length > 0 ? (
                                                allQuestions[selectedQuiz.id].map((item, index) => (
                                                   <QuestionCard qa={item} index={index} key={index} />
                                                ))
                                            ) : (
                                                <div className="text-center text-slate-400 flex flex-col items-center justify-center h-full gap-4">
                                                    <Meh className="h-24 w-24 text-slate-600"/>
                                                    <h3 className="text-xl font-bold">A Bit Empty Here...</h3>
                                                    <p>Looks like no questions have been added for this quiz yet!</p>
                                                </div>
                                            )}
                                        </div>
                                         <DialogFooter>
                                            <Button onClick={() => setViewingQuiz(false)} variant="outline" className="bg-slate-800 border-slate-700 hover:bg-slate-700">Close</Button>
                                        </DialogFooter>
                                    </>
                                )}
                            </motion.div>
                        </DialogContent>
                    </Dialog>
                )}
            </AnimatePresence>
        </div>
    );
};

export default QuizBankPage;