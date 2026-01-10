import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Slider } from "../components/ui/slider";
import { Switch } from "../components/ui/switch";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { ScrollArea } from "../components/ui/scroll-area";
import { Separator } from "../components/ui/separator";
import { Progress } from "../components/ui/progress";
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Play,
  Pause,
  Square,
  Save,
  Download,
  Upload,
  BookOpen,
  Brain,
  Clock,
  Target,
  CheckCircle,
  XCircle,
  RotateCcw,
  Settings,
  Headphones,
  Radio,
  FileAudio,
  ArrowLeft
} from "lucide-react";
import { Link } from "wouter";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../hooks/use-auth";

interface StudySession {
  id: string;
  title: string;
  subject: string;
  duration: number;
  startTime: Date;
  notes: AudioNote[];
  quizResults?: QuizResult[];
  completed: boolean;
}

interface AudioNote {
  id: string;
  timestamp: number;
  audioUrl: string;
  transcription: string;
  topic: string;
  duration: number;
}

interface QuizResult {
  question: string;
  answer: string;
  correct: boolean;
  explanation: string;
}

interface VoiceCommand {
  command: string;
  action: () => void;
  description: string;
}

export default function VoiceStudyCompanion() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Core states
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Voice settings
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [speechSpeed, setSpeechSpeed] = useState(1.0);
  const [voiceVolume, setVoiceVolume] = useState(0.8);
  const [autoTranscribe, setAutoTranscribe] = useState(true);
  const [voiceCommandsEnabled, setVoiceCommandsEnabled] = useState(true);
  
  // Study content
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [studyGoal, setStudyGoal] = useState<string>('');
  const [sessionDuration, setSessionDuration] = useState(30); // minutes
  const [audioNotes, setAudioNotes] = useState<AudioNote[]>([]);
  const [currentNote, setCurrentNote] = useState<string>('');
  
  // Session tracking
  const [sessionProgress, setSessionProgress] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [wordsSpoken, setWordsSpoken] = useState(0);
  const [comprehensionScore, setComprehensionScore] = useState(0);
  
  // References
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);
  
  // Voice commands configuration
  const voiceCommands: VoiceCommand[] = [
    {
      command: "start session",
      action: startStudySession,
      description: "Begin a new study session"
    },
    {
      command: "end session", 
      action: endStudySession,
      description: "End the current study session"
    },
    {
      command: "start recording",
      action: startRecording,
      description: "Begin recording audio notes"
    },
    {
      command: "stop recording",
      action: stopRecording,
      description: "Stop recording audio notes"
    },
    {
      command: "quiz me",
      action: startQuizMode,
      description: "Start an interactive quiz"
    },
    {
      command: "explain topic",
      action: explainCurrentTopic,
      description: "Get explanation of current topic"
    },
    {
      command: "save notes",
      action: saveAudioNotes,
      description: "Save all recorded notes"
    },
    {
      command: "play back",
      action: playLastRecording,
      description: "Play the last recorded note"
    }
  ];

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
          
        if (event.results[event.results.length - 1].isFinal) {
          handleVoiceCommand(transcript.toLowerCase().trim());
          setWordsSpoken(prev => prev + transcript.split(' ').length);
        }
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  // Session timer
  useEffect(() => {
    if (currentSession && !currentSession.completed) {
      sessionTimerRef.current = setInterval(() => {
        setTimeElapsed(prev => {
          const newTime = prev + 1;
          const progress = (newTime / (sessionDuration * 60)) * 100;
          setSessionProgress(Math.min(progress, 100));
          
          if (progress >= 100) {
            endStudySession();
          }
          
          return newTime;
        });
      }, 1000);
    }
    
    return () => {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
      }
    };
  }, [currentSession, sessionDuration]);

  // Voice command handler
  const handleVoiceCommand = useCallback((transcript: string) => {
    if (!voiceCommandsEnabled) return;
    
    const command = voiceCommands.find(cmd => 
      transcript.includes(cmd.command)
    );
    
    if (command) {
      speakText(`Executing: ${command.description}`);
      command.action();
    } else if (transcript.includes('help')) {
      const helpText = "Available commands: " + voiceCommands.map(cmd => cmd.command).join(", ");
      speakText(helpText);
    }
  }, [voiceCommandsEnabled, voiceCommands]);

  // Text-to-speech function
  const speakText = async (text: string) => {
    if (!voiceEnabled || isSpeaking) return;
    
    setIsSpeaking(true);
    
    try {
      // Try browser speech synthesis
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = speechSpeed;
        utterance.volume = voiceVolume;
        utterance.lang = 'en-US';
        
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        
        speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('TTS error:', error);
      setIsSpeaking(false);
    }
  };

  // Study session functions
  function startStudySession() {
    if (!selectedSubject || !studyGoal) {
      toast({
        title: "Setup Required",
        description: "Please select a subject and set a study goal first.",
        variant: "destructive"
      });
      return;
    }
    
    const session: StudySession = {
      id: Date.now().toString(),
      title: `${selectedSubject} Study Session`,
      subject: selectedSubject,
      duration: sessionDuration,
      startTime: new Date(),
      notes: [],
      completed: false
    };
    
    setCurrentSession(session);
    setTimeElapsed(0);
    setSessionProgress(0);
    setWordsSpoken(0);
    setAudioNotes([]);
    
    speakText(`Starting ${sessionDuration} minute study session for ${selectedSubject}. Your goal is: ${studyGoal}`);
    
    if (voiceCommandsEnabled) {
      startListening();
    }
    
    toast({
      title: "Study Session Started",
      description: `${sessionDuration} minutes • ${selectedSubject}`,
    });
  }

  function endStudySession() {
    if (!currentSession) return;
    
    setCurrentSession(prev => prev ? { ...prev, completed: true } : null);
    stopListening();
    stopRecording();
    
    if (sessionTimerRef.current) {
      clearInterval(sessionTimerRef.current);
    }
    
    const minutes = Math.floor(timeElapsed / 60);
    const seconds = timeElapsed % 60;
    
    speakText(`Study session completed. You studied for ${minutes} minutes and ${seconds} seconds, spoke ${wordsSpoken} words, and recorded ${audioNotes.length} notes.`);
    
    toast({
      title: "Session Complete",
      description: `Studied for ${minutes}:${seconds.toString().padStart(2, '0')} • ${audioNotes.length} notes recorded`,
    });
  }

  // Recording functions
  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      recordingChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordingChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(recordingChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const note: AudioNote = {
          id: Date.now().toString(),
          timestamp: timeElapsed,
          audioUrl,
          transcription: currentNote,
          topic: selectedSubject,
          duration: 0 // Would be calculated from actual recording
        };
        
        setAudioNotes(prev => [...prev, note]);
        setCurrentNote('');
        
        if (autoTranscribe) {
          transcribeAudio(audioBlob);
        }
        
        toast({
          title: "Note Recorded",
          description: "Audio note saved successfully",
        });
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      speakText("Recording started");
      
    } catch (error) {
      console.error('Recording error:', error);
      toast({
        title: "Recording Failed",
        description: "Could not access microphone",
        variant: "destructive"
      });
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      speakText("Recording stopped");
    }
  }

  function startListening() {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  }

  function stopListening() {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }

  async function transcribeAudio(audioBlob: Blob) {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);
      
      const response = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        setCurrentNote(data.transcription);
      }
    } catch (error) {
      console.error('Transcription error:', error);
    }
  }

  async function startQuizMode() {
    if (!currentSession) {
      toast({
        title: "No Active Session",
        description: "Start a study session first",
        variant: "destructive"
      });
      return;
    }
    
    speakText("Starting quiz mode. I'll ask you questions about your study topic.");
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Generate a quiz question about ${selectedSubject}`,
          mode: 'enhanced',
          subject: selectedSubject
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        speakText(data.response);
      }
    } catch (error) {
      console.error('Quiz generation error:', error);
    }
  }

  async function explainCurrentTopic() {
    if (!selectedSubject) {
      speakText("Please select a subject first");
      return;
    }
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Explain the key concepts of ${selectedSubject}`,
          mode: 'educational',
          subject: selectedSubject
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        speakText(data.response);
      }
    } catch (error) {
      console.error('Explanation error:', error);
    }
  }

  function saveAudioNotes() {
    if (audioNotes.length === 0) {
      speakText("No notes to save");
      return;
    }
    
    // Would implement actual save functionality here
    speakText(`Saved ${audioNotes.length} audio notes`);
    
    toast({
      title: "Notes Saved",
      description: `${audioNotes.length} audio notes saved`,
    });
  }

  function playLastRecording() {
    if (audioNotes.length === 0) {
      speakText("No recordings available");
      return;
    }
    
    const lastNote = audioNotes[audioNotes.length - 1];
    if (audioRef.current) {
      audioRef.current.src = lastNote.audioUrl;
      audioRef.current.play();
      setIsPlaying(true);
      
      audioRef.current.onended = () => setIsPlaying(false);
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Link href="/ai-tutor">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to AI Tutor
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Voice Study Companion
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Interactive voice-powered learning experience
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {currentSession && (
              <Badge variant={currentSession.completed ? "secondary" : "default"}>
                {currentSession.completed ? "Completed" : "Active Session"}
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Control Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Session Setup */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Study Session Setup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Subject</label>
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mathematics">Mathematics</SelectItem>
                        <SelectItem value="physics">Physics</SelectItem>
                        <SelectItem value="chemistry">Chemistry</SelectItem>
                        <SelectItem value="biology">Biology</SelectItem>
                        <SelectItem value="history">History</SelectItem>
                        <SelectItem value="literature">Literature</SelectItem>
                        <SelectItem value="languages">Languages</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Duration (minutes)</label>
                    <Select value={sessionDuration.toString()} onValueChange={(value) => setSessionDuration(parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="90">1.5 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Study Goal</label>
                  <Input
                    value={studyGoal}
                    onChange={(e) => setStudyGoal(e.target.value)}
                    placeholder="What do you want to achieve in this session?"
                  />
                </div>
                
                <div className="flex justify-center">
                  {!currentSession || currentSession.completed ? (
                    <Button 
                      onClick={startStudySession}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      disabled={!selectedSubject || !studyGoal}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Study Session
                    </Button>
                  ) : (
                    <Button 
                      onClick={endStudySession}
                      variant="destructive"
                    >
                      <Square className="h-4 w-4 mr-2" />
                      End Session
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Voice Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Headphones className="h-5 w-5 mr-2" />
                  Voice Controls
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    variant={isListening ? "destructive" : "outline"}
                    onClick={isListening ? stopListening : startListening}
                    className="flex flex-col items-center p-4 h-auto"
                  >
                    {isListening ? <MicOff className="h-6 w-6 mb-2" /> : <Mic className="h-6 w-6 mb-2" />}
                    <span className="text-xs">{isListening ? "Stop Listening" : "Voice Commands"}</span>
                  </Button>
                  
                  <Button
                    variant={isRecording ? "destructive" : "outline"}
                    onClick={isRecording ? stopRecording : startRecording}
                    className="flex flex-col items-center p-4 h-auto"
                  >
                    {isRecording ? <Square className="h-6 w-6 mb-2" /> : <FileAudio className="h-6 w-6 mb-2" />}
                    <span className="text-xs">{isRecording ? "Stop Recording" : "Record Note"}</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={playLastRecording}
                    disabled={audioNotes.length === 0}
                    className="flex flex-col items-center p-4 h-auto"
                  >
                    <Play className="h-6 w-6 mb-2" />
                    <span className="text-xs">Play Last Note</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={saveAudioNotes}
                    disabled={audioNotes.length === 0}
                    className="flex flex-col items-center p-4 h-auto"
                  >
                    <Save className="h-6 w-6 mb-2" />
                    <span className="text-xs">Save Notes</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Session Progress */}
            {currentSession && !currentSession.completed && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Clock className="h-5 w-5 mr-2" />
                      Session Progress
                    </span>
                    <Badge variant="outline">{formatTime(timeElapsed)}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Time Progress</span>
                      <span>{Math.round(sessionProgress)}%</span>
                    </div>
                    <Progress value={sessionProgress} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{audioNotes.length}</div>
                      <div className="text-sm text-gray-600">Notes Recorded</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{wordsSpoken}</div>
                      <div className="text-sm text-gray-600">Words Spoken</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">{formatTime(timeElapsed)}</div>
                      <div className="text-sm text-gray-600">Time Elapsed</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Audio Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileAudio className="h-5 w-5 mr-2" />
                  Audio Notes ({audioNotes.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  {audioNotes.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      No audio notes recorded yet
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {audioNotes.map((note, index) => (
                        <div key={note.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline">Note {index + 1}</Badge>
                            <span className="text-sm text-gray-500">
                              {formatTime(note.timestamp)}
                            </span>
                          </div>
                          {note.transcription && (
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {note.transcription}
                            </p>
                          )}
                          <div className="flex items-center mt-2 space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                if (audioRef.current) {
                                  audioRef.current.src = note.audioUrl;
                                  audioRef.current.play();
                                }
                              }}
                            >
                              <Play className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = note.audioUrl;
                                link.download = `note-${index + 1}.webm`;
                                link.click();
                              }}
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Settings Panel */}
          <div className="space-y-6">
            {/* Voice Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Voice Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Voice Enabled</label>
                  <Switch
                    checked={voiceEnabled}
                    onCheckedChange={setVoiceEnabled}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Voice Commands</label>
                  <Switch
                    checked={voiceCommandsEnabled}
                    onCheckedChange={setVoiceCommandsEnabled}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Auto Transcribe</label>
                  <Switch
                    checked={autoTranscribe}
                    onCheckedChange={setAutoTranscribe}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium block mb-2">
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
                
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Volume: {Math.round(voiceVolume * 100)}%
                  </label>
                  <Slider
                    value={[voiceVolume]}
                    onValueChange={(value) => setVoiceVolume(value[0])}
                    min={0}
                    max={1}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Voice Commands Reference */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2" />
                  Voice Commands
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {voiceCommands.map((cmd, index) => (
                      <div key={index} className="p-2 border rounded text-sm">
                        <div className="font-medium text-blue-600">"{cmd.command}"</div>
                        <div className="text-gray-600 text-xs">{cmd.description}</div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  onClick={startQuizMode}
                  disabled={!currentSession}
                  className="w-full justify-start"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Start Quiz Mode
                </Button>
                
                <Button
                  variant="outline"
                  onClick={explainCurrentTopic}
                  disabled={!selectedSubject}
                  className="w-full justify-start"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Explain Topic
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => speakText("Voice study companion is ready to help you learn efficiently")}
                  className="w-full justify-start"
                >
                  <Volume2 className="h-4 w-4 mr-2" />
                  Test Voice
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Hidden audio element for playback */}
      <audio ref={audioRef} className="hidden" />
    </div>
  );
}