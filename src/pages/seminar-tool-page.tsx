import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { ArrowRight, Bot, Mic, School, Sparkles, Star, BookOpen, BrainCircuit, Loader2, Send } from 'lucide-react';
import { useTheme } from '../hooks/use-theme';
import MinimalHeader from '../components/minimal-header';
import { Badge } from '../components/ui/badge';

import './seminar-tool-page.css';

const topics = [
    { value: 'history-of-ai', label: 'The History of Artificial Intelligence', icon: <BrainCircuit className="inline-block mr-2" /> },
    { value: 'quantum-computing', label: 'The Basics of Quantum Computing', icon: <Sparkles className="inline-block mr-2" /> },
    { value: 'climate-change', label: 'Impact of Climate Change on Biodiversity', icon: <BookOpen className="inline-block mr-2" /> },
    { value: 'blockchain', label: 'Blockchain Technology and Its Applications', icon: <BrainCircuit className="inline-block mr-2" /> },
];

const FunnyLoader = ({ text }) => (
    <div className="flex flex-col items-center justify-center gap-4 text-center">
        <motion.div
            animate={{ rotate: [0, 360], scale: [1, 1.1, 1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
            <BrainCircuit className="h-20 w-20 text-purple-400" />
        </motion.div>
        <p className="text-lg font-semibold text-slate-600 dark:text-slate-300">{text}</p>
        <Loader2 className="h-6 w-6 text-slate-500 animate-spin" />
    </div>
);

const AICoachChat = ({ onClose }) => {
    const [messages, setMessages] = useState([{ text: "Hello! I'm your AI Coach. Ask me anything about presentation skills, topic details, or how to structure your seminar.", sender: 'ai' }]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }

    useEffect(scrollToBottom, [messages]);

    const handleSend = () => {
        if (input.trim() === '') return;
        const newMessages = [...messages, { text: input, sender: 'user' }];
        setMessages(newMessages);
        const lowerCaseInput = input.toLowerCase();
        setInput('');

        setTimeout(() => {
            let aiResponse = "That's an excellent point! To make it even better, try using a real-world example. People connect with stories. What other concerns do you have?";
            if (lowerCaseInput.includes('structure')) {
                aiResponse = "A good structure is key! I recommend the 'Problem-Solution-Benefit' framework. First, present the problem, then your solution, and finally, the benefits. What do you think?";
            } else if (lowerCaseInput.includes('engage') || lowerCaseInput.includes('boring')) {
                aiResponse = "To keep your audience engaged, try asking questions, using humor, or telling a compelling story. Visual aids like images or short videos also work wonders!";
            } else if (lowerCaseInput.includes('nervous') || lowerCaseInput.includes('anxious')) {
                aiResponse = "It's completely normal to feel nervous. Practice is the best remedy! Try rehearsing in front of a mirror or a friend. Deep breathing exercises before you start can also help calm your nerves.";
            } else if (lowerCaseInput.includes('start') || lowerCaseInput.includes('introduction')) {
                aiResponse = "A strong start is crucial. You could begin with a surprising statistic, a rhetorical question, or a short, relevant anecdote to grab your audience's attention from the get-go.";
            } else if (lowerCaseInput.includes('end') || lowerCaseInput.includes('conclusion')) {
                aiResponse = "For a memorable conclusion, summarize your key points and end with a strong call to action or a thought-provoking final statement. Leave your audience with something to think about!";
            }
            setMessages(prev => [...prev, { text: aiResponse, sender: 'ai' }]);
        }, 1200);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-24 right-5 w-[400px] h-[550px] bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl flex flex-col z-50"
        >
            <div className="p-4 border-b dark:border-gray-800 flex justify-between items-center bg-white/50 dark:bg-gray-900/50 rounded-t-2xl">
                <h3 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
                    <Sparkles className="text-purple-500" /> AI Seminar Coach
                </h3>
                <Button variant="ghost" size="icon" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white" onClick={onClose}>&times;</Button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
                {messages.map((msg, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className={`flex items-start gap-3 my-4 ${msg.sender === 'user' ? 'justify-end' : ''}`}
                    >
                        {msg.sender === 'ai' && <Bot className="w-8 h-8 text-purple-500 flex-shrink-0 p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-full" />}
                        <div className={`p-3 rounded-lg max-w-xs text-sm ${msg.sender === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none'}`}>
                            {msg.text}
                        </div>
                    </motion.div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t dark:border-gray-800 flex items-center gap-2">
                <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask for presentation tips..."
                    className="flex-1 bg-gray-100 dark:bg-gray-800 border-transparent focus:ring-purple-500"
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                />
                <Button onClick={handleSend} className="bg-purple-600 hover:bg-purple-700 rounded-full w-12 h-12 flex items-center justify-center"><Send className="w-5 h-5" /></Button>
            </div>
        </motion.div>
    );
};

const SeminarToolPage = () => {
    const { theme, setTheme } = useTheme();
    const [seminarState, setSeminarState] = useState('idle'); // idle, topic_selected, ai_demo, student_practice, evaluating, feedback
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [conversation, setConversation] = useState([]);
    const [isCoachOpen, setCoachOpen] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const conversationEndRef = useRef(null);

    const scrollToBottom = () => {
        conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [conversation]);

    const handleTopicSelect = (topicValue) => {
        const topic = topics.find(t => t.value === topicValue);
        setSelectedTopic(topic);
        setSeminarState('topic_selected');
        setConversation([
            { sender: 'ai', text: `An excellent choice! We will focus on "${topic.label}". This is a fascinating area.` },
            { sender: 'ai', text: `You can either watch me present a demo seminar, or if you feel ready, you can start your own presentation. You can also ask the AI Coach for tips anytime.` }
        ]);
    };

    const startAIDemo = () => {
        setSeminarState('ai_demo');
        let demoConversation = [
            { sender: 'ai', text: "Excellent! Let's begin the demo. Pay attention to the structure, tone, and how I engage with the 'audience'." },
            { sender: 'ai', text: "*(clears throat)* Good morning, everyone. Today, we embark on a journey to understand the core principles of..." },
            { sender: 'ai', text: "Notice how I started with a strong opening. Now, for our first key point..." },
            { sender: 'ai', text: "Analogies are a powerful tool. For instance, think of it like this... *(presents a clever analogy)*" },
            { sender: 'ai', text: "And to conclude, let's summarize the key takeaways. A, B, and C. Thank you." },
            { sender: 'ai', text: "The demo is complete! I hope that was helpful. Now, whenever you're ready, the stage is yours." }
        ];

        let i = 0;
        const addMessage = () => {
            if (i < demoConversation.length) {
                setConversation(prev => [...prev, demoConversation[i]]);
                i++;
                setTimeout(addMessage, 2200);
            } else {
                setSeminarState('topic_selected');
            }
        };
        addMessage();
    };

    const startStudentPractice = () => {
        setSeminarState('student_practice');
        setConversation(prev => [...prev, { sender: 'ai', text: "The stage is yours! The recording has begun. Take a deep breath and start when you're ready. I'm listening." }]);
    };
    
    const finishStudentPractice = () => {
        setSeminarState('evaluating');
        setConversation(prev => [...prev, { sender: 'user', text: "[You delivered your presentation with confidence!]" }]);
        
        setTimeout(() => {
            setConversation(prev => [...prev, { sender: 'ai', text: "Thank you for that presentation. Let me analyze your performance and prepare your feedback." }]);
        }, 1000);

        setTimeout(() => {
            const newFeedback = {
                score: Math.floor(Math.random() * 15) + 85, // 85-100
                clarity: { score: 'A', text: 'Your points were exceptionally clear and well-articulated. The main concepts were easy to follow.' },
                engagement: { score: 'A-', text: 'Great energy! To improve, you could incorporate more pauses to let key points sink in.' },
                structure: { score: 'A+', text: 'A textbook example of a well-structured presentation. The flow was logical and seamless.' },
                overall: 'A truly fantastic performance! You have a natural talent for this. Keep practicing, and you\'ll be unstoppable.'
            };
            setFeedback(newFeedback);
            setSeminarState('feedback');
        }, 5000);
    };
    
    const resetSeminar = () => {
        setSeminarState('idle');
        setSelectedTopic(null);
        setConversation([]);
        setFeedback(null);
    }
    
    const renderMainContent = () => {
        switch (seminarState) {
            case 'evaluating':
                return <FunnyLoader text="Analyzing your masterful oration..."/>;
            case 'feedback':
                return (
                    <motion.div initial={{opacity: 0, scale: 0.9}} animate={{opacity: 1, scale: 1}} className="p-6 h-full flex flex-col justify-center">
                        <CardHeader className="text-center">
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}>
                                <Badge variant="secondary" className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300">Feedback Report</Badge>
                            </motion.div>
                            <CardTitle className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500 py-2">Here's Your Breakdown</CardTitle>
                            <p className="text-7xl font-bold text-gray-900 dark:text-white pt-4">{feedback.score}<span className="text-2xl text-gray-400">/100</span></p>
                        </CardHeader>
                        <CardContent className="space-y-4 text-center">
                            <p className="text-lg text-gray-600 dark:text-gray-300 italic">"{feedback.overall}"</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left pt-4">
                                <Card className="bg-slate-100/50 dark:bg-slate-800/50"><CardHeader><CardTitle className="text-lg">Clarity</CardTitle></CardHeader><CardContent><p className="dark:text-slate-300">{feedback.clarity.text}</p></CardContent></Card>
                                <Card className="bg-slate-100/50 dark:bg-slate-800/50"><CardHeader><CardTitle className="text-lg">Engagement</CardTitle></CardHeader><CardContent><p className="dark:text-slate-300">{feedback.engagement.text}</p></CardContent></Card>
                                <Card className="bg-slate-100/50 dark:bg-slate-800/50"><CardHeader><CardTitle className="text-lg">Structure</CardTitle></CardHeader><CardContent><p className="dark:text-slate-300">{feedback.structure.text}</p></CardContent></Card>
                            </div>
                            <Button onClick={resetSeminar} className="mt-6 w-full max-w-xs mx-auto bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white transition-all duration-300 transform hover:scale-105">
                                Practice Another Topic
                            </Button>
                        </CardContent>
                    </motion.div>
                );
            default:
                return (
                    <div className="flex flex-col h-full">
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <AnimatePresence>
                                {conversation.map((msg, index) => (
                                    <motion.div
                                        key={index}
                                        layout
                                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -10, scale: 0.9 }}
                                        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                                        className={`flex items-start gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === 'ai' ? 'bg-purple-200 dark:bg-purple-900' : 'bg-blue-200 dark:bg-blue-900'}`}>
                                            {msg.sender === 'ai' ? <Bot className="w-6 h-6 text-purple-600 dark:text-purple-300" /> : <School className="w-6 h-6 text-blue-600 dark:text-blue-300" />}
                                        </div>
                                        <div className={`max-w-xl p-4 rounded-xl shadow-sm ${msg.sender === 'ai' ? 'bg-gray-100 dark:bg-gray-800 rounded-bl-none' : 'bg-blue-500 text-white rounded-br-none'}`}>
                                            <p>{msg.text}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                             {seminarState === 'idle' && (
                                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                                    <School className="w-24 h-24 mb-4 text-gray-300 dark:text-gray-700"/>
                                    <h2 className="text-2xl font-semibold">Welcome to the Seminar Practice Stage</h2>
                                    <p className="max-w-md">Here, you can hone your presentation skills with an AI coach. Select a topic to begin.</p>
                                </div>
                            )}
                            <div ref={conversationEndRef} />
                        </div>
                        {seminarState === 'student_practice' && (
                             <motion.div initial={{opacity:0}} animate={{opacity:1}} className="p-4 flex justify-center items-center gap-4 border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-black/20">
                                <Button className="bg-red-500 hover:bg-red-600 text-white animate-pulse shadow-lg"><Mic className="mr-2"/> Recording in Progress...</Button>
                                <Button onClick={finishStudentPractice} className="shadow-lg">Finish Presentation</Button>
                             </motion.div>
                        )}
                    </div>
                );
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans seminar-bg">
            <MinimalHeader title="Seminar Practice Tool" onThemeChange={setTheme} currentTheme={theme} />
            <main className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 md:p-6">
                
                <motion.div 
                    initial={{x: -100, opacity: 0}} 
                    animate={{x: 0, opacity: 1}} 
                    transition={{duration: 0.5, ease: 'easeOut'}} 
                    className="flex flex-col gap-6"
                >
                    <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border-slate-200 dark:border-slate-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Sparkles className="text-purple-500"/>Seminar Setup</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-slate-600 dark:text-slate-400">Choose a topic to begin your practice session.</p>
                            <Select onValueChange={handleTopicSelect} disabled={seminarState !== 'idle'}>
                                <SelectTrigger className="bg-white/80 dark:bg-slate-800/80">
                                    <SelectValue placeholder="Select a topic..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {topics.map(topic => <SelectItem key={topic.value} value={topic.value}>{topic.icon}{topic.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>

                    <AnimatePresence>
                    {seminarState === 'topic_selected' && (
                        <motion.div 
                            initial={{opacity: 0, y:20}}
                            animate={{opacity: 1, y: 0}}
                            exit={{opacity: 0, y:20}}
                            className="space-y-3"
                            transition={{staggerChildren: 0.1}}
                        >
                            <motion.h3 initial={{opacity: 0}} animate={{opacity: 1}} className="text-center font-semibold text-slate-600 dark:text-slate-300">Choose Your Next Step</motion.h3>
                            <motion.div initial={{opacity: 0, y:20}} animate={{opacity: 1, y: 0}}>
                                <Button className="w-full justify-start bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm" onClick={startAIDemo}>
                                    <Bot className="mr-3 text-purple-500"/> Watch AI Demo First
                                </Button>
                            </motion.div>
                            <motion.div initial={{opacity: 0, y:20}} animate={{opacity: 1, y: 0}}>
                                <Button className="w-full justify-start bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm" onClick={startStudentPractice}>
                                    <School className="mr-3 text-blue-500"/> I'm Ready to Present
                                </Button>
                            </motion.div>
                        </motion.div>
                    )}
                    </AnimatePresence>

                </motion.div>

                <motion.div 
                    initial={{scale: 0.9, opacity: 0}} 
                    animate={{scale: 1, opacity: 1}} 
                    transition={{duration: 0.5, delay: 0.2, ease: 'easeOut'}} 
                    className="lg:col-span-2 h-full min-h-0"
                >
                    <Card className="h-full w-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border-slate-200 dark:border-slate-800 flex flex-col shadow-lg">
                        {renderMainContent()}
                    </Card>
                </motion.div>
            </main>
            
            <Button 
                onClick={() => setCoachOpen(o => !o)}
                className="floating-fab fixed bottom-5 right-5 z-50 p-4 rounded-full shadow-lg bg-gradient-to-tr from-purple-500 to-pink-500 text-white transform hover:scale-110 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-300 dark:focus:ring-purple-800"
                aria-label="Toggle AI Coach"
                size="icon"
            >
                <Sparkles className="h-6 w-6"/>
            </Button>
            
            <AnimatePresence>
                {isCoachOpen && <AICoachChat onClose={() => setCoachOpen(false)} />}
            </AnimatePresence>
        </div>
    );
};

export default SeminarToolPage;
