import React, { useState, useEffect } from "react";
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
  Timer,
  Loader2
} from "lucide-react";
import { useAuth } from "../hooks/use-auth";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { queryClient } from "../lib/queryClient";
import MinimalHeader from "../components/minimal-header";
import { useTheme } from "../hooks/use-theme";

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

const FunnyLoader = () => (
    <motion.div
      className="flex flex-col items-center justify-center space-y-6 text-center h-screen bg-gray-50 dark:bg-gray-900"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      <motion.div 
        className="relative"
        animate={{ rotate: [0, 5, -5, 5, 0]}}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <Zap className="w-24 h-24 text-yellow-400" />
        <Sparkles className="w-12 h-12 text-pink-400 absolute -top-4 -right-4 animate-ping" />
      </motion.div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Calculating Your Awesomeness...</h2>
      <p className="text-gray-600 dark:text-gray-400">Tallying points and polishing trophies!</p>
      <Loader2 className="w-8 h-8 text-gray-500 animate-spin mt-4" />
    </motion.div>
);


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

export default function ProgressPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [showLevelUpAnimation, setShowLevelUpAnimation] = useState(false);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);

  const { data: progressStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/student/progress-stats"],
    enabled: user?.role === "student",
    initialData: { // Mock data to prevent error on first render
        totalPoints: 1250, currentLevel: 5, pointsToNextLevel: 500, totalLessonsCompleted: 24,
        streakDays: 7, longestStreak: 14, weeklyProgress: 180, monthlyGoal: 300,
        completionRate: 87, studyTimeMinutes: 1840, rank: 3, totalUsers: 50
    }
  });

  const { data: achievements = [], isLoading: achievementsLoading } = useQuery({
    queryKey: ["/api/student/achievements"],
    enabled: user?.role === "student",
    initialData: [
        { id: 1, title: "First Steps", description: "Complete your first lesson", icon: "👶", category: "Beginner", pointsRequired: 10, unlocked: true, rarity: 'common' },
        { id: 2, title: "Week Warrior", description: "Maintain a 7-day learning streak", icon: "🔥", category: "Consistency", pointsRequired: 50, unlocked: true, rarity: 'rare' },
        { id: 3, title: "Knowledge Seeker", description: "Complete 25 lessons", icon: "📚", category: "Progress", pointsRequired: 100, unlocked: false, rarity: 'epic' },
        { id: 4, title: "Master Student", description: "Reach level 10", icon: "👑", category: "Mastery", pointsRequired: 1000, unlocked: false, rarity: 'legendary' }
    ]
  });

  const { data: leaderboard = [], isLoading: leaderboardLoading } = useQuery({
    queryKey: ["/api/leaderboard", selectedPeriod],
    enabled: user?.role === "student",
    initialData: [
        { id: 1, username: "alex_star", points: 2450, level: 8, streak: 12, rank: 1 },
        { id: 2, username: "maria_learn", points: 2100, level: 7, streak: 5, rank: 2 },
        { id: 3, username: user?.username || "You", points: 1250, level: 5, streak: 7, rank: 3 },
        { id: 4, username: "john_study", points: 1100, level: 5, streak: 3, rank: 4 },
        { id: 5, username: "emma_bright", points: 980, level: 4, streak: 8, rank: 5 }
    ]
  });

  const { data: progressHistory = [], isLoading: historyLoading } = useQuery({
    queryKey: ["/api/student/progress-history", selectedPeriod],
    enabled: user?.role === "student",
    initialData: [
        { date: 'Mon', points: 50 }, { date: 'Tue', points: 75 }, { date: 'Wed', points: 120 },
        { date: 'Thu', points: 150 }, { date: 'Fri', points: 200 }, { date: 'Sat', points: 240 },
        { date: 'Sun', points: 280 }
    ]
  }) as { data: any[], isLoading: boolean };

  const stats: ProgressStats = progressStats as ProgressStats;

  const levelProgress = ((stats.totalPoints % 100) / (stats.pointsToNextLevel || 100)) * 100;
  const nextLevelPoints = stats.pointsToNextLevel;

  const categoryData = [
    { name: 'Science', value: 40, color: '#8884d8' },
    { name: 'Math', value: 30, color: '#82ca9d' },
    { name: 'English', value: 20, color: '#ffc658' },
    { name: 'History', value: 10, color: '#ff7300' }
  ];

  if (statsLoading || achievementsLoading || leaderboardLoading || historyLoading) {
    return <FunnyLoader />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <MinimalHeader title="My Progress" currentTheme={theme} onThemeChange={setTheme} />

     <AnimatePresence>
        {showLevelUpAnimation && (
          <motion.div
            key="level-up"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.3 } }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowLevelUpAnimation(false)}
          >
            <motion.div
              initial={{ y: -50, rotate: -10 }}
              animate={{ y: 0, rotate: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
              className="relative bg-gradient-to-r from-yellow-400 to-orange-500 p-6 sm:p-8 rounded-2xl text-center text-white shadow-2xl border-2 border-white/50"
            >
              <Sparkles className="w-10 h-10 text-white/80 absolute -top-5 -left-5" />
              <Sparkles className="w-6 h-6 text-white/80 absolute -bottom-3 -right-3 animate-ping" />
              <Crown className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 animate-bounce" />
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">LEVEL UP!</h2>
              <p className="text-lg sm:text-xl">You reached Level {stats.currentLevel}!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {newAchievement && (
          <motion.div
            initial={{ x: '110%' }}
            animate={{ x: 0 }}
            exit={{ x: '110%' }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            className="fixed top-20 right-4 z-40 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-xl shadow-lg max-w-sm"
          >
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-300" />
              <div>
                <h3 className="font-bold">Achievement Unlocked!</h3>
                <p className="text-sm">{newAchievement.title}</p>
              </div>
              <button
                onClick={() => setNewAchievement(null)}
                className="absolute top-1 right-1 text-white/70 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="p-3 sm:p-4 md:p-6 space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {/* Card 1: Level */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}>
                <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white overflow-hidden">
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs sm:text-sm opacity-90">Level</p>
                                <p className="text-2xl sm:text-3xl font-bold">{stats.currentLevel}</p>
                            </div>
                            <Crown className="w-8 h-8 sm:w-10 sm:h-10 opacity-80" />
                        </div>
                        <div className="mt-2 sm:mt-4">
                            <Progress value={levelProgress} className="h-2 bg-white/20" />
                            <p className="text-xs mt-1 opacity-90">
                                {stats.totalPoints % 100}/{nextLevelPoints - (stats.currentLevel - 1) * 100} XP
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
            {/* Cards 2-4 */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}><Card className="bg-gradient-to-br from-green-500 to-teal-600 text-white"><CardContent className="p-4 sm:p-6"><div className="flex items-center justify-between"><div><p className="text-xs sm:text-sm opacity-90">Total Points</p><p className="text-2xl sm:text-3xl font-bold">{stats.totalPoints.toLocaleString()}</p></div><Star className="w-8 h-8 sm:w-10 sm:h-10 opacity-80" /></div><div className="flex items-center mt-2 text-xs opacity-90"><TrendingUp className="w-4 h-4 mr-1" />+{stats.weeklyProgress} this week</div></CardContent></Card></motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}><Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white"><CardContent className="p-4 sm:p-6"><div className="flex items-center justify-between"><div><p className="text-xs sm:text-sm opacity-90">Streak</p><p className="text-2xl sm:text-3xl font-bold">{stats.streakDays}</p></div><Flame className="w-8 h-8 sm:w-10 sm:h-10 opacity-80" /></div><p className="text-xs mt-2 opacity-90">Best: {stats.longestStreak} days</p></CardContent></Card></motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.4 } }}><Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white"><CardContent className="p-4 sm:p-6"><div className="flex items-center justify-between"><div><p className="text-xs sm:text-sm opacity-90">Global Rank</p><p className="text-2xl sm:text-3xl font-bold">#{stats.rank || 1}</p></div><Medal className="w-8 h-8 sm:w-10 sm:h-10 opacity-80" /></div><p className="text-xs mt-2 opacity-90">Top {stats.totalUsers ? Math.round((stats.rank / stats.totalUsers) * 100) : 1}%</p></CardContent></Card></motion.div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto p-1">
            <TabsTrigger value="overview"><TrendingUp className="w-4 h-4 mr-2"/>Overview</TabsTrigger>
            <TabsTrigger value="achievements"><Trophy className="w-4 h-4 mr-2"/>Achievements</TabsTrigger>
            <TabsTrigger value="leaderboard"><Users className="w-4 h-4 mr-2"/>Leaderboard</TabsTrigger>
            <TabsTrigger value="analytics"><Brain className="w-4 h-4 mr-2"/>Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card><CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5" />Learning Progress</CardTitle><CardDescription>Your daily point accumulation</CardDescription></CardHeader><CardContent><ResponsiveContainer width="100%" height={250}><LineChart data={progressHistory}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis /><Tooltip /><Line type="monotone" dataKey="points" stroke="#8884d8" strokeWidth={3} dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }} /></LineChart></ResponsiveContainer></CardContent></Card>
                <Card><CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="w-5 h-5" />Subject Progress</CardTitle><CardDescription>Your learning distribution</CardDescription></CardHeader><CardContent><ResponsiveContainer width="100%" height={250}><PieChart><Pie data={categoryData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}><Cell key="cell-0" fill="#8884d8" /><Cell key="cell-1" fill="#82ca9d" /><Cell key="cell-2" fill="#ffc658" /><Cell key="cell-3" fill="#ff7300" /></Pie><Tooltip /></PieChart></ResponsiveContainer></CardContent></Card>
            </div>
        </TabsContent>

        <TabsContent value="achievements" className="mt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {achievements.map((achievement: Achievement) => (
              <motion.div key={achievement.id} whileHover={{ scale: 1.05 }} className={`relative overflow-hidden rounded-lg p-4 text-center transition-all duration-300 ${achievement.unlocked ? `bg-gradient-to-br ${rarityGradients[achievement.rarity]} text-white shadow-lg` : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                <div className={`text-4xl mx-auto mb-2 p-3 rounded-full inline-block ${achievement.unlocked ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700'}`}>{achievement.icon}</div>
                <h3 className="font-bold text-sm sm:text-base">{achievement.title}</h3>
                <p className="text-xs opacity-90 hidden sm:block">{achievement.description}</p>
                {achievement.unlocked && <Trophy className="w-5 h-5 text-yellow-300 absolute top-2 right-2" />}
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-6">
            <Card><CardHeader><CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" />Top Learners</CardTitle><CardDescription>See how you stack up</CardDescription></CardHeader><CardContent className="space-y-2"><div className="space-y-2">
                {leaderboard.map((entry: LeaderboardEntry, index: number) => (
                  <motion.div key={entry.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0, transition: { delay: index * 0.05 } }} className={`flex items-center gap-3 p-3 rounded-lg ${entry.username === user?.username ? 'bg-blue-100 dark:bg-blue-900/50 border-2 border-blue-200' : 'bg-gray-50 dark:bg-gray-800'}`}>
                    <div className={`flex items-center justify-center w-7 h-7 text-xs rounded-full font-bold ${index === 0 ? 'bg-yellow-400 text-white' : index === 1 ? 'bg-gray-400 text-white' : index === 2 ? 'bg-orange-400 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200'}`}>{entry.rank}</div>
                    <div className="flex-1"><h3 className="font-semibold text-sm">{entry.username}{entry.username === user?.username && <Badge variant="secondary" className="ml-2 text-xs">You</Badge>}</h3></div>
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400"><span className="flex items-center gap-1"><Star className="w-4 h-4" />{entry.points.toLocaleString()}</span><span className="hidden sm:flex items-center gap-1"><Flame className="w-4 h-4" />{entry.streak}</span></div>
                    {index < 3 && <div className="text-xl">{['🥇', '🥈', '🥉'][index]}</div>}
                  </motion.div>
                ))}
            </div></CardContent></Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card><CardHeader><CardTitle>Weekly Activity</CardTitle><CardDescription>Study time over the past week</CardDescription></CardHeader><CardContent><ResponsiveContainer width="100%" height={200}><BarChart data={[{ day: 'Mon', minutes: 45 }, { day: 'Tue', minutes: 60 }, { day: 'Wed', minutes: 30 }, { day: 'Thu', minutes: 75 }, { day: 'Fri', minutes: 90 }, { day: 'Sat', minutes: 120 }, { day: 'Sun', minutes: 85 }]}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="day" /><YAxis /><Tooltip /><Bar dataKey="minutes" fill="#8884d8" /></BarChart></ResponsiveContainer></CardContent></Card>
            <Card><CardHeader><CardTitle>Monthly Goals</CardTitle><CardDescription>Your progress on this month's goals</CardDescription></CardHeader><CardContent className="space-y-4"><div><div className="flex justify-between text-sm mb-2"><span>Lessons</span><span>{stats.totalLessonsCompleted}/50</span></div><Progress value={(stats.totalLessonsCompleted / 50) * 100} /></div><div><div className="flex justify-between text-sm mb-2"><span>Study Time (hrs)</span><span>{Math.floor(stats.studyTimeMinutes / 60)}/40</span></div><Progress value={(Math.floor(stats.studyTimeMinutes / 60) / 40) * 100} /></div><div><div className="flex justify-between text-sm mb-2"><span>Points</span><span>{stats.totalPoints}/1000</span></div><Progress value={(stats.totalPoints / 1000) * 100} /></div></CardContent></Card>
            </div>
        </TabsContent>
      </Tabs>
      </main>
    </div>
  );
}