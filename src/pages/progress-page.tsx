import { Link } from "wouter";
import { Button } from "../components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../hooks/use-auth";
import Navigation from "../components/navigation";
import GamifiedProgressVisualizer from "../components/gamified-progress-visualizer";

export default function ProgressPage() {
  const { user } = useAuth();

  if (user?.role !== "student") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">This page is only available to students.</p>
          <Link href="/">
            <Button>Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentRole={user?.role || "student"} onRoleChange={() => {}} />
      
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <Link href="/">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Back</span>
              </Button>
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Learning Progress</h1>
          <p className="text-sm sm:text-base text-gray-600">Track your achievements and compete with classmates</p>
        </div>

        <GamifiedProgressVisualizer />
      </div>
    </div>
  );
}