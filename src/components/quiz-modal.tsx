import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Label } from "../components/ui/label";
import { Clock, X } from "lucide-react";

interface QuizModalProps {
  onClose: () => void;
}

export default function QuizModal({ onClose }: QuizModalProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [answers, setAnswers] = useState<string[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(765); // 12:45 in seconds

  // Mock quiz data
  const quiz = {
    title: "Physics Quiz: Motion and Force",
    totalQuestions: 10,
    questions: [
      {
        id: 1,
        question: "What is Newton's Second Law of Motion?",
        options: [
          "An object at rest stays at rest unless acted upon by a force",
          "Force equals mass times acceleration (F = ma)",
          "For every action, there is an equal and opposite reaction",
          "Energy cannot be created or destroyed"
        ],
        correctAnswer: 1
      },
      {
        id: 2,
        question: "What is the unit of force in the SI system?",
        options: [
          "Joule",
          "Newton",
          "Watt",
          "Pascal"
        ],
        correctAnswer: 1
      }
      // Add more questions as needed
    ]
  };

  const currentQuestionData = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.totalQuestions) * 100;

  // Format time remaining
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleNextQuestion = () => {
    // Save current answer
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = selectedAnswer;
    setAnswers(newAnswers);

    if (currentQuestion < quiz.totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(newAnswers[currentQuestion + 1] || "");
    } else {
      // Quiz completed
      handleSubmitQuiz();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      // Save current answer
      const newAnswers = [...answers];
      newAnswers[currentQuestion] = selectedAnswer;
      setAnswers(newAnswers);

      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(answers[currentQuestion - 1] || "");
    }
  };

  const handleSkipQuestion = () => {
    setSelectedAnswer("");
    handleNextQuestion();
  };

  const handleSubmitQuiz = () => {
    // Submit quiz logic here
    // console.log("Quiz submitted:", answers);
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{quiz.title}</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex items-center text-sm text-gray-600 space-x-4">
            <span>Question {currentQuestion + 1} of {quiz.totalQuestions}</span>
            <span>•</span>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>Time remaining: {formatTime(timeRemaining)}</span>
            </div>
          </div>
          <Progress value={progress} className="h-2 mt-3" />
        </DialogHeader>
        
        <div className="py-6">
          <div className="mb-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              {currentQuestionData.question}
            </h4>
            
            <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
              <div className="space-y-3">
                {currentQuestionData.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="cursor-pointer flex-1">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
          
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePreviousQuestion}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>
            
            <div className="flex space-x-3">
              <Button variant="outline" onClick={handleSkipQuestion}>
                Skip
              </Button>
              <Button onClick={handleNextQuestion} className="bg-primary hover:bg-blue-700">
                {currentQuestion === quiz.totalQuestions - 1 ? "Submit Quiz" : "Next Question"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
