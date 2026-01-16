import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Textarea } from "../components/ui/textarea";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Progress } from "../components/ui/progress";
import {
  BookOpen,
  Calendar,
  Clock,
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  Star,
  Send,
  Paperclip,
  Download,
  Eye,
  MessageSquare,
  TrendingUp,
  Target,
  ArrowLeft,
  Brain, // Added for FunnyLoader
  Loader2 // Added for FunnyLoader
} from "lucide-react";
import { Link } from "wouter";
import { cn } from "../lib/utils";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useAuth } from "../hooks/use-auth";
import MinimalHeader from "../components/minimal-header"; // Changed from Navigation
import { useTheme } from "../hooks/use-theme"; // Added for theme toggle
import { formatDistanceToNow } from "date-fns";

const FunnyLoader = ({ text = "Gathering your homework assignments..." }) => (
    <motion.div
        className="flex flex-col items-center justify-center space-y-4 text-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
    >
        <motion.div
            animate={{
                y: [0, -10, 0],
                rotate: [0, 0, 0, 0] // Adjusted for a less "brain-like" animation if not directly brain-related
            }}
            transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
            }}
        >
            <BookOpen className="h-20 w-20 text-blue-500" /> {/* Changed icon to BookOpen */}
        </motion.div>
        <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">{text}</p>
        <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
    </motion.div>
);

interface Assignment {
  id: number;
  title: string;
  description: string;
  courseId: number;
  courseName: string;
  teacherName: string;
  dueDate: string;
  maxScore: number;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  instructions: string;
  submissionType: 'text' | 'file' | 'both';
  createdAt: string;
}

interface Submission {
  id?: number;
  assignmentId: number;
  content: string;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  score?: number;
  feedback?: string;
  submittedAt?: string;
  gradedAt?: string;
}

export default function HomeworkPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme(); // Initialize useTheme
  const [selectedTab, setSelectedTab] = useState("pending");
  const [submissionContent, setSubmissionContent] = useState<Record<number, string>>({});
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch assignments for student
  const { data: assignments = [], isLoading } = useQuery<Assignment[]>({
    queryKey: ["/api/student/assignments"],
  });

  // Fetch submissions for student
  const { data: submissions = [] } = useQuery<Submission[]>({
    queryKey: ["/api/student/submissions"],
  });

  // Submit assignment mutation
  const submitAssignmentMutation = useMutation({
    mutationFn: async ({ assignmentId, content, attachments }: {
      assignmentId: number;
      content: string;
      attachments?: File[];
    }) => {
      const formData = new FormData();
      formData.append('content', content);
      if (attachments) {
        attachments.forEach((file, index) => {
          formData.append(`attachment_${index}`, file);
        });
      }

      const res = await fetch(`/api/assignments/${assignmentId}/submit`, {
        method: 'POST',
        body: formData,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/student/assignments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/student/submissions"] });
      setSubmissionContent(prev => ({ ...prev, [selectedAssignment!.id]: "" }));
      setSelectedAssignment(null);
    },
  });

  const getSubmissionForAssignment = (assignmentId: number) => {
    return submissions.find(sub => sub.assignmentId === assignmentId);
  };

  const getAssignmentStatus = (assignment: Assignment) => {
    const submission = getSubmissionForAssignment(assignment.id);
    const dueDate = new Date(assignment.dueDate);
    const now = new Date();
    
    if (submission) {
      if (submission.gradedAt) {
        return { status: 'graded', color: 'bg-blue-500', text: 'Graded' };
      }
      return { status: 'submitted', color: 'bg-green-500', text: 'Submitted' };
    }
    
    if (now > dueDate) {
      return { status: 'overdue', color: 'bg-red-500', text: 'Overdue' };
    }
    
    const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (hoursUntilDue <= 24) {
      return { status: 'due-soon', color: 'bg-orange-500', text: 'Due Soon' };
    }
    
    return { status: 'pending', color: 'bg-gray-500', text: 'Pending' };
  };

  const filteredAssignments = assignments.filter(assignment => {
    const status = getAssignmentStatus(assignment).status;
    
    switch (selectedTab) {
      case 'pending':
        return status === 'pending' || status === 'due-soon';
      case 'submitted':
        return status === 'submitted';
      case 'graded':
        return status === 'graded';
      case 'overdue':
        return status === 'overdue';
      default:
        return true;
    }
  });

  const handleSubmitAssignment = (assignmentId: number) => {
    const content = submissionContent[assignmentId] || "";
    if (!content.trim()) return;

    submitAssignmentMutation.mutate({
      assignmentId,
      content,
    });
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files || !selectedAssignment) return;
    
    const fileArray = Array.from(files);
    submitAssignmentMutation.mutate({
      assignmentId: selectedAssignment.id,
      content: submissionContent[selectedAssignment.id] || "",
      attachments: fileArray,
    });
  };

  const getProgressStats = () => {
    const total = assignments.length;
    const submitted = assignments.filter(a => getSubmissionForAssignment(a.id)).length;
    const graded = assignments.filter(a => {
      const sub = getSubmissionForAssignment(a.id);
      return sub?.gradedAt;
    }).length;
    
    return { total, submitted, graded };
  };

  const { total, submitted, graded } = getProgressStats();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100 dark:from-gray-900 dark:to-purple-950">
        <FunnyLoader text="Loading your homework assignments..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 dark:from-gray-900 dark:to-purple-950 text-gray-900 dark:text-white">
      <MinimalHeader title="My Homework" currentTheme={theme} onThemeChange={setTheme} />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left Column - Overview/Summary */}
          <div className="lg:col-span-1 space-y-6 md:space-y-8">
            <div className="relative p-4 sm:p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl shadow-xl">
              <div className="absolute top-2 left-2 sm:top-4 sm:left-4">
                <Link href="/">
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                    <ArrowLeft className="h-4 w-4 md:mr-2" />
                    <span className="hidden md:inline">Dashboard</span>
                  </Button>
                </Link>
              </div>
              <div className="text-center pt-10 sm:pt-8 pb-4">
                <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">My Homework Hub</h1>
                <p className="text-base sm:text-lg opacity-90">Stay on top of your assignments.</p>
              </div>

              {/* Progress Overview - Responsive (integrated into new header design) */}
              <div className="mt-4 sm:mt-6 grid grid-cols-3 gap-2 sm:gap-4">
                <Card className="bg-white/10 text-white border-none p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between">
                  <div className="text-center sm:text-left">
                    <p className="text-xs sm:text-sm opacity-80">Total</p>
                    <p className="text-2xl sm:text-3xl font-bold">{total}</p>
                  </div>
                  <Target className="h-6 w-6 sm:h-8 sm:w-8 opacity-70 mt-1 sm:mt-0" />
                </Card>
                <Card className="bg-white/10 text-white border-none p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between">
                  <div className="text-center sm:text-left">
                    <p className="text-xs sm:text-sm opacity-80">Done</p>
                    <p className="text-2xl sm:text-3xl font-bold">{submitted}</p>
                  </div>
                  <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 opacity-70 mt-1 sm:mt-0" />
                </Card>
                <Card className="bg-white/10 text-white border-none p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between">
                  <div className="text-center sm:text-left">
                    <p className="text-xs sm:text-sm opacity-80">Graded</p>
                    <p className="text-2xl sm:text-3xl font-bold">{graded}</p>
                  </div>
                  <Star className="h-6 w-6 sm:h-8 sm:w-8 opacity-70 mt-1 sm:mt-0" />
                </Card>
              </div>
            </div>

            {/* Progress Bar - Animated */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-3">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Overall Progress</h3>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {submitted}/{total} assignments submitted
                    </span>
                  </div>
                  <Progress value={total > 0 ? (submitted / total) * 100 : 0} className="h-3 bg-blue-200 dark:bg-blue-800" />
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Detailed Assignments */}
          <div className="lg:col-span-2">
            {/* Assignment Tabs - Responsive */}
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <ScrollArea className="w-full whitespace-nowrap rounded-lg">
              <TabsList className="inline-flex h-auto">
                <TabsTrigger value="pending">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>Pending ({assignments.filter(a => ['pending', 'due-soon'].includes(getAssignmentStatus(a).status)).length})</span>
                </TabsTrigger>
                <TabsTrigger value="submitted">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>Done ({assignments.filter(a => getAssignmentStatus(a).status === 'submitted').length})</span>
                </TabsTrigger>
                <TabsTrigger value="graded">
                  <Star className="h-4 w-4 mr-2" />
                  <span>Graded ({assignments.filter(a => getAssignmentStatus(a).status === 'graded').length})</span>
                </TabsTrigger>
                <TabsTrigger value="overdue">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <span>Late ({assignments.filter(a => getAssignmentStatus(a).status === 'overdue').length})</span>
                </TabsTrigger>
              </TabsList>
            </ScrollArea>

          <TabsContent value={selectedTab} className="mt-6">
            <div className="grid gap-4 md:gap-6">
              {filteredAssignments.length === 0 ? (
                <Card>
                  <CardContent className="p-8 sm:p-12 text-center">
                    <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No assignments found</h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                      {selectedTab === 'pending' && "You're all caught up! No pending assignments."}
                      {selectedTab === 'submitted' && "No submitted assignments yet."}
                      {selectedTab === 'graded' && "No graded assignments yet."}
                      {selectedTab === 'overdue' && "Great job! No overdue assignments."}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredAssignments.map((assignment, index) => { // Added index for delay
                  const status = getAssignmentStatus(assignment);
                  const submission = getSubmissionForAssignment(assignment.id);
                  const dueDate = new Date(assignment.dueDate);
                  
                  return (
                    <motion.div
                      key={assignment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }} // Staggered animation
                    >
                      <Card className="hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center flex-wrap gap-x-3 gap-y-2 mb-2">
                              <CardTitle className="text-lg sm:text-xl">{assignment.title}</CardTitle>
                              <Badge className={cn("text-white", status.color)}>
                                {status.text}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                              <span className="flex items-center">
                                <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5" />
                                {assignment.courseName}
                              </span>
                              <span className="flex items-center">
                                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5" />
                                Due {formatDistanceToNow(dueDate, { addSuffix: true })}
                              </span>
                              <span className="flex items-center">
                                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5" />
                                {assignment.maxScore} points
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="p-4 sm:p-6">
                        <div className="space-y-4">
                          {/* Assignment Description */}
                          <div>
                            <h4 className="font-medium mb-2 text-sm sm:text-base">Assignment Description</h4>
                            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{assignment.description}</p>
                          </div>

                          {/* Instructions */}
                          {assignment.instructions && (
                            <div>
                              <h4 className="font-medium mb-2 text-sm sm:text-base">Instructions</h4>
                              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{assignment.instructions}</p>
                            </div>
                          )}

                          {/* Attachments */}
                          {assignment.attachments && assignment.attachments.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-2 text-sm sm:text-base">Assignment Files</h4>
                              <div className="space-y-2">
                                {assignment.attachments.map((attachment, index) => (
                                  <div key={index} className="flex items-center space-x-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
                                    <Paperclip className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm">{attachment.name}</span>
                                    <Button size="sm" variant="outline">
                                      <Download className="h-3 w-3 mr-1" />
                                      Download
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Submission Section */}
                          {!submission && status.status !== 'overdue' && (
                            <div className="border-t dark:border-gray-700 pt-4">
                              <h4 className="font-medium mb-3 text-sm sm:text-base">Submit Assignment</h4>
                              <div className="space-y-3">
                                <Textarea
                                  placeholder="Write your answer or response here..."
                                  value={submissionContent[assignment.id] || ""}
                                  onChange={(e) => setSubmissionContent(prev => ({
                                    ...prev,
                                    [assignment.id]: e.target.value
                                  }))}
                                  className="min-h-[100px] sm:min-h-[120px]"
                                />
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                  <Button
                                    onClick={() => handleSubmitAssignment(assignment.id)}
                                    disabled={!submissionContent[assignment.id]?.trim() || submitAssignmentMutation.isPending}
                                    className="bg-primary hover:bg-blue-700 w-full sm:w-auto"
                                  >
                                    <Send className="h-4 w-4 mr-2" />
                                    Submit Assignment
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedAssignment(assignment);
                                      fileInputRef.current?.click();
                                    }}
                                    className="w-full sm:w-auto"
                                  >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Attach Files
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Submitted Work */}
                          {submission && (
                            <div className="border-t dark:border-gray-700 pt-4">
                              <h4 className="font-medium mb-3 text-sm sm:text-base">Your Submission</h4>
                              <div className="bg-gray-100 dark:bg-gray-800 p-3 sm:p-4 rounded-lg">
                                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-3">{submission.content}</p>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                  <span>Submitted {formatDistanceToNow(new Date(submission.submittedAt!), { addSuffix: true })}</span>
                                  {submission.score !== undefined && (
                                    <span className="font-medium text-green-600 dark:text-green-400">
                                      Score: {submission.score}/{assignment.maxScore}
                                    </span>
                                  )}
                                </div>
                                
                                {submission.feedback && (
                                  <div className="mt-3 p-3 bg-blue-100 dark:bg-blue-900/50 border-l-4 border-blue-400">
                                    <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-1">Teacher Feedback</h5>
                                    <p className="text-sm sm:text-base text-blue-700 dark:text-blue-300">{submission.feedback}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    </motion.div> // Added closing motion.div
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>
          </div> {/* Closing lg:col-span-2 (Right Column) */}
        </div> {/* Closing grid grid-cols-1 lg:grid-cols-3 gap-8 (Main Grid Container) */}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFileUpload(e.target.files)}
        />
      </motion.div> {/* Closing motion.div for main content */}
    </div>
  );
}