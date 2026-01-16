import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Brain, Mic, MicOff, Video, VideoOff, MessageSquare, Hourglass, User, Sun, Moon, Sparkles, Trophy, X, Zap, Bot, BookOpen, FileText, PenSquare } from 'lucide-react';
import { useTheme } from '../hooks/use-theme';
import { cn } from '../lib/utils';

type DebateState = 'setup' | 'loading' | 'debate' | 'results';
type Speaker = 'You' | 'AI Opponent';

// Mock Data
const mockSubjects = [
    { id: 'bio', name: 'Biology', icon: '🧬' },
    { id: 'phy', name: 'Physics', icon: '⚛️' },
    { id: 'his', name: 'History', icon: '📜' },
    { id: 'lit', name: 'Literature', icon: '📚' },
];

const mockChapters: { [key: string]: { id: string; name: string }[] } = {
    'bio': [
        { id: 'cell', name: 'The Cell' },
        { id: 'gen', name: 'Genetics' },
        { id: 'eco', name: 'Ecology' },
    ],
    'phy': [
        { id: 'new', name: 'Newtonian Mechanics' },
        { id: 'em', name: 'Electromagnetism' },
        { id: 'rel', name: 'Relativity' },
    ],
    'his': [
        { id: 'ww2', name: 'World War II' },
        { id: 'ren', name: 'The Renaissance' },
        { id: 'civ', name: 'Civil Rights Movement' },
    ],
    'lit': [
        { id: 'shk', name: 'Shakespeare' },
        { id: 'mod', name: 'Modernism' },
        { id: 'fic', name: 'Science Fiction' },
    ],
};


const mockArguments = {
    pro: [
        "This technology represents a quantum leap in efficiency and will unlock unprecedented economic growth.",
        "By embracing this, we are paving the way for a more inclusive and interconnected global society.",
        "The ethical frameworks we've developed are more than capable of managing the risks involved."
    ],
    con: [
        "We are moving too quickly and ignoring the profound ethical and societal disruptions this will cause.",
        "The potential for misuse of this technology in the wrong hands is a threat we cannot afford to ignore.",
        "While the benefits are touted, the long-term costs to privacy and autonomy are unacceptably high."
    ]
};

// Sub-components
const AILoader = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center justify-center text-center p-8">
        <div className="relative">
            <Bot className="w-24 h-24 text-purple-400" />
            <motion.div className="absolute inset-0 rounded-full border-4 border-purple-500" animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5]}} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }} />
        </div>
        <p className="text-xl font-semibold mt-4">Preparing the debate stage...</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">The AI is sharpening its arguments.</p>
    </motion.div>
);

const SetupView = ({ onStart }: { onStart: (topic: string) => void }) => {
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
    const [customTopic, setCustomTopic] = useState("");

    const handleChapterSelect = (chapterName: string) => {
        onStart(chapterName);
    };

    const handleCustomTopicSubmit = () => {
        if (customTopic.trim()) {
            onStart(customTopic);
        }
    };
    
    return (
        <Card className="w-full max-w-4xl shadow-2xl bg-white/30 dark:bg-gray-900/30 backdrop-blur-lg border-gray-200 dark:border-gray-700">
            <CardContent className="p-6 sm:p-10">
                <div className='text-center mb-8'>
                    <BookOpen className="w-16 h-16 mx-auto text-purple-500 mb-4" />
                    <h2 className="text-3xl font-bold mb-2">Start a Debate</h2>
                    <p className="text-gray-600 dark:text-gray-300">Choose a topic or create your own.</p>
                </div>

                {/* Subjects */}
                <div className='mb-8'>
                    <h3 className="text-2xl font-bold text-center mb-4">1. Choose a Subject</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {mockSubjects.map(subject => (
                            <motion.div key={subject.id} whileHover={{ y: -5, scale: 1.05 }} className="cursor-pointer" onClick={() => setSelectedSubject(subject.id === selectedSubject ? null : subject.id)}>
                                <Card className={cn("p-6 text-center h-full flex flex-col items-center justify-center transition-colors", selectedSubject === subject.id ? "bg-purple-500 text-white" : "bg-white/50 dark:bg-gray-800/50 hover:bg-purple-100 dark:hover:bg-purple-900/50")}>
                                    <div className="text-4xl mb-2">{subject.icon}</div>
                                    <h3 className="font-semibold text-lg">{subject.name}</h3>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Chapters */}
                <AnimatePresence>
                {selectedSubject && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className='mb-8'
                    >
                        <h3 className="text-2xl font-bold text-center mb-4">2. Select a Chapter Topic</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {mockChapters[selectedSubject].map(chapter => (
                                <motion.div key={chapter.id} whileHover={{ y: -5, scale: 1.05 }} className="cursor-pointer" onClick={() => handleChapterSelect(chapter.name)}>
                                    <Card className="p-6 text-center h-full flex items-center justify-center bg-white/50 dark:bg-gray-800/50 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors">
                                        <h3 className="font-semibold text-lg">{chapter.name}</h3>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
                </AnimatePresence>

                {/* Custom Topic */}
                <div>
                    <h3 className="text-2xl font-bold text-center mb-4">Or Write Your Own Topic</h3>
                     <div className='w-full max-w-lg mx-auto'>
                        <div className="space-y-4 text-left">
                            <Input
                                value={customTopic}
                                onChange={(e) => setCustomTopic(e.target.value)}
                                placeholder="e.g., 'Is space exploration a worthwhile investment?'"
                                className="p-6 text-lg"
                            />
                        </div>
                        <Button onClick={handleCustomTopicSubmit} size="lg" className="mt-6 w-full text-xl py-7 bg-purple-600 hover:bg-purple-700" disabled={!customTopic.trim()}>
                            <Sparkles className="mr-2" /> Start Debate with Custom Topic
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

const DebateView = ({ transcript, currentSpeaker, topic, liveTranscript }: { transcript: { speaker: Speaker, text: string }[], currentSpeaker: Speaker, topic: string, liveTranscript: string }) => (
    <div className="w-full h-full md:h-[85vh] flex flex-col space-y-4 p-2 sm:p-4">
        <h2 className="text-center text-lg sm:text-xl font-semibold truncate px-4">Topic: {topic}</h2>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4">
            <ParticipantWindow name="You" isSpeaking={currentSpeaker === 'You'} liveTranscript={liveTranscript} />
            <ParticipantWindow name="AI Opponent" isSpeaking={currentSpeaker === 'AI Opponent'} isAI />
        </div>
        <Transcript transcript={transcript} />
    </div>
);

const ParticipantWindow = ({ name, isSpeaking, isAI = false, liveTranscript }: { name: string, isSpeaking: boolean, isAI?: boolean, liveTranscript?: string }) => (
    <motion.div className={cn("relative w-full h-48 md:h-full rounded-2xl overflow-hidden bg-gray-200 dark:bg-gray-800 transition-all duration-500 shadow-lg", isSpeaking && "ring-4 ring-offset-2 ring-offset-gray-100 dark:ring-offset-gray-900 ring-yellow-400")}>
        <AnimatePresence>
            {isSpeaking && <motion.div className="absolute inset-0 border-4 border-yellow-400 rounded-2xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }} />}
        </AnimatePresence>
        <div className="w-full h-full flex items-center justify-center p-4">
            {liveTranscript ? (
                <p className="text-center text-lg font-medium">{liveTranscript}</p>
            ) : (
                isAI ? <Bot className="w-1/4 h-1/4 sm:w-1/3 sm:h-1/3 text-gray-500" /> : <User className="w-1/4 h-1/4 sm:w-1/3 sm:h-1/3 text-gray-500" />
            )}
        </div>
        <div className="absolute bottom-0 left-0 bg-black/50 px-2 py-1 sm:px-4 sm:py-2 rounded-tr-xl">
            <span className="font-semibold text-white text-sm sm:text-base">{name}</span>
        </div>
    </motion.div>
);

const Transcript = ({ transcript }: { transcript: { speaker: Speaker, text: string }[] }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [transcript]);

    return (
        <Card ref={scrollRef} className="h-40 md:h-48 overflow-y-auto p-2 sm:p-4 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm">
            <AnimatePresence>
                {transcript.map((entry, index) => (
                    <motion.div key={index} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={cn("mb-2 flex items-start gap-2 text-sm sm:text-base", entry.speaker === 'You' && "justify-end")}>
                        {entry.speaker === 'AI Opponent' && <Bot className="w-5 h-5 mt-1 text-purple-500 flex-shrink-0" />}
                        <p className={cn("max-w-md rounded-xl px-3 py-2", entry.speaker === 'You' ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-700")}>{entry.text}</p>
                        {entry.speaker === 'You' && <User className="w-5 h-5 mt-1 text-blue-500 flex-shrink-0" />}
                    </motion.div>
                ))}
            </AnimatePresence>
        </Card>
    );
};

const ControlBar = ({ isListening, onMicClick, isCameraOn, setCameraOn, onEndDebate }: { isListening: boolean, onMicClick: () => void, isCameraOn: boolean, setCameraOn: (b: boolean) => void, onEndDebate: () => void }) => (
    <motion.div initial={{ y: 100 }} animate={{ y: 0 }} transition={{ type: 'spring', stiffness: 100 }} className="fixed bottom-0 left-1/2 -translate-x-1/2 mb-2 sm:mb-4 z-20">
        <div className="flex items-center gap-2 sm:gap-4 p-2 sm:p-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-full shadow-2xl">
            <Button variant="ghost" size="icon" className="rounded-full w-12 h-12 sm:w-14 sm:h-14" onClick={onMicClick}>
                {isListening ? <Mic className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" /> : <MicOff className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />}
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full w-12 h-12 sm:w-14 sm:h-14" onClick={() => setCameraOn(!isCameraOn)}>
                {isCameraOn ? <Video className="w-5 h-5 sm:w-6 sm:h-6" /> : <VideoOff className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />}
            </Button>
            <Button className="rounded-full w-20 h-12 sm:w-24 sm:h-14 bg-red-600 hover:bg-red-700 text-white font-bold text-sm sm:text-base" onClick={onEndDebate}>End</Button>
        </div>
    </motion.div>
);

const ResultsView = ({ onRestart }: { onRestart: () => void }) => (
    <Card className="w-full max-w-2xl text-center shadow-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border-gray-200 dark:border-gray-700">
        <CardContent className="p-6 sm:p-10">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}>
                <Trophy className="w-20 h-20 sm:w-24 sm:h-24 mx-auto text-yellow-400 mb-4" />
            </motion.div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">Debate Concluded!</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-8 text-base sm:text-lg">You've successfully completed the debate. Review the transcript to find areas for improvement.</p>
            <Button onClick={onRestart} size="lg" className="mt-4 w-full text-lg sm:text-xl py-6 sm:py-8 bg-purple-600 hover:bg-purple-700">
                <Sparkles className="mr-2" /> Start a New Debate
            </Button>
        </CardContent>
    </Card>
);

const DebateToolPage = () => {
    const { theme, setTheme } = useTheme();
    const [debateState, setDebateState] = useState<DebateState>('setup');
    const [topic, setTopic] = useState('');
    const [transcript, setTranscript] = useState<{ speaker: Speaker; text: string }[]>([]);
    const [currentSpeaker, setCurrentSpeaker] = useState<Speaker>('You');
    const [isCameraOn, setCameraOn] = useState(true);
    
    const [userSpeech, setUserSpeech] = useState("");
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (!('webkitSpeechRecognition' in window)) {
            console.error("This browser does not support speech recognition.");
            return;
        }

        const recognition = new (window as any).webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
            setUserSpeech("Listening...");
        };

        recognition.onend = () => {
            setIsListening(false);
            setUserSpeech("");
        };
        
        recognition.onerror = (event: any) => {
            console.error(`Speech recognition error: ${event.error}`);
            setIsListening(false);
            setUserSpeech("");
        };

        recognition.onresult = (event: any) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            
            setUserSpeech(interimTranscript);

            if (finalTranscript.trim()) {
                setTranscript(prev => [...prev, { speaker: 'You', text: finalTranscript.trim() }]);
            }
        };

        recognitionRef.current = recognition;
        
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    const toggleListen = () => {
        if (!recognitionRef.current) {
            console.log("Speech recognition not initialized.");
            return;
        }
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            if (currentSpeaker === 'You') {
                recognitionRef.current.start();
            }
        }
    };

    const startDebate = (selectedTopic: string) => {
        if (!selectedTopic.trim()) return;
        setTopic(selectedTopic);
        setDebateState('loading');
        setTimeout(() => {
            setTranscript([{ speaker: 'AI Opponent', text: `An excellent topic! I shall argue the 'con' position regarding: "${selectedTopic}". You may begin.` }]);
            setCurrentSpeaker('You');
            setDebateState('debate');
        }, 3000);
    };

    const endDebate = () => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
        }
        setDebateState('results');
    };
    
    const resetDebate = () => {
        setTopic('');
        setDebateState('setup');
        setTranscript([]);
    }

    useEffect(() => {
        const lastTranscript = transcript[transcript.length - 1];
        if (lastTranscript && lastTranscript.speaker === 'You') {
            setCurrentSpeaker('AI Opponent');
        }
    }, [transcript]);

    useEffect(() => {
        let aiTurnTimeout: NodeJS.Timeout;
        if (debateState === 'debate' && currentSpeaker === 'AI Opponent') {
            const thinkTime = 2000 + Math.random() * 2000;
            aiTurnTimeout = setTimeout(() => {
                const newArgument = mockArguments.con[Math.floor(Math.random() * mockArguments.con.length)];
                setTranscript(t => [...t, { speaker: 'AI Opponent', text: newArgument }]);
                setCurrentSpeaker('You');
            }, thinkTime);
        }
        return () => clearTimeout(aiTurnTimeout);
    }, [debateState, currentSpeaker]);


    const renderContent = () => {
        switch (debateState) {
            case 'setup':
                return <SetupView onStart={startDebate} />;
            case 'loading':
                return <AILoader />;
            case 'debate':
                return <DebateView transcript={transcript} currentSpeaker={currentSpeaker} topic={topic} liveTranscript={userSpeech} />;
            case 'results':
                return <ResultsView onRestart={resetDebate} />;
            default:
                return null;
        }
    };

    return (
        <div className={cn("min-h-screen w-full font-sans antialiased", theme)}>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
                <header className="absolute top-0 right-0 p-4 z-10">
                    <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                        <Sun className="h-6 w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-6 w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    </Button>
                </header>
                <main className="flex items-center justify-center min-h-screen w-full p-2 sm:p-4">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={debateState}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.4, ease: 'easeInOut' }}
                            className="w-full h-full flex items-center justify-center"
                        >
                            {renderContent()}
                        </motion.div>
                    </AnimatePresence>
                </main>
                {debateState === 'debate' && (
                    <ControlBar isListening={isListening} onMicClick={toggleListen} isCameraOn={isCameraOn} setCameraOn={setCameraOn} onEndDebate={endDebate} />
                )}
            </div>
        </div>
    );
};

export default DebateToolPage;