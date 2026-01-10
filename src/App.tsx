import { Switch, Route } from "wouter";
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
import ExamPage from "./pages/exam-page";
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

import NotFound from "./pages/not-found";
import BookContentWindow from "./components/BookContentWindow/BookContentWindow";
import BookGallery from "./components/BookGallery";
import SeminarToolPage from "./pages/seminar-tool-page";
import DebateToolPage from "./pages/debate-tool-page";
import { ThemeProvider } from "./hooks/use-theme";
import QuizPage from "./pages/studio/quiz-page";
import QuizBankPage from "./pages/studio/quiz-bank-page";
import TestPrepPage from "./pages/studio/test-prep-page";
import QAPage from "./pages/studio/qa-page";


function Router() {
  return (
    <Switch>
        <ProtectedRoute path="/dashboard" component={() => <Dashboard />} />
      <ProtectedRoute path="/courses" component={() => <CoursesPage />} />
      <ProtectedRoute path="/courses/:courseId" component={() => <CourseLessonsPage />} />
      <ProtectedRoute path="/progress" component={() => <ProgressPage />} />
      <ProtectedRoute path="/ai-tutor" component={() => <AITutorModern />} />
      <ProtectedRoute path="/voice-study" component={() => <VoiceStudyCompanion />} />
      <ProtectedRoute path="/exams" component={() => <ExamPage />} />
      <ProtectedRoute path="/homework" component={() => <HomeworkPage />} />
      <ProtectedRoute path="/teacher/homework" component={() => <TeacherHomeworkPage />} />
      <ProtectedRoute path="/teacher/pdf-upload" component={() => <TeacherPDFUpload />} />
      <ProtectedRoute path="/content-manager" component={() => <ContentManagerPage />} />
      <ProtectedRoute path="/enhanced-content-manager" component={() => <EnhancedContentManager />} />
      <ProtectedRoute path="/analytics" component={() => <AnalyticsPage />} />
      <ProtectedRoute path="/community" component={() => <CommunityPage />} />
      <ProtectedRoute path="/students" component={() => <StudentsPage />} />
      <ProtectedRoute path="/profile" component={() => <ProfilePage />} />
      <ProtectedRoute path="/settings" component={() => <SettingsPage />} />
      <Route path="/" component={() => <AuthPage />} />
      <Route path="/auth" component={() => <AuthPage />} />
      <Route path="/forgot-password" component={() => <ForgotPasswordPage />} />
      <ProtectedRoute path="/bookExpanded" component={() => <BookContentWindow />} />
      <ProtectedRoute path="/bookGallery" component={() => <BookGallery />} />
      <ProtectedRoute path="/seminar-tool" component={() => <SeminarToolPage />} />
      <ProtectedRoute path="/debate-tool" component={() => <DebateToolPage />} />

      <ProtectedRoute path="/studio/quiz" component={() => <QuizPage />} />
      <ProtectedRoute path="/studio/quiz-bank" component={() => <QuizBankPage />} />
      <ProtectedRoute path="/studio/test-prep" component={() => <TestPrepPage />} />
      <ProtectedRoute path="/studio/qa" component={() => <QAPage />} />


      <Route component={() => <NotFound />} />
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