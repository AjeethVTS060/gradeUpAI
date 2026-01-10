import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { ArrowLeft, Book, Filter, Search } from 'lucide-react';
import { Link } from 'wouter';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';

const quizBank = [
  { title: 'Algebra Basics', subject: 'Mathematics', questions: 15, difficulty: 'Easy' },
  { title: 'Newtonian Physics', subject: 'Physics', questions: 20, difficulty: 'Medium' },
  { title: 'Organic Chemistry Reactions', subject: 'Chemistry', questions: 25, difficulty: 'Hard' },
  { title: 'Cellular Biology', subject: 'Biology', questions: 15, difficulty: 'Easy' },
  { title: 'World War II', subject: 'History', questions: 30, difficulty: 'Medium' },
  { title: 'Data Structures', subject: 'Computer Science', questions: 20, difficulty: 'Hard' },
];

const QuizBankPage = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-8 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <Link href="/ai-tutor">
            <Button variant="outline" className="bg-slate-800 border-slate-700 hover:bg-slate-700">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tutor
            </Button>
          </Link>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Book className="text-purple-400" />
            Quiz Bank
          </h1>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Input placeholder="Search quizzes..." className="bg-slate-800 border-slate-700 pl-10" />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            </div>
            <Button variant="outline" className="bg-slate-800 border-slate-700 hover:bg-slate-700">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </header>

        {/* Quiz Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizBank.map((quiz, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500 transition-colors">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-300">{quiz.subject}</span>
                    <span className={`text-xs font-bold ${
                      quiz.difficulty === 'Easy' ? 'text-green-400' :
                      quiz.difficulty === 'Medium' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {quiz.difficulty}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold my-4">{quiz.title}</h3>
                  <div className="flex justify-between items-center text-slate-400 text-sm">
                    <span>{quiz.questions} Questions</span>
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700">Start Quiz</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default QuizBankPage;
