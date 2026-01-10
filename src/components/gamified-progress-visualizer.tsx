import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { 
  Trophy, 
  Star, 
  Target, 
  Flame, 
  Award, 
  TrendingUp, 
  Calendar,
  BookOpen,
  Brain,
  Zap,
  Crown,
  Medal,
  Sparkles,
  ChevronUp,
  Users,
  Timer
} from "lucide-react";
import { useAuth } from "../hooks/use-auth";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  category: string;
  pointsRequired: number;
  unlocked: boolean;
  unlockedAt?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface ProgressStats {
  totalPoints: number;
  currentLevel: number;
  pointsToNextLevel: number;
  totalLessonsCompleted: number;
  streakDays: number;
  longestStreak: number;
  weeklyProgress: number;
  monthlyGoal: number;
  completionRate: number;
  studyTimeMinutes: number;
  rank: number;
  totalUsers: number;
}

interface LeaderboardEntry {
  id: number;
  username: string;
  avatar?: string;
  points: number;
  level: number;
  streak: number;
  rank: number;
}

const rarityColors = {
  common: "bg-gray-500",
  rare: "bg-blue-500", 
  epic: "bg-purple-500",
  legendary: "bg-yellow-500"
};

const rarityGradients = {
  common: "from-gray-400 to-gray-600",
  rare: "from-blue-400 to-blue-600",
  epic: "from-purple-400 to-purple-600", 
  legendary: "from-yellow-400 to-yellow-600"
};

export default function GamifiedProgressVisualizer() {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [showLevelUpAnimation, setShowLevelUpAnimation] = useState(false);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);

  const { data: progressStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/student/progress-stats"],
    enabled: user?.role === "student",
  });

  const { data: achievements = [], isLoading: achievementsLoading } = useQuery({
    queryKey: ["/api/student/achievements"],
    enabled: user?.role === "student",
  });

  const { data: leaderboard = [], isLoading: leaderboardLoading } = useQuery({
    queryKey: ["/api/leaderboard", selectedPeriod],
    enabled: user?.role === "student",
  });

  const { data: progressHistory = [], isLoading: historyLoading } = useQuery({
    queryKey: ["/api/student/progress-history", selectedPeriod],
    enabled: user?.role === "student",
  }) as { data: any[], isLoading: boolean };

  const updateProgressMutation = useMutation({
    mutationFn: async (data: { lessonId: number; completed: boolean; timeSpent: number }) => {
      const res = await fetch("/api/student/update-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include"
      });
      return res.json();
    },
  });

  const stats: ProgressStats = (progressStats as ProgressStats) || {
    totalPoints: 0,
    currentLevel: 1,
    pointsToNextLevel: 100,
    totalLessonsCompleted: 0,
    streakDays: 0,
    longestStreak: 0,
    weeklyProgress: 0,
    monthlyGoal: 100,
    completionRate: 0,
    studyTimeMinutes: 0,
    rank: 0,
    totalUsers: 0
  };

  const levelProgress = ((stats.totalPoints % 100) / 100) * 100;
  const nextLevelPoints = stats.currentLevel * 100;

  // Sample achievement data
  const sampleAchievements: Achievement[] = [
    {
      id: 1,
      title: "First Steps",
      description: "Complete your first lesson",
      icon: "👶",
      category: "Beginner",
      pointsRequired: 10,
      unlocked: stats.totalLessonsCompleted > 0,
      rarity: 'common'
    },
    {
      id: 2,
      title: "Week Warrior",
      description: "Maintain a 7-day learning streak",
      icon: "🔥",
      category: "Consistency", 
      pointsRequired: 50,
      unlocked: stats.streakDays >= 7,
      rarity: 'rare'
    },
    {
      id: 3,
      title: "Knowledge Seeker",
      description: "Complete 25 lessons",
      icon: "📚",
      category: "Progress",
      pointsRequired: 100,
      unlocked: stats.totalLessonsCompleted >= 25,
      rarity: 'epic'
    },
    {
      id: 4,
      title: "Master Student",
      description: "Reach level 10",
      icon: "👑",
      category: "Mastery",
      pointsRequired: 1000,
      unlocked: stats.currentLevel >= 10,
      rarity: 'legendary'
    }
  ];

  // Sample leaderboard data
  const sampleLeaderboard: LeaderboardEntry[] = [
    { id: 1, username: user?.username || "You", points: stats.totalPoints, level: stats.currentLevel, streak: stats.streakDays, rank: stats.rank || 1 },
    { id: 2, username: "Alice_Student", points: 850, level: 8, streak: 12, rank: 1 },
    { id: 3, username: "Bob_Student", points: 720, level: 7, streak: 5, rank: 2 },
    { id: 4, username: "Charlie_Student", points: 680, level: 6, streak: 8, rank: 3 },
    { id: 5, username: "Diana_Student", points: 590, level: 5, streak: 3, rank: 4 }
  ].sort((a, b) => b.points - a.points).map((entry, index) => ({ ...entry, rank: index + 1 }));

  // Progress chart data
  const progressChartData = Array.isArray(progressHistory) && progressHistory.length > 0 ? progressHistory : [
    { date: '2024-01-01', points: 50 },
    { date: '2024-01-02', points: 75 },
    { date: '2024-01-03', points: 120 },
    { date: '2024-01-04', points: 150 },
    { date: '2024-01-05', points: 200 },
    { date: '2024-01-06', points: 240 },
    { date: '2024-01-07', points: stats.totalPoints }
  ];

  const categoryData = [
    { name: 'Science', value: 40, color: '#8884d8' },
    { name: 'Math', value: 30, color: '#82ca9d' },
    { name: 'English', value: 20, color: '#ffc658' },
    { name: 'History', value: 10, color: '#ff7300' }
  ];

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      {/* Level Up Animation */}
     <AnimatePresence mode="wait">
        {showLevelUpAnimation && (
          <motion.div
            key="level-up"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          >
            <motion.div
              initial={{ y: -50 }}
              animate={{ y: 0 }}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 p-8 rounded-2xl text-center text-white shadow-2xl"
            >
              <Crown className="w-16 h-16 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-2">LEVEL UP!</h2>
              <p className="text-xl">You reached Level {stats.currentLevel}!</p>
              <Button
                onClick={() => setShowLevelUpAnimation(false)}
                className="mt-4 bg-white text-orange-500 hover:bg-gray-100"
              >
                Continue Learning
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Achievement Notification */}
      <AnimatePresence>
        {newAchievement && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="fixed top-4 right-4 z-40 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-lg shadow-lg max-w-sm"
          >
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-300" />
              <div>
                <h3 className="font-bold">Achievement Unlocked!</h3>
                <p className="text-sm">{newAchievement.title}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setNewAchievement(null)}
                className="text-white hover:bg-white/20"
              >
                ×
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Current Level</p>
                <p className="text-3xl font-bold">{stats.currentLevel}</p>
              </div>
              <Crown className="w-10 h-10 opacity-80" />
            </div>
            <div className="mt-4">
              <Progress value={levelProgress} className="h-2 bg-white/20" />
              <p className="text-xs mt-1 opacity-90">
                {stats.totalPoints % 100}/{nextLevelPoints - (stats.currentLevel - 1) * 100} XP to next level
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-teal-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Points</p>
                <p className="text-3xl font-bold">{stats.totalPoints.toLocaleString()}</p>
              </div>
              <Star className="w-10 h-10 opacity-80" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 mr-1" />
              <p className="text-xs opacity-90">+{stats.weeklyProgress} this week</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Current Streak</p>
                <p className="text-3xl font-bold">{stats.streakDays}</p>
              </div>
              <Flame className="w-10 h-10 opacity-80" />
            </div>
            <p className="text-xs mt-2 opacity-90">
              Best: {stats.longestStreak} days
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Global Rank</p>
                <p className="text-3xl font-bold">#{stats.rank || 1}</p>
              </div>
              <Medal className="w-10 h-10 opacity-80" />
            </div>
            <p className="text-xs mt-2 opacity-90">
              Top {stats.totalUsers ? Math.round((stats.rank / stats.totalUsers) * 100) : 1}%
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Progress Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Learning Progress
                </CardTitle>
                <CardDescription>Your daily point accumulation</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={progressChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="points" 
                      stroke="#8884d8" 
                      strokeWidth={3}
                      dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Subject Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Subject Progress
                </CardTitle>
                <CardDescription>Your learning distribution by subject</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Study Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Lessons Completed</p>
                    <p className="text-2xl font-bold">{stats.totalLessonsCompleted}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-full">
                    <Timer className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Study Time</p>
                    <p className="text-2xl font-bold">{Math.floor(stats.studyTimeMinutes / 60)}h {stats.studyTimeMinutes % 60}m</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Target className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Completion Rate</p>
                    <p className="text-2xl font-bold">{stats.completionRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sampleAchievements.map((achievement) => (
              <motion.div
                key={achievement.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className={`relative overflow-hidden ${
                  achievement.unlocked 
                    ? `bg-gradient-to-br ${rarityGradients[achievement.rarity]} text-white` 
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className={`text-4xl p-3 rounded-full ${
                        achievement.unlocked ? 'bg-white/20' : 'bg-gray-200'
                      }`}>
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold">{achievement.title}</h3>
                          <Badge className={`${rarityColors[achievement.rarity]} text-white`}>
                            {achievement.rarity}
                          </Badge>
                        </div>
                        <p className="text-sm opacity-90 mt-1">{achievement.description}</p>
                        <p className="text-xs opacity-75 mt-2">
                          {achievement.pointsRequired} points required
                        </p>
                      </div>
                      {achievement.unlocked && (
                        <Trophy className="w-6 h-6 text-yellow-300" />
                      )}
                    </div>
                    {achievement.unlocked && (
                      <div className="absolute top-2 right-2">
                        <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Top Learners
              </CardTitle>
              <CardDescription>See how you stack up against other students</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sampleLeaderboard.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center gap-4 p-4 rounded-lg ${
                      entry.username === user?.username 
                        ? 'bg-blue-50 border-2 border-blue-200' 
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                      index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-orange-500 text-white' :
                      'bg-gray-300 text-gray-700'
                    }`}>
                      {entry.rank}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{entry.username}</h3>
                        {entry.username === user?.username && (
                          <Badge variant="secondary">You</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4" />
                          {entry.points.toLocaleString()} pts
                        </span>
                        <span className="flex items-center gap-1">
                          <Crown className="w-4 h-4" />
                          Level {entry.level}
                        </span>
                        <span className="flex items-center gap-1">
                          <Flame className="w-4 h-4" />
                          {entry.streak} day streak
                        </span>
                      </div>
                    </div>

                    {index < 3 && (
                      <div className="text-2xl">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Activity</CardTitle>
                <CardDescription>Your learning activity over the past week</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={[
                    { day: 'Mon', minutes: 45 },
                    { day: 'Tue', minutes: 60 },
                    { day: 'Wed', minutes: 30 },
                    { day: 'Thu', minutes: 75 },
                    { day: 'Fri', minutes: 90 },
                    { day: 'Sat', minutes: 120 },
                    { day: 'Sun', minutes: 85 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="minutes" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Monthly Goals */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Progress</CardTitle>
                <CardDescription>Track your monthly learning goals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Lessons Completed</span>
                    <span>{stats.totalLessonsCompleted}/50</span>
                  </div>
                  <Progress value={(stats.totalLessonsCompleted / 50) * 100} />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Study Time (hours)</span>
                    <span>{Math.floor(stats.studyTimeMinutes / 60)}/40</span>
                  </div>
                  <Progress value={(Math.floor(stats.studyTimeMinutes / 60) / 40) * 100} />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Points Earned</span>
                    <span>{stats.totalPoints}/1000</span>
                  </div>
                  <Progress value={(stats.totalPoints / 1000) * 100} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}