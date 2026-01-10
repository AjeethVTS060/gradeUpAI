import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ScrollArea } from "../components/ui/scroll-area";
import { Alert, AlertDescription } from "../components/ui/alert";
import { 
  Upload, 
  FileText, 
  Brain, 
  BookOpen, 
  Target, 
  Clock, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Loader2,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  BarChart3,
  Lightbulb,
  Tags,
  BookMarked,
  ArrowLeft,
  Users,
  UserPlus
} from "lucide-react";
import { Link } from "wouter";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../hooks/use-auth";

// Enhanced schemas for NLP-powered content
const enhancedCourseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  grade: z.number().min(1).max(12),
  subjectId: z.number().min(1),
  learningObjectives: z.array(z.string()).optional(),
  prerequisites: z.array(z.string()).optional(),
});

const nlpProcessingSchema = z.object({
  file: z.any(),
  courseId: z.number(),
  processingMode: z.enum(['basic', 'advanced', 'comprehensive']),
  extractConcepts: z.boolean().default(true),
  generateExercises: z.boolean().default(true),
  createQuizzes: z.boolean().default(false),
});

type EnhancedCourseForm = z.infer<typeof enhancedCourseSchema>;
type NLPProcessingForm = z.infer<typeof nlpProcessingSchema>;

interface ProcessingResult {
  success: boolean;
  message: string;
  chapters: ChapterStructure[];
  lessons: ProcessedLesson[];
  totalPages: number;
  wordCount: number;
  readingLevel: string;
  subjectClassification: string;
  conceptMap: ConceptExtraction[];
}

interface ChapterStructure {
  title: string;
  sections: SectionStructure[];
  summary: string;
  learningObjectives: string[];
}

interface SectionStructure {
  title: string;
  content: string;
  subsections: string[];
  keyTerms: string[];
  exercises: string[];
}

interface ProcessedLesson {
  title: string;
  content: string;
  summary: string;
  keyPoints: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number;
  topics: string[];
  vocabulary: string[];
  concepts: ConceptExtraction[];
}

interface ConceptExtraction {
  concept: string;
  definition: string;
  importance: number;
  relatedTerms: string[];
}

export default function EnhancedContentManager() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState("create");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);

  // Fetch data
  const { data: courses = [] } = useQuery({
    queryKey: ["/api/teacher/courses"],
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ["/api/subjects"],
  });

  const { data: courseLessons = [] } = useQuery({
    queryKey: [`/api/lessons/${selectedCourse}`],
    enabled: !!selectedCourse,
  });

  // Forms
  const courseForm = useForm<EnhancedCourseForm>({
    resolver: zodResolver(enhancedCourseSchema),
    defaultValues: {
      title: "",
      description: "",
      grade: 9,
      subjectId: 1,
      learningObjectives: [],
      prerequisites: [],
    },
  });

  const processingForm = useForm<NLPProcessingForm>({
    resolver: zodResolver(nlpProcessingSchema),
    defaultValues: {
      courseId: 0,
      processingMode: 'advanced',
      extractConcepts: true,
      generateExercises: true,
      createQuizzes: false,
    },
  });

  // Mutations
  const createCourseMutation = useMutation({
    mutationFn: async (data: EnhancedCourseForm) => {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, teacherId: user?.id }),
      });
      if (!response.ok) throw new Error('Failed to create course');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success", 
        description: "Course created successfully with enhanced NLP features",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/teacher/courses"] });
      courseForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create course",
        variant: "destructive",
      });
    },
  });

  const processDocumentMutation = useMutation({
    mutationFn: async (data: { file: File; courseId: number; options: any }) => {
      const formData = new FormData();
      formData.append('pdf', data.file);
      formData.append('courseId', data.courseId.toString());
      formData.append('options', JSON.stringify(data.options));

      const response = await fetch('/api/teacher/process-document-nlp', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to process document');
      return response.json();
    },
    onSuccess: (result) => {
      setProcessingResult(result);
      toast({
        title: "Processing Complete",
        description: `Successfully processed document with ${result.lessonsCreated || 0} lessons created`,
      });
      // Invalidate and refetch lessons for the current course
      queryClient.invalidateQueries({ queryKey: [`/api/lessons`] });
      if (selectedCourse) {
        queryClient.refetchQueries({ queryKey: [`/api/lessons/${selectedCourse}`] });
      }
    },
    onError: (error) => {
      toast({
        title: "Processing Failed",
        description: "Failed to process document with NLP analysis",
        variant: "destructive",
      });
    },
  });

  // File handling
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === 'application/pdf' || file.name.endsWith('.docx'))) {
      setSelectedFile(file);
      setProcessingResult(null);
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a PDF or DOCX file",
        variant: "destructive",
      });
    }
  };

  const handleProcessDocument = async (data: NLPProcessingForm) => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a file to process",
        variant: "destructive",
      });
      return;
    }

    setProcessingProgress(0);
    const progressInterval = setInterval(() => {
      setProcessingProgress(prev => Math.min(prev + 10, 90));
    }, 500);

    try {
      await processDocumentMutation.mutateAsync({
        file: selectedFile,
        courseId: data.courseId,
        options: {
          processingMode: data.processingMode,
          extractConcepts: data.extractConcepts,
          generateExercises: data.generateExercises,
          createQuizzes: data.createQuizzes,
        }
      });
      setProcessingProgress(100);
    } finally {
      clearInterval(progressInterval);
    }
  };

  const handleCreateCourse = (data: EnhancedCourseForm) => {
    createCourseMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/teacher">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Enhanced Content Manager
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                AI-powered content creation with advanced NLP analysis
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Brain className="h-3 w-3" />
              NLP Powered
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Lightbulb className="h-3 w-3" />
              Smart Analysis
            </Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Course
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Process Documents
            </TabsTrigger>
            <TabsTrigger value="manage" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Manage Content
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Content Analytics
            </TabsTrigger>
          </TabsList>

          {/* Create Course Tab */}
          <TabsContent value="create" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Create New Course with AI Enhancement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={courseForm.handleSubmit(handleCreateCourse)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Course Title</Label>
                        <Input
                          id="title"
                          {...courseForm.register("title")}
                          placeholder="e.g., Advanced Mathematics"
                        />
                        {courseForm.formState.errors.title && (
                          <p className="text-sm text-red-600 mt-1">
                            {courseForm.formState.errors.title.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          {...courseForm.register("description")}
                          placeholder="Describe the course content and objectives..."
                          className="min-h-[100px]"
                        />
                        {courseForm.formState.errors.description && (
                          <p className="text-sm text-red-600 mt-1">
                            {courseForm.formState.errors.description.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">  
                      <div>
                        <Label htmlFor="subject">Subject</Label>
                        <Select
                          value={courseForm.watch("subjectId")?.toString()}
                          onValueChange={(value) => courseForm.setValue("subjectId", parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects.map((subject: any) => (
                              <SelectItem key={subject.id} value={subject.id.toString()}>
                                {subject.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="grade">Grade Level</Label>
                        <Select
                          value={courseForm.watch("grade")?.toString()}
                          onValueChange={(value) => courseForm.setValue("grade", parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select grade" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((grade) => (
                              <SelectItem key={grade} value={grade.toString()}>
                                Grade {grade}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={createCourseMutation.isPending}
                  >
                    {createCourseMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating Course...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Enhanced Course
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Process Documents Tab */}
          <TabsContent value="upload" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upload Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Advanced Document Processing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form onSubmit={processingForm.handleSubmit(handleProcessDocument)} className="space-y-4">
                    <div>
                      <Label htmlFor="course-select">Target Course</Label>
                      <Select
                        value={processingForm.watch("courseId")?.toString()}
                        onValueChange={(value) => processingForm.setValue("courseId", parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select course" />
                        </SelectTrigger>
                        <SelectContent>
                          {courses.map((course: any) => (
                            <SelectItem key={course.id} value={course.id.toString()}>
                              {course.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="file-upload">Document File (PDF/DOCX)</Label>
                      <Input
                        id="file-upload"
                        type="file"
                        accept=".pdf,.docx"
                        onChange={handleFileSelect}
                        className="cursor-pointer"
                      />
                      {selectedFile && (
                        <p className="text-sm text-green-600 mt-1">
                          Selected: {selectedFile.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label>Processing Mode</Label>
                      <Select
                        value={processingForm.watch("processingMode")}
                        onValueChange={(value: any) => processingForm.setValue("processingMode", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic">Basic Analysis</SelectItem>
                          <SelectItem value="advanced">Advanced NLP</SelectItem>
                          <SelectItem value="comprehensive">Comprehensive AI</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Processing Options</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="extract-concepts"
                            {...processingForm.register("extractConcepts")}
                          />
                          <Label htmlFor="extract-concepts" className="text-sm">
                            Extract Key Concepts
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="generate-exercises"
                            {...processingForm.register("generateExercises")}
                          />
                          <Label htmlFor="generate-exercises" className="text-sm">
                            Generate Practice Exercises
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="create-quizzes"
                            {...processingForm.register("createQuizzes")}
                          />
                          <Label htmlFor="create-quizzes" className="text-sm">
                            Create Assessment Quizzes
                          </Label>
                        </div>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={processDocumentMutation.isPending || !selectedFile}
                    >
                      {processDocumentMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing with AI...
                        </>
                      ) : (
                        <>
                          <Brain className="h-4 w-4 mr-2" />
                          Process with Advanced NLP
                        </>
                      )}
                    </Button>
                  </form>

                  {processDocumentMutation.isPending && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Processing Progress</span>
                        <span>{processingProgress}%</span>
                      </div>
                      <Progress value={processingProgress} className="w-full" />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Results Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Processing Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {processingResult ? (
                    <div className="space-y-4">
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          {processingResult.message}
                        </AlertDescription>
                      </Alert>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {processingResult.lessons?.length || 0}
                          </div>
                          <div className="text-sm text-blue-600">Lessons Created</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {processingResult.totalPages}
                          </div>
                          <div className="text-sm text-green-600">Pages Processed</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Subject Classification:</span>
                          <Badge variant="outline">
                            {processingResult.subjectClassification}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Reading Level:</span>
                          <Badge variant="secondary">
                            {processingResult.readingLevel}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Word Count:</span>
                          <span>{processingResult.wordCount.toLocaleString()}</span>
                        </div>
                      </div>

                      {processingResult.conceptMap && processingResult.conceptMap.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Key Concepts Extracted:</Label>
                          <div className="flex flex-wrap gap-1">
                            {processingResult.conceptMap.slice(0, 8).map((concept, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {concept.concept}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Upload a document to see processing results</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Manage Content Tab */}
          <TabsContent value="manage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookMarked className="h-5 w-5" />
                  Content Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Select Course to Manage</Label>
                    <Select
                      value={selectedCourse?.toString()}
                      onValueChange={(value) => setSelectedCourse(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map((course: any) => (
                          <SelectItem key={course.id} value={course.id.toString()}>
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedCourse && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Course Lessons</h3>
                        <Badge>{courseLessons.length} lessons</Badge>
                      </div>
                      
                      <ScrollArea className="h-[400px]">
                        <div className="space-y-2">
                          {courseLessons.map((lesson: any, index: number) => (
                            <Card key={lesson.id} className="p-4">
                              <div className="flex justify-between items-start">
                                <div className="space-y-2 flex-1">
                                  <h4 className="font-medium">{lesson.title}</h4>
                                  {lesson.summary && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      {lesson.summary}
                                    </p>
                                  )}
                                  <div className="flex flex-wrap gap-1">
                                    {lesson.difficulty && (
                                      <Badge 
                                        variant={
                                          lesson.difficulty === 'beginner' ? 'secondary' :
                                          lesson.difficulty === 'intermediate' ? 'default' : 'destructive'
                                        }
                                        className="text-xs"
                                      >
                                        {lesson.difficulty}
                                      </Badge>
                                    )}
                                    {lesson.estimatedDuration && (
                                      <Badge variant="outline" className="text-xs">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {lesson.estimatedDuration}min
                                      </Badge>
                                    )}
                                  </div>
                                  {lesson.topics && lesson.topics.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                      {lesson.topics.slice(0, 3).map((topic: string, idx: number) => (
                                        <Badge key={idx} variant="outline" className="text-xs">
                                          <Tags className="h-3 w-3 mr-1" />
                                          {topic}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div className="flex gap-1 ml-4">
                                  <Button variant="ghost" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Courses</p>
                      <p className="text-2xl font-bold">{courses.length}</p>
                    </div>
                    <BookOpen className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Documents Processed</p>
                      <p className="text-2xl font-bold">
                        {processingResult ? 1 : 0}
                      </p>
                    </div>
                    <FileText className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">AI Lessons Created</p>
                      <p className="text-2xl font-bold">
                        {processingResult?.lessons?.length || 0}
                      </p>
                    </div>
                    <Brain className="h-8 w-8 text-purple-500" />
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