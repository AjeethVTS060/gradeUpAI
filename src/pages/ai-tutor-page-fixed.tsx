import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "../hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Slider } from "../components/ui/slider";
import { Switch } from "../components/ui/switch";
import { 
  Bot, 
  Send, 
  Loader2, 
  Mic, 
  MicOff,
  Volume2,
  VolumeX,
  Calculator,
  BookOpen,
  Brain,
  Zap,
  Settings,
  Trash2,
  User,
  Copy,
  RotateCcw,
  Globe
} from "lucide-react";
import Navigation from "../components/navigation";
import { apiRequest } from "../lib/queryClient";
import { cn } from "../lib/utils";

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  subject?: string;
}

const subjects = [
  { name: "Mathematics", icon: Calculator, color: "bg-blue-500" },
  { name: "Physics", icon: BookOpen, color: "bg-green-500" },
  { name: "Chemistry", icon: BookOpen, color: "bg-purple-500" },
  { name: "Biology", icon: BookOpen, color: "bg-emerald-500" },
  { name: "History", icon: BookOpen, color: "bg-red-500" },
  { name: "Literature", icon: BookOpen, color: "bg-orange-500" },
];

const quickQuestions = [
  "Solve: 2x² + 5x - 3 = 0",
  "Explain photosynthesis",
  "What caused World War I?",
  "Help with essay writing",
  "Explain gravity",
  "Solve algebra problems"
];

const accentOptions = [
  { value: 'us', label: 'US English', flag: '🇺🇸' },
  { value: 'uk', label: 'UK English', flag: '🇬🇧' },
  { value: 'indian', label: 'Indian English', flag: '🇮🇳' }
];

export default function AITutorPage() {
  const { user } = useAuth();
  const [currentRole, setCurrentRole] = useState<string>("student");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m your AI tutor with enhanced voice capabilities. I can help you learn any subject with natural speech in different accents. What would you like to study today?',
      timestamp: new Date()
    }
  ]);
  
  // Core states
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [tutorMode, setTutorMode] = useState<'basic' | 'educational' | 'enhanced'>('enhanced');
  
  // Enhanced Voice states
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [speechSpeed, setSpeechSpeed] = useState<number>(0.9);
  const [selectedVoice, setSelectedVoice] = useState<string>('openai-alloy');
  const [selectedAccent, setSelectedAccent] = useState<'us' | 'uk' | 'indian'>('us');
  const [humanization, setHumanization] = useState<number>(0.7);
  const [voiceBreathing, setVoiceBreathing] = useState(true);
  const [voicePauses, setVoicePauses] = useState(true);
  const [voiceEmphasis, setVoiceEmphasis] = useState(true);
  
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Queries
  const { data: tutorStatus } = useQuery({
    queryKey: ["/api/chat/status"],
    refetchInterval: 30000,
  });

  const { data: voiceModels } = useQuery({
    queryKey: ["/api/voice/models"],
    staleTime: 300000,
  });

  // Chat mutation
  const chatMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      const context = selectedSubject ? `Subject: ${selectedSubject}. ` : '';
      const res = await apiRequest("POST", "/api/chat", { 
        message: userMessage,
        context: context,
        mode: tutorMode,
        subject: selectedSubject
      });
      return await res.json();
    },
    onSuccess: (data) => {
      const aiMessage = {
        id: Date.now().toString(),
        type: 'ai' as const,
        content: data.response,
        timestamp: new Date(),
        subject: selectedSubject
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Auto-speak AI responses if voice is enabled
      if (voiceEnabled) {
        setTimeout(() => speakText(data.response), 100);
      }
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

  // Enhanced Speech synthesis with accent support
  const speakText = async (text: string) => {
    if (!text || isSpeaking || !voiceEnabled) return;
    
    try {
      setIsSpeaking(true);
      
      const cleanText = text
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/#{1,6}\s/g, '')
        .replace(/```[\s\S]*?```/g, '[code block]')
        .replace(/`([^`]+)`/g, '$1')
        .trim();

      // Use enhanced TTS API with accent and humanization support
      try {
        const response = await apiRequest("POST", "/api/voice/enhanced-tts", {
          text: cleanText,
          accent: selectedAccent,
          model: selectedVoice,
          speed: speechSpeed,
          humanization: humanization,
          breathing: voiceBreathing,
          pauses: voicePauses,
          emphasis: voiceEmphasis
        });
        
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        
        audio.onerror = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        
        await audio.play();
        
      } catch (enhancedError) {
        // console.log('Enhanced TTS failed, using browser speech synthesis');
        
        // Fallback to browser speech synthesis
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(cleanText);
          const voices = speechSynthesis.getVoices();
          utterance.voice = voices.find(voice => 
            voice.lang.startsWith('en')
          ) || voices[0];
          utterance.rate = speechSpeed;
          utterance.pitch = 1;
          utterance.volume = 1;
          
          utterance.onend = () => setIsSpeaking(false);
          utterance.onerror = () => setIsSpeaking(false);
          
          speechSynthesis.speak(utterance);
        } else {
          setIsSpeaking(false);
        }
      }
    } catch (error) {
      console.error('Speech synthesis failed:', error);
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  // Speech recognition setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => setIsListening(false);
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setMessage(prev => prev + transcript);
      };
      
      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || chatMutation.isPending) return;
    
    chatMutation.mutate(message);
    setMessage("");
    
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date(),
      subject: selectedSubject
    }]);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const clearChat = () => {
    setMessages([{
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m your AI tutor with enhanced voice capabilities. I can help you learn any subject with natural speech in different accents. What would you like to study today?',
      timestamp: new Date()
    }]);
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const handleQuickQuestion = (question: string) => {
    setMessage(question);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navigation currentRole={currentRole} onRoleChange={setCurrentRole} />
      
      <div className="flex flex-col lg:flex-row gap-6 p-4 pt-20">
        {/* Enhanced Sidebar with Voice Controls */}
        <div className="w-full lg:w-80 space-y-4">
          {/* Subject Selection */}
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Subject
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Subjects</SelectItem>
                  {subjects.map(subject => (
                    <SelectItem key={subject.name} value={subject.name}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="grid grid-cols-2 gap-2">
                {subjects.slice(0, 4).map(subject => {
                  const Icon = subject.icon;
                  return (
                    <Button
                      key={subject.name}
                      variant={selectedSubject === subject.name ? "default" : "outline"}
                      className="text-xs h-8"
                      onClick={() => setSelectedSubject(subject.name)}
                    >
                      <Icon className="h-3 w-3 mr-1" />
                      {subject.name}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* AI Mode Selection */}
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                AI Mode
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 gap-2">
                <Button
                  variant={tutorMode === 'basic' ? 'default' : 'outline'}
                  className="justify-start text-sm h-10"
                  onClick={() => setTutorMode('basic')}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Basic Guidance
                </Button>
                <Button
                  variant={tutorMode === 'educational' ? 'default' : 'outline'}
                  className="justify-start text-sm h-10"
                  onClick={() => setTutorMode('educational')}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Educational Tutor
                </Button>
                <Button
                  variant={tutorMode === 'enhanced' ? 'default' : 'outline'}
                  className="justify-start text-sm h-10"
                  onClick={() => setTutorMode('enhanced')}
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Enhanced (Gemma 3n 4B)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Voice Settings */}
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="h-5 w-5 text-green-600" />
                Voice & Accent
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Voice Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Voice Responses</span>
                <Switch 
                  checked={voiceEnabled} 
                  onCheckedChange={setVoiceEnabled}
                />
              </div>

              {voiceEnabled && (
                <>
                  {/* Accent Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Accent</label>
                    <Select value={selectedAccent} onValueChange={setSelectedAccent}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {accentOptions.map(accent => (
                          <SelectItem key={accent.value} value={accent.value}>
                            <span className="flex items-center gap-2">
                              <span>{accent.flag}</span>
                              {accent.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Voice Model Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Voice Model</label>
                    <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="openai-alloy">Alloy (Neutral)</SelectItem>
                        <SelectItem value="openai-echo">Echo (Male)</SelectItem>
                        <SelectItem value="openai-fable">Fable (British)</SelectItem>
                        <SelectItem value="openai-onyx">Onyx (Deep)</SelectItem>
                        <SelectItem value="openai-nova">Nova (Young)</SelectItem>
                        <SelectItem value="openai-shimmer">Shimmer (Soft)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Speech Speed */}
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

                  {/* Humanization Level */}
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

                  {/* Voice Enhancement Options */}
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

                  {/* Voice Control Buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => speakText("Hello! This is a test of the enhanced voice system with " + selectedAccent + " accent.")}
                      disabled={isSpeaking}
                      className="flex-1"
                    >
                      <Volume2 className="h-4 w-4 mr-1" />
                      Test Voice
                    </Button>
                    {isSpeaking && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={stopSpeaking}
                      >
                        <VolumeX className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </>
              )}
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
                <Badge variant={tutorStatus?.openaiAvailable ? "default" : "secondary"}>
                  {tutorMode === 'enhanced' ? 'Gemma 3n 4B' : 'Educational Tutor'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Voice System:</span>
                <Badge variant={voiceEnabled ? "default" : "secondary"}>
                  {voiceEnabled ? `${selectedAccent.toUpperCase()} Accent` : 'Disabled'}
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
        <div className="flex-1 flex flex-col">
          <div className="flex-1 grid grid-rows-[1fr_auto] gap-4">
            {/* Chat Messages */}
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Bot className="h-6 w-6 text-blue-600" />
                    AI Tutor Chat
                    {selectedSubject && (
                      <Badge variant="outline" className="ml-2">
                        {selectedSubject}
                      </Badge>
                    )}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearChat}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="h-96">
                <ScrollArea className="h-full pr-4">
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-lg",
                          msg.type === 'user' 
                            ? "bg-blue-50 dark:bg-blue-900/20 ml-8" 
                            : "bg-gray-50 dark:bg-gray-800/50 mr-8"
                        )}
                      >
                        <div className={cn(
                          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                          msg.type === 'user' 
                            ? "bg-blue-600 text-white" 
                            : "bg-gray-600 text-white"
                        )}>
                          {msg.type === 'user' ? (
                            <User className="h-4 w-4" />
                          ) : (
                            <Bot className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">
                              {msg.type === 'user' ? user?.username || 'You' : 'AI Tutor'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {msg.timestamp.toLocaleTimeString()}
                            </span>
                            {msg.subject && (
                              <Badge variant="outline" className="text-xs">
                                {msg.subject}
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {msg.content}
                          </div>
                          {msg.type === 'ai' && (
                            <div className="flex gap-1 mt-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyMessage(msg.content)}
                                className="h-6 px-2 text-xs"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              {voiceEnabled && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => speakText(msg.content)}
                                  disabled={isSpeaking}
                                  className="h-6 px-2 text-xs"
                                >
                                  <Volume2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {chatMutation.isPending && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 mr-8">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 text-white flex items-center justify-center">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm text-gray-600">AI is thinking...</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div ref={messagesEndRef} />
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Quick Questions & Input */}
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardContent className="p-4">
                {/* Quick Questions */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Quick Questions:</h4>
                  <div className="flex flex-wrap gap-2">
                    {quickQuestions.map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => handleQuickQuestion(question)}
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Input Form */}
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={toggleListening}
                    disabled={isListening}
                    className={cn(
                      "flex-shrink-0",
                      isListening && "bg-red-50 border-red-200 text-red-600"
                    )}
                  >
                    {isListening ? (
                      <MicOff className="h-4 w-4" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask me anything about your studies..."
                    className="flex-1"
                    disabled={chatMutation.isPending}
                  />
                  <Button
                    type="submit"
                    disabled={chatMutation.isPending || !message.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
                
                {isListening && (
                  <div className="mt-2 text-sm text-green-600 flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                    Listening for your voice...
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}