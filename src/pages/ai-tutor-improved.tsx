import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
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
  Pause
} from "lucide-react";
import { useToast } from "../hooks/use-toast";

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
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

export default function AITutorImproved() {
  const { toast } = useToast();
  
  // Core states
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [tutorMode, setTutorMode] = useState<'basic' | 'educational' | 'enhanced'>('enhanced');
  const [selectedModel, setSelectedModel] = useState<string>('google/gemma-3-12b-it');
  
  // Chat states
  const [currentMessage, setCurrentMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Voice states - auto-enabled with UK English defaults
  const [selectedAccent, setSelectedAccent] = useState<'us' | 'uk' | 'indian'>('uk');
  const [selectedVoice, setSelectedVoice] = useState<string>('fable');
  const [speechSpeed, setSpeechSpeed] = useState(0.7);
  const [humanization, setHumanization] = useState(1);
  const [voiceBreathing, setVoiceBreathing] = useState(true);
  const [voicePauses, setVoicePauses] = useState(true);
  const [voiceEmphasis, setVoiceEmphasis] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Text highlighting states
  const [highlightedText, setHighlightedText] = useState("");
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [responseWords, setResponseWords] = useState<string[]>([]);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Subject options
  const subjects = [
    { value: "all", label: "All Subjects" },
    { value: "mathematics", label: "Mathematics" },
    { value: "physics", label: "Physics" },
    { value: "chemistry", label: "Chemistry" },
    { value: "biology", label: "Biology" },
    { value: "english", label: "English" },
    { value: "history", label: "History" },
    { value: "geography", label: "Geography" },
    { value: "computer_science", label: "Computer Science" }
  ];

  // Voice models
  const voiceModels = [
    { value: "fable", label: "Fable (Professional)" },
    { value: "alloy", label: "Alloy (Conversational)" },
    { value: "echo", label: "Echo (Warm)" },
    { value: "nova", label: "Nova (Clear)" }
  ];

  // Auto-enable audio on component mount
  useEffect(() => {
    const enableAudio = async () => {
      try {
        // Create a dummy audio context to enable audio
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
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
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = selectedAccent === 'uk' ? 'en-GB' : selectedAccent === 'indian' ? 'en-IN' : 'en-US';
      
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
          variant: "destructive"
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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load chat history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('ai-tutor-history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setChatHistory(parsed.map((chat: any) => ({
          ...chat,
          createdAt: new Date(chat.createdAt),
          lastUpdated: new Date(chat.lastUpdated),
          messages: chat.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        })));
      } catch (error) {
        console.error("Failed to load chat history:", error);
      }
    }
  }, []);

  // Save chat history to localStorage
  const saveChatHistory = useCallback((history: ChatHistory[]) => {
    localStorage.setItem('ai-tutor-history', JSON.stringify(history));
  }, []);

  // Start new chat
  const startNewChat = () => {
    if (messages.length > 0) {
      // Save current chat if it has messages
      const chatTitle = messages[0]?.content.slice(0, 50) + "..." || "New Chat";
      const newChat: ChatHistory = {
        id: currentChatId || Date.now().toString(),
        title: chatTitle,
        messages: [...messages],
        createdAt: new Date(),
        lastUpdated: new Date()
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
    const updatedHistory = chatHistory.filter(chat => chat.id !== chatId);
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
      description: "All chat history has been deleted."
    });
  };

  // Enhanced text highlighting with proper synchronization
  const highlightTextSync = useCallback((text: string) => {
    const words = text.split(/\s+/).filter(word => word.length > 0);
    setResponseWords(words);
    setCurrentWordIndex(-1);
    
    if (words.length === 0) return;

    // Estimate timing based on speech speed and text length
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
    }, 50); // Check every 50ms for smoother highlighting
    
    // Store interval reference for cleanup
    if (highlightTimeoutRef.current) {
      clearInterval(highlightTimeoutRef.current);
    }
    highlightTimeoutRef.current = highlightInterval;
  }, [speechSpeed]);

  // Enhanced speech function with proper highlighting sync
  const speakText = async (text: string) => {
    if (!text.trim() || isSpeaking) return;
    
    setIsSpeaking(true);
    
    try {
      const ttsResponse = await fetch('/api/voice/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.slice(0, 3000), // Limit text length
          voice: selectedVoice,
          speed: speechSpeed,
          accent: selectedAccent,
          humanization,
          breathing: voiceBreathing,
          pauses: voicePauses,
          emphasis: voiceEmphasis
        })
      });

      if (!ttsResponse.ok) {
        throw new Error('TTS request failed');
      }

      const audioBlob = await ttsResponse.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      audioRef.current = new Audio(audioUrl);
      
      // Calculate speech duration for highlighting
      const estimatedDuration = (text.length / 15) * 1000 * (1 / speechSpeed); // Rough estimation
      
      audioRef.current.onplay = () => {
        highlightTextSync(text);
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
      
    } catch (error) {
      console.error('Speech error:', error);
      setIsSpeaking(false);
      setCurrentWordIndex(-1);
      setResponseWords([]);
      toast({
        title: "Speech Error",
        description: "Failed to generate speech. Please try again.",
        variant: "destructive"
      });
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
        variant: "destructive"
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
      type: 'user',
      content: currentMessage,
      timestamp: new Date(),
      subject: selectedSubject !== 'all' ? selectedSubject : undefined
    };
    
    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage("");
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentMessage,
          subject: selectedSubject !== 'all' ? selectedSubject : undefined,
          mode: tutorMode,
          modelId: selectedModel,
          context: messages.slice(-5).map(m => `${m.type}: ${m.content}`).join('\n')
        })
      });
      
      if (!response.ok) {
        throw new Error('Chat request failed');
      }
      
      const data = await response.json();
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.response,
        timestamp: new Date(),
        subject: selectedSubject !== 'all' ? selectedSubject : undefined,
        model: selectedModel
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Auto-speak the response
      setTimeout(() => {
        speakText(data.response);
      }, 500);
      
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Chat Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive"
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
            className={index === currentWordIndex ? 'bg-yellow-200 dark:bg-yellow-800 px-1 rounded' : ''}
          >
            {word}{index < words.length - 1 ? ' ' : ''}
          </span>
        ))}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Chat History Sidebar */}
        <div className="lg:col-span-1">
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-5 w-5 text-blue-600" />
                Chat History
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={startNewChat}
                  className="flex-1"
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  New Chat
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllHistory}
                  disabled={chatHistory.length === 0}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {chatHistory.map((chat) => (
                    <div
                      key={chat.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        currentChatId === chat.id 
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => loadChat(chat)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium truncate">
                            {chat.title}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {chat.messages.length} messages
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {chat.lastUpdated.toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteChat(chat.id);
                          }}
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {chatHistory.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No chat history yet</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Settings Panel */}
        <div className="lg:col-span-1 space-y-4">
          {/* Subject & Mode Selection */}
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-green-600" />
                Learning Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.value} value={subject.value}>
                        {subject.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tutor Mode</label>
                <Select value={tutorMode} onValueChange={(value: any) => setTutorMode(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="educational">Educational</SelectItem>
                    <SelectItem value="enhanced">Enhanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Voice Settings */}
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Volume2 className="h-5 w-5 text-purple-600" />
                Voice Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Auto-enabled voice info */}
              <div className="text-xs text-muted-foreground p-2 bg-green-50 dark:bg-green-900/20 rounded">
                ✓ Voice responses automatically enabled
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Accent</label>
                <Select value={selectedAccent} onValueChange={(value: any) => setSelectedAccent(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="uk">UK English</SelectItem>
                    <SelectItem value="us">US English</SelectItem>
                    <SelectItem value="indian">Indian English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Voice Model</label>
                <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {voiceModels.map((voice) => (
                      <SelectItem key={voice.value} value={voice.value}>
                        {voice.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Speech Speed: {speechSpeed.toFixed(1)}x
                </label>
                <Slider
                  value={[speechSpeed]}
                  onValueChange={(value) => setSpeechSpeed(value[0])}
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Human-like Speech: {Math.round(humanization * 100)}%
                </label>
                <Slider
                  value={[humanization]}
                  onValueChange={(value) => setHumanization(value[0])}
                  min={0}
                  max={1}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Natural Breathing</span>
                  <Switch 
                    checked={voiceBreathing} 
                    onCheckedChange={setVoiceBreathing}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Smart Pauses</span>
                  <Switch 
                    checked={voicePauses} 
                    onCheckedChange={setVoicePauses}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Emphasis & Tone</span>
                  <Switch 
                    checked={voiceEmphasis} 
                    onCheckedChange={setVoiceEmphasis}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5 text-gray-600" />
                Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>AI Model:</span>
                <Badge variant="default">
                  Gemma 3 12B
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Voice System:</span>
                <Badge variant="default">
                  {selectedAccent.toUpperCase()} Accent
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Speech Recognition:</span>
                <Badge variant={'webkitSpeechRecognition' in window ? "default" : "secondary"}>
                  {('webkitSpeechRecognition' in window) ? 'Available' : 'Unavailable'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Chat Area */}
        <div className="lg:col-span-2 flex flex-col">
          <div className="flex-1 grid grid-rows-[1fr_auto] gap-4">
            {/* Chat Messages */}
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Bot className="h-6 w-6 text-blue-600" />
                    AI Tutor Chat
                    {selectedSubject !== 'all' && (
                      <Badge variant="outline" className="ml-2">
                        {subjects.find(s => s.value === selectedSubject)?.label}
                      </Badge>
                    )}
                  </CardTitle>
                  {isSpeaking && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={stopSpeaking}
                      className="text-red-600 hover:text-red-800"
                    >
                      <VolumeX className="h-4 w-4 mr-1" />
                      Stop Speaking
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96 pr-4">
                  <div className="space-y-4">
                    {messages.length === 0 && (
                      <div className="text-center text-muted-foreground py-8">
                        <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold mb-2">Welcome to AI Tutor!</h3>
                        <p className="text-sm">
                          Ask me anything about {selectedSubject === 'all' ? 'any subject' : subjects.find(s => s.value === selectedSubject)?.label}.
                        </p>
                        <p className="text-xs mt-2">
                          Voice responses are automatically enabled with {selectedAccent.toUpperCase()} accent.
                        </p>
                      </div>
                    )}
                    
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex gap-3 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            message.type === 'user' 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-green-600 text-white'
                          }`}>
                            {message.type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                          </div>
                          <div className={`rounded-lg p-3 ${
                            message.type === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-700'
                          }`}>
                            <div className="prose prose-sm max-w-none dark:prose-invert">
                              {message.type === 'assistant' && isSpeaking && messages[messages.length - 1]?.id === message.id 
                                ? renderHighlightedText(message.content)
                                : <span>{message.content}</span>
                              }
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <div className="text-xs opacity-70">
                                {message.timestamp.toLocaleTimeString()}
                                {message.subject && (
                                  <span className="ml-2">• {subjects.find(s => s.value === message.subject)?.label}</span>
                                )}
                              </div>
                              {message.type === 'assistant' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => speakText(message.content)}
                                  disabled={isSpeaking}
                                  className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                                >
                                  {isSpeaking && messages[messages.length - 1]?.id === message.id 
                                    ? <Pause className="h-3 w-3" />
                                    : <Play className="h-3 w-3" />
                                  }
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {isLoading && (
                      <div className="flex gap-3 justify-start">
                        <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center flex-shrink-0">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                            <span className="text-sm text-muted-foreground ml-2">AI is thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div ref={messagesEndRef} />
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Input Area */}
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Textarea
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        placeholder={`Ask anything about ${selectedSubject === 'all' ? 'any subject' : subjects.find(s => s.value === selectedSubject)?.label}...`}
                        className="min-h-[60px] pr-20"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
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
                          disabled={!('webkitSpeechRecognition' in window)}
                          className={`h-8 w-8 p-0 ${isListening ? 'text-red-600' : 'text-gray-600'}`}
                        >
                          {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                        </Button>
                        <Button
                          onClick={sendMessage}
                          disabled={!currentMessage.trim() || isLoading}
                          className="h-8 w-8 p-0"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {isListening && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      Listening... Speak now
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}