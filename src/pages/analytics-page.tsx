import { useState } from "react";
import { useAuth } from "../hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import Navigation from "../components/navigation";
import Sidebar from "../components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Alert, AlertDescription } from "../components/ui/alert";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  BookOpen, 
  Clock, 
  Award,
  Target,
  ChevronUp,
  ChevronDown,
  Brain,
  Calendar,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Zap,
  Star,
  Trophy,
  Flame,
  Activity,
  ArrowLeft
} from "lucide-react";
import { Link } from "wouter";

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState("30days");

  // ✅ derive values safely
  const currentRole = user?.role || "student";
  const isAuthenticated = !!user;

  // ✅ ALL hooks must be called unconditionally
  const { data: studentStats } = useQuery({
    queryKey: ["/api/student/stats"],
    enabled: isAuthenticated && currentRole === "student",
  });

  const { data: teacherStats } = useQuery({
    queryKey: ["/api/teacher/stats"],
    enabled: isAuthenticated && currentRole === "teacher",
  });

  const { data: examHistory } = useQuery({
    queryKey: ["/api/student/exam-history"],
    enabled: isAuthenticated && currentRole === "student",
  });

  const { data: assignments } = useQuery({
    queryKey: ["/api/teacher/assignments"],
    enabled: isAuthenticated && currentRole === "teacher",
  });

  // ✅ NOW early return is allowed
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        currentRole={currentRole} 
        onRoleChange={() => {}} // Disabled role changing
      />
      
      <div className="flex">
        <Sidebar currentRole={currentRole} />
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-4">
              <Link href="/">
                <Button variant="outline" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-gray-600 mt-2">
                  {currentRole === "student" 
                    ? "Track your learning progress and performance" 
                    : "Monitor student performance and course analytics"
                  }
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">Last 7 days</SelectItem>
                    <SelectItem value="30days">Last 30 days</SelectItem>
                    <SelectItem value="3months">Last 3 months</SelectItem>
                    <SelectItem value="6months">Last 6 months</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">Export Report</Button>
              </div>
            </div>

            {currentRole === "student" ? (
              <StudentAnalytics 
                stats={studentStats} 
                examHistory={examHistory}
                timeRange={timeRange}
              />
            ) : (
              <TeacherAnalytics 
                stats={teacherStats} 
                assignments={assignments}
                timeRange={timeRange}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function StudentAnalytics({ stats, examHistory, timeRange }: any) {
  // Calculate learning insights
  const getLearningInsights = () => {
    const insights = [];
    
    if (stats?.averageScore < 70) {
      insights.push({
        type: 'warning',
        icon: AlertTriangle,
        title: 'Performance Needs Attention',
        message: 'Your average score is below 70%. Consider spending more time on practice exercises.',
        action: 'Take Practice Tests'
      });
    }

    if ((stats?.totalTimeSpent || 0) < 300) { // Less than 5 hours
      insights.push({
        type: 'info',
        icon: Clock,
        title: 'Increase Study Time',
        message: 'You\'ve studied less than 5 hours. Consistent daily practice improves retention.',
        action: 'Set Study Schedule'
      });
    }

    if (stats?.averageScore >= 85) {
      insights.push({
        type: 'success',
        icon: Trophy,
        title: 'Excellent Performance!',
        message: 'You\'re performing exceptionally well. Keep up the momentum!',
        action: 'Challenge Yourself'
      });
    }

    return insights;
  };

  const getBestSubjects = () => {
    if (!examHistory || examHistory.length === 0) return [];
    
    const subjectPerformance = examHistory.reduce((acc: any, exam: any) => {
      if (!acc[exam.subject]) {
        acc[exam.subject] = { scores: [], total: 0, count: 0 };
      }
      acc[exam.subject].scores.push(exam.score);
      acc[exam.subject].total += exam.score;
      acc[exam.subject].count += 1;
      return acc;
    }, {});

    return Object.entries(subjectPerformance)
      .map(([subject, data]: [string, any]) => ({
        subject,
        average: data.total / data.count,
        attempts: data.count
      }))
      .sort((a, b) => b.average - a.average)
      .slice(0, 3);
  };

  const getWeakSubjects = () => {
    if (!examHistory || examHistory.length === 0) return [];
    
    const subjectPerformance = examHistory.reduce((acc: any, exam: any) => {
      if (!acc[exam.subject]) {
        acc[exam.subject] = { scores: [], total: 0, count: 0 };
      }
      acc[exam.subject].scores.push(exam.score);
      acc[exam.subject].total += exam.score;
      acc[exam.subject].count += 1;
      return acc;
    }, {});

    return Object.entries(subjectPerformance)
      .map(([subject, data]: [string, any]) => ({
        subject,
        average: data.total / data.count,
        attempts: data.count
      }))
      .filter(item => item.average < 70)
      .sort((a, b) => a.average - b.average)
      .slice(0, 3);
  };

  const getStudyStreak = () => {
    // Mock streak calculation - in real app, this would come from backend
    return Math.floor(Math.random() * 15) + 1;
  };

  const learningInsights = getLearningInsights();
  const bestSubjects = getBestSubjects();
  const weakSubjects = getWeakSubjects();
  const studyStreak = getStudyStreak();

  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="performance">Performance</TabsTrigger>
        <TabsTrigger value="insights">Insights</TabsTrigger>
        <TabsTrigger value="goals">Goals</TabsTrigger>
        <TabsTrigger value="habits">Study Habits</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        {/* Learning Insights Alert */}
        {learningInsights.length > 0 && (
          <div className="grid gap-4">
            {learningInsights.map((insight, index) => (
              <Alert key={index} className={`${
                insight.type === 'warning' ? 'border-orange-200 bg-orange-50' :
                insight.type === 'success' ? 'border-green-200 bg-green-50' :
                'border-blue-200 bg-blue-50'
              }`}>
                <insight.icon className={`h-4 w-4 ${
                  insight.type === 'warning' ? 'text-orange-600' :
                  insight.type === 'success' ? 'text-green-600' :
                  'text-blue-600'
                }`} />
                <AlertDescription className="ml-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{insight.title}</p>
                      <p className="text-sm mt-1">{insight.message}</p>
                    </div>
                    <Button size="sm" variant="outline">{insight.action}</Button>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Study Streak</p>
                  <p className="text-2xl font-bold">{studyStreak} days</p>
                </div>
                <Flame className="h-8 w-8 text-orange-500" />
              </div>
              <div className="flex items-center mt-2">
                <Zap className="h-4 w-4 text-orange-500" />
                <span className="text-sm text-orange-600">Keep it going!</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Score</p>
                  <p className="text-2xl font-bold">{stats?.averageScore || 0}%</p>
                </div>
                <TrendingUp className={`h-8 w-8 ${
                  (stats?.averageScore || 0) >= 80 ? 'text-green-500' :
                  (stats?.averageScore || 0) >= 60 ? 'text-yellow-500' : 'text-red-500'
                }`} />
              </div>
              <div className="flex items-center mt-2">
                {(stats?.averageScore || 0) >= 70 ? (
                  <>
                    <ChevronUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">Great progress!</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <span className="text-sm text-orange-600">Needs improvement</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Study Time</p>
                  <p className="text-2xl font-bold">{Math.round((stats?.totalTimeSpent || 0) / 60)}h</p>
                </div>
                <Clock className="h-8 w-8 text-purple-500" />
              </div>
              <div className="flex items-center mt-2">
                <Activity className="h-4 w-4 text-purple-500" />
                <span className="text-sm text-purple-600">This month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Lessons Completed</p>
                  <p className="text-2xl font-bold">{stats?.lessonsCompleted || 0}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <div className="flex items-center mt-2">
                <Target className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">Keep learning</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subject Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Strong Subjects */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Your Strong Subjects
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bestSubjects.length > 0 ? (
                <div className="space-y-4">
                  {bestSubjects.map((subject, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-green-800">{subject.subject}</h4>
                        <p className="text-sm text-green-600">{subject.attempts} attempts</p>
                      </div>
                      <Badge className="bg-green-500">{Math.round(subject.average)}%</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Take more exams to identify strong subjects</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Areas for Improvement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-500" />
                Focus Areas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {weakSubjects.length > 0 ? (
                <div className="space-y-4">
                  {weakSubjects.map((subject, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-orange-800">{subject.subject}</h4>
                        <p className="text-sm text-orange-600">Needs more practice</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="border-orange-500 text-orange-600">
                          {Math.round(subject.average)}%
                        </Badge>
                        <Button size="sm" className="mt-2 bg-orange-500 hover:bg-orange-600">
                          Practice
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Great job! No weak areas identified</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Exam Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {examHistory && examHistory.length > 0 ? (
              <div className="space-y-4">
                {examHistory.slice(0, 5).map((exam: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">{exam.subject}</h4>
                      <p className="text-sm text-gray-600">{new Date(exam.completedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={exam.score >= 80 ? "default" : exam.score >= 60 ? "secondary" : "destructive"}>
                        {exam.score}%
                      </Badge>
                      <p className="text-sm text-gray-600 mt-1">{exam.questionsAnswered} questions</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No exam data available yet</p>
                <p className="text-sm text-gray-500 mt-1">Take your first exam to see performance analytics</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="performance" className="space-y-6">
        {/* Performance Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{stats?.averageScore || 0}%</p>
                <p className="text-sm text-gray-600 mt-1">Average Score</p>
                <div className="flex items-center justify-center mt-2">
                  {(stats?.averageScore || 0) > 75 ? (
                    <ChevronUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm ml-1">vs last week</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Consistency Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{Math.min(studyStreak * 7, 100)}%</p>
                <p className="text-sm text-gray-600 mt-1">Daily Practice</p>
                <div className="flex items-center justify-center mt-2">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span className="text-sm ml-1">{studyStreak} day streak</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Learning Velocity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">{(stats?.lessonsCompleted || 0) * 2}</p>
                <p className="text-sm text-gray-600 mt-1">Topics/Week</p>
                <div className="flex items-center justify-center mt-2">
                  <Activity className="h-4 w-4 text-purple-500" />
                  <span className="text-sm ml-1">Learning pace</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Score Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {examHistory && examHistory.length > 0 ? (
              <div className="space-y-4">
                {['90-100%', '80-89%', '70-79%', '60-69%', 'Below 60%'].map((range, index) => {
                  const [min, max] = range === 'Below 60%' ? [0, 59] : 
                    range.split('-').map(r => parseInt(r.replace('%', '')));
                  const count = examHistory.filter((exam: any) => 
                    range === 'Below 60%' ? exam.score < 60 : exam.score >= min && exam.score <= (max || 100)
                  ).length;
                  const percentage = (count / examHistory.length) * 100;
                  
                  return (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="w-20 text-sm font-medium">{range}</div>
                      <div className="flex-1">
                        <Progress value={percentage} className="h-3" />
                      </div>
                      <div className="w-16 text-sm text-gray-600">{count} tests</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Take more exams to see score distribution</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Tests Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Test Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {examHistory && examHistory.length > 0 ? (
              <div className="space-y-4">
                {examHistory.slice(0, 10).map((exam: any, index: number) => (
                  <div key={index} className="flex items-center space-x-4 p-3 border rounded-lg">
                    <div className={`w-3 h-3 rounded-full ${
                      exam.score >= 80 ? 'bg-green-500' :
                      exam.score >= 70 ? 'bg-yellow-500' :
                      exam.score >= 60 ? 'bg-orange-500' : 'bg-red-500'
                    }`}></div>
                    <div className="flex-1">
                      <h4 className="font-medium">{exam.subject}</h4>
                      <p className="text-sm text-gray-600">{new Date(exam.completedAt).toLocaleDateString()}</p>
                    </div>
                    <Badge variant={exam.score >= 70 ? "default" : "destructive"}>
                      {exam.score}%
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No recent tests to display</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="insights" className="space-y-6">
        {/* AI-Powered Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-500" />
              Personalized Learning Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Learning Pattern Analysis */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Learning Pattern Analysis</h4>
                <p className="text-sm text-blue-700 mb-3">
                  Based on your study habits, you perform best during evening hours and show stronger retention with mathematics concepts.
                </p>
                <div className="flex gap-2">
                  <Badge className="bg-blue-500">Evening Learner</Badge>
                  <Badge className="bg-blue-500">Visual Learning Style</Badge>
                </div>
              </div>

              {/* Improvement Recommendations */}
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">Improvement Recommendations</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-green-600 mt-1" />
                    <span className="text-sm text-green-700">
                      Increase practice frequency in Science subjects to improve retention by 15-20%
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-green-600 mt-1" />
                    <span className="text-sm text-green-700">
                      Review previous mistakes before attempting new tests to avoid repeated errors
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-green-600 mt-1" />
                    <span className="text-sm text-green-700">
                      Schedule 15-minute daily reviews to maintain your {studyStreak}-day learning streak
                    </span>
                  </li>
                </ul>
              </div>

              {/* Knowledge Gaps */}
              {weakSubjects.length > 0 && (
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-medium text-orange-800 mb-2">Identified Knowledge Gaps</h4>
                  <div className="space-y-2">
                    {weakSubjects.map((subject, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-orange-700">{subject.subject} - Focus on fundamentals</span>
                        <Button size="sm" variant="outline" className="border-orange-500 text-orange-600">
                          Study Plan
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Predicted Performance */}
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-purple-800 mb-2">Performance Prediction</h4>
                <p className="text-sm text-purple-700 mb-3">
                  Based on current trends, you're likely to achieve an average score of{' '}
                  <span className="font-bold">{Math.min((stats?.averageScore || 0) + 5, 95)}%</span> by next month with consistent practice.
                </p>
                <Progress value={Math.min((stats?.averageScore || 0) + 5, 95)} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="goals" className="space-y-6">
        {/* Current Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              Learning Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Weekly Goal */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Weekly Study Goal</h4>
                  <Badge className="bg-blue-500">10 hours</Badge>
                </div>
                <Progress value={(Math.round((stats?.totalTimeSpent || 0) / 60) / 10) * 100} className="h-2 mb-2" />
                <p className="text-sm text-gray-600">
                  {Math.round((stats?.totalTimeSpent || 0) / 60)} / 10 hours completed this week
                </p>
              </div>

              {/* Score Improvement Goal */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Score Improvement Goal</h4>
                  <Badge className="bg-green-500">85% Average</Badge>
                </div>
                <Progress value={((stats?.averageScore || 0) / 85) * 100} className="h-2 mb-2" />
                <p className="text-sm text-gray-600">
                  Current: {stats?.averageScore || 0}% | Target: 85%
                </p>
              </div>

              {/* Streak Goal */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Study Streak Goal</h4>
                  <Badge className="bg-orange-500">30 days</Badge>
                </div>
                <Progress value={(studyStreak / 30) * 100} className="h-2 mb-2" />
                <p className="text-sm text-gray-600">
                  {studyStreak} / 30 days streak maintained
                </p>
              </div>
            </div>

            <div className="mt-6">
              <Button className="w-full">Set New Goal</Button>
            </div>
          </CardContent>
        </Card>

        {/* Goal Suggestions */}
        <Card>
          <CardHeader>
            <CardTitle>Suggested Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { title: "Complete 5 lessons this week", difficulty: "Easy", points: "50 pts" },
                { title: "Achieve 80% in next Science test", difficulty: "Medium", points: "100 pts" },
                { title: "Maintain 14-day study streak", difficulty: "Medium", points: "150 pts" },
                { title: "Master multiplication tables", difficulty: "Hard", points: "200 pts" }
              ].map((goal, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{goal.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">{goal.difficulty}</Badge>
                      <span className="text-xs text-gray-600">{goal.points}</span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">Add Goal</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="habits" className="space-y-6">
        {/* Study Habits Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                Study Time Patterns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['Morning (6-12)', 'Afternoon (12-18)', 'Evening (18-24)', 'Night (0-6)'].map((period, index) => {
                  const hours = [2, 1, 4, 0][index]; // Mock data
                  const percentage = (hours / 7) * 100;
                  
                  return (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="w-24 text-sm">{period}</div>
                      <div className="flex-1">
                        <Progress value={percentage} className="h-2" />
                      </div>
                      <div className="w-12 text-sm text-gray-600">{hours}h</div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Insight:</strong> You're most productive during evening hours (18-24).
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-500" />
                Learning Consistency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{studyStreak}</p>
                  <p className="text-sm text-gray-600">Current Streak</p>
                </div>
                
                {/* Weekly Activity */}
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 7 }, (_, i) => (
                    <div
                      key={i}
                      className={`h-8 rounded ${
                        i < studyStreak % 7 ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                      title={`Day ${i + 1}`}
                    ></div>
                  ))}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Study Days This Week</span>
                    <span className="font-medium">{Math.min(studyStreak, 7)}/7</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Average Session Length</span>
                    <span className="font-medium">45 min</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Most Active Day</span>
                    <span className="font-medium">Wednesday</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Study Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Study Habit Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">Strengths</h4>
                <ul className="space-y-1 text-sm text-green-700">
                  <li>• Consistent evening study sessions</li>
                  <li>• Good completion rate for started lessons</li>
                  <li>• Regular exam participation</li>
                </ul>
              </div>
              
              <div className="p-4 bg-orange-50 rounded-lg">
                <h4 className="font-medium text-orange-800 mb-2">Areas to Improve</h4>
                <ul className="space-y-1 text-sm text-orange-700">
                  <li>• Increase morning study sessions</li>
                  <li>• Review previous topics more frequently</li>
                  <li>• Set specific time blocks for difficult subjects</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Personalized Study Schedule</h4>
              <p className="text-sm text-blue-700 mb-3">
                Based on your performance data, here's an optimized study schedule:
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Monday, Wednesday, Friday</span>
                  <span className="font-medium">Mathematics (7-8 PM)</span>
                </div>
                <div className="flex justify-between">
                  <span>Tuesday, Thursday</span>
                  <span className="font-medium">Science (7-8 PM)</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span>
                  <span className="font-medium">Review & Practice Tests (2-4 PM)</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span className="font-medium">English & Reading (6-7 PM)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="progress" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Learning Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm text-gray-600">75%</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Mathematics</span>
                  <span className="text-sm text-gray-600">85%</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Science</span>
                  <span className="text-sm text-gray-600">70%</span>
                </div>
                <Progress value={70} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">English</span>
                  <span className="text-sm text-gray-600">60%</span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="achievements" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Achievements & Badges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">No achievements yet</p>
              <p className="text-sm text-gray-500 mt-2">Complete lessons and exams to earn badges</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

function TeacherAnalytics({ stats, assignments, timeRange }: any) {
  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="students">Students</TabsTrigger>
        <TabsTrigger value="assignments">Assignments</TabsTrigger>
        <TabsTrigger value="performance">Performance</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        {/* Teacher Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold">{stats?.totalStudents || 0}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Courses</p>
                  <p className="text-2xl font-bold">{stats?.activeCourses || 0}</p>
                </div>
                <BookOpen className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Assignments Created</p>
                  <p className="text-2xl font-bold">{assignments?.length || 0}</p>
                </div>
                <Target className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Class Score</p>
                  <p className="text-2xl font-bold">{stats?.averageClassScore || 0}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Class Performance Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Class Performance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Class performance analytics</p>
              <p className="text-sm text-gray-500 mt-2">Detailed class performance metrics would be displayed here</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="students" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Student Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Student analytics coming soon</p>
              <p className="text-sm text-gray-500 mt-2">Individual student performance tracking</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="assignments" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Assignment Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            {assignments && assignments.length > 0 ? (
              <div className="space-y-4">
                {assignments.map((assignment: any) => (
                  <div key={assignment.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{assignment.title}</h4>
                      <Badge>{assignment.submissionCount || 0} submissions</Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${((assignment.submissionCount || 0) / (assignment.totalStudents || 1)) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {(((assignment.submissionCount || 0) / (assignment.totalStudents || 1)) * 100).toFixed(1)}% completion rate
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No assignments created yet</p>
                <p className="text-sm text-gray-500 mt-2">Create assignments to see analytics</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="performance" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Performance trend analysis</p>
              <p className="text-sm text-gray-500 mt-2">Detailed performance trends and insights</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}