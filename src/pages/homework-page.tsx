import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
  ArrowLeft
} from "lucide-react";
import { Link } from "wouter";
import { cn } from "../lib/utils";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useAuth } from "../hooks/use-auth";
import Navigation from "../components/navigation";
import { formatDistanceToNow } from "date-fns";

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
      <div className="min-h-screen bg-gray-50">
        <Navigation currentRole="student" onRoleChange={() => {}} />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentRole="student" onRoleChange={() => {}} />
      
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
        <div className="mb-3 sm:mb-4">
          <Link href="/">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </Link>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4 sm:mb-6 lg:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Homework</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Track and submit your assignments</p>
          </div>
          
          {/* Progress Overview - Responsive */}
          <div className="grid grid-cols-3 gap-2 sm:flex sm:space-x-3 lg:space-x-4">
            <Card className="p-2 sm:p-3 lg:p-4">
              <div className="flex flex-col sm:flex-row items-center sm:space-x-2 lg:space-x-3 text-center sm:text-left">
                <Target className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 mb-1 sm:mb-0" />
                <div>
                  <div className="text-[10px] sm:text-sm text-gray-600">Total</div>
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold">{total}</div>
                </div>
              </div>
            </Card>
            <Card className="p-2 sm:p-3 lg:p-4">
              <div className="flex flex-col sm:flex-row items-center sm:space-x-2 lg:space-x-3 text-center sm:text-left">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mb-1 sm:mb-0" />
                <div>
                  <div className="text-[10px] sm:text-sm text-gray-600">Done</div>
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold">{submitted}</div>
                </div>
              </div>
            </Card>
            <Card className="p-2 sm:p-3 lg:p-4">
              <div className="flex flex-col sm:flex-row items-center sm:space-x-2 lg:space-x-3 text-center sm:text-left">
                <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 mb-1 sm:mb-0" />
                <div>
                  <div className="text-[10px] sm:text-sm text-gray-600">Graded</div>
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold">{graded}</div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Progress Bar */}
        <Card className="mb-4 sm:mb-6">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 mb-3 sm:mb-4">
              <h3 className="text-sm sm:text-lg font-semibold">Overall Progress</h3>
              <span className="text-xs sm:text-sm text-gray-600">
                {submitted}/{total} assignments submitted
              </span>
            </div>
            <Progress value={total > 0 ? (submitted / total) * 100 : 0} className="h-2" />
          </CardContent>
        </Card>

        {/* Assignment Tabs - Responsive */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-auto">
            <TabsTrigger value="pending" className="flex flex-col sm:flex-row items-center sm:space-x-1.5 py-1.5 sm:py-2 text-[10px] sm:text-xs lg:text-sm">
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Pending</span>
              <span>({assignments.filter(a => ['pending', 'due-soon'].includes(getAssignmentStatus(a).status)).length})</span>
            </TabsTrigger>
            <TabsTrigger value="submitted" className="flex flex-col sm:flex-row items-center sm:space-x-1.5 py-1.5 sm:py-2 text-[10px] sm:text-xs lg:text-sm">
              <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Done</span>
              <span>({assignments.filter(a => getAssignmentStatus(a).status === 'submitted').length})</span>
            </TabsTrigger>
            <TabsTrigger value="graded" className="flex flex-col sm:flex-row items-center sm:space-x-1.5 py-1.5 sm:py-2 text-[10px] sm:text-xs lg:text-sm">
              <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Graded</span>
              <span>({assignments.filter(a => getAssignmentStatus(a).status === 'graded').length})</span>
            </TabsTrigger>
            <TabsTrigger value="overdue" className="flex flex-col sm:flex-row items-center sm:space-x-1.5 py-1.5 sm:py-2 text-[10px] sm:text-xs lg:text-sm">
              <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Late</span>
              <span>({assignments.filter(a => getAssignmentStatus(a).status === 'overdue').length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="mt-6">
            <div className="grid gap-6">
              {filteredAssignments.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No assignments found</h3>
                    <p className="text-gray-600">
                      {selectedTab === 'pending' && "You're all caught up! No pending assignments."}
                      {selectedTab === 'submitted' && "No submitted assignments yet."}
                      {selectedTab === 'graded' && "No graded assignments yet."}
                      {selectedTab === 'overdue' && "Great job! No overdue assignments."}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredAssignments.map((assignment) => {
                  const status = getAssignmentStatus(assignment);
                  const submission = getSubmissionForAssignment(assignment.id);
                  const dueDate = new Date(assignment.dueDate);
                  
                  return (
                    <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <CardTitle className="text-xl">{assignment.title}</CardTitle>
                              <Badge className={cn("text-white", status.color)}>
                                {status.text}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span className="flex items-center">
                                <BookOpen className="h-4 w-4 mr-1" />
                                {assignment.courseName}
                              </span>
                              <span className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                Due {formatDistanceToNow(dueDate, { addSuffix: true })}
                              </span>
                              <span className="flex items-center">
                                <TrendingUp className="h-4 w-4 mr-1" />
                                {assignment.maxScore} points
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="space-y-4">
                          {/* Assignment Description */}
                          <div>
                            <h4 className="font-medium mb-2">Assignment Description</h4>
                            <p className="text-gray-700 whitespace-pre-wrap">{assignment.description}</p>
                          </div>

                          {/* Instructions */}
                          {assignment.instructions && (
                            <div>
                              <h4 className="font-medium mb-2">Instructions</h4>
                              <p className="text-gray-700 whitespace-pre-wrap">{assignment.instructions}</p>
                            </div>
                          )}

                          {/* Attachments */}
                          {assignment.attachments && assignment.attachments.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-2">Assignment Files</h4>
                              <div className="space-y-2">
                                {assignment.attachments.map((attachment, index) => (
                                  <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
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
                            <div className="border-t pt-4">
                              <h4 className="font-medium mb-3">Submit Assignment</h4>
                              <div className="space-y-3">
                                <Textarea
                                  placeholder="Write your answer or response here..."
                                  value={submissionContent[assignment.id] || ""}
                                  onChange={(e) => setSubmissionContent(prev => ({
                                    ...prev,
                                    [assignment.id]: e.target.value
                                  }))}
                                  className="min-h-[120px]"
                                />
                                <div className="flex items-center space-x-2">
                                  <Button
                                    onClick={() => handleSubmitAssignment(assignment.id)}
                                    disabled={!submissionContent[assignment.id]?.trim() || submitAssignmentMutation.isPending}
                                    className="bg-primary hover:bg-blue-700"
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
                            <div className="border-t pt-4">
                              <h4 className="font-medium mb-3">Your Submission</h4>
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-gray-700 whitespace-pre-wrap mb-3">{submission.content}</p>
                                <div className="flex items-center justify-between text-sm text-gray-600">
                                  <span>Submitted {formatDistanceToNow(new Date(submission.submittedAt!), { addSuffix: true })}</span>
                                  {submission.score !== undefined && (
                                    <span className="font-medium text-green-600">
                                      Score: {submission.score}/{assignment.maxScore}
                                    </span>
                                  )}
                                </div>
                                
                                {submission.feedback && (
                                  <div className="mt-3 p-3 bg-blue-50 border-l-4 border-blue-400">
                                    <h5 className="font-medium text-blue-800 mb-1">Teacher Feedback</h5>
                                    <p className="text-blue-700">{submission.feedback}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFileUpload(e.target.files)}
        />
      </div>
    </div>
  );
}