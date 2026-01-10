import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Textarea } from "../components/ui/textarea";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { 
  Plus, 
  Calendar, 
  Clock, 
  FileText, 
  Upload, 
  Users, 
  CheckCircle, 
  Star,
  Send,
  Paperclip,
  Eye,
  BarChart3,
  TrendingUp,
  BookOpen,
  GraduationCap,
  Edit,
  Trash2
} from "lucide-react";
import { cn } from "../lib/utils";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useAuth } from "../hooks/use-auth";
import Navigation from "../components/navigation";
import { formatDistanceToNow } from "date-fns";

interface Course {
  id: number;
  title: string;
  enrollmentCount: number;
}

interface Assignment {
  id: number;
  title: string;
  description: string;
  instructions: string;
  courseId: number;
  courseName: string;
  dueDate: string;
  maxScore: number;
  submissionType: 'text' | 'file' | 'both';
  createdAt: string;
  submissionCount: number;
  totalStudents: number;
}

interface Submission {
  id: number;
  studentName: string;
  studentEmail: string;
  content: string;
  submittedAt: string;
  score?: number;
  feedback?: string;
  gradedAt?: string;
}

export default function TeacherHomeworkPage() {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState("overview");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    instructions: "",
    courseId: "",
    dueDate: "",
    maxScore: 100,
    submissionType: "text" as const,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch teacher's courses
  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ["/api/teacher/courses"],
  });

  // Fetch assignments created by teacher
  const { data: assignments = [], isLoading } = useQuery<Assignment[]>({
    queryKey: ["/api/teacher/assignments"],
  });

  // Fetch submissions for selected assignment
  const { data: submissions = [] } = useQuery<Submission[]>({
    queryKey: ["/api/assignments", selectedAssignment?.id, "submissions"],
    enabled: !!selectedAssignment,
  });

  // Create assignment mutation
  const createAssignmentMutation = useMutation({
    mutationFn: async (assignmentData: typeof newAssignment) => {
      const res = await apiRequest("POST", "/api/assignments", assignmentData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teacher/assignments"] });
      setShowCreateDialog(false);
      setNewAssignment({
        title: "",
        description: "",
        instructions: "",
        courseId: "",
        dueDate: "",
        maxScore: 100,
        submissionType: "text",
      });
    },
  });

  // Grade submission mutation
  const gradeSubmissionMutation = useMutation({
    mutationFn: async ({ submissionId, score, feedback }: {
      submissionId: number;
      score: number;
      feedback: string;
    }) => {
      const res = await apiRequest("PUT", `/api/submissions/${submissionId}/grade`, {
        score,
        feedback,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assignments", selectedAssignment?.id, "submissions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/teacher/assignments"] });
    },
  });

  const handleCreateAssignment = () => {
    if (!newAssignment.title.trim() || !newAssignment.courseId || !newAssignment.dueDate) return;
    createAssignmentMutation.mutate(newAssignment);
  };

  const getAssignmentStats = () => {
    const total = assignments.length;
    const active = assignments.filter(a => new Date(a.dueDate) > new Date()).length;
    const totalSubmissions = assignments.reduce((sum, a) => sum + a.submissionCount, 0);
    const avgCompletionRate = assignments.length > 0 
      ? assignments.reduce((sum, a) => sum + (a.submissionCount / a.totalStudents), 0) / assignments.length * 100
      : 0;

    return { total, active, totalSubmissions, avgCompletionRate };
  };

  const { total, active, totalSubmissions, avgCompletionRate } = getAssignmentStats();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation currentRole="teacher" onRoleChange={() => {}} />
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
      <Navigation currentRole="teacher" onRoleChange={() => {}} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Homework Management</h1>
            <p className="text-gray-600 mt-2">Create and manage assignments for your classes</p>
          </div>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Assignment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Assignment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Assignment Title</Label>
                  <Input
                    id="title"
                    value={newAssignment.title}
                    onChange={(e) => setNewAssignment(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter assignment title"
                  />
                </div>
                
                <div>
                  <Label htmlFor="course">Select Course</Label>
                  <Select value={newAssignment.courseId} onValueChange={(value) => 
                    setNewAssignment(prev => ({ ...prev, courseId: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id.toString()}>
                          {course.title} ({course.enrollmentCount} students)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="datetime-local"
                      value={newAssignment.dueDate}
                      onChange={(e) => setNewAssignment(prev => ({ ...prev, dueDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxScore">Maximum Score</Label>
                    <Input
                      id="maxScore"
                      type="number"
                      value={newAssignment.maxScore}
                      onChange={(e) => setNewAssignment(prev => ({ ...prev, maxScore: parseInt(e.target.value) || 100 }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="submissionType">Submission Type</Label>
                  <Select value={newAssignment.submissionType} onValueChange={(value: any) => 
                    setNewAssignment(prev => ({ ...prev, submissionType: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text Only</SelectItem>
                      <SelectItem value="file">File Upload Only</SelectItem>
                      <SelectItem value="both">Text and Files</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newAssignment.description}
                    onChange={(e) => setNewAssignment(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the assignment objectives and requirements"
                    className="min-h-[100px]"
                  />
                </div>

                <div>
                  <Label htmlFor="instructions">Detailed Instructions</Label>
                  <Textarea
                    id="instructions"
                    value={newAssignment.instructions}
                    onChange={(e) => setNewAssignment(prev => ({ ...prev, instructions: e.target.value }))}
                    placeholder="Provide step-by-step instructions for students"
                    className="min-h-[120px]"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateAssignment}
                    disabled={!newAssignment.title.trim() || !newAssignment.courseId || !newAssignment.dueDate}
                  >
                    Create Assignment
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Total Assignments</p>
                  <p className="text-2xl font-bold">{total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Clock className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Active Assignments</p>
                  <p className="text-2xl font-bold">{active}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Send className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600">Total Submissions</p>
                  <p className="text-2xl font-bold">{totalSubmissions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <BarChart3 className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-600">Avg Completion</p>
                  <p className="text-2xl font-bold">{avgCompletionRate.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assignment Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">All Assignments</TabsTrigger>
            <TabsTrigger value="submissions">Review Submissions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid gap-6">
              {assignments.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No assignments yet</h3>
                    <p className="text-gray-600 mb-4">Create your first assignment to get started</p>
                    <Button onClick={() => setShowCreateDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Assignment
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                assignments.map((assignment) => {
                  const dueDate = new Date(assignment.dueDate);
                  const isOverdue = dueDate < new Date();
                  const completionRate = (assignment.submissionCount / assignment.totalStudents) * 100;
                  
                  return (
                    <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-xl mb-2">{assignment.title}</CardTitle>
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
                                <Users className="h-4 w-4 mr-1" />
                                {assignment.submissionCount}/{assignment.totalStudents} submitted
                              </span>
                              <span className="flex items-center">
                                <TrendingUp className="h-4 w-4 mr-1" />
                                {assignment.maxScore} points
                              </span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Badge className={cn(
                              "text-white",
                              isOverdue ? "bg-red-500" : "bg-green-500"
                            )}>
                              {isOverdue ? "Overdue" : "Active"}
                            </Badge>
                            <Badge variant="outline">
                              {completionRate.toFixed(1)}% complete
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="space-y-4">
                          <p className="text-gray-700">{assignment.description}</p>
                          
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedAssignment(assignment);
                                setSelectedTab("submissions");
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Review Submissions ({assignment.submissionCount})
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="submissions" className="mt-6">
            {!selectedAssignment ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Select an assignment</h3>
                  <p className="text-gray-600">Choose an assignment from the overview tab to review submissions</p>
                </CardContent>
              </Card>
            ) : (
              <div>
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>{selectedAssignment.title}</CardTitle>
                    <p className="text-gray-600">{selectedAssignment.courseName}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        {submissions.length} submissions received
                      </div>
                      <Button variant="outline" onClick={() => setSelectedAssignment(null)}>
                        Back to Overview
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  {submissions.map((submission) => (
                    <Card key={submission.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{submission.studentName}</CardTitle>
                            <p className="text-sm text-gray-600">{submission.studentEmail}</p>
                            <p className="text-sm text-gray-600">
                              Submitted {formatDistanceToNow(new Date(submission.submittedAt), { addSuffix: true })}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {submission.gradedAt ? (
                              <Badge className="bg-green-500 text-white">
                                Graded: {submission.score}/{selectedAssignment.maxScore}
                              </Badge>
                            ) : (
                              <Badge variant="outline">Pending Review</Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Student Response</h4>
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <p className="whitespace-pre-wrap">{submission.content}</p>
                            </div>
                          </div>

                          {!submission.gradedAt && (
                            <div className="border-t pt-4">
                              <h4 className="font-medium mb-3">Grade Submission</h4>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor={`score-${submission.id}`}>Score (out of {selectedAssignment.maxScore})</Label>
                                  <Input
                                    id={`score-${submission.id}`}
                                    type="number"
                                    min="0"
                                    max={selectedAssignment.maxScore}
                                    placeholder="Enter score"
                                  />
                                </div>
                                <div className="col-span-2">
                                  <Label htmlFor={`feedback-${submission.id}`}>Feedback</Label>
                                  <Textarea
                                    id={`feedback-${submission.id}`}
                                    placeholder="Provide feedback to the student"
                                    className="min-h-[80px]"
                                  />
                                </div>
                              </div>
                              <Button 
                                className="mt-3"
                                onClick={() => {
                                  const scoreInput = document.getElementById(`score-${submission.id}`) as HTMLInputElement;
                                  const feedbackInput = document.getElementById(`feedback-${submission.id}`) as HTMLTextAreaElement;
                                  
                                  if (scoreInput.value && feedbackInput.value) {
                                    gradeSubmissionMutation.mutate({
                                      submissionId: submission.id,
                                      score: parseInt(scoreInput.value),
                                      feedback: feedbackInput.value,
                                    });
                                  }
                                }}
                              >
                                <Star className="h-4 w-4 mr-2" />
                                Submit Grade
                              </Button>
                            </div>
                          )}

                          {submission.feedback && (
                            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                              <h5 className="font-medium text-blue-800 mb-1">Your Feedback</h5>
                              <p className="text-blue-700">{submission.feedback}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Assignment Performance Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {assignments.map((assignment) => {
                      const completionRate = (assignment.submissionCount / assignment.totalStudents) * 100;
                      return (
                        <div key={assignment.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{assignment.title}</h4>
                            <span className="text-sm text-gray-600">
                              {assignment.submissionCount}/{assignment.totalStudents} submissions
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${completionRate}%` }}
                            ></div>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {completionRate.toFixed(1)}% completion rate
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}