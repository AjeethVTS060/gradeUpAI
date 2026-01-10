import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { 
  BookOpen, 
  Trophy, 
  Clock, 
  Award, 
  Star, 
  Flame, 
  GraduationCap, 
  Rocket,
  Calculator,
  Leaf,
  Globe,
  ChevronRight
} from "lucide-react";
import { Link } from "wouter";

interface StudentDashboardProps {
  onStartQuiz: () => void;
}

export default function StudentDashboard({ onStartQuiz }: StudentDashboardProps) {
  const { user } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery<{
    lessonsCompleted?: number;
    averageScore?: number;
    totalTimeSpent?: number;
    badgesEarned?: number;
  }>({
    queryKey: ["/api/student/stats"],
  });

  const { data: streak } = useQuery<{
    currentStreak?: number;
    longestStreak?: number;
  }>({
    queryKey: ["/api/student/streak"],
  });

  const { data: achievements } = useQuery({
    queryKey: ["/api/student/achievements"],
  });

  const mockCourses = [
    {
      id: 1,
      title: "Quadratic Equations",
      subject: "Mathematics",
      grade: "Grade 10",
      progress: 65,
      icon: Calculator,
      color: "bg-blue-500"
    },
    {
      id: 2,
      title: "Photosynthesis",
      subject: "Biology",
      grade: "Grade 9",
      progress: 40,
      icon: Leaf,
      color: "bg-green-500"
    },
    {
      id: 3,
      title: "World War II",
      subject: "History",
      grade: "Grade 11",
      progress: 80,
      icon: Globe,
      color: "bg-purple-500"
    }
  ];

  const mockUpcomingTests = [
    {
      id: 1,
      title: "Physics Quiz",
      description: "Motion and Force - 20 questions",
      dueDate: "Tomorrow",
      urgency: "high"
    },
    {
      id: 2,
      title: "Math Test",
      description: "Algebra - 15 questions",
      dueDate: "In 3 days",
      urgency: "medium"
    }
  ];

  const mockAchievements = [
    {
      id: 1,
      title: "Perfect Score",
      description: "Math Quiz - 100%",
      color: "from-yellow-100 to-yellow-200",
      iconColor: "bg-yellow-500",
      icon: Star
    },
    {
      id: 2,
      title: "Streak Master",
      description: "10 days in a row",
      color: "from-green-100 to-green-200",
      iconColor: "bg-green-500",
      icon: Flame
    },
    {
      id: 3,
      title: "Chapter Master",
      description: "Biology Chapter 3",
      color: "from-purple-100 to-purple-200",
      iconColor: "bg-purple-500",
      icon: GraduationCap
    },
    {
      id: 4,
      title: "Fast Learner",
      description: "Completed in record time",
      color: "from-blue-100 to-blue-200",
      iconColor: "bg-blue-500",
      icon: Rocket
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-blue-600 rounded-xl p-4 sm:p-6 lg:p-8 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">
              Welcome back, {user?.firstName}! 👋
            </h1>
            <p className="text-blue-100 text-sm sm:text-base">
              Ready to continue your learning journey? You're doing great!
            </p>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="bg-white/20 rounded-lg p-3 sm:p-4 text-center">
              <Flame className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-1" />
              <p className="text-lg sm:text-xl font-bold">{streak?.currentStreak || 0}</p>
              <p className="text-xs text-blue-100">Day Streak</p>
            </div>
            <Link href="/ai-tutor">
              <Button className="bg-white text-primary hover:bg-blue-50 text-sm sm:text-base">
                Start Learning
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats - Responsive Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <Card className="card-hover bg-white dark:bg-gray-800">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 sm:p-3 rounded-lg">
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-primary" />
              </div>
              <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">This Week</span>
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
              {statsLoading ? "..." : stats?.lessonsCompleted || 0}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Lessons Done</p>
          </CardContent>
        </Card>

        <Card className="card-hover bg-white dark:bg-gray-800">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <div className="bg-green-100 dark:bg-green-900/30 p-2 sm:p-3 rounded-lg">
                <Trophy className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-600" />
              </div>
              <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Overall</span>
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
              {statsLoading ? "..." : `${stats?.averageScore || 0}%`}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Avg Score</p>
          </CardContent>
        </Card>

        <Card className="card-hover bg-white dark:bg-gray-800">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-2 sm:p-3 rounded-lg">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-purple-600" />
              </div>
              <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">This Week</span>
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
              {statsLoading ? "..." : `${stats?.totalTimeSpent || 0}h`}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Study Time</p>
          </CardContent>
        </Card>

        <Card className="card-hover bg-white dark:bg-gray-800">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 sm:p-3 rounded-lg">
                <Award className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-yellow-600" />
              </div>
              <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Earned</span>
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
              {statsLoading ? "..." : stats?.badgesEarned || 0}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Badges</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content - Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Continue Learning */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2 sm:pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base sm:text-lg">Continue Learning</CardTitle>
                <Link href="/courses">
                  <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                    View All <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              {mockCourses.map((course) => (
                <div 
                  key={course.id}
                  className="flex flex-col sm:flex-row sm:items-center p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer gap-3 sm:gap-4"
                  data-testid={`course-card-${course.id}`}
                >
                  <div className={`${course.color} text-white p-2.5 sm:p-3 rounded-lg shrink-0 w-fit`}>
                    <course.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">{course.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600">{course.subject} - {course.grade}</p>
                    <div className="mt-2">
                      <Progress value={course.progress} className="h-1.5 sm:h-2" />
                      <p className="text-[10px] sm:text-xs text-gray-500 mt-1">{course.progress}% complete</p>
                    </div>
                  </div>
                  <Link href="/courses">
                    <Button size="sm" className="w-full sm:w-auto bg-primary hover:bg-blue-700 text-xs sm:text-sm">
                      Continue
                    </Button>
                  </Link>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Assessments */}
        <Card>
          <CardHeader className="pb-2 sm:pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg">Upcoming Tests</CardTitle>
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {mockUpcomingTests.map((test) => (
              <div 
                key={test.id}
                className={`p-3 sm:p-4 rounded-lg border ${
                  test.urgency === "high" 
                    ? "border-orange-200 bg-orange-50" 
                    : "border-blue-200 bg-blue-50"
                }`}
                data-testid={`test-card-${test.id}`}
              >
                <div className="flex items-start justify-between mb-2 gap-2">
                  <h3 className="font-medium text-gray-900 text-sm sm:text-base">{test.title}</h3>
                  <Badge 
                    variant={test.urgency === "high" ? "destructive" : "default"}
                    className="text-[10px] sm:text-xs shrink-0"
                  >
                    {test.dueDate}
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mb-3">{test.description}</p>
                <Button 
                  size="sm"
                  className={`w-full text-xs sm:text-sm ${
                    test.urgency === "high" 
                      ? "bg-yellow-500 hover:bg-yellow-600" 
                      : "bg-primary hover:bg-blue-700"
                  }`}
                  onClick={() => {
                    if (test.urgency === "high") {
                      window.location.href = "/courses";
                    } else {
                      window.location.href = "/studio/quiz?questions=15&time=20";
                    }
                  }}
                >
                  {test.urgency === "high" ? "Study Now" : "Prepare"}
                </Button>
              </div>
            ))}
            
            <div className="text-center py-2 sm:py-4">
              <Link href="/studio/quiz?questions=15&time=20">
                <Button variant="ghost" size="sm" className="text-xs sm:text-sm">View All Tests</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Achievements */}
      <Card className="bg-white dark:bg-gray-800">
        <CardHeader className="pb-2 sm:pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base sm:text-lg dark:text-white">Recent Achievements</CardTitle>
            <Button variant="ghost" size="sm" className="text-xs sm:text-sm dark:text-gray-300 dark:hover:bg-gray-700">View All</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {mockAchievements.map((achievement) => (
              <div 
                key={achievement.id}
                className={`text-center p-3 sm:p-4 bg-gradient-to-br ${achievement.color} dark:from-gray-700 dark:to-gray-800 rounded-lg card-hover`}
                data-testid={`achievement-${achievement.id}`}
              >
                <div className={`${achievement.iconColor} text-white p-2 sm:p-3 rounded-full w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 flex items-center justify-center`}>
                  <achievement.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">{achievement.title}</h3>
                <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mt-1">{achievement.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
