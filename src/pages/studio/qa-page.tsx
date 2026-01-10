import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { ArrowLeft, HelpCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Link } from 'wouter';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardFooter } from '../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';

const qaItems = [
  {
    question: "What is the difference between velocity and speed?",
    answer: "Speed is a scalar quantity that refers to 'how fast an object is moving.' Velocity is a vector quantity that refers to 'the rate at which an object changes its position.'",
    author: "Physics Bot",
    avatar: "⚛️",
    likes: 12,
  },
  {
    question: "Can you explain the concept of recursion in programming?",
    answer: "Recursion is a method of solving a problem where the solution depends on solutions to smaller instances of the same problem. A function that calls itself is a recursive function.",
    author: "CS Bot",
    avatar: "💻",
    likes: 25,
  },
];

const QAPage = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-8 font-sans">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
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
            <HelpCircle className="text-orange-400" />
            Q&A Forum
          </h1>
          <Button className="bg-orange-600 hover:bg-orange-700">
            Ask a New Question
          </Button>
        </header>

        {/* Question Input */}
        <div className="mb-8">
          <Input placeholder="Search for a question..." className="bg-slate-800 border-slate-700 text-lg p-6 rounded-xl" />
        </div>

        {/* Q&A List */}
        <div className="space-y-6">
          {qaItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.15 }}
            >
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-3 text-orange-300">{item.question}</h3>
                  <p className="text-slate-300 leading-relaxed">{item.answer}</p>
                </CardContent>
                <CardFooter className="flex justify-between items-center p-4 pt-0">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-slate-700 text-orange-400">{item.avatar}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-semibold text-slate-400">{item.author}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 text-slate-400 hover:text-green-400 transition-colors">
                      <ThumbsUp className="h-5 w-5" />
                      {item.likes}
                    </button>
                    <button className="text-slate-400 hover:text-red-400 transition-colors">
                      <ThumbsDown className="h-5 w-5" />
                    </button>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default QAPage;
