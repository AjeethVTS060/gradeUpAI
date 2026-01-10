import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Link } from "wouter";
import { 
  Users, 
  BookOpen, 
  ClipboardCheck, 
  BarChart3, 
  PlusCircle, 
  FileText, 
  Upload,
  Calculator,
  Microscope,
  Atom,
  ArrowRight
} from "lucide-react";

export default function TeacherDashboard() {
  const { user } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery<{
    totalStudents?: number;
    coursesCreated?: number;
    pendingAssignments?: number;
    classAverage?: number;
  }>({
    queryKey: ["/api/teacher/stats"],
  });

  // Mock data for teacher courses
  const mockCourses = [
    {
      id: 1,
      title: "Advanced Mathematics",
      subject: "Mathematics",
      grade: "Grade 12",
      students: 32,
      completion: 94,
      lastActivity: "2 hours ago",
      icon: Calculator,
      color: "bg-blue-500"
    },
    {
      id: 2,
      title: "Physics Fundamentals",
      subject: "Physics",
      grade: "Grade 11",
      students: 28,
      completion: 76,
      lastActivity: "5 hours ago",
      icon: Microscope,
      color: "bg-green-500"
    },
    {
      id: 3,
      title: "Chemistry Basics",
      subject: "Chemistry",
      grade: "Grade 10",
      students: 25,
      completion: 88,
      lastActivity: "1 day ago",
      icon: Atom,
      color: "bg-purple-500"
    }
  ];

  const quickActions = [
    {
      id: 1,
      title: "AI Content Manager",
      description: "Create courses with advanced NLP processing",
      icon: FileText,
      color: "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700",
      href: "/enhanced-content-manager",
      featured: true
    },
    {
      id: 2,
      title: "PDF Document Processing",
      description: "Upload and analyze educational documents",
      icon: Upload,
      color: "bg-blue-600 hover:bg-blue-700",
      href: "/enhanced-content-manager"
    },
    {
      id: 3,
      title: "Create Assignment",
      description: "Design homework and assessments",
      icon: ClipboardCheck,
      color: "bg-green-600 hover:bg-green-700",
      href: "/teacher/homework"
    },
    {
      id: 4,
      title: "View Analytics",
      description: "Track student performance and progress",
      icon: BarChart3,
      color: "bg-orange-600 hover:bg-orange-700",
      href: "/analytics"
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-4 sm:p-6 lg:p-8 text-white">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">
          Welcome, Professor {user?.lastName}! 👩‍🏫
        </h1>
        <p className="text-indigo-100 text-sm sm:text-base">Manage your classes, create content, and track student progress.</p>
      </div>

      {/* Teacher Quick Stats - Responsive Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <Card className="card-hover bg-white dark:bg-gray-800">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 sm:p-3 rounded-lg">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-primary" />
              </div>
              <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Active</span>
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
              {statsLoading ? "..." : stats?.totalStudents || 0}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Students</p>
          </CardContent>
        </Card>

        <Card className="card-hover bg-white dark:bg-gray-800">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <div className="bg-green-100 dark:bg-green-900/30 p-2 sm:p-3 rounded-lg">
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-600" />
              </div>
              <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Created</span>
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
              {statsLoading ? "..." : stats?.coursesCreated || 0}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Courses</p>
          </CardContent>
        </Card>

        <Card className="card-hover bg-white dark:bg-gray-800">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-2 sm:p-3 rounded-lg">
                <ClipboardCheck className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-purple-600" />
              </div>
              <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Pending</span>
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
              {statsLoading ? "..." : stats?.pendingAssignments || 0}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">To Review</p>
          </CardContent>
        </Card>

        <Card className="card-hover bg-white dark:bg-gray-800">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <div className="bg-orange-100 dark:bg-orange-900/30 p-2 sm:p-3 rounded-lg">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-orange-600" />
              </div>
              <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Avg</span>
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
              {statsLoading ? "..." : `${stats?.classAverage || 0}%`}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Performance</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Quick Actions */}
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-base sm:text-lg dark:text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3">
            {quickActions.map((action) => (
              <Link key={action.id} href={action.href}>
                <Button
                  className={`w-full flex items-center justify-between p-3 sm:p-4 h-auto text-left text-white ${action.color} ${action.featured ? 'ring-2 ring-purple-300' : ''}`}
                >
                  <div className="flex items-center flex-1 min-w-0">
                    <action.icon className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium text-xs sm:text-sm truncate">{action.title}</span>
                      <span className="text-[10px] sm:text-xs opacity-90 truncate hidden sm:block">{action.description}</span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 flex-shrink-0 ml-2" />
                </Button>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Recent Classes */}
        <div className="lg:col-span-2">
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader className="pb-2 sm:pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base sm:text-lg dark:text-white">Recent Classes</CardTitle>
                <Button variant="ghost" size="sm" className="text-xs sm:text-sm dark:text-gray-300 dark:hover:bg-gray-700">View All</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              {mockCourses.map((course) => (
                <div 
                  key={course.id}
                  className="flex flex-col sm:flex-row sm:items-center p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg gap-3"
                >
                  <div className={`${course.color} text-white p-2.5 sm:p-3 rounded-lg shrink-0 w-fit`}>
                    <course.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">{course.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{course.grade} - {course.students} students</p>
                    <div className="flex flex-wrap items-center mt-2 gap-2">
                      <Badge 
                        variant="outline"
                        className={`text-[10px] sm:text-xs ${
                          course.completion > 90 
                            ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700" 
                            : course.completion > 75 
                            ? "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700"
                            : "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700"
                        }`}
                      >
                        {course.completion}%
                      </Badge>
                      <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">{course.lastActivity}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs sm:text-sm dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600">
                    Manage
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Student Performance Overview */}
      <Card className="bg-white dark:bg-gray-800">
        <CardHeader className="pb-2 sm:pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-base sm:text-lg dark:text-white">Performance Overview</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select defaultValue="7days">
                <SelectTrigger className="w-full sm:w-32 text-xs sm:text-sm h-8 sm:h-9 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-700 dark:text-gray-300">
                  <SelectItem value="7days">7 days</SelectItem>
                  <SelectItem value="30days">30 days</SelectItem>
                  <SelectItem value="3months">3 months</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="text-xs sm:text-sm h-8 sm:h-9 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600">
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Performance Chart Placeholder */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 sm:p-6 lg:p-8 text-center">
            <BarChart3 className="h-10 w-10 sm:h-12 sm:w-12 lg:h-16 lg:w-16 text-gray-400 dark:text-gray-500 mx-auto mb-3 sm:mb-4" />
            <p className="text-gray-600 dark:text-gray-300 font-medium text-sm sm:text-base">Performance analytics</p>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 sm:mt-2">Chart visualization coming soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
