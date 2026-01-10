import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "../components/ui/button";
import { ClipboardList, Database, BookCheck, HelpCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Slider } from "../components/ui/slider";
import { Switch } from "../components/ui/switch";
import { Textarea } from "../components/ui/textarea";
import { ScrollArea } from "../components/ui/scroll-area";
import { Separator } from "../components/ui/separator";
import {
  Bot,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  User,
  History,
  Trash2,
  BookOpen,
  Settings,
  MessageSquare,
  Play,
  Pause,
  Sparkles,
  Brain,
  Zap,
  ArrowLeft,
  GraduationCap,
  Volume2 as VoiceIcon,
  Headphones,
  Wand2,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useToast } from "../hooks/use-toast";

interface ChatMessage {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  subject?: string;
  model?: string;
}

interface ChatHistory {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  lastUpdated: Date;
}

export default function AITutorModern() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Core states
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [tutorMode, setTutorMode] = useState<
    "basic" | "educational" | "enhanced"
  >("enhanced");
  const [selectedModel, setSelectedModel] = useState<string>(
    "google/gemma-3-12b-it"
  );

  // Chat states
  const [currentMessage, setCurrentMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Voice states - auto-enabled with UK English defaults
  const [selectedAccent, setSelectedAccent] = useState<"us" | "uk" | "indian">
    ("uk");
  const [selectedVoice, setSelectedVoice] = useState<string>("fable");
  const [speechSpeed, setSpeechSpeed] = useState(0.7);
  const [humanization, setHumanization] = useState(1);
  const [voiceBreathing, setVoiceBreathing] = useState(true);
  const [voicePauses, setVoicePauses] = useState(true);
  const [voiceEmphasis, setVoiceEmphasis] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedContext, setSelectedContext] = useState("");
  // const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedUnit, setSelectedUnit] = useState("");
// Independent Sidebar Chat States
const [isAISidebarOpen, setIsAISidebarOpen] = useState(false);
const [sidebarQuestion, setSidebarQuestion] = useState("");
const [sidebarMessages, setSidebarMessages] = useState<ChatMessage[]>([]);
const [isSidebarLoading, setIsSidebarLoading] = useState(false);
const sidebarEndRef = useRef<HTMLDivElement>(null);

// Auto-scroll sidebar to bottom
useEffect(() => {
  sidebarEndRef.current?.scrollIntoView({ behavior: "smooth" });
}, [sidebarMessages]);
  // Text highlighting states
  const [highlightedText, setHighlightedText] = useState("");
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [responseWords, setResponseWords] = useState<string[]>([]);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
const [quickQuestion, setQuickQuestion] = useState("");
const [isQuickAskOpen, setIsQuickAskOpen] = useState(false);

const captureSelection = () => {
  const text = window.getSelection()?.toString();
  if (text && text.trim().length > 0) {
    setSelectedContext(text.trim());
    setIsAISidebarOpen(true); // Open sidebar automatically
    setSidebarQuestion(`Can you explain this part: "${text.trim()}"`);
    toast({
      title: "Text Captured",
      description: "Ask your question about the highlighted text.",
    });
  } else {
    toast({
      title: "No text selected",
      description: "Highlight some text in the chat first!",
      variant: "destructive",
    });
  }
};
const sendSidebarMessage = async () => {
  if (!sidebarQuestion.trim() || isSidebarLoading) return;

  const userMsg: ChatMessage = {
    id: Date.now().toString(),
    type: "user",
    content: sidebarQuestion,
    timestamp: new Date(),
  };

  setSidebarMessages((prev) => [...prev, userMsg]);
  const query = sidebarQuestion;
  setSidebarQuestion("");
  setIsSidebarLoading(true);

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: query,
        subject: selectedSubject !== "all" ? selectedSubject : "general",
        mode: "educational", // Fixed mode for sidebar helper
        modelId: selectedModel,
      }),
    });

    const data = await response.json();

    const assistantMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: "assistant",
      content: data.response,
      timestamp: new Date(),
    };

    setSidebarMessages((prev) => [...prev, assistantMsg]);
  } catch (error) {
    toast({ title: "Error", description: "Assistant failed to respond.", variant: "destructive" });
  } finally {
    setIsSidebarLoading(false);
  }
};

const handleQuickAsk = async () => {
  if (!quickQuestion.trim()) return;
  
  // Set the question to the main chat and send it
  setCurrentMessage(quickQuestion);
  setIsQuickAskOpen(false);
  setQuickQuestion("");
  
  // We use a small timeout to ensure the state update for setCurrentMessage 
  // is processed before triggering the send logic
  setTimeout(() => {
    sendMessage();
  }, 100);
};
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Subject options with modern icons
  const subjects = [
    {
      value: "all",
      label: "All Subjects",
      icon: "🎯",
      color: "bg-gradient-to-r from-purple-500 to-pink-500",
    },
    {
      value: "mathematics",
      label: "Mathematics",
      icon: "🔢",
      color: "bg-gradient-to-r from-blue-500 to-cyan-500",
    },
    {
      value: "physics",
      label: "Physics",
      icon: "⚛️",
      color: "bg-gradient-to-r from-green-500 to-teal-500",
    },
    {
      value: "chemistry",
      label: "Chemistry",
      icon: "🧪",
      color: "bg-gradient-to-r from-red-500 to-orange-500",
    },
    {
      value: "biology",
      label: "Biology",
      icon: "🧬",
      color: "bg-gradient-to-r from-emerald-500 to-green-500",
    },
    {
      value: "english",
      label: "English",
      icon: "📚",
      color: "bg-gradient-to-r from-indigo-500 to-purple-500",
    },
    {
      value: "history",
      label: "History",
      icon: "🏛️",
      color: "bg-gradient-to-r from-amber-500 to-yellow-500",
    },
    {
      value: "geography",
      label: "Geography",
      icon: "🌍",
      color: "bg-gradient-to-r from-teal-500 to-cyan-500",
    },
    {
      value: "computer_science",
      label: "Computer Science",
      icon: "💻",
      color: "bg-gradient-to-r from-slate-500 to-gray-500",
    },
  ];

  // Voice models with enhanced descriptions
  const voiceModels = [
    { value: "fable", label: "Fable", description: "Professional & Clear" },
    {
      value: "alloy",
      label: "Alloy",
      description: "Conversational & Friendly",
    },
    { value: "echo", label: "Echo", description: "Warm & Engaging" },
    { value: "nova", label: "Nova", description: "Crisp & Modern" },
  ];

  // Auto-enable audio on component mount
  useEffect(() => {
    const enableAudio = async () => {
      try {
        const audioContext = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
        await audioContext.resume();
        console.log("Audio automatically enabled");
      } catch (error) {
        console.log("Audio auto-enable failed:", error);
      }
    };
    enableAudio();
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang =
        selectedAccent === "uk"
          ? "en-GB"
          : selectedAccent === "indian"
          ? "en-IN"
          : "en-US";

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setCurrentMessage(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
        toast({
          title: "Speech recognition error",
          description: "Please try again or type your message.",
          variant: "destructive",
        });
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [selectedAccent, toast]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load chat history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem("ai-tutor-history");
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setChatHistory(
          parsed.map((chat: any) => ({
            ...chat,
            createdAt: new Date(chat.createdAt),
            lastUpdated: new Date(chat.lastUpdated),
            messages: chat.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
            })),
          }))
        );
      } catch (error) {
        console.error("Failed to load chat history:", error);
      }
    }
  }, []);

  // Save chat history to localStorage
  const saveChatHistory = useCallback((history: ChatHistory[]) => {
    localStorage.setItem("ai-tutor-history", JSON.stringify(history));
  }, []);

  // Start new chat
  const startNewChat = () => {
    if (messages.length > 0) {
      const chatTitle = messages[0]?.content.slice(0, 50) + "..." || "New Chat";
      const newChat: ChatHistory = {
        id: currentChatId || Date.now().toString(),
        title: chatTitle,
        messages: [...messages],
        createdAt: new Date(),
        lastUpdated: new Date(),
      };

      const updatedHistory = [newChat, ...chatHistory];
      setChatHistory(updatedHistory);
      saveChatHistory(updatedHistory);
    }

    setMessages([]);
    setCurrentChatId(Date.now().toString());
    setCurrentMessage("");
  };

  // Load chat from history
  const loadChat = (chat: ChatHistory) => {
    setMessages(chat.messages);
    setCurrentChatId(chat.id);
    setCurrentMessage("");
  };

  // Delete chat from history
  const deleteChat = (chatId: string) => {
    const updatedHistory = chatHistory.filter((chat) => chat.id !== chatId);
    setChatHistory(updatedHistory);
    saveChatHistory(updatedHistory);

    if (currentChatId === chatId) {
      setMessages([]);
      setCurrentChatId(null);
    }
  };

  // Clear all history
  const clearAllHistory = () => {
    setChatHistory([]);
    saveChatHistory([]);
    toast({
      title: "History cleared",
      description: "All chat history has been deleted.",
    });
  };

  // Enhanced text highlighting with proper synchronization
  const highlightTextSync = useCallback(
    (text: string) => {
      const words = text.split(/\s+/).filter((word) => word.length > 0);
      setResponseWords(words);
      setCurrentWordIndex(-1);

      if (words.length === 0) return;

      const estimatedDuration = (text.length / 15) * 1000 * (1 / speechSpeed);
      const wordDuration = estimatedDuration / words.length;
      let currentIndex = 0;

      const startTime = Date.now();

      const highlightInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const expectedIndex = Math.floor(elapsed / wordDuration);

        if (expectedIndex < words.length && expectedIndex !== currentIndex) {
          setCurrentWordIndex(expectedIndex);
          currentIndex = expectedIndex;
        }

        if (expectedIndex >= words.length) {
          clearInterval(highlightInterval);
          setCurrentWordIndex(-1);
          setResponseWords([]);
        }
      }, 50);

      if (highlightTimeoutRef.current) {
        clearInterval(highlightTimeoutRef.current);
      }
      highlightTimeoutRef.current = highlightInterval;
    },
    [speechSpeed]
  );

  // Enhanced speech function with fallback to browser speech synthesis
  const speakText = async (text: any) => {
    // Ensure text is a string
    const textStr =
      typeof text === "string" ? text : text?.response || String(text) || "";
    if (!textStr.trim() || isSpeaking) return;

    setIsSpeaking(true);

    try {
      // Try OpenAI TTS first
      const ttsResponse = await fetch("/api/voice/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: textStr.slice(0, 3000),
          voice: selectedVoice,
          speed: speechSpeed,
          format: "mp3",
        }),
      });

      if (ttsResponse.ok) {
        const audioBlob = await ttsResponse.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        if (audioRef.current) {
          audioRef.current.pause();
        }

        audioRef.current = new Audio(audioUrl);

        audioRef.current.onplay = () => {
          highlightTextSync(textStr);
        };

        audioRef.current.onended = () => {
          setIsSpeaking(false);
          setCurrentWordIndex(-1);
          setResponseWords([]);
          URL.revokeObjectURL(audioUrl);
        };

        audioRef.current.onerror = () => {
          setIsSpeaking(false);
          setCurrentWordIndex(-1);
          setResponseWords([]);
          URL.revokeObjectURL(audioUrl);
        };

        await audioRef.current.play();
      } else {
        // Fallback to browser speech synthesis
        if ("speechSynthesis" in window) {
          const utterance = new SpeechSynthesisUtterance(textStr);
          utterance.rate = speechSpeed;
          utterance.volume = 1;

          // Set language based on accent
          if (selectedAccent === "uk") {
            utterance.lang = "en-GB";
          } else if (selectedAccent === "indian") {
            utterance.lang = "en-IN";
          } else {
            utterance.lang = "en-US";
          }

          utterance.onstart = () => {
            highlightTextSync(textStr);
          };

          utterance.onend = () => {
            setIsSpeaking(false);
            setCurrentWordIndex(-1);
            setResponseWords([]);
          };

          utterance.onerror = () => {
            setIsSpeaking(false);
            setCurrentWordIndex(-1);
            setResponseWords([]);
          };

          speechSynthesis.speak(utterance);
        } else {
          throw new Error("No speech synthesis available");
        }
      }
    } catch (error) {
      console.error("Speech error:", error);
      setIsSpeaking(false);
      setCurrentWordIndex(-1);
      setResponseWords([]);

      // Fallback to browser speech synthesis on error
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = speechSpeed;
        utterance.volume = 1;

        if (selectedAccent === "uk") {
          utterance.lang = "en-GB";
        } else if (selectedAccent === "indian") {
          utterance.lang = "en-IN";
        } else {
          utterance.lang = "en-US";
        }

        utterance.onend = () => {
          setIsSpeaking(false);
        };

        speechSynthesis.speak(utterance);
      } else {
        toast({
          title: "Speech Error",
          description:
            "Speech synthesis failed. Please check your internet connection.",
          variant: "destructive",
        });
      }
    }
  };

  // Stop speaking
  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (highlightTimeoutRef.current) {
      clearInterval(highlightTimeoutRef.current);
    }
    // Stop browser speech synthesis
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setCurrentWordIndex(-1);
    setResponseWords([]);
  };

  // Start voice recognition
  const startListening = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Speech recognition unavailable",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive",
      });
      return;
    }

    setIsListening(true);
    recognitionRef.current.start();
  };

  // Stop voice recognition
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  // Send message
  const sendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: currentMessage,
      timestamp: new Date(),
      subject: selectedSubject !== "all" ? selectedSubject : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setCurrentMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: currentMessage,
          subject: selectedSubject !== "all" ? selectedSubject : undefined,
          mode: tutorMode,
          modelId: selectedModel,
          context: messages
            .slice(-5)
            .map((m) => `${m.type}: ${m.content}`)
            .join("\n"),
        }),
      });

      if (!response.ok) {
        throw new Error("Chat request failed");
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: data.response,
        timestamp: new Date(),
        subject: selectedSubject !== "all" ? selectedSubject : undefined,
        model: selectedModel,
      };

      setMessages((prev) => {
        const updatedMessages = [...prev, assistantMessage];

        // Save chat history after each exchange
        if (updatedMessages.length > 0) {
          const chatTitle =
            updatedMessages[0]?.content.slice(0, 50) + "..." || "New Chat";
          const currentChat: ChatHistory = {
            id: currentChatId || Date.now().toString(),
            title: chatTitle,
            messages: updatedMessages,
            createdAt: new Date(),
            lastUpdated: new Date(),
          };

          // Update or add to history
          const updatedHistory = chatHistory.filter(
            (chat) => chat.id !== currentChat.id
          );
          updatedHistory.unshift(currentChat);
          setChatHistory(updatedHistory);
          saveChatHistory(updatedHistory);
        }

        return updatedMessages;
      });

      setTimeout(() => {
        speakText(data.response);
      }, 500);
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Chat Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Render highlighted text
  const renderHighlightedText = (text: string) => {
    if (responseWords.length === 0 || currentWordIndex === -1) {
      return <span>{text}</span>;
    }

    const words = text.split(/\s+/);
    return (
      <span>
        {words.map((word, index) => (
          <span
            key={index}
            className={
              index === currentWordIndex
                ? "bg-gradient-to-r from-yellow-200 to-amber-200 dark:from-yellow-800 dark:to-amber-800 px-1 rounded transition-all duration-300"
                : ""
            }
          >
            {word}
            {index < words.length - 1 ? " " : ""}
          </span>
        ))}
      </span>
    );
  };

  const selectedSubjectData = subjects.find((s) => s.value === selectedSubject);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-2 sm:p-4">
      {/* Background decoration - hidden on mobile for performance */}
      <div className="hidden sm:block fixed inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-200 dark:bg-blue-800 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-40 w-24 h-24 bg-purple-200 dark:bg-purple-800 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 left-40 w-28 h-28 bg-green-200 dark:bg-green-800 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Navigation Header - Responsive */}
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <Link href="/">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white order-first sm:order-none">
            AI Tutor
          </h1>
          <div className="flex gap-2">
            <Link href="/voice-study">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1.5"
              >
                <VoiceIcon className="h-4 w-4" />
                <span className="hidden md:inline">Voice Study</span>
              </Button>
            </Link>
            {/* --- NEW ASK AI BUTTON --- */}
 <Button
  onClick={() => setIsAISidebarOpen(true)}
  variant="default"
  size="sm"
  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white"
>
  <Wand2 className="h-4 w-4" />
  <span className="hidden md:inline">Ask AI</span>
</Button>
<Button
  onClick={captureSelection}
  variant="outline"
  size="sm"
  className="flex items-center gap-1.5 border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/20"
>
  <Brain className="h-4 w-4 text-blue-500" />
  <span className="hidden md:inline">Explain Selection</span>
</Button>
  {/* ------------------------- */}
            <Link href="/exams">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1.5"
              >
                <GraduationCap className="h-4 w-4" />
                <span className="hidden md:inline">Practice</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Compact Header with Chat History & Settings - Responsive */}

        {/* Main Chat Interface - Responsive */}
        <div
          className={`
    grid gap-4 sm:gap-6 transition-all duration-300
    grid-cols-1
    xl:grid-cols-12
  `}
        >
          <div
            className={`
    space-y-4 transition-all duration-300
    ${leftCollapsed ? "xl:col-span-1" : "xl:col-span-3"}
  `}
          >
            {/* Subject Selection - Compact */}
            <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 h-[600px] flex flex-col">
              {/* Header */}
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  {!leftCollapsed && "Learning Panel"}
                </CardTitle>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setLeftCollapsed(!leftCollapsed)}
                  className="h-7 w-7"
                >
                  ☰
                </Button>
              </CardHeader>

              {/* Content */}
              {!leftCollapsed ? (
                <CardContent className="flex-1 overflow-hidden p-3 pt-0 space-y-4">
                  {/* SUBJECT (Multi-select style display) */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">
                      Subject
                    </label>

                    <Select
                      value={selectedSubject}
                      onValueChange={setSelectedSubject}
                    >
                      <SelectTrigger className="min-h-9 text-xs flex flex-wrap gap-1">
                        {selectedSubjectData && selectedSubject !== "all" ? (
                          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 rounded text-blue-700 dark:text-blue-300 text-xs">
                            {selectedSubjectData.icon} {selectedSubjectData.label}
                          </span>
                        ) : (
                          <SelectValue placeholder="Select subjects" />
                        )}
                      </SelectTrigger>

                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.value} value={subject.value}>
                            <div className="flex items-center gap-2">
                              <span>{subject.icon}</span>
                              {subject.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* UNIT DROPDOWN */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">
                      Unit
                    </label>

                    <Select
                      value={selectedUnit}
                      onValueChange={setSelectedUnit}
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>

                      <SelectContent>
                        {["Unit 1", "Unit 2", "Unit 3"].map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* DIVIDER */}
                  <div className="h-px bg-gray-200 dark:bg-slate-700" />

                  {/* HISTORY (Scrollable) */}
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        History
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={startNewChat}
                        className="h-6 px-2 text-xs"
                      >
                        New
                      </Button>
                    </div>

                    <ScrollArea className="h-full pr-1">
                      <div className="space-y-1">
                        {chatHistory.map((chat) => (
                          <div
                            key={chat.id}
                            onClick={() => loadChat(chat)}
                            className={`p-2 rounded cursor-pointer transition-colors text-xs ${currentChatId === chat.id
                              ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                              : "hover:bg-gray-50 dark:hover:bg-slate-700"
                            }`}
                          >
                            <div className="truncate font-medium">
                              {chat.title}
                            </div>
                            <div className="text-muted-foreground">
                              {chat.messages.length} msgs
                            </div>
                          </div>
                        ))}

                        {chatHistory.length === 0 && (
                          <p className="text-xs text-center text-muted-foreground py-4">
                            No chats yet
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </CardContent>
              ) : (
                <CardContent className="flex flex-col items-center gap-4 py-6">
                  {[{"icon": "📘", "label": "Subject"}, {"icon": "🧩", "label": "Unit"}, {"icon": "🕘", "label": "History"}].map((item) => (
                    <div
                      key={item.label}
                      className="group relative cursor-pointer"
                    >
                      <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-slate-700">
                        {item.icon}
                      </div>

                      {/* Tooltip */}
                      <span
                        className="
          absolute left-full ml-3 top-1/2 -translate-y-1/2
          bg-black text-white text-xs px-2 py-1 rounded
          opacity-0 group-hover:opacity-100 transition
          whitespace-nowrap
        "
                      >
                        {item.label}
                      </span>
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>

            {/* AI Mode - Compact */}
            {/* <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Brain className="h-4 w-4" />
                AI Mode
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <Select value={tutorMode} onValueChange={(value: any) => setTutorMode(value)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="educational">Educational</SelectItem>
                  <SelectItem value="enhanced">Enhanced</SelectItem>
                </SelectContent>
              </Select>
              <div className="mt-2 text-xs text-muted-foreground">
                Voice: UK English, Fable
              </div>
            </CardContent>
          </Card> */}
          </div>

          {/* Voice Settings - Compact */}
          {/* <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Voice Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-3">
              <div className="text-xs p-2 bg-green-50 dark:bg-green-900/20 rounded text-green-700 dark:text-green-300 text-center">
                Auto-enabled: UK English, Fable, 0.7x speed
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span>Speed: {speechSpeed.toFixed(1)}x</span>
                  <span>Quality: {Math.round(humanization * 100)}%</span>
                </div>
                <Slider
                  value={[speechSpeed]}
                  onValueChange={(value) => setSpeechSpeed(value[0])}
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  className="w-full h-1"
                />
              </div>

              <div className="grid grid-cols-3 gap-1 text-xs">
                <div className="flex items-center gap-1">
                  <Switch 
                    checked={voiceBreathing} 
                    onCheckedChange={setVoiceBreathing}
                    className="scale-75"
                  />
                  <span>Breath</span>
                </div>
                <div className="flex items-center gap-1">
                  <Switch 
                    checked={voicePauses} 
                    onCheckedChange={setVoicePauses}
                    className="scale-75"
                  />
                  <span>Pause</span>
                </div>
                <div className="flex items-center gap-1">
                  <Switch 
                    checked={voiceEmphasis} 
                    onCheckedChange={setVoiceEmphasis}
                    className="scale-75"
                  />
                  <span>Tone</span>
                </div>
              </div>
            </CardContent>
          </Card> */}

          {/* Main Chat Area */}
      {/* Main Chat Area */}
<div
  className={`
    transition-all duration-300
    ${leftCollapsed && rightCollapsed 
      ? "xl:col-span-10" // Both collapsed: 1 + 10 + 1 = 12
      : leftCollapsed || rightCollapsed
        ? "xl:col-span-8"  // One collapsed: 1 + 8 + 3 = 12 (or 3 + 8 + 1)
        : "xl:col-span-6"  // None collapsed: 3 + 6 + 3 = 12
    }
  `}
>
            <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 h-[600px] flex flex-col">
              <CardHeader className="pb-4 border-b border-gray-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-3">
                    <Bot className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="flex items-center gap-2">
                        AI Tutor
                        <Badge variant="secondary" className="text-xs">
                          Gemma 3 12B
                        </Badge>
                      </div>
                      {selectedSubjectData && selectedSubject !== "all" && (
                        <div className="text-sm text-muted-foreground">
                          {selectedSubjectData.icon} {selectedSubjectData.label}  Specialist
                        </div>
                      )}
                    </div>
                  </CardTitle>
                  {isSpeaking && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={stopSpeaking}
                      className="text-xs"
                    >
                      <VolumeX className="h-3 w-3 mr-1" />
                      Stop
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex-1 p-4 overflow-hidden">
                <ScrollArea className="h-full pr-2">
                  <div className="space-y-4">
                    {messages.length === 0 && (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center">
                          <Bot className="h-8 w-8 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">
                          Welcome to AI Tutor!
                        </h3>
                        <p className="text-muted-foreground text-sm mb-1">
                          Ready to help you learn{" "}
                          {selectedSubjectData?.label.toLowerCase() ||
                            "any subject"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Voice responses auto-enabled with{" "}
                          {selectedAccent.toUpperCase()} accent
                        </p>
                      </div>
                    )}

                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`flex gap-3 max-w-[80%] ${message.type === "user" ? "flex-row-reverse" : "flex-row"}`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.type === "user" ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-slate-700"}`}
                          >
                            {message.type === "user" ? (
                              <User className="h-4 w-4" />
                            ) : (
                              <Bot className="h-4 w-4" />
                            )}
                          </div>
                          <div
                            className={`rounded-lg p-3 ${message.type === "user" ? "bg-blue-600 text-white" : "bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600"}`}
                          >
                            <div className="text-sm">
                              {message.type === "assistant" &&
                              isSpeaking &&
                              messages[messages.length - 1]?.id ===
                                message.id ? (
                                renderHighlightedText(message.content)
                              ) : (
                                <span>{message.content}</span>
                              )}
                            </div>
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/20 dark:border-slate-500/20">
                              <div className="text-xs opacity-70">
                                {message.timestamp.toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                              {message.type === "assistant" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => speakText(message.content)}
                                  disabled={isSpeaking}
                                  className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                                >
                                  {isSpeaking &&
                                  messages[messages.length - 1]?.id ===
                                    message.id ? (
                                    <Pause className="h-3 w-3" />
                                  ) : (
                                    <Play className="h-3 w-3" />
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {isLoading && (
                      <div className="flex gap-3 justify-start">
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3 border border-gray-200 dark:border-slate-600">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                              <div
                                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                                style={{ animationDelay: "0.2s" }}
                              ></div>
                              <div
                                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                                style={{ animationDelay: "0.4s" }}
                              ></div>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              AI is thinking...
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div ref={messagesEndRef} />
                </ScrollArea>
              </CardContent>

              {/* Input Area */}
              <div className="border-t border-gray-200 dark:border-slate-700 p-4">
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Textarea
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        placeholder={`Ask anything about ${selectedSubjectData?.label.toLowerCase() || "any subject"}...`}
                        className="min-h-[60px] pr-20 resize-none text-sm"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                      />
                      <div className="absolute right-2 bottom-2 flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={isListening ? stopListening : startListening}
                          disabled={!("webkitSpeechRecognition" in window)}
                          className={`h-8 w-8 p-0 ${isListening ? "bg-red-500 text-white hover:bg-red-600" : "hover:bg-gray-100 dark:hover:bg-slate-700"}`}
                        >
                          {isListening ? (
                            <MicOff className="h-3 w-3" />
                          ) : (
                            <Mic className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          onClick={sendMessage}
                          disabled={!currentMessage.trim() || isLoading}
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Send className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {isListening && (
                    <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span>Listening... Speak now</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
    <div className={`transition-all duration-300 ${rightCollapsed ? "xl:col-span-1" : "xl:col-span-3"} flex justify-end`}>
  <Card
    className={`
      h-[600px] flex flex-col
      transition-all duration-300 ease-in-out
      ${rightCollapsed ? "w-16" : "w-full"}
    `}
  >
  
    {/* Header */}
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">

      <CardTitle className="text-sm font-semibold flex items-center gap-2">
        <History className="h-4 w-4" />
        {!rightCollapsed && "Studio"}
      </CardTitle>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => setRightCollapsed(!rightCollapsed)}
        className="h-7 w-7"
      >
        ☰
      </Button>
    </CardHeader>

    {/* Content */}
    <CardContent className="flex-1 flex items-center justify-center p-4">
      {!rightCollapsed ? (
        <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
          <Button variant="outline" className="h-20 flex flex-col gap-2 text-xs" onClick={() => setLocation('/studio/quiz')}>
            <ClipboardList className="h-5 w-5 text-blue-600" />
            Quiz
          </Button>
          <Button variant="outline" className="h-20 flex flex-col gap-2 text-xs" onClick={() => setLocation('/studio/quiz-bank')}>
            <Database className="h-5 w-5 text-purple-600" />
            Quiz Bank
          </Button>
          <Button variant="outline" className="h-20 flex flex-col gap-2 text-xs" onClick={() => setLocation('/studio/test-prep')}>
            <BookCheck className="h-5 w-5 text-green-600" />
            Test Prep
          </Button>
          <Button variant="outline" className="h-20 flex flex-col gap-2 text-xs" onClick={() => setLocation('/studio/qa')}>
            <HelpCircle className="h-5 w-5 text-orange-600" />
            Q&A
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {[ClipboardList, Database, BookCheck, HelpCircle].map((Icon, i) => (
            <div key={i} className="relative group">
              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
                <Icon className="h-4 w-4" />
              </div>

              <span
                className="
                  absolute right-full mr-3
                  bg-black text-white text-xs px-2 py-1 rounded
                  opacity-0 group-hover:opacity-100 transition
                  whitespace-nowrap
                "
              >
                {["Quiz", "Quiz Bank", "Test Prep", "Q&A"][i]}
              </span>
            </div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
</div>


            
        </div>
      </div>
      {/* SLIDING AI SIDEBAR */}
{/* INDEPENDENT SIDEBAR CHATBOT */}
<div className={`fixed inset-0 z-50 transition-all duration-300 ${isAISidebarOpen ? "visible" : "invisible"}`}>
  {/* Backdrop */}
  <div 
    className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isAISidebarOpen ? "opacity-100" : "opacity-0"}`}
    onClick={() => setIsAISidebarOpen(false)}
  />

  {/* Sidebar Panel */}
  <div className={`absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl transform transition-transform duration-500 ease-out border-l border-gray-200 dark:border-slate-800 ${isAISidebarOpen ? "translate-x-0" : "translate-x-full"}`}>
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 z-10">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-sm">Quick AI Helper</h2>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] text-muted-foreground">Ready to help</span>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsAISidebarOpen(false)}>
           <span className="text-xl">×</span>
        </Button>
      </div>
{/* Context Preview in Sidebar */}
{selectedContext && (
  <div className="mx-4 mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-lg relative">
    <p className="text-[10px] font-bold text-amber-800 dark:text-amber-400 uppercase">Context Selection:</p>
    <p className="text-[11px] italic line-clamp-2 opacity-80">"{selectedContext}"</p>
    <button 
      onClick={() => setSelectedContext("")}
      className="absolute top-1 right-1 text-amber-800 dark:text-amber-400 hover:scale-110"
    >
      <Trash2 className="h-3 w-3" />
    </button>
  </div>
)}
      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4 bg-gray-50/50 dark:bg-slate-950/50">
        <div className="space-y-4">
          {sidebarMessages.length === 0 && (
            <div className="text-center py-10 opacity-60">
              <Sparkles className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <p className="text-xs">Ask me anything! I can find answers while you stay on your current lesson.</p>
            </div>
          )}
         {sidebarMessages.map((msg) => (
  <div key={msg.id} className={`flex flex-col ${msg.type === "user" ? "items-end" : "items-start"}`}>
    <div className={`max-w-[85%] p-3 rounded-2xl text-xs relative group ${msg.type === "user" 
      ? "bg-blue-600 text-white rounded-tr-none" 
      : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-tl-none shadow-sm"}`}>
      {msg.content}
      
      {/* EXPORT BUTTON - Only shows for Assistant and on Hover */}
      {msg.type === "assistant" && (
        <button
          onClick={() => {
            const exportedMsg: ChatMessage = {
              ...msg,
              id: Date.now().toString(),
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, exportedMsg]);
            toast({
              title: "Exported to Chat",
              description: "This answer has been added to your main study session.",
            });
          }}
          className="absolute -right-8 top-0 p-1.5 bg-white dark:bg-slate-800 rounded-full border border-gray-200 dark:border-slate-700 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:text-blue-600"
          title="Add to main chat"
        >
          <Zap className="h-3 w-3" />
        </button>
      )}
    </div>
    <span className="text-[9px] opacity-40 mt-1 px-1">
      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    </span>
  </div>
))}
          {isSidebarLoading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-gray-200 dark:border-slate-700">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            </div>
          )}
          <div ref={sidebarEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="relative flex items-end gap-2">
          <Textarea 
            placeholder="Search for an answer..."
            value={sidebarQuestion}
            onChange={(e) => setSidebarQuestion(e.target.value)}
            className="min-h-[45px] max-h-[120px] resize-none text-xs rounded-xl"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendSidebarMessage();
              }
            }}
          />
          <Button 
            size="icon" 
            className="h-10 w-10 rounded-xl bg-blue-600 hover:bg-blue-700 shrink-0"
            onClick={sendSidebarMessage}
            disabled={isSidebarLoading || !sidebarQuestion.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  </div>
</div>
    </div>

    
  );
}
