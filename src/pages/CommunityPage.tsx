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
  Sun,
  Moon,
  Menu,
  Users,
  X,
  ShieldCheck,
  PartyPopper, // Added PartyPopper import
} from "lucide-react";
import { useTheme } from "../hooks/use-theme";
import { cn } from "../lib/utils";
import { useMediaQuery } from "../hooks/use-media-query";

const debateData = {
  servers: [
    { id: "1", name: "General Debate", icon: "🌍", defaultChannel: "1" },
    { id: "2", name: "History Buffs", icon: "📜", defaultChannel: "3" },
    { id: "3", name: "Science Geeks", icon: "🔬", defaultChannel: "3" },
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
        text: "Welcome to #stoicism! To quote Marcus Aurelius: 'You have power over your mind - not outside events.'",
        timestamp: "2 hours ago",
        isAI: true,
      },
      {
        id: "2",
        user: "You",
        avatar: "https://i.pravatar.cc/40?u=you",
        text: "How can one apply this in a high-stress modern work environment?",
        timestamp: "1 hour ago",
      },
      {
        id: "3",
        user: "Epictetus",
        avatar: "https://i.pravatar.cc/40?u=epictetus",
        text: "The essence lies in distinguishing what you can control from what you cannot.",
        timestamp: "30 minutes ago",
        isAI: true,
        isOpponent: true,
      },
    ],
  },
  members: {
    "2_3": [
      { id: "1", name: "AI Moderator", status: "Online", isAI: true },
      { id: "2", name: "You", status: "Online" },
      { id: "3", name: "Winston Churchill", status: "Online", isAI: true, isOpponent: true },
    ],
    "4_1": [
      { id: "1", name: "AI Moderator", status: "Online", isAI: true },
      { id: "2", name: "You", status: "Online" },
      { id: "3", name: "Epictetus", status: "Online", isAI: true, isOpponent: true },
      { id: "4", name: "Seneca", status: "Online", isAI: true, isOpponent: true },
    ],
  },
};

const initialServerId = "2";
const initialChannelId = "3";

const DebateToolPage = () => {
  const { theme, setTheme } = useTheme();
  const [activeServerId, setActiveServerId] = useState(initialServerId);
  const [activeChannelId, setActiveChannelId] = useState(initialChannelId);
  const [messages, setMessages] = useState(debateData.messages[`${activeServerId}_${activeChannelId}`] || []);
  const [typing, setTyping] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Responsive breakpoints
  const isDesktop = useMediaQuery("(min-width: 1280px)"); // Large laptops/Desktops
  const isLaptop = useMediaQuery("(min-width: 1024px)");  // Standard laptops
  const isTablet = useMediaQuery("(min-width: 768px)");   // Tablets

  const [isChannelListOpen, setChannelListOpen] = useState(false);
  const [isMemberListOpen, setMemberListOpen] = useState(false);

  const activeServer = debateData.servers.find((s) => s.id === activeServerId);
  const channelsForActiveServer = debateData.channels[activeServerId] || [];
  const activeChannel = channelsForActiveServer.find((c) => c.id === activeChannelId);
  const membersForActiveChannel = debateData.members[`${activeServerId}_${activeChannelId}`] || [];

  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector("[data-radix-scroll-area-viewport]");
    if (viewport) {
      viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleServerSelect = (serverId: string) => {
    setActiveServerId(serverId);
    const newServer = debateData.servers.find((s) => s.id === serverId);
    const newChannelId = newServer?.defaultChannel || debateData.channels[serverId]?.[0]?.id || "1";
    setActiveChannelId(newChannelId);
    setMessages(debateData.messages[`${serverId}_${newChannelId}`] || []);
    if (!isTablet) setChannelListOpen(false);
  };

  const handleChannelSelect = (channelId: string) => {
    setActiveChannelId(channelId);
    setMessages(debateData.messages[`${activeServerId}_${channelId}`] || []);
    if (!isLaptop) setChannelListOpen(false);
  };

  const handleSend = () => {
    if (typing.trim() === "") return;
    const key = `${activeServerId}_${activeChannelId}`;
    const newMessage = {
      id: Date.now().toString(),
      user: "You",
      avatar: "https://i.pravatar.cc/40?u=you",
      text: typing,
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, newMessage]);
    if (!debateData.messages[key]) debateData.messages[key] = [];
    debateData.messages[key].push(newMessage);
    setTyping("");

    setIsTyping(true);
    setTimeout(() => {
      const opponents = membersForActiveChannel.filter((m) => m.isOpponent);
      const randomOpponent = opponents[Math.floor(Math.random() * opponents.length)] || { name: "AI Opponent" };

      const opponentResponse = {
        id: (Date.now() + 1).toString(),
        user: randomOpponent.name,
        avatar: `https://i.pravatar.cc/40?u=${randomOpponent.name}`,
        text: "I have processed your point. However, looking at the structural evidence, one might argue differently.",
        timestamp: "Just now",
        isAI: true,
        isOpponent: true,
      };
      setMessages((prev) => [...prev, opponentResponse]);
      debateData.messages[key].push(opponentResponse);
      setIsTyping(false);
    }, 1500);
  };

  const pageVariants = {
    initial: {
      opacity: 0,
      x: "-100vw",
    },
    in: {
      opacity: 1,
      x: 0,
    },
    out: {
      opacity: 0,
      x: "100vw",
    },
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.5,
  };

  return (
    <motion.div
      className={cn("flex h-screen w-full bg-white dark:bg-gray-900 font-sans overflow-hidden transition-colors duration-300", theme)}
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      
      {/* 1. SERVER SIDEBAR (Fixed Width - Mobile/Desktop) */}
      <div className="w-[72px] sm:w-20 bg-gray-200 dark:bg-[#111214] p-3 flex flex-col items-center space-y-3 shrink-0 border-r border-black/5 dark:border-none">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-white text-lg font-bold cursor-pointer hover:bg-indigo-600 transition-all">
          AI
        </div>
        <div className="w-8 h-[2px] bg-gray-300 dark:bg-gray-800 rounded-full" />
        
        <TooltipProvider delayDuration={0}>
          <ScrollArea className="w-full">
            <div className="flex flex-col items-center space-y-3 pb-4">
              {debateData.servers.map((server) => (
                <Tooltip key={server.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => handleServerSelect(server.id)}
                      className={cn(
                        "group relative w-12 h-12 flex items-center justify-center text-xl transition-all duration-200",
                        activeServerId === server.id 
                          ? "rounded-2xl bg-indigo-500 text-white" 
                          : "rounded-[24px] bg-gray-300 dark:bg-[#313338] text-gray-700 dark:text-gray-200 hover:rounded-2xl hover:bg-indigo-500 hover:text-white"
                      )}
                    >
                      {server.icon}
                      {activeServerId === server.id && (
                        <div className="absolute -left-3 w-1 h-10 bg-white rounded-r-full" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-black text-white font-bold border-none">{server.name}</TooltipContent>
                </Tooltip>
              ))}
              <button className="w-12 h-12 rounded-[24px] bg-gray-300 dark:bg-[#313338] flex items-center justify-center text-green-500 hover:rounded-2xl hover:bg-green-500 hover:text-white transition-all">
                <PlusCircle size={25} />
              </button>
            </div>
          </ScrollArea>
        </TooltipProvider>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        
        {/* 2. CHANNEL LIST (Overlay on Mobile/Tablet, Fixed on Desktop) */}
        <AnimatePresence>
          {(isChannelListOpen || isLaptop) && (
            <>
              {!isLaptop && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={() => setChannelListOpen(false)}
                  className="fixed inset-0 bg-black/60 z-30 lg:hidden"
                />
              )}
              <motion.div
                initial={isLaptop ? false : { x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className={cn(
                  "absolute lg:relative z-40 w-60 h-full bg-[#f2f3f5] dark:bg-[#2b2d31] flex flex-col shrink-0",
                  !isLaptop && "shadow-2xl"
                )}
              >
                <div className="h-12 px-4 flex items-center justify-between shadow-sm border-b border-black/5 dark:border-black/20">
                  <span className="font-bold truncate dark:text-white text-sm uppercase tracking-tight">
                    {activeServer?.name}
                  </span>
                  <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setChannelListOpen(false)}>
                    <X size={18} />
                  </Button>
                </div>

                <ScrollArea className="flex-1 px-2 mt-3">
                  <div className="space-y-[2px]">
                    <p className="px-2 pb-2 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Text Channels</p>
                    {channelsForActiveServer.map((channel) => (
                      <button
                        key={channel.id}
                        onClick={() => handleChannelSelect(channel.id)}
                        className={cn(
                          "w-full flex items-center px-2 py-1.5 rounded-md group transition-colors",
                          channel.id === activeChannelId 
                            ? "bg-gray-300/50 dark:bg-[#3f4147] text-gray-900 dark:text-white" 
                            : "text-gray-500 hover:bg-gray-300/30 dark:hover:bg-[#35373c] hover:text-gray-700 dark:hover:text-gray-200"
                        )}
                      >
                        <Hash size={18} className="mr-1.5 opacity-40" />
                        <span className="truncate font-medium text-sm">{channel.name}</span>
                        {channel.unread > 0 && <div className="ml-auto w-2 h-2 bg-red-500 rounded-full" />}
                      </button>
                    ))}
                  </div>
                </ScrollArea>

                {/* User Control Panel */}
                <div className="p-2 bg-[#ebedef] dark:bg-[#232428] flex items-center justify-between gap-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar className="h-8 w-8"><AvatarImage src="https://i.pravatar.cc/40?u=you" /></Avatar>
                    <div className="truncate text-[11px] font-bold dark:text-white leading-tight">
                      You <p className="text-[9px] font-normal text-gray-500">#0001</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Button variant="ghost" size="icon" className="h-7 w-7"><Mic size={14} /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7"><Settings size={14} /></Button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* 3. MAIN CHAT AREA */}
        <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#313338]">
          <header className="h-12 px-4 flex items-center justify-between border-b border-black/5 dark:border-black/20 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8" onClick={() => setChannelListOpen(true)}>
                <Menu size={20} />
              </Button>
              <Hash className="text-gray-400" size={20} />
              <h2 className="font-bold text-sm dark:text-white truncate">{activeChannel?.name}</h2>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </Button>
              <div className="hidden sm:flex items-center bg-gray-200 dark:bg-[#1e1f22] px-2 rounded h-7">
                 <Input className="border-none bg-transparent h-full w-24 text-xs focus-visible:ring-0" placeholder="Search" />
                 <Search size={12} className="text-gray-400" />
              </div>
              <Button variant="ghost" size="icon" className="xl:hidden h-8 w-8" onClick={() => setMemberListOpen(true)}>
                <Users size={18} />
              </Button>
            </div>
          </header>

          <ScrollArea className="flex-1" ref={scrollAreaRef}>
            <div className="p-4 space-y-4">
               {/* Welcome Message Header */}
               <div className="py-8 px-4 border-b border-black/5 dark:border-white/5 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-[#41434a] flex items-center justify-center mb-4 text-3xl">#</div>
                  <h1 className="text-2xl font-bold dark:text-white">Welcome to #{activeChannel?.name}!</h1>
                  <p className="text-gray-500 text-sm">This is the start of the #{activeChannel?.name} channel.</p>
               </div>

               {messages.map((msg) => (
                <div key={msg.id} className="flex gap-4 group hover:bg-black/[0.02] dark:hover:bg-black/[0.05] -mx-4 px-4 py-1">
                  <Avatar className="h-10 w-10 mt-0.5 shrink-0 rounded-full overflow-hidden">
                    <AvatarImage src={msg.avatar} />
                    <AvatarFallback className="bg-indigo-500 text-white">{msg.user[0]}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={cn("font-bold text-sm", 
                        msg.isOpponent ? "text-red-500" : msg.isAI ? "text-blue-500" : "text-gray-900 dark:text-white"
                      )}>
                        {msg.user}
                      </span>
                      {msg.isAI && (
                        <span className="flex items-center gap-0.5 bg-indigo-500 text-white text-[10px] px-1 rounded-sm h-4">
                          <Bot size={10} /> BOT
                        </span>
                      )}
                      <span className="text-[10px] text-gray-500">{msg.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-normal break-words">{msg.text}</p>
                  </div>
                </div>
               ))}
               {isTyping && (
                 <div className="flex items-center gap-2 text-xs text-gray-500 ml-14">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
                    </div>
                    Someone is thinking...
                 </div>
               )}
            </div>
          </ScrollArea>

          <div className="px-4 pb-6 pt-2 shrink-0">
            <div className="bg-[#ebedef] dark:bg-[#383a40] rounded-lg flex items-center px-4 min-h-[44px]">
              <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors mr-3 shrink-0">
                <PartyPopper size={20} />
              </button>
              <Input 
                value={typing}
                onChange={(e) => e.target.value.length <= 250 && setTyping(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="flex-1 bg-transparent border-none text-sm focus-visible:ring-0 focus-visible:ring-offset-0 px-0 dark:text-white" 
                placeholder={`Message #${activeChannel?.name}`} 
              />
              <button onClick={handleSend} className="ml-3 text-gray-400 hover:text-indigo-500">
                <Send size={20} />
              </button>
            </div>
          </div>
        </main>

        {/* 4. MEMBER LIST (Slide-over Laptop, Fixed Desktop XL) */}
        <AnimatePresence>
          {(isMemberListOpen || isDesktop) && (
            <>
              {!isDesktop && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={() => setMemberListOpen(false)}
                  className="fixed inset-0 bg-black/60 z-30 xl:hidden"
                />
              )}
              <motion.div
                initial={isDesktop ? false : { x: 300 }}
                animate={{ x: 0 }}
                exit={{ x: 300 }}
                className={cn(
                  "absolute xl:relative right-0 z-40 w-60 h-full bg-[#f2f3f5] dark:bg-[#2b2d31] flex flex-col shrink-0",
                  !isDesktop && "shadow-2xl"
                )}
              >
                <div className="h-12 px-4 flex items-center justify-between border-b border-black/5 dark:border-black/20">
                   <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Members — {membersForActiveChannel.length}</p>
                   <Button variant="ghost" size="icon" className="xl:hidden h-8 w-8" onClick={() => setMemberListOpen(false)}><X size={18} /></Button>
                </div>
                <ScrollArea className="flex-1 p-3">
                   <div className="space-y-4">
                      {membersForActiveChannel.map(member => (
                        <div key={member.id} className="flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-gray-300/30 dark:hover:bg-white/[0.05] cursor-pointer group">
                           <div className="relative shrink-0">
                              <Avatar className="h-8 w-8"><AvatarImage src={`https://i.pravatar.cc/40?u=${member.name}`} /></Avatar>
                              <div className={cn("absolute bottom-0 right-0 w-3 h-3 border-2 border-[#f2f3f5] dark:border-[#2b2d31] rounded-full", 
                                member.status === "Online" ? "bg-green-500" : "bg-gray-500"
                              )} />
                           </div>
                           <div className="min-w-0">
                              <div className="flex items-center gap-1">
                                <span className={cn("text-sm font-medium truncate", member.isOpponent ? "text-red-400" : "dark:text-gray-300")}>
                                  {member.name}
                                </span>
                                {member.isAI && !member.isOpponent && <ShieldCheck size={12} className="text-indigo-400" />}
                              </div>
                              {member.isOpponent && <p className="text-[9px] font-bold text-red-500 tracking-tighter uppercase">Opponent</p>}
                           </div>
                        </div>
                      ))}
                   </div>
                </ScrollArea>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default DebateToolPage;