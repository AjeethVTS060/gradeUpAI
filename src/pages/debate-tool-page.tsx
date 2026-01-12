import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Brain, Mic, Megaphone, Lightbulb, User, MessageSquareText, Hourglass, CheckCircle, XCircle, ChevronRight, Loader2, Sparkles, Trophy, ArrowLeft, Send } from 'lucide-react';
import MinimalHeader from '../components/minimal-header';
import { useTheme } from '../hooks/use-theme';
import { Link, useLocation } from 'wouter';

import './debate-tool-page.css'; // Assuming this CSS file exists for custom styles

const FunnyLoader = ({ text = "The AI is pondering its arguments..." }) => (
    <motion.div
        className="flex flex-col items-center justify-center space-y-4 text-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
    >
        <motion.div
            animate={{
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0]
            }}
            transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
            }}
        >
            <Brain className="h-20 w-20 text-purple-500" />
        </motion.div>
        <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">{text}</p>
        <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
    </motion.div>
);

const DebateToolPage = () => {
    const { theme, setTheme } = useTheme();
    const [, setLocation] = useLocation();

    const [debateState, setDebateState] = useState('setup'); // setup, debating, results
    const [topic, setTopic] = useState('');
    const [proArgument, setProArgument] = useState('');
    const [conArgument, setConArgument] = useState('');
    const [aiRole, setAiRole] = useState<'pro' | 'con'>('con'); // AI takes the 'con' side by default
    const [currentTurn, setCurrentTurn] = useState<'player' | 'ai'>('player');
    const [debateLog, setDebateLog] = useState<{ speaker: 'player' | 'ai', argument: string }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [debateRound, setDebateRound] = useState(1); // To track turns
    const [playerScore, setPlayerScore] = useState(0);
    const [aiScore, setAiScore] = useState(0);

    const MAX_ROUNDS = 3; // Example: 3 rounds of arguments

    useEffect(() => {
        if (debateState === 'debating' && currentTurn === 'ai') {
            setIsLoading(true);
            setTimeout(() => {
                const aiArgument = generateAiArgument(topic, debateLog);
                setDebateLog(prev => [...prev, { speaker: 'ai', argument: aiArgument }]);
                evaluateArguments(aiArgument, 'ai');
                setCurrentTurn('player');
                setDebateRound(prev => prev + 1);
                setIsLoading(false);
            }, 3000); // Simulate AI thinking time
        }
    }, [currentTurn, debateState, topic, debateLog]);

    const handleSetupSubmit = () => {
        if (topic.trim() === '') {
            alert('Please enter a debate topic.');
            return;
        }
        setDebateLog([{ speaker: 'player', argument: `Debate Topic: "${topic}"` }]);
        setDebateState('debating');
        setCurrentTurn('player'); // Player starts the debate
    };

    const handlePlayerArgumentSubmit = () => {
        if (proArgument.trim() === '' && aiRole === 'con') {
            alert('Please enter your argument for the "Pro" side.');
            return;
        }
        if (conArgument.trim() === '' && aiRole === 'pro') {
            alert('Please enter your argument for the "Con" side.');
            return;
        }

        const playerArg = aiRole === 'con' ? proArgument : conArgument;
        setDebateLog(prev => [...prev, { speaker: 'player', argument: playerArg }]);
        evaluateArguments(playerArg, 'player');

        setProArgument('');
        setConArgument('');

        if (debateRound < MAX_ROUNDS) {
            setCurrentTurn('ai');
        } else {
            setDebateState('results');
        }
    };

    const generateAiArgument = (currentTopic: string, currentLog: typeof debateLog): string => {
        // --- Placeholder for actual AI logic (e.g., API call to an LLM) ---
        // This would involve sending the currentTopic, debateLog, and aiRole to an AI model.
        // For simulation, we'll make it more dynamic based on context.

        const lastPlayerArgument = currentLog.filter(log => log.speaker === 'player').pop()?.argument.toLowerCase();
        const keywordsPro = ['benefits', 'advantage', 'growth', 'future', 'positive', 'solution'];
        const keywordsCon = ['risks', 'drawbacks', 'challenge', 'problem', 'negative', 'consequence'];

        let response = '';

        const generateGenericResponse = (side: 'pro' | 'con') => {
            if (side === 'pro') {
                return [
                    `From a pro perspective on "${currentTopic}", we must emphasize the potential for significant progress and positive change.`,
                    `The advantages of embracing "${currentTopic}" far outweigh any perceived obstacles, paving the way for a brighter future.`,
                    `Consider the undeniable benefits of "${currentTopic}" in fostering innovation and improving quality of life.`,
                ];
            } else { // con
                return [
                    `However, one must carefully consider the substantial risks and unforeseen challenges associated with "${currentTopic}".`,
                    `While arguments for "${currentTopic}" exist, they often overlook the critical long-term consequences and ethical dilemmas.`,
                    `It is imperative to address the inherent problems and potential societal impacts before endorsing "${currentTopic}".`,
                ];
            }
        };

        if (aiRole === 'con') { // AI is arguing against the player's potential 'pro' arguments
            if (lastPlayerArgument) {
                if (keywordsPro.some(keyword => lastPlayerArgument.includes(keyword))) {
                    response = `While acknowledging the mentioned ${keywordsPro.find(k => lastPlayerArgument.includes(k))} of the opposing view, it's crucial to also consider the often-overlooked challenges.`;
                } else if (lastPlayerArgument.includes('innovation')) {
                    response = 'Innovation is indeed valuable, but without careful consideration of the broader implications, it can lead to unintended negative consequences.';
                } else if (lastPlayerArgument.includes('data') || lastPlayerArgument.includes('technology')) {
                    response = 'Relying heavily on technology and data, while modern, can also introduce vulnerabilities and ethical concerns that demand thorough scrutiny.';
                } else {
                    response = `That's an interesting point, but from a critical standpoint on "${currentTopic}", we must analyze its potential pitfalls further.`;
                }
            } else {
                response = generateGenericResponse('con')[Math.floor(Math.random() * 3)];
            }
        } else { // AI is arguing for the player's potential 'con' arguments
            if (lastPlayerArgument) {
                if (keywordsCon.some(keyword => lastPlayerArgument.includes(keyword))) {
                    response = `Indeed, the ${keywordsCon.find(k => lastPlayerArgument.includes(k))} you highlight are valid, but they are often manageable with proactive measures and robust frameworks.`;
                } else if (lastPlayerArgument.includes('cost') || lastPlayerArgument.includes('expense')) {
                    response = 'While initial costs may seem daunting, the long-term returns and efficiency gains often justify the investment, making it a viable path forward.';
                } else if (lastPlayerArgument.includes('resistance') || lastPlayerArgument.includes('difficulty')) {
                    response = 'Resistance to change is natural, yet with clear communication and phased implementation, even difficult transitions can be navigated successfully.';
                } else {
                    response = `I agree with your assessment. Expanding on "${currentTopic}", we can find even more compelling reasons to support this stance.`;
                }
            } else {
                response = generateGenericResponse('pro')[Math.floor(Math.random() * 3)];
            }
        }
        
        // Add a round-specific nuance
        if (debateRound === MAX_ROUNDS) {
            response += " And in conclusion, our side firmly stands by this position.";
        } else if (debateRound === 1) {
            response = "To begin, " + response;
        }

        return response;
    };

    const evaluateArguments = (argument: string, speaker: 'player' | 'ai') => {
        // --- Placeholder for sophisticated NLP-based evaluation ---
        // In a real AI debate, this would involve NLP models to assess quality, relevance, and rebuttal.
        let points = 0;
        const argLower = argument.toLowerCase();

        // Points for length (longer arguments suggest more detail)
        if (argLower.length > 80) points += 2;
        else if (argLower.length > 30) points += 1;

        // Points for reasoning keywords
        const reasoningKeywords = ['because', 'therefore', 'consequently', 'thus', 'as a result', 'given that'];
        if (reasoningKeywords.some(keyword => argLower.includes(keyword))) points += 2;

        // Points for counter-argument/rebuttal keywords (only relevant if responding to an opposing view)
        const counterKeywords = ['however', 'but', 'on the other hand', 'conversely', 'despite this', 'nevertheless'];
        const lastOpponentArgument = debateLog.filter(log => log.speaker !== speaker).pop()?.argument.toLowerCase();
        if (lastOpponentArgument && counterKeywords.some(keyword => argLower.includes(keyword))) {
            points += 2;
        }

        // Basic topic relevance check (very rudimentary)
        const topicKeywords = topic.toLowerCase().split(' ').filter(word => word.length > 3);
        if (topicKeywords.some(keyword => argLower.includes(keyword))) points += 1;

        // Award points
        if (speaker === 'player') setPlayerScore(prev => prev + points);
        else setAiScore(prev => prev + points);

        // --- Integration point for real AI: ---
        // If an external AI API were evaluating arguments, its score/feedback
        // would be processed here to update player/AI scores.
    };

    const resetDebate = () => {
        setDebateState('setup');
        setTopic('');
        setProArgument('');
        setConArgument('');
        setAiRole('con');
        setCurrentTurn('player');
        setDebateLog([]);
        setIsLoading(false);
        setDebateRound(1);
        setPlayerScore(0);
        setAiScore(0);
    };

    const renderDebateContent = () => {
        switch (debateState) {
            case 'setup':
                return (
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="topic" className="text-base">Debate Topic</Label>
                            <Input
                                id="topic"
                                placeholder="E.g., 'Should AI replace human teachers?'"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                className="debate-input"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ai-role" className="text-base">AI's Role</Label>
                            <select
                                id="ai-role"
                                value={aiRole}
                                onChange={(e) => setAiRole(e.target.value as 'pro' | 'con')}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="pro">Pro (AI argues for the motion)</option>
                                <option value="con">Con (AI argues against the motion)</option>
                            </select>
                        </div>
                        <Button onClick={handleSetupSubmit} className="w-full debate-button">
                            Start AI Practice Debate <Brain className="ml-2 h-4 w-4" />
                        </Button>
                    </CardContent>
                );
            case 'debating':
                return (
                    <CardContent className="space-y-6">
                        <div className="h-72 overflow-y-auto border rounded-lg p-4 bg-gray-50 dark:bg-gray-800 debate-log-container">
                            {debateLog.map((entry, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`mb-3 p-3 rounded-lg max-w-[80%] ${entry.speaker === 'player' ? 'ml-auto bg-blue-100 dark:bg-blue-900 text-right' : 'mr-auto bg-purple-100 dark:bg-purple-900'}`}
                                >
                                    <p className="font-semibold">{entry.speaker === 'player' ? 'You' : 'AI Coach'}</p>
                                    <p className="text-sm">{entry.argument}</p>
                                </motion.div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-center mt-4">
                                    <FunnyLoader text="AI is formulating its response..." />
                                </div>
                            )}
                        </div>

                        {debateRound <= MAX_ROUNDS ? (
                            <div className="space-y-4">
                                <Label className="text-base flex items-center gap-2">
                                    <User className="h-4 w-4" /> Your Argument (Round {debateRound}/{MAX_ROUNDS})
                                    {currentTurn === 'ai' && <Hourglass className="h-4 w-4 animate-pulse text-yellow-500" />}
                                </Label>
                                <Textarea
                                    placeholder={`Enter your argument for the ${aiRole === 'con' ? 'Pro' : 'Con'} side...`}
                                    value={aiRole === 'con' ? proArgument : conArgument}
                                    onChange={(e) => aiRole === 'con' ? setProArgument(e.target.value) : setConArgument(e.target.value)}
                                    disabled={currentTurn === 'ai' || isLoading}
                                    className="debate-input"
                                />
                                <Button
                                    onClick={handlePlayerArgumentSubmit}
                                    disabled={currentTurn === 'ai' || isLoading || (aiRole === 'con' ? proArgument.trim() === '' : conArgument.trim() === '')}
                                    className="w-full debate-button"
                                >
                                    Submit Argument <Send className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <div className="text-center text-lg font-semibold text-gray-700 dark:text-gray-300">
                                Debate Concluded! Check Results.
                            </div>
                        )}
                    </CardContent>
                );
            case 'results':
                let outcomeMessage = "It's a draw! Both debaters presented compelling arguments.";
                let outcomeIcon = <Megaphone className="h-24 w-24 text-gray-500 mx-auto mb-4" />;
                let outcomeColor = "text-gray-600 dark:text-gray-300";

                if (playerScore > aiScore) {
                    outcomeMessage = "You won the debate! Your arguments were more persuasive.";
                    outcomeIcon = <Trophy className="h-24 w-24 text-yellow-500 mx-auto mb-4" />;
                    outcomeColor = "text-green-600 dark:text-green-400";
                } else if (aiScore > playerScore) {
                    outcomeMessage = "The AI won this round! Time to refine your argumentation skills.";
                    outcomeIcon = <Brain className="h-24 w-24 text-purple-600 mx-auto mb-4" />;
                    outcomeColor = "text-red-600 dark:text-red-400";
                }

                return (
                    <CardContent className="space-y-6 text-center">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', stiffness: 200 }}
                        >
                            {outcomeIcon}
                            <h2 className="text-3xl font-bold mb-2">Debate Over!</h2>
                            <p className={`text-lg mb-6 ${outcomeColor}`}>{outcomeMessage}</p>
                        </motion.div>
                        <div className="grid grid-cols-2 gap-4">
                            <Card className="p-4 bg-blue-50 dark:bg-blue-900">
                                <h3 className="font-semibold text-blue-800 dark:text-blue-200">Your Score</h3>
                                <p className="text-5xl font-bold text-blue-600 dark:text-blue-400">{playerScore}</p>
                            </Card>
                            <Card className="p-4 bg-purple-50 dark:bg-purple-900">
                                <h3 className="font-semibold text-purple-800 dark:text-purple-200">AI's Score</h3>
                                <p className="text-5xl font-bold text-purple-600 dark:text-purple-400">{aiScore}</p>
                            </Card>
                        </div>
                        <Button onClick={resetDebate} className="w-full debate-button mt-6">
                            Start New Debate <Sparkles className="ml-2 h-4 w-4" />
                        </Button>
                        <Link href="/ai-tutor-page">
                            <Button variant="outline" className="w-full mt-2">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Go to AI Tutor
                            </Button>
                        </Link>
                    </CardContent>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 dark:from-gray-900 dark:to-purple-950 text-gray-900 dark:text-white debate-page-bg">
            <MinimalHeader title="AI Debate Tool" currentTheme={theme} onThemeChange={setTheme} />
            <main className="container mx-auto p-4 md:p-8 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="debate-card-wrapper"
                >
                    <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-gray-200 dark:border-gray-700 shadow-xl rounded-2xl p-6 md:p-8">
                        <CardHeader className="text-center mb-6">
                            <motion.div
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 200 }}
                            >
                                <Brain className="h-16 w-16 text-purple-600 mx-auto mb-4 debate-icon-pulse" />
                            </motion.div>
                            <CardTitle className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                                AI Debate Tool
                            </CardTitle>
                            <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">Hone your arguments against an AI opponent!</p>
                        </CardHeader>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={debateState}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                {isLoading && debateState === 'debating' ? (
                                    <FunnyLoader />
                                ) : (
                                    renderDebateContent()
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </Card>
                </motion.div>
            </main>
        </div>
    );
};

export default DebateToolPage;
