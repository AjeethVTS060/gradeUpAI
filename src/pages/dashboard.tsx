import { useState, useEffect } from "react";
import { useAuth } from "../hooks/use-auth";
import Navigation from "../components/navigation";
import Sidebar from "../components/sidebar";
import StudentDashboard from "../components/student-dashboard";
import TeacherDashboard from "../components/teacher-dashboard";
import AIChatbot from "../components/ai-chatbot";
import QuizModal from "../components/quiz-modal";

export default function Dashboard() {
  const { user } = useAuth();
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [currentRole, setCurrentRole] = useState("student");

  useEffect(() => {
    if (user?.role) {
      setCurrentRole(user.role);
    }
  }, [user]);

  if (!user) {
    return null;
  }

  const handleRoleChange = (newRole: string) => {
    // In a real app, you might have more complex logic for changing roles
    setCurrentRole(newRole);
    console.log("Switched role to:", newRole);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation 
        currentRole={currentRole} 
        onRoleChange={handleRoleChange}
      />
      
      <div className="flex">
        <Sidebar currentRole={currentRole} />
        
        {/* Main Content - Responsive padding */}
        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)]">
          {currentRole === "student" ? (
            <StudentDashboard onStartQuiz={() => setShowQuizModal(true)} />
          ) : (
            <TeacherDashboard />
          )}
        </main>
      </div>

      <AIChatbot />
      
      {showQuizModal && (
        <QuizModal onClose={() => setShowQuizModal(false)} />
      )}
    </div>
  );
}
