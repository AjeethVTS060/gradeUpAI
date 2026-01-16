import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useToast } from "../hooks/use-toast";
import { mockSubjects, mockUnits } from "../lib/mockData"; // Import mock data
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { ScrollArea } from "../components/ui/scroll-area";
import { Badge } from "../components/ui/badge";
import { Textarea } from "../components/ui/textarea";
import { useIsMobile } from "../hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../components/ui/sheet";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "../components/ui/resizable";
import { ImperativePanelGroupHandle, ImperativePanelHandle } from "react-resizable-panels";
import FunnyLoader from "../components/ui/FunnyLoader";
import {
  ArrowLeft,
  BookOpen,
  Bot,
  Brain,
  GraduationCap,
  History,
  Mic,
  MicOff,
  Pause,
  Play,
  Send,
  User,
  VolumeX,
  Wand2,
  BookCheck,
  ClipboardList,
  Database,
  HelpCircle,
  Trash2,
  Sparkles,
  Zap,
  Speech,
  PanelLeftClose,
  PanelRightClose,
  PanelLeftOpen,
  PanelRightOpen,
  Menu,
} from "lucide-react";


interface ChatMessage {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  subject?: string;
  unit?: string; // Add unit to ChatMessage interface
}

export interface ChatHistory {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  lastUpdated: Date;
}

// Map mockSubjects to the desired format with icons and colors
const formattedSubjects = [
  {
    value: "all",
    label: "All Subjects",
    icon: "🎯",
    color: "bg-gradient-to-r from-purple-500 to-pink-500",
  },
  ...mockSubjects.map((subject) => {
    let icon = "📚"; // Default icon
    let color = "bg-gradient-to-r from-gray-500 to-gray-600"; // Default color

    switch (subject.name.toLowerCase()) {
      case "mathematics":
        icon = "🔢";
        color = "bg-gradient-to-r from-blue-500 to-cyan-500";
        break;
      case "physics":
        icon = "⚛️";
        color = "bg-gradient-to-r from-green-500 to-teal-500";
        break;
      case "chemistry":
        icon = "🧪";
        color = "bg-gradient-to-r from-red-500 to-orange-500";
        break;
      case "biology":
        icon = "🧬";
        color = "bg-gradient-to-r from-emerald-500 to-green-500";
        break;
      case "english literature":
        icon = "📚";
        color = "bg-gradient-to-r from-indigo-500 to-purple-500";
        break;
      case "history":
        icon = "🏛️";
        color = "bg-gradient-to-r from-amber-500 to-yellow-500";
        break;
      case "computer science":
        icon = "💻";
        color = "bg-gradient-to-r from-slate-500 to-gray-500";
        break;
      // Add more cases for other subjects if needed
    }

    return {
      value: subject.name.toLowerCase().replace(/\s/g, "_"),
      label: subject.name,
      icon,
      color,
      id: subject.id, // Add the id here
    };
  }),
];

export default function AITutorModern() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const panelGroupRef = useRef<ImperativePanelGroupHandle>(null);
  const leftPanelRef = useRef<ImperativePanelHandle>(null);
  const rightPanelRef = useRef<ImperativePanelHandle>(null);

  const toggleLeftPanel = () => {
    if (leftPanelRef.current) {
      if (leftPanelRef.current.isCollapsed()) {
        leftPanelRef.current.expand();
      } else {
        leftPanelRef.current.collapse();
      }
    }
  };

  const toggleRightPanel = () => {
    if (rightPanelRef.current) {
      if (rightPanelRef.current.isCollapsed()) {
        rightPanelRef.current.expand();
      } else {
        rightPanelRef.current.collapse();
      }
    }
  };


  // Core states
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [availableUnits, setAvailableUnits] = useState<
    { id: number; name: string }[]
  >([]);

  // Chat states
  const [currentMessage, setCurrentMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);

  // Voice states - auto-enabled with UK English defaults
  const [selectedAccent, setSelectedAccent] = useState<"us" | "uk" | "indian">
    ("uk");
  const [speechSpeed, setSpeechSpeed] = useState(0.7);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedContext, setSelectedContext] = useState("");
  // const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [unitSummary, setUnitSummary] = useState(""); // New state for unit summary

  // Effect to update available units based on selected subject
  useEffect(() => {
    if (selectedSubject && selectedSubject !== "all") {
      const subjectId = formattedSubjects.find(s => s.value === selectedSubject)?.id;
      if (subjectId) {
        setAvailableUnits(mockUnits[subjectId.toString()] || []);
      } else {
        setAvailableUnits([]);
      }
    } else {
      setAvailableUnits([]);
    }
    setSelectedUnit(""); // Reset unit when subject changes
  }, [selectedSubject]);
  // Effect to generate unit summary when selectedUnit changes
  useEffect(() => {
    if (selectedUnit && selectedSubject && selectedSubject !== "all") {
      setIsLoading(true);
      const summaryMessage: ChatMessage = {
        id: Date.now().toString(),
        type: "assistant",
        content: `Generating summary for ${selectedUnit} in ${formattedSubjects.find(s => s.value === selectedSubject)?.label}...`,
        timestamp: new Date(),
        subject: selectedSubject,
        unit: selectedUnit,
      };
      setMessages((prev) => [...prev, summaryMessage]);

      setTimeout(() => {
        const generatedSummary = `Here's a concise summary of **${selectedUnit}** in **${formattedSubjects.find(s => s.value === selectedSubject)?.label}**: This unit covers the fundamental concepts of ${selectedUnit}, including its key definitions, historical context, and practical applications. It aims to provide a solid understanding of ${selectedUnit}'s core principles and how they relate to the broader subject of ${formattedSubjects.find(s => s.value === selectedSubject)?.label}. Key takeaways include [insert a few key concepts related to unit and subject].`;

        setUnitSummary(generatedSummary); // Store the summary
        const assistantSummaryMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            type: "assistant",
            content: generatedSummary,
            timestamp: new Date(),
            subject: selectedSubject,
            unit: selectedUnit,
        };
        setMessages((prev) => [...prev.filter(msg => msg.id !== summaryMessage.id), assistantSummaryMessage]); // Replace loading message
        setIsLoading(false);
      }, 1500); // Simulate network delay
    }
  }, [selectedUnit, selectedSubject, formattedSubjects]);

  // Effect to store selected subject in localStorage
  useEffect(() => {
    localStorage.setItem("ai-tutor-selected-subject", selectedSubject);
  }, [selectedSubject]);

  // Effect to store selected unit in localStorage
  useEffect(() => {
    localStorage.setItem("ai-tutor-selected-unit", selectedUnit);
  }, [selectedUnit]);


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
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Subject options with modern icons
  const subjects = formattedSubjects;

  // Auto-enable audio on component mount
  useEffect(() => {
    const enableAudio = async () => {
      try {
        const audioContext = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
        await audioContext.resume();
        // console.log("Audio automatically enabled");
      } catch (error) {
        // console.log("Audio auto-enable failed:", error);
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
        // console.error("Failed to load chat history:", error);
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
      // console.error("Speech error:", error);
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
          unit: selectedUnit || undefined, // Include selectedUnit in the payload
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
      // console.error("Chat error:", error);
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

  const leftPanelContent = (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{!isLeftPanelCollapsed && "Learning Panel"}</CardTitle>
        <Button variant="ghost" size="icon" onClick={toggleLeftPanel} className="hidden sm:flex">
          <Menu className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLeftPanelCollapsed && !isMobile ? (
          <div className="flex flex-col items-center gap-4">
            <BookOpen className="h-6 w-6" />
            <ClipboardList className="h-6 w-6" />
            <Database className="h-6 w-6" />
            <History className="h-6 w-6" />
          </div>
        ) : (
          <>
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
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Unit
              </label>
              <Select
                value={selectedUnit}
                onValueChange={setSelectedUnit}
                disabled={selectedSubject === "all" || availableUnits.length === 0}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {availableUnits.map((unit) => (
                    <SelectItem key={unit.id} value={unit.name}>
                      {unit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="h-px bg-gray-200 dark:bg-slate-700" />
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
                      onClick={() => {
                        loadChat(chat);
                        if (isMobile) setIsLeftPanelOpen(false);
                      }}
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
          </>
        )}
      </CardContent>
    </Card>
  );

  const rightPanelContent = (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          {!isRightPanelCollapsed && "Studio"}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={toggleRightPanel} className="hidden sm:flex">
          <Menu className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center p-4">
        {isRightPanelCollapsed && !isMobile ? (
          <div className="flex flex-col items-center gap-4">
            <ClipboardList className="h-6 w-6 text-blue-600" />
            <Database className="h-6 w-6 text-purple-600" />
            <BookCheck className="h-6 w-6 text-green-600" />
            <HelpCircle className="h-6 w-6 text-orange-600" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
            <Button variant="outline" className="h-20 flex flex-col gap-2 text-xs" onClick={() => { setLocation('/studio/quiz'); if (isMobile) setIsRightPanelOpen(false); }}>
              <ClipboardList className="h-5 w-5 text-blue-600" />
              Quiz
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2 text-xs" onClick={() => { setLocation('/studio/quiz-bank'); if (isMobile) setIsRightPanelOpen(false); }}>
              <Database className="h-5 w-5 text-purple-600" />
              Quiz Bank
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2 text-xs" onClick={() => { setLocation('/preparation-exam'); if (isMobile) setIsRightPanelOpen(false); }}>
              <BookCheck className="h-5 w-5 text-green-600" />
              Test Prep
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2 text-xs" onClick={() => { setLocation('/studio/qa'); if (isMobile) setIsRightPanelOpen(false); }}>
              <HelpCircle className="h-5 w-5 text-orange-600" />
              Q&A
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
  
  const mainPanelContent = (
      <Card className="h-full flex flex-col">
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
  );

  return (
    <div className="h-screen bg-gray-50 dark:bg-slate-900 p-2 sm:p-4 flex flex-col">
      {/* Background decoration - hidden on mobile for performance */}
      <div className="hidden sm:block fixed inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-200 dark:bg-blue-800 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-40 w-24 h-24 bg-purple-200 dark:bg-purple-800 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 left-40 w-28 h-28 bg-green-200 dark:bg-green-800 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative w-full flex flex-col flex-1">
        {/* Navigation Header - Responsive */}
        <div className="mb-4 sm:mb-6 flex flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Link href="/dashboard">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            </Link>
            <Button variant="outline" size="icon" className="sm:hidden" onClick={() => setIsLeftPanelOpen(true)}>
              <Menu className="h-4 w-4" />
            </Button>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            AI Tutor
          </h1>
          <div className="flex items-center gap-2">
            <Link href="/voice-study">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1.5"
              >
                <Speech className="h-4 w-4" />
                <span className="hidden md:inline">Voice Study</span>
              </Button>
            </Link>
            <Button
              onClick={() => setIsAISidebarOpen(true)}
              variant="default"
              size="sm"
              className="hidden sm:flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Wand2 className="h-4 w-4" />
              <span className="hidden md:inline">Ask AI</span>
            </Button>
            <Button
              onClick={captureSelection}
              variant="outline"
              size="sm"
              className="hidden sm:flex items-center gap-1.5 border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              <Brain className="h-4 w-4 text-blue-500" />
              <span className="hidden md:inline">Explain</span>
            </Button>
            <Link href="/exams">
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex items-center gap-1.5"
              >
                <GraduationCap className="h-4 w-4" />
                <span className="hidden md:inline">Practice</span>
              </Button>
            </Link>
            <Button variant="outline" size="icon" className="sm:hidden" onClick={() => setIsRightPanelOpen(true)}>
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {isMobile ? (
          <div className="flex-1 flex flex-col min-h-0">
            {mainPanelContent}
            <Sheet open={isLeftPanelOpen} onOpenChange={setIsLeftPanelOpen}>
              <SheetContent side="left" className="p-0 w-full max-w-md">
                {leftPanelContent}
              </SheetContent>
            </Sheet>
            <Sheet open={isRightPanelOpen} onOpenChange={setIsRightPanelOpen}>
              <SheetContent side="right" className="p-0 w-full max-w-md">
                {rightPanelContent}
              </SheetContent>
            </Sheet>
          </div>
        ) : (
          <ResizablePanelGroup direction="horizontal" className="flex-1" ref={panelGroupRef}>
            <ResizablePanel
              id="left-panel"
              ref={leftPanelRef}
              defaultSize={20}
              collapsedSize={4}
              collapsible
              minSize={15}
              onCollapse={() => setIsLeftPanelCollapsed(true)}
              onExpand={() => setIsLeftPanelCollapsed(false)}
              className={`transition-all duration-300`}
            >
              {leftPanelContent}
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={60} minSize={30}>
              {mainPanelContent}
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel
              id="right-panel"
              ref={rightPanelRef}
              defaultSize={20}
              collapsedSize={4}
              collapsible
              minSize={15}
              onCollapse={() => setIsRightPanelCollapsed(true)}
              onExpand={() => setIsRightPanelCollapsed(false)}
              className={`transition-all duration-300`}
            >
              {rightPanelContent}
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>
    </div>
  );
}
