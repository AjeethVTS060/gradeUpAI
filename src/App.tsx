import PageTransition from "./components/PageTransition";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { AuthProvider } from "./hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import Dashboard from "./pages/dashboard";
import AuthPage from "./pages/auth-page";
import CoursesPage from "./pages/courses-page";
import CourseLessonsPage from "./pages/course-lessons-page";
import ProgressPage from "./pages/progress-page";
import AITutorModern from "./pages/ai-tutor-modern";
import VoiceStudyCompanion from "./pages/voice-study-companion";
import QuizPage from "./pages/quiz-page";
import HomeworkPage from "./pages/homework-page";
import TeacherHomeworkPage from "./pages/teacher-homework-page";
import TeacherPDFUpload from "./pages/teacher-pdf-upload";
import AnalyticsPage from "./pages/analytics-page";
import ContentManagerPage from "./pages/content-manager-page";
import EnhancedContentManager from "./pages/enhanced-content-manager";
import CommunityPage from "./pages/community-page-fixed";
import StudentsPage from "./pages/students-page";
import ProfilePage from "./pages/profile-page";
import SettingsPage from "./pages/settings-page";
import ForgotPasswordPage from "./pages/forgot-password-page";
import CommunityNewPage from "./pages/CommunityPage";
import NotFound from "./pages/not-found";
import BookContentWindow from "./components/BookContentWindow/BookContentWindow";
import BookGallery from "./components/BookGallery";
import SeminarToolPage from "./pages/seminar-tool-page";
import DebateToolPage from "./pages/debate-tool-page";
import { ThemeProvider } from "./hooks/use-theme";
import StudioQuizPage from "./pages/studio/quiz-page";
import QuizBankPage from "./pages/studio/quiz-bank-page";
import TestPrepPage from "./pages/studio/test-prep-page";
import QAPage from "./pages/studio/qa-page";
import PreparationExamPage from "./pages/preparation-exam-page";
import MainExamPage from "./pages/main-exam-page";
import AchievementsPage from './pages/achievements-page';


function Router() {
  const [location] = useLocation();
  return (
    <Switch>
        <ProtectedRoute path="/dashboard" component={() => <PageTransition routeKey={location}><Dashboard /></PageTransition>} />
      <ProtectedRoute path="/courses" component={() => <PageTransition routeKey={location}><CoursesPage /></PageTransition>} />
      <ProtectedRoute path="/courses/:courseId" component={() => <PageTransition routeKey={location}><CourseLessonsPage /></PageTransition>} />
      <ProtectedRoute path="/progress" component={() => <PageTransition routeKey={location}><ProgressPage /></PageTransition>} />
      <ProtectedRoute path="/achievements" component={() => <PageTransition routeKey={location}><AchievementsPage /></PageTransition>} />
      <ProtectedRoute path="/ai-tutor" component={() => <PageTransition routeKey={location}><AITutorModern /></PageTransition>} />
      <ProtectedRoute path="/voice-study" component={() => <PageTransition routeKey={location}><VoiceStudyCompanion /></PageTransition>} />
      <ProtectedRoute path="/quiz" component={() => <PageTransition routeKey={location}><QuizPage /></PageTransition>} />
      <ProtectedRoute path="/homework" component={() => <PageTransition routeKey={location}><HomeworkPage /></PageTransition>} />
      <ProtectedRoute path="/teacher/homework" component={() => <PageTransition routeKey={location}><TeacherHomeworkPage /></PageTransition>} />
      <ProtectedRoute path="/teacher/pdf-upload" component={() => <PageTransition routeKey={location}><TeacherPDFUpload /></PageTransition>} />
      <ProtectedRoute path="/content-manager" component={() => <PageTransition routeKey={location}><ContentManagerPage /></PageTransition>} />
      <ProtectedRoute path="/enhanced-content-manager" component={() => <PageTransition routeKey={location}><EnhancedContentManager /></PageTransition>} />
      <ProtectedRoute path="/analytics" component={() => <PageTransition routeKey={location}><AnalyticsPage /></PageTransition>} />
      <ProtectedRoute path="/community" component={() => <PageTransition routeKey={location}><CommunityPage /></PageTransition>} />
      <ProtectedRoute path="/communityNew" component={() => <PageTransition routeKey={location}><CommunityNewPage /></PageTransition>} />
      <ProtectedRoute path="/preparation-exam" component={() => <PageTransition routeKey={location}><PreparationExamPage /></PageTransition>} />
      <ProtectedRoute path="/main-exam" component={() => <PageTransition routeKey={location}><MainExamPage /></PageTransition>} />

      <ProtectedRoute path="/students" component={() => <PageTransition routeKey={location}><StudentsPage /></PageTransition>} />
      <ProtectedRoute path="/profile" component={() => <PageTransition routeKey={location}><ProfilePage /></PageTransition>} />
      <ProtectedRoute path="/settings" component={() => <PageTransition routeKey={location}><SettingsPage /></PageTransition>} />
     <Route path="/" component={() => <AuthPage />} />
      <Route path="/auth" component={() => <AuthPage />} />
      <Route path="/forgot-password" component={() => <ForgotPasswordPage />} />
      <ProtectedRoute path="/bookExpanded" component={() => <PageTransition routeKey={location}><BookContentWindow /></PageTransition>} />
      <ProtectedRoute path="/bookGallery" component={() => <PageTransition routeKey={location}><BookGallery /></PageTransition>} />
      <ProtectedRoute path="/seminar-tool" component={() => <PageTransition routeKey={location}><SeminarToolPage /></PageTransition>} />
      <ProtectedRoute path="/debate-tool" component={() => <PageTransition routeKey={location}><DebateToolPage /></PageTransition>} />

      <ProtectedRoute path="/studio/quiz/:id?" component={(params) => <PageTransition routeKey={location}><StudioQuizPage id={params.id} /></PageTransition>} />
      <ProtectedRoute path="/studio/quiz-bank" component={() => <PageTransition routeKey={location}><QuizBankPage /></PageTransition>} />
      <ProtectedRoute path="/studio/test-prep" component={() => <PageTransition routeKey={location}><TestPrepPage /></PageTransition>} />
      <ProtectedRoute path="/studio/qa" component={() => <PageTransition routeKey={location}><QAPage /></PageTransition>} />


      <Route component={() => <PageTransition routeKey={location}><NotFound /></PageTransition>} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;