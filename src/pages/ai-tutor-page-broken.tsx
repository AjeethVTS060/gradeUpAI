import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "../hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Badge } from "../components/ui/badge";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Slider } from "../components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { Separator } from "../components/ui/separator";
import { 
  Bot, 
  Send, 
  Loader2, 
  Mic, 
  Image as ImageIcon, 
  FileText, 
  Brain,
  Lightbulb,
  BookOpen,
  Calculator,
  Atom,
  History,
  Trash2,
  Copy,
  Volume2,
  VolumeX,
  MessageCircle,
  TrendingUp,
  Zap,
  Settings,
  ChevronDown,
  CheckCircle,
  Sparkles
} from "lucide-react";
import { cn } from "../lib/utils";
import { apiRequest, queryClient } from "../lib/queryClient";
import Navigation from "../components/navigation";

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  subject?: string;
  attachments?: Array<{
    type: 'image' | 'document';
    name: string;
    url: string;
  }>;
}

interface TutorStatus {
  ollamaAvailable: boolean;
  perplexityAvailable: boolean;
  selfHostedAvailable: boolean;
  capabilities: string[];
  activeModel: string;
}

interface VoiceModel {
  id: string;
  name: string;
  type: 'tts' | 'stt';
  provider: 'openai' | 'browser' | 'elevenlabs';
  quality: 'standard' | 'premium' | 'neural';
  languages: string[];
  description: string;
}

interface VoiceCapabilities {
  ttsModels: VoiceModel[];
  sttModels: VoiceModel[];
  supportedLanguages: string[];
}

const subjectSuggestions = [
  { name: "Mathematics", icon: Calculator, color: "bg-blue-500" },
  { name: "Physics", icon: Atom, color: "bg-green-500" },
  { name: "Chemistry", icon: Atom, color: "bg-purple-500" },
  { name: "Biology", icon: BookOpen, color: "bg-emerald-500" },
  { name: "History", icon: History, color: "bg-red-500" },
];

const quickQuestions = [
  "Solve: 2x² + 5x - 3 = 0",
  "Explain derivatives step by step",
  "What are linear equations?",
  "Help with algebra word problems",
  "Factoring polynomials",
  "Graphing functions tutorial",
  "Trigonometry basics",
  "Create a math study plan"
];

export default function AITutorPage() {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: "🧮 Welcome to your AI Math Tutor! I specialize in:\n\n📐 **Algebra & Equations** - Step-by-step solving\n📊 **Calculus** - Derivatives, integrals, limits\n📈 **Graphing** - Functions and data visualization\n🔢 **Problem Solving** - Word problems and applications\n\nSelect a subject below or ask me any math question!",
      timestamp: new Date()
    }
  ]);
  const [selectedSubject, setSelectedSubject] = useState<string>("Mathematics");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showMathKeyboard, setShowMathKeyboard] = useState(false);
  const [tutorMode, setTutorMode] = useState<'basic' | 'enhanced' | 'educational' | 'math'>('educational');
  const [selectedTTSVoice, setSelectedTTSVoice] = useState<string>('alloy');
  const [selectedSTTModel, setSelectedSTTModel] = useState<string>('browser-speech-recognition');
  const [speechSpeed, setSpeechSpeed] = useState<number>(1.0);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: chatHistory } = useQuery({
    queryKey: ["/api/chat/history"],
  });

  const { data: tutorStatus } = useQuery<TutorStatus>({
    queryKey: ["/api/chat/status"],
    refetchInterval: 30000, // Check status every 30 seconds
  });

  const { data: voiceCapabilities } = useQuery<VoiceCapabilities>({
    queryKey: ["/api/voice/models"],
  });

  const { data: voiceRecommendations } = useQuery({
    queryKey: ["/api/voice/recommendations", { subject: selectedSubject }],
    enabled: !!selectedSubject,
  });

  const chatMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      const context = selectedSubject ? `Subject: ${selectedSubject}. ` : '';
      
      // Use specialized math endpoint for mathematics problems
      if (selectedSubject === 'Mathematics' && (
        userMessage.toLowerCase().includes('solve') ||
        userMessage.toLowerCase().includes('equation') ||
        userMessage.toLowerCase().includes('calculate') ||
        userMessage.toLowerCase().includes('derivative') ||
        userMessage.toLowerCase().includes('integral')
      )) {
        const res = await apiRequest("POST", "/api/chat/math", {
          problem: userMessage,
          subject: selectedSubject
        });
        return await res.json();
      }
      
      const res = await apiRequest("POST", "/api/chat", { 
        message: userMessage,
        context: context,
        mode: tutorMode,
        subject: selectedSubject
      });
      return await res.json();
    },
    onSuccess: (data) => {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          type: 'ai',
          content: data.response,
          timestamp: new Date(),
          subject: selectedSubject
        }
      ]);
    },
    onError: () => {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          type: 'ai',
          content: "I'm experiencing some technical difficulties. Please try again later.",
          timestamp: new Date()
        }
      ]);
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || chatMutation.isPending) return;

    const userMessage = message.trim();
    setMessage("");
    
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        type: 'user',
        content: userMessage,
        timestamp: new Date(),
        subject: selectedSubject
      }
    ]);

    chatMutation.mutate(userMessage);
  };

  const handleQuickQuestion = (question: string) => {
    setMessage(question);
  };

  // Text-to-Speech functionality
  const speakMessage = (text: string) => {
    if (!('speechSynthesis' in window)) {
      console.log("Speech synthesis not supported");
      return;
    }

    // Stop any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Mathematical symbols helper
  const mathSymbols = [
    { symbol: "²", description: "squared" },
    { symbol: "³", description: "cubed" },
    { symbol: "√", description: "square root" },
    { symbol: "∛", description: "cube root" },
    { symbol: "π", description: "pi" },
    { symbol: "∞", description: "infinity" },
    { symbol: "≤", description: "less than or equal" },
    { symbol: "≥", description: "greater than or equal" },
    { symbol: "≠", description: "not equal" },
    { symbol: "±", description: "plus or minus" },
    { symbol: "∫", description: "integral" },
    { symbol: "∑", description: "sum" },
    { symbol: "∆", description: "delta" },
    { symbol: "α", description: "alpha" },
    { symbol: "β", description: "beta" },
    { symbol: "θ", description: "theta" }
  ];

  const insertMathSymbol = (symbol: string) => {
    setMessage(prev => prev + symbol);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Handle file upload logic here
      console.log("File uploaded:", file.name);
    }
  };

  const startVoiceRecording = async () => {
    // Check browser support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    // Check microphone permissions
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (permissionError) {
      alert("Microphone access is required for voice commands. Please allow microphone access and try again.");
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        console.log('Voice recognition started - speak now');
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript;
          }
        }
        if (transcript.trim()) {
          setMessage(transcript.trim());
          console.log('Voice input captured:', transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        let errorMessage = "Voice recognition failed. ";
        switch (event.error) {
          case 'no-speech':
            errorMessage += "No speech detected. Please try speaking again.";
            break;
          case 'audio-capture':
            errorMessage += "No microphone found or audio capture failed.";
            break;
          case 'not-allowed':
            errorMessage += "Microphone access denied. Please allow microphone access.";
            break;
          case 'network':
            errorMessage += "Network error occurred.";
            break;
          default:
            errorMessage += "Please try again.";
        }
        alert(errorMessage);
      };

      recognition.onend = () => {
        setIsListening(false);
        console.log('Voice recognition ended');
      };

      recognition.start();
      
    } catch (error) {
      console.error('Failed to start voice recognition:', error);
      setIsListening(false);
      alert('Failed to start voice recognition. Please ensure your browser supports speech recognition and try again.');
    }
  };

  const clearConversation = () => {
    setMessages([{
      id: '1',
      type: 'ai',
      content: "Hello! I'm your AI tutor. I can help you with homework, explain concepts, solve problems, and create personalized study plans. What would you like to learn today?",
      timestamp: new Date()
    }]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentRole={user?.role || "student"} onRoleChange={() => {}} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Subject Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Brain className="h-5 w-5 mr-2" />
                  Subject Focus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    variant={selectedSubject === "" ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setSelectedSubject("")}
                  >
                    All Subjects
                  </Button>
                  {subjectSuggestions.map((subject) => (
                    <Button
                      key={subject.name}
                      variant={selectedSubject === subject.name ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => setSelectedSubject(subject.name)}
                    >
                      <subject.icon className="h-4 w-4 mr-2" />
                      {subject.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Questions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2" />
                  Quick Start
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {quickQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-left h-auto p-3"
                      onClick={() => handleQuickQuestion(question)}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Mode Selector */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Brain className="h-5 w-5 mr-2" />
                  AI Tutor Mode
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm">
                    <div className="font-medium mb-2">Select Mode:</div>
                    <div className="space-y-2">
                      <Button
                        variant={tutorMode === "educational" ? "default" : "outline"}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setTutorMode("educational")}
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        Educational Mode
                      </Button>
                      <Button
                        variant={tutorMode === "basic" ? "default" : "outline"}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setTutorMode("basic")}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Basic Chat
                      </Button>
                      <Button
                        variant={tutorMode === "enhanced" ? "default" : "outline"}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setTutorMode("enhanced")}
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        Enhanced Mode
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-600 p-2 bg-gray-50 rounded">
                    {tutorMode === "educational" && "Structured learning responses with step-by-step guidance"}
                    {tutorMode === "basic" && "Simple conversational AI assistance"}
                    {tutorMode === "enhanced" && "Advanced AI with detailed analysis"}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  AI Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm">
                    <div className="font-medium mb-2">Current Status:</div>
                    <div className={cn(
                      "p-2 rounded text-xs",
                      tutorStatus?.ollamaAvailable 
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-blue-50 text-blue-700 border border-blue-200"
                    )}>
                      {tutorStatus?.ollamaAvailable ? (
                        <>
                          Advanced Mathematics Available
                          <div className="mt-1 text-xs opacity-75">
                            Self-hosted AI with unlimited usage
                          </div>
                        </>
                      ) : (
                        <>
                          Educational Mode Active
                          <div className="mt-1 text-xs opacity-75">
                            Structured learning support available
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Study Tools */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Study Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => {
                      setSelectedSubject("Mathematics");
                      setMessage("Generate a practice quiz with 5 algebra problems");
                    }}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Math Quiz
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => {
                      setSelectedSubject("Mathematics");
                      setMessage("Create a personalized study plan for calculus and algebra");
                    }}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Create Study Plan
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => {
                      setSelectedSubject("Mathematics");
                      setMessage("Explain step-by-step how to solve quadratic equations");
                    }}
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Step-by-Step Guide
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => {
                      setSelectedSubject("Mathematics");
                      setMessage("Help me understand graphing linear functions with examples");
                    }}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Visual Learning
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            <Card className="h-[800px] flex flex-col">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary text-white p-2 rounded-lg">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle>AI Tutor</CardTitle>
                      <div className="flex items-center space-x-2">
                        <div className={cn(
                          "h-2 w-2 rounded-full",
                          tutorStatus?.ollamaAvailable ? "bg-green-500" : "bg-yellow-500"
                        )}></div>
                        <span className="text-sm text-gray-600">
                          {tutorStatus?.ollamaAvailable ? "Enhanced Math Mode" : "Basic Mode"}
                        </span>
                        {selectedSubject && (
                          <Badge variant="secondary">{selectedSubject}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearConversation}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-0">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div 
                        key={msg.id}
                        className={cn(
                          "flex",
                          msg.type === 'user' ? "justify-end" : "justify-start"
                        )}
                      >
                        <div className="relative group">
                          <div
                            className={cn(
                              "max-w-xs lg:max-w-md p-4 rounded-lg text-sm",
                              msg.type === 'user'
                                ? "bg-primary text-white"
                                : "bg-gray-100 text-gray-900"
                            )}
                          >
                            <div className="whitespace-pre-wrap">{msg.content}</div>
                            {msg.subject && (
                              <Badge variant="outline" className="mt-2 text-xs">
                                {msg.subject}
                              </Badge>
                            )}
                            <div className="text-xs opacity-70 mt-2">
                              {msg.timestamp.toLocaleTimeString()}
                            </div>
                          </div>
                          
                          {/* Interactive buttons for AI messages */}
                          {msg.type === 'ai' && (
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute -right-2 top-2 flex flex-col space-y-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 bg-white shadow-md hover:bg-gray-50"
                                onClick={() => speakMessage(msg.content)}
                                disabled={isSpeaking}
                              >
                                {isSpeaking ? (
                                  <VolumeX className="h-3 w-3" />
                                ) : (
                                  <Volume2 className="h-3 w-3" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 bg-white shadow-md hover:bg-gray-50"
                                onClick={() => copyToClipboard(msg.content)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {chatMutation.isPending && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 text-gray-900 max-w-xs p-4 rounded-lg text-sm flex items-center">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Thinking...
                        </div>
                      </div>
                    )}
                  </div>
                  <div ref={messagesEndRef} />
                </ScrollArea>
                
                <div className="border-t p-4">
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="flex space-x-2">
                      <div className="flex-1">
                        <Textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Ask me anything about your studies..."
                          className="min-h-[60px] resize-none"
                          disabled={chatMutation.isPending}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSubmit(e);
                            }
                          }}
                        />
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Button 
                          type="submit" 
                          size="sm"
                          disabled={!message.trim() || chatMutation.isPending}
                          className="bg-primary hover:bg-blue-700"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={startVoiceRecording}
                          disabled={isListening || chatMutation.isPending}
                          className={cn(isListening && "bg-red-50 border-red-200")}
                        >
                          <Mic className={cn(
                            "h-4 w-4", 
                            isListening ? "text-red-500 animate-pulse" : "text-gray-500"
                          )} />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <ImageIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowMathKeyboard(!showMathKeyboard)}
                          disabled={chatMutation.isPending}
                          className={cn(showMathKeyboard && "bg-blue-50 border-blue-200")}
                        >
                          <Calculator className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Mathematical Symbols Panel */}
                    {showMathKeyboard && selectedSubject === "Mathematics" && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
                        <div className="text-xs font-medium text-gray-700 mb-2">Mathematical Symbols</div>
                        <div className="grid grid-cols-8 gap-1">
                          {mathSymbols.map((item, index) => (
                            <Button
                              key={index}
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-sm hover:bg-white"
                              onClick={() => insertMathSymbol(item.symbol)}
                              title={item.description}
                            >
                              {item.symbol}
                            </Button>
                          ))}
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          Click symbols to add to your message, or type expressions like: x^2, sqrt(16), sin(30)
                        </div>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-2">
                      {quickQuestions.slice(0, 3).map((question, index) => (
                        <Button
                          key={index}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickQuestion(question)}
                          className="text-xs"
                        >
                          {question}
                        </Button>
                      ))}
                    </div>
                  </form>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}