import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { ArrowLeft, BookCheck, Clock, Layers } from 'lucide-react';
import { Link } from 'wouter';
import { Card, CardContent } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';

const testPrepTopics = [
  { subject: 'Physics', topic: 'Final Exam Review', progress: 75, color: 'blue' },
  { subject: 'Mathematics', topic: 'Calculus I Mid-term', progress: 40, color: 'purple' },
  { subject: 'Biology', topic: 'Genetics Chapter Test', progress: 90, color: 'green' },
];

const TestPrepPage = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-8 font-sans">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
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
            <BookCheck className="text-green-400" />
            Test Preparation
          </h1>
          <Button className="bg-green-600 hover:bg-green-700">
            Create New Prep Plan
          </Button>
        </header>

        {/* Prep Plan Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testPrepTopics.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              <Card className={`bg-slate-800/50 border-slate-700 overflow-hidden`}>
                <div className={`h-2 bg-gradient-to-r from-${item.color}-500 to-${item.color}-400`}></div>
                <CardContent className="p-6">
                  <span className="text-sm font-semibold text-green-400">{item.subject}</span>
                  <h3 className="text-2xl font-bold my-2">{item.topic}</h3>
                  
                  <div className="my-4">
                    <div className="flex justify-between items-center mb-1 text-slate-300">
                      <span className="text-xs font-medium">Progress</span>
                      <span className="text-sm font-bold">{item.progress}%</span>
                    </div>
                    <Progress value={item.progress} className="h-2" />
                  </div>

                  <div className="flex flex-col gap-2 text-slate-400 text-sm">
                    <div className="flex items-center gap-2"><Clock className="h-4 w-4"/> 3 sessions remaining</div>
                    <div className="flex items-center gap-2"><Layers className="h-4 w-4"/> 5 practice quizzes</div>
                  </div>

                  <Button className="w-full mt-6 bg-green-600 hover:bg-green-700">
                    Continue Prep
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default TestPrepPage;
