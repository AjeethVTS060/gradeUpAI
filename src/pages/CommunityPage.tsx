import React, { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import {
  Hash,
  Settings,
  Mic,
  Headphones,
  PlusCircle,
  Bot,
  Send,
  Search,
  Inbox,
  HelpCircle,
  Sun,
  Moon,
} from "lucide-react";
import "./CommunityPage.css";
import { useTheme } from "../hooks/use-theme";
import { cn } from "../lib/utils";

const debateData = {
  servers: [
    { id: "1", name: "General Debate", icon: "🌍", defaultChannel: "1" },
    { id: "2", name: "History Buffs", icon: "📜", defaultChannel: "1" },
    { id: "3", name: "Science Geeks", icon: "🔬", defaultChannel: "1" },
    { id: "4", name: "Philosophy Corner", icon: "🤔", defaultChannel: "1" },
  ],
  channels: {
    "1": [
      { id: "1", name: "welcome", unread: 0 },
      { id: "2", name: "rules", unread: 0 },
    ],
    "2": [
      { id: "1", name: "welcome", unread: 0 },
      { id: "2", name: "announcements", unread: 1 },
      { id: "3", name: "ww2-discussion", unread: 3 },
      { id: "4", name: "ancient-greece", unread: 0 },
      { id: "5", name: "roman-empire", unread: 0 },
    ],
    "3": [
      { id: "1", name: "welcome", unread: 0 },
      { id: "2", name: "cosmology", unread: 0 },
      { id: "3", name: "quantum-mechanics", unread: 5 },
    ],
    "4": [
      { id: "1", name: "stoicism", unread: 2 },
      { id: "2", name: "existentialism", unread: 0 },
    ],
  },
  messages: {
    "2_3": [
      {
        id: "1",
        user: "AI Moderator",
        avatar: "🤖",
        text: "Welcome to #ww2-discussion! What are your thoughts on the Eastern Front?",
        timestamp: "1 hour ago",
        isAI: true,
      },
    ],
    "4_1": [
        {
          id: "1",
          user: "AI Moderator",
          avatar: "🤖",
          text: "Welcome to #stoicism! To quote Marcus Aurelius: 'You have power over your mind - not outside events. Realize this, and you will find strength.'",
          timestamp: "2 hours ago",
          isAI: true,
        },
        {
            id: '2',
            user: 'You',
            avatar: 'https://i.pravatar.cc/40?u=you',
            text: 'How can one apply this in a high-stress modern work environment?',
            timestamp: '1 hour ago',
        },
        {
            id: '3',
            user: 'Epictetus',
            avatar: 'https://i.pravatar.cc/40?u=epictetus',
            text: 'The essence lies in distinguishing what you can control from what you cannot. Your reaction to stress is within your power, the external demands are not.',
            timestamp: '30 minutes ago',
            isAI: true,
            isOpponent: true
        }
    ],
  },
  members: {
    "2_3": [
        { id: '1', name: 'AI Moderator', status: 'Online', isAI: true },
        { id: '2', name: 'You', status: 'Online' },
        { id: '3', name: 'Winston Churchill', status: 'Online', isAI: true, isOpponent: true },
        { id: '4', name: 'Eleanor Roosevelt', status: 'Offline' },
    ],
    "4_1": [
        { id: '1', name: 'AI Moderator', status: 'Online', isAI: true },
        { id: '2', name: 'You', status: 'Online' },
        { id: '3', name: 'Epictetus', status: 'Online', isAI: true, isOpponent: true },
        { id: '4', name: 'Seneca', status: 'Online', isAI: true, isOpponent: true },
        { id: '5', name: 'Marcus Aurelius', status: 'Offline' },
    ]
  },
};

const initialServerId = "2";
const initialChannelId = debateData.servers.find(s => s.id === initialServerId)?.defaultChannel || "1";

const DebateToolPage = () => {
  const { theme, setTheme } = useTheme();
  const [activeServerId, setActiveServerId] = useState(initialServerId);
  const [activeChannelId, setActiveChannelId] = useState(initialChannelId);

  const [messages, setMessages] = useState(
    debateData.messages[`${activeServerId}_${activeChannelId}`] || []
  );
  const [typing, setTyping] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const activeServer = debateData.servers.find((s) => s.id === activeServerId);
  const channelsForActiveServer = debateData.channels[activeServerId] || [];
  const activeChannel = channelsForActiveServer.find(
    (c) => c.id === activeChannelId
  );
  const membersForActiveChannel =
    debateData.members[`${activeServerId}_${activeChannelId}`] || [];

    useEffect(() => {
        const viewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
        }
    }, [messages, isTyping]);


  const handleServerSelect = (serverId: string) => {
    setActiveServerId(serverId);
    const newServer = debateData.servers.find((s) => s.id === serverId);
    const newChannelId =
      newServer?.defaultChannel || debateData.channels[serverId]?.[0]?.id || "1";
    setActiveChannelId(newChannelId);
    setMessages(debateData.messages[`${serverId}_${newChannelId}`] || []);
  };

  const handleChannelSelect = (channelId: string) => {
    setActiveChannelId(channelId);
    setMessages(debateData.messages[`${activeServerId}_${channelId}`] || []);
  };

  const handleSend = () => {
    if (typing.trim() === "") return;
    const newMessage = {
      id: (messages.length + 1).toString(),
      user: "You",
      avatar: "https://i.pravatar.cc/40?u=you",
      text: typing,
      timestamp: "Just now",
    };
    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    
    // In a real app, this would be an API call. We're updating a mock object for now.
    const key = `${activeServerId}_${activeChannelId}`;
    if (!debateData.messages[key]) {
        debateData.messages[key] = [];
    }
    debateData.messages[key].push(newMessage);


    setTyping("");

    // Simulate opponent response
    setIsTyping(true);
    setTimeout(() => {
        const opponents = membersForActiveChannel.filter(m => m.isOpponent);
        const randomOpponent = opponents[Math.floor(Math.random() * opponents.length)] || {name: 'AI Opponent', avatar: 'https://i.pravatar.cc/40?u=ai'};

      const opponentResponse = {
        id: (newMessages.length + 2).toString(),
        user: randomOpponent.name,
        avatar: `https://i.pravatar.cc/40?u=${randomOpponent.name}`,
        text: "An interesting perspective. I will need a moment to formulate a counter-argument.",
        timestamp: "Just now",
        isAI: true,
        isOpponent: true,
      };
      setMessages((prev) => [...prev, opponentResponse]);
       debateData.messages[key].push(opponentResponse);
      setIsTyping(false);
    }, 2000);
  };

  return (
    <div
      className={cn(
        "flex flex-col h-screen font-sans overflow-hidden",
        theme === "dark" ? "dark" : ""
      )}
    >
      <div className="flex flex-1 overflow-hidden">
        {/* Server List */}
        <motion.div
          initial={{ x: -70 }}
          animate={{ x: 0 }}
          className="w-20 bg-gray-200 dark:bg-gray-900 p-2 flex flex-col items-center space-y-3 shrink-0"
        >
          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-2xl cursor-pointer brand-icon">
            {/* <Bot /> */}
             AI
          </div>
          <div className="w-full h-px bg-gray-300 dark:bg-gray-700"></div>
          <TooltipProvider delayDuration={0}>
            {debateData.servers.map((server) => (
              <Tooltip key={server.id}>
                <TooltipTrigger asChild>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="server-icon-wrapper"
                    onClick={() => handleServerSelect(server.id)}
                  >
                    <div
                      className={`server-icon ${
                        server.id === activeServerId ? "server-icon-active" : ""
                      }`}
                    >
                      {server.icon}
                    </div>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="bg-gray-900 text-white border-none"
                >
                  <p>{server.name}</p>
                </TooltipContent>
              </Tooltip>
            ))}
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div whileHover={{ scale: 1.1 }}>
                  <div className="server-icon bg-gray-400 dark:bg-gray-700 hover:bg-green-500">
                    <PlusCircle size={24} />
                  </div>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="bg-gray-900 text-white border-none"
              >
                <p>Add a server</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </motion.div>

        {/* Channel List & User Panel */}
        <motion.div
          key={activeServerId}
          initial={{ x: -240, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-64 bg-gray-100 dark:bg-gray-800 flex flex-col shrink-0"
        >
          <div className="p-4 font-bold text-lg shadow-md h-14 flex items-center border-b border-gray-200 dark:border-gray-900/50">
            {activeServer?.name}
          </div>
          <ScrollArea className="flex-1 px-2 py-4">
            <h3 className="px-2 text-gray-500 dark:text-gray-400 font-semibold text-sm mb-2 uppercase tracking-wide">
              Text Channels
            </h3>
            {channelsForActiveServer.map((channel) => (
              <div
                key={channel.id}
                onClick={() => handleChannelSelect(channel.id)}
                className={`channel-link ${
                  channel.id === activeChannelId ? "channel-link-active" : ""
                }`}
              >
                <div className="flex items-center">
                  <Hash size={20} className="text-gray-500 mr-2" />
                  <span>{channel.name}</span>
                </div>
                {channel.unread > 0 && (
                  <div className="bg-red-500 text-white text-xs font-bold rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center">
                    {channel.unread}
                  </div>
                )}
              </div>
            ))}
          </ScrollArea>
          <div className="p-2 bg-gray-200 dark:bg-gray-900/60 h-16 flex justify-between items-center">
            <div className="flex items-center">
              <Avatar className="h-9 w-9 mr-2">
                <AvatarImage src="https://i.pravatar.cc/40?u=you" />
                <AvatarFallback>Y</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold text-sm">You</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  #1234
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
              <Mic
                size={20}
                className="cursor-pointer hover:text-gray-900 dark:hover:text-white"
                
              />
              <Headphones
                size={20}
                className="cursor-pointer hover:text-gray-900 dark:hover:text-white"
                
              />
              <Settings
                size={20}
                className="cursor-pointer hover:text-gray-900 dark:hover:text-white"
                
              />
            </div>
          </div>
        </motion.div>

        {/* Main Chat */}
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-700">
          <motion.div
            key={`${activeServerId}-${activeChannelId}`}
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="p-4 shadow-md h-14 flex items-center justify-between border-b border-gray-200 dark:border-gray-900/50"
          >
            <div className="flex items-center">
              <Hash size={24} className="text-gray-500 mr-2" />
              <h2 className="font-semibold text-lg text-gray-900 dark:text-white">
                {activeChannel?.name}
              </h2>
            </div>
            <div className="flex items-center space-x-4">
               <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="bg-transparent border-none"
                >
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
              <Search
                size={20}
                className="text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-white"
                
              />
              <Inbox
                size={20}
                className="text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-white"
                
              />
              <HelpCircle
                size={20}
                className="text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-white"
                
              />
            </div>
          </motion.div>
          <ScrollArea className="flex-1" ref={scrollAreaRef}>
            <AnimatePresence>
              <div className="p-4 space-y-6">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    layout
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                    className={`flex items-start message ${
                      msg.user === "You" ? "message-you" : ""
                    }`}
                  >
                    <Avatar className="h-10 w-10 mr-4">
                      <AvatarImage src={msg.avatar} />
                      <AvatarFallback>{msg.user.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-baseline">
                        <span
                          className={`font-bold mr-2 ${
                            msg.isOpponent
                              ? "text-red-400"
                              : msg.user === "You"
                              ? "text-green-400"
                              : "text-blue-400"
                          }`}
                        >
                          {msg.user}
                        </span>
                        {msg.isAI && (
                          <Bot size={14} className="text-yellow-400" />
                        )}
                        <span className="text-xs text-gray-500">
                          {msg.timestamp}
                        </span>
                      </div>
                      <p className="text-gray-800 dark:text-gray-200">
                        {msg.text}
                      </p>
                    </div>
                  </motion.div>
                ))}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center pl-14"
                  >
                    <Avatar className="h-10 w-10 mr-4">
                      <AvatarImage src="https://i.pravatar.cc/40?u=ai" />
                      <AvatarFallback>A</AvatarFallback>
                    </Avatar>
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </motion.div>
                )}
              </div>
            </AnimatePresence>
          </ScrollArea>
          <div className="px-4 pb-4 mt-2">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center pr-2">
              <Input
                value={typing}
                onChange={(e) => setTyping(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                className="bg-transparent border-none text-gray-800 dark:text-gray-200 placeholder-gray-500 text-base h-12"
                placeholder={`Message #${activeChannel?.name}`}
              />
              <Button
                onClick={handleSend}
                variant="ghost"
                size="icon"
                className="text-gray-500 dark:text-gray-400 hover:text-green-500 hover:bg-transparent"
              >
                <Send />
              </Button>
            </div>
          </div>
        </div>

        {/* Member List */}
        <motion.div
          key={`${activeServerId}-${activeChannelId}-members`}
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-64 bg-gray-100 dark:bg-gray-800 p-4 flex flex-col shrink-0"
        >
          <h3 className="font-bold mb-4 flex items-center uppercase text-sm text-gray-500 dark:text-gray-400 tracking-wide">
            Members - {membersForActiveChannel.length}
          </h3>
          <ScrollArea className="-mx-4 flex-1">
          <div className="space-y-4 px-4">
            {membersForActiveChannel.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between group"
              >
                <div className="flex items-center">
                  <Avatar className={`h-9 w-9 mr-2 relative`}>
                    <AvatarImage
                      src={`https://i.pravatar.cc/40?u=${member.name}`}
                    />
                     <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    <span
                      className={`bottom-0 left-6 absolute w-3 h-3 ${
                        member.status === "Online"
                          ? "bg-green-500"
                          : "bg-gray-500"
                      } border-2 border-white dark:border-gray-800 rounded-full`}
                    ></span>
                  </Avatar>
                  <div>
                    <span
                      className={`font-semibold ${
                        member.isOpponent
                          ? "text-red-400"
                          : member.isAI
                          ? "text-blue-400"
                          : "text-gray-300"
                      }`}
                    >
                      {member.name}
                    </span>
                    {member.isAI && !member.isOpponent && (
                      <span className="text-xs text-yellow-500 ml-1">MOD</span>
                    )}
                  </div>
                </div>
                <AnimatePresence>
                  {member.isOpponent && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-xs font-bold text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      OPPONENT
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
          </ScrollArea>
        </motion.div>
      </div>
    </div>
  );
};

export default DebateToolPage;
