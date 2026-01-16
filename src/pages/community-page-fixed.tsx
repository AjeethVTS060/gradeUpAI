import React, { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from 'framer-motion'; // Added motion and AnimatePresence
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Separator } from "../components/ui/separator";
import { toast } from "../hooks/use-toast";
import { apiRequest, queryClient } from "../lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import MinimalHeader from "../components/minimal-header"; // Added MinimalHeader
import { useTheme } from "../hooks/use-theme"; // Added useTheme
import {
  Users,
  MessageSquare,
  Send,
  Paperclip,
  Image as ImageIcon,
  Mic,
  MicOff,
  Play,
  Pause,
  Download,
  Star,
  Trophy,
  Target,
  TrendingUp,
  Heart,
  MessageCircle,
  Share2,
  Eye,
  EyeOff,
  Trash2,
  MoreHorizontal,
  Plus,
  Search,
  Filter,
  ChevronDown,
  BookOpen,
  Award,
  Zap,
  ArrowLeft,
  Loader2 // Added for FunnyLoader
} from "lucide-react";

const FunnyLoader = ({ text = "Building the community... please wait!" }) => (
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
            <Users className="h-20 w-20 text-green-500" />
        </motion.div>
        <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">{text}</p>
        <Loader2 className="h-8 w-8 text-green-400 animate-spin" />
    </motion.div>
);

interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  profileImage?: string;
}

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState("community");
  const [selectedConversation, setSelectedConversation] = useState<number | 'group' | null>(null);
  const [messageContent, setMessageContent] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postType, setPostType] = useState("discussion");
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [contentFilter, setContentFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showComments, setShowComments] = useState<{ [key: number]: boolean }>({});
  const [commentTexts, setCommentTexts] = useState<{ [key: number]: string }>({});
  const [isMobileChatActive, setIsMobileChatActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch current user
  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });
  const { theme, setTheme } = useTheme();

  // Fetch community data
  const { data: posts, isLoading: isLoadingPosts } = useQuery<any[]>({
    queryKey: ["/api/community/posts"],
  });

  const { data: privateMessages, isLoading: isLoadingPrivateMessages } = useQuery<any[]>({
    queryKey: ["/api/community/messages"],
  });

  const { data: groupMessages, isLoading: isLoadingGroupMessages } = useQuery<any[]>({
    queryKey: ["/api/community/group-messages"],
  });

  const { data: classmates, isLoading: isLoadingClassmates } = useQuery<any[]>({
    queryKey: ["/api/community/classmates"],
  });

  // Auto-scroll to latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [groupMessages, privateMessages, selectedConversation]);

  useEffect(() => {
    if (selectedConversation) {
      setIsMobileChatActive(true);
    }
  }, [selectedConversation]);

  const { data: communityPoints, isLoading: isLoadingCommunityPoints } = useQuery<number>({
    queryKey: ["/api/community/points"],
  });

  const { data: leaderboard, isLoading: isLoadingLeaderboard } = useQuery<any[]>({
    queryKey: ["/api/community/leaderboard"],
  });

  const { data: badges, isLoading: isLoadingBadges } = useQuery<any[]>({
    queryKey: ["/api/community/badges"],
  });

  const { data: communitySettings, isLoading: isLoadingCommunitySettings } = useQuery<any>({
    queryKey: ["/api/community/settings"],
  });

  const isLoading = isLoadingPosts || isLoadingPrivateMessages || isLoadingGroupMessages || isLoadingClassmates || isLoadingCommunityPoints || isLoadingLeaderboard || isLoadingBadges || isLoadingCommunitySettings;


  // Mutations
  const createPostMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create post');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
      setPostContent("");
      setPostType("discussion");
      toast({ title: "Post created successfully!" });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      const response = await fetch(`/api/community/posts/${postId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error('Failed to delete post');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
      toast({ title: "Post deleted successfully!" });
    },
  });

  // Like post mutation
  const likePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      const response = await fetch(`/api/community/posts/${postId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error('Failed to like post');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
    },
  });

  // Comment on post mutation
  const commentPostMutation = useMutation({
    mutationFn: async ({ postId, content }: { postId: number; content: string }) => {
      const response = await fetch(`/api/community/posts/${postId}/comments`, {
        method: "POST",
        body: JSON.stringify({ content }),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error('Failed to add comment');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
      setCommentTexts(prev => ({ ...prev, [variables.postId]: "" }));
      toast({ title: "Comment added successfully!" });
    },
  });

  // Share post mutation
  const sharePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      const response = await fetch(`/api/community/posts/${postId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error('Failed to share post');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
      toast({ title: "Post shared successfully!" });
    },
  });

  const createPrivateMessageMutation = useMutation({
    mutationFn: async (data: any) => {
      if (data.audioBlob) {
        // Handle voice message upload with FormData
        const formData = new FormData();
        formData.append('content', data.content);
        formData.append('receiverId', data.receiverId.toString());
        formData.append('courseId', data.courseId.toString());
        formData.append('messageType', 'voice');
        formData.append('audio', data.audioBlob, 'voice-message.webm');

        const response = await fetch("/api/community/messages", {
          method: "POST",
          body: formData,
        });
        if (!response.ok) throw new Error('Failed to send voice message');
        return response.json();
      } else {
        // Handle text message
        const response = await fetch("/api/community/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to send message');
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/messages"] });
      setMessageContent("");
      setAudioBlob(null);
      setAttachedFile(null);
      toast({ title: "Message sent!" });
    },
  });

  const createGroupMessageMutation = useMutation({
    mutationFn: async (data: any) => {
      if (data.audioBlob) {
        // Handle voice message upload with FormData
        const formData = new FormData();
        formData.append('content', data.content);
        formData.append('courseId', data.courseId.toString());
        formData.append('messageType', 'voice');
        formData.append('audio', data.audioBlob, 'voice-message.webm');

        const response = await fetch("/api/community/group-messages", {
          method: "POST",
          body: formData,
        });
        if (!response.ok) throw new Error('Failed to send voice message');
        return response.json();
      } else {
        // Handle text message
        const response = await fetch("/api/community/group-messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to send group message');
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/group-messages"] });
      setMessageContent("");
      setAudioBlob(null);
      setAttachedFile(null);
      toast({ title: "Group message sent!" });
    },
  });

  const sendMessage = () => {
    // console.log("sendMessage called:", { messageContent, selectedConversation, type: typeof selectedConversation, hasAudio: !!audioBlob });
    
    // Allow sending if there's text content OR an audio blob
    if ((messageContent.trim() || audioBlob) && selectedConversation) {
      const messageData = {
        content: messageContent.trim() || (audioBlob ? 'Voice message' : ''),
        courseId: 27,
        messageType: audioBlob ? 'voice' : 'text',
        audioBlob: audioBlob || null
      };

      if (selectedConversation === 'group') {
        // Send as group message
        createGroupMessageMutation.mutate(messageData);
      } else {
        // Send as private message
        createPrivateMessageMutation.mutate({
          ...messageData,
          receiverId: selectedConversation as number
        });
      }
    } else {
      if (!messageContent.trim() && !audioBlob) {
        toast({ title: "Please enter a message or record audio" });
      } else if (!selectedConversation) {
        toast({ title: "Please select a contact or group to send messages" });
      }
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      toast({ title: "Could not access microphone" });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileAttachment = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAttachedFile(file);
      toast({ title: `File "${file.name}" attached` });
    }
  };

  const createPost = () => {
    if (postContent.trim()) {
      createPostMutation.mutate({
        content: postContent.trim(),
        type: postType,
        courseId: 27
      });
    } else {
      toast({ title: "Please enter post content" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 dark:from-gray-900 dark:to-purple-950 text-gray-900 dark:text-white">
      <MinimalHeader title="Community Hub" currentTheme={theme || 'light'} onThemeChange={setTheme} />
      
      {/* Cinematic Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative h-[500px] flex items-center justify-center text-white overflow-hidden" // Increased height
      >
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Animated Gradient Background */}
          <motion.div
            className="absolute inset-0"
            initial={{ backgroundPosition: "0% 50%" }}
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{
              duration: 20,
              ease: "linear",
              repeat: Infinity,
              repeatType: "loop",
            }}
            style={{
              background: "linear-gradient(270deg, #667eea, #764ba2, #667eea)",
              backgroundSize: "200% 200%",
            }}
          />
          {/* Floating Shapes */}
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-white/10 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                scale: Math.random() * 0.5 + 0.1,
                opacity: Math.random() * 0.5 + 0.1,
              }}
              animate={{
                x: [
                  Math.random() * window.innerWidth,
                  Math.random() * window.innerWidth,
                ],
                y: [
                  Math.random() * window.innerHeight,
                  Math.random() * window.innerHeight,
                ],
                scale: [
                  Math.random() * 0.5 + 0.1,
                  Math.random() * 0.5 + 0.1,
                ],
                opacity: [
                  Math.random() * 0.5 + 0.1,
                  Math.random() * 0.5 + 0.1,
                ],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
              style={{
                width: `${Math.random() * 50 + 20}px`,
                height: `${Math.random() * 50 + 20}px`,
                filter: "blur(5px)",
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4 drop-shadow-lg">
              Connect & Thrive
            </h1>
            <p className="text-md sm:text-lg md:text-xl max-w-2xl mx-auto mb-6 opacity-90 drop-shadow-md">
              Join the GradeUp community to share knowledge, ask questions, and collaborate with peers and mentors.
            </p>
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white text-lg px-6 sm:px-8 py-3 rounded-full shadow-lg transform transition-transform duration-300 hover:scale-105"
              onClick={() => setActiveTab('community')}
            >
              Explore Feed <MessageSquare className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
        <div className="absolute top-4 left-4 z-20">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={() => window.location.href = '/dashboard'}
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </Button>
          </div>
      </motion.section>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 relative z-20 -mt-20">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-sm sm:max-w-md text-sm md:text-base bg-gradient-to-br from-white/90 to-gray-100/90 dark:from-gray-800/90 dark:to-gray-900/90 backdrop-blur-md mx-auto rounded-full p-1.5 shadow-xl border border-gray-200 dark:border-gray-700 transform transition-all duration-300 hover:scale-[1.02] mt-4 mb-8">
            <TabsTrigger
              value="community"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:font-semibold data-[state=active]:transform data-[state=active]:scale-105 transition-all duration-200 rounded-full text-gray-700 dark:text-gray-200 hover:text-purple-700 dark:hover:text-purple-300"
            >
              <MessageSquare className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="truncate">Feed</span>
            </TabsTrigger>
            <TabsTrigger
              value="messaging"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:font-semibold data-[state=active]:transform data-[state=active]:scale-105 transition-all duration-200 rounded-full text-gray-700 dark:text-gray-200 hover:text-purple-700 dark:hover:text-purple-300"
            >
              <Send className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="truncate">Messages</span>
            </TabsTrigger>
            <TabsTrigger
              value="leaderboard"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:font-semibold data-[state=active]:transform data-[state=active]:scale-105 transition-all duration-200 rounded-full text-gray-700 dark:text-gray-200 hover:text-purple-700 dark:hover:text-purple-300"
            >
              <Trophy className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="truncate">Leaders</span>
            </TabsTrigger>
          </TabsList>

          {/* Community Feed Tab */}
          <TabsContent value="community" className="space-y-6">
            {isLoadingPosts ? (
              <FunnyLoader text="Loading community posts..." />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-3 space-y-6">
                  {/* Create Post */}
                  <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-gray-900 dark:text-gray-100">Share with your class</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Select value={postType} onValueChange={setPostType}>
                        <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="discussion">Discussion</SelectItem>
                          <SelectItem value="question">Question</SelectItem>
                          <SelectItem value="achievement">Achievement</SelectItem>
                          <SelectItem value="study_tip">Study Tip</SelectItem>
                        </SelectContent>
                      </Select>
                      <Textarea
                        placeholder="What's on your mind?"
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        className="min-h-[100px] bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                      />
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileAttachment}
                            accept="image/*"
                            className="hidden"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <ImageIcon className="h-4 w-4 mr-1" />
                            Photo
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = '*/*';
                              input.onchange = (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0];
                                if (file) {
                                  setAttachedFile(file);
                                  toast({ title: `File "${file.name}" attached` });
                                }
                              };
                              input.click();
                            }}
                            className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Paperclip className="h-4 w-4 mr-1" />
                            File
                          </Button>
                          {attachedFile && (
                            <Badge variant="secondary" className="text-xs">
                              {attachedFile.name}
                            </Badge>
                          )}
                        </div>
                        <Button onClick={createPost} disabled={createPostMutation.isPending} className="bg-purple-600 hover:bg-purple-700 text-white">
                          {createPostMutation.isPending ? "Posting..." : "Post"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Search and Filter Controls */}
                  <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
                    <div className="flex-1 w-full">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Search posts..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                        />
                      </div>
                    </div>
                    <Select value={contentFilter} onValueChange={setContentFilter}>
                      <SelectTrigger className="w-full sm:w-48 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Content</SelectItem>
                        <SelectItem value="question">Questions</SelectItem>
                        <SelectItem value="discussion">Discussions</SelectItem>
                        <SelectItem value="achievement">Achievements</SelectItem>
                        <SelectItem value="study_tip">Study Tips</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Posts Feed */}
                  <div className="space-y-4">
                    {posts && Array.isArray(posts) && posts.length > 0 ? (
                      posts
                      .filter((post: any) => {
                        const matchesSearch = !searchTerm ||
                          post.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          post.author?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          post.author?.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
                        const matchesFilter = contentFilter === "all" || post.type === contentFilter;
                        return matchesSearch && matchesFilter;
                      })
                      .map((post: any, index: number) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                      >
                        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md">
                          <CardContent className="p-4 sm:p-6">
                          <div className="flex items-start space-x-4">
                            <Avatar>
                              <AvatarFallback>
                                {post.author?.firstName?.[0] || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2 flex-wrap">
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                                    {post.author?.firstName} {post.author?.lastName}
                                  </h4>
                                  <Badge variant="outline" className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                    {post.type}
                                  </Badge>
                                </div>
                                <span className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-0">
                                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                                </span>
                              </div>
                                {post.authorId === user?.id && (
                                  <div className="absolute top-2 right-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deletePostMutation.mutate(post.id)}
                                    disabled={deletePostMutation.isPending}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                  </div>
                                )}
                              <p className="text-gray-800 dark:text-gray-200 mb-3">{post.content}</p>
                              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                  <button
                                  className="flex items-center space-x-1 hover:text-red-600 transition-colors"
                                  onClick={() => likePostMutation.mutate(post.id)}
                                  disabled={likePostMutation.isPending}
                                >
                                  <Heart className={`h-4 w-4 ${post.liked ? 'fill-red-500 text-red-500' : ''}`} />
                                  <span>Like ({post.likesCount || 0})</span>
                                </button>
                                <button
                                  className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                                  onClick={() => setShowComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                                >
                                  <MessageCircle className="h-4 w-4" />
                                  <span>Comment ({post.commentsCount || 0})</span>
                                </button>
                                <button
                                  className="flex items-center space-x-1 hover:text-green-600 transition-colors"
                                  onClick={() => sharePostMutation.mutate(post.id)}
                                  disabled={sharePostMutation.isPending}
                                >
                                  <Share2 className="h-4 w-4" />
                                  <span>Share ({post.sharesCount || 0})</span>
                                </button>
                              </div>

                              {/* Comments Section */}
                              {showComments[post.id] && (
                                <div className="mt-4 border-t pt-4 border-gray-200 dark:border-gray-700">
                                  <div className="space-y-3 mb-4">
                                    {post.comments && post.comments.map((comment: any) => (
                                      <div key={comment.id} className="flex items-start space-x-3">
                                        <Avatar className="h-6 w-6">
                                          <AvatarFallback className="text-xs">
                                            {comment.author?.firstName?.[0] || 'U'}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 bg-gray-100 dark:bg-gray-700/80 rounded-lg p-3">
                                            <div className="flex items-center space-x-2 mb-1">
                                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {comment.author?.firstName} {comment.author?.lastName}
                                              </span>
                                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                              </span>
                                            </div>
                                            <p className="text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
                                          </div>                                    </div>
                                    ))}
                                  </div>

                                  {/* Add Comment Input */}
                                  <div className="flex items-center space-x-3">
                                    <Avatar className="h-8 w-8">
                                      <AvatarFallback>
                                        {user?.firstName?.[0] || 'U'}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 flex items-center space-x-2">
                                      <Input
                                        placeholder="Write a comment..."
                                        value={commentTexts[post.id] || ""}
                                        onChange={(e) => setCommentTexts(prev => ({
                                          ...prev,
                                          [post.id]: e.target.value
                                        }))}
                                        className="flex-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                                        onKeyPress={(e) => {
                                          if (e.key === 'Enter' && (commentTexts[post.id] || "").trim()) {
                                            commentPostMutation.mutate({
                                              postId: post.id,
                                              content: (commentTexts[post.id] || "").trim()
                                            });
                                          }
                                        }}
                                      />
                                      <Button
                                        size="sm"
                                        onClick={() => {
                                          if ((commentTexts[post.id] || "").trim()) {
                                            commentPostMutation.mutate({
                                              postId: post.id,
                                              content: (commentTexts[post.id] || "").trim()
                                            });
                                          }
                                        }}
                                        disabled={commentPostMutation.isPending || !(commentTexts[post.id] || "").trim()}
                                        className="bg-purple-600 hover:bg-purple-700 text-white"
                                      >
                                        Post
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      </motion.div>
                      ))
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center py-8 text-gray-500 dark:text-gray-400"
                      >
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-semibold">No posts found.</p>
                        <p className="text-sm">Be the first to share something awesome with your community!</p>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-lg text-gray-900 dark:text-gray-100">Quick Stats</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-300">Community Points</span>
                          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">{communityPoints || 0}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-300">Badges Earned</span>
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100">{badges?.length || 0}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </div>
            )}
          </TabsContent>
          {/* Messaging Tab */}
          <TabsContent value="messaging" className="space-y-6">
            {isLoadingPrivateMessages || isLoadingGroupMessages || isLoadingClassmates ? (
              <FunnyLoader text="Loading messages and contacts..." />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[70vh]">
                {/* Contact List */}
                <Card className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg lg:flex flex-col ${isMobileChatActive ? 'hidden lg:flex' : 'flex'}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-gray-900 dark:text-gray-100">
                      Messages
                      <Button size="sm" variant="ghost" className="text-purple-600 hover:text-purple-700 dark:text-purple-300 dark:hover:text-purple-400">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 overflow-y-auto flex-1">
                    <div className="space-y-1">
                      {/* Group Chat */}
                      <div
                        className={`p-4 border-b cursor-pointer transition-all duration-200 ${selectedConversation === 'group' ? 'bg-blue-50 dark:bg-blue-900/40 border-l-4 border-l-blue-500' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
                        onClick={() => setSelectedConversation('group')}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <Users className="h-10 w-10 p-2 bg-blue-100 text-blue-600 rounded-full dark:bg-blue-900 dark:text-blue-300" />
                            <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-gray-900 dark:text-gray-100">Class Group</h4>
                              <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">2m ago</span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 truncate">Click to join group chat...</p>
                          </div>
                        </div>
                      </div>

                      {/* Individual Classmates */}
                      {classmates && (classmates as any[]).map((classmate: any) => (
                        <div
                          key={classmate.id}
                          className={`p-4 border-b cursor-pointer transition-all duration-200 ${selectedConversation === classmate.id ? 'bg-blue-50 dark:bg-blue-900/40 border-l-4 border-l-blue-500' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
                          onClick={() => setSelectedConversation(classmate.id)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback>
                                  {classmate.firstName?.[0]}{classmate.lastName?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full"></div>
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <div className="flex items-center justify-between">
                                <h4 className="font-medium text-gray-900 dark:text-gray-100">{classmate.firstName} {classmate.lastName}</h4>
                                <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">5m ago</span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 truncate">Hey, can you help me with...</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Chat Window */}
                <div className={`lg:col-span-3 ${isMobileChatActive ? 'block' : 'hidden lg:block'}`}>
                  {selectedConversation ? (
                    <Card className="h-full flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
                      <CardHeader className="border-b border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex items-center space-x-3">
                           <Button
                              variant="ghost"
                              size="icon"
                              className="lg:hidden mr-2"
                              onClick={() => setIsMobileChatActive(false)}
                            >
                              <ArrowLeft className="h-5 w-5" />
                            </Button>
                          <Avatar>
                            <AvatarFallback className="bg-purple-200 text-purple-800 dark:bg-purple-800 dark:text-purple-200">
                              {selectedConversation === 'group' ? 'G' :
                               classmates?.find(c => c.id === selectedConversation)?.firstName[0] || 'U'
                              }
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                              {selectedConversation === 'group' ? 'Class Group Chat' :
                               classmates?.find(c => c.id === selectedConversation)?.firstName + ' ' + classmates?.find(c => c.id === selectedConversation)?.lastName || 'Chat'
                              }
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {selectedConversation === 'group' ? 'Online' : 'Last seen 2 minutes ago'}
                            </p>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="flex-1 p-0 flex flex-col">
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                          {selectedConversation === 'group' ? (
                            // Show group messages
                            groupMessages && (groupMessages as any[]).length > 0 ? (
                              (groupMessages as any[])
                                .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                                .map((message: any) => (
                                <div key={message.id} className={`flex items-start space-x-3 mb-4 ${message.senderId === user?.id ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback className={message.senderId === user?.id ? 'bg-purple-500 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200'}>
                                      {message.senderId === user?.id ? user?.firstName?.[0] : (message.sender?.firstName?.[0] || 'U')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className={`flex-1 ${message.senderId === user?.id ? 'items-end' : 'items-start'} flex flex-col`}>
                                    <div className={`inline-block rounded-xl p-3 max-w-xs ${message.senderId === user?.id ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100'}`}>
                                      {message.messageType === 'voice' && message.audioUrl ? (
                                        <div className="flex items-center space-x-2">
                                          <button
                                            onClick={() => {
                                              const audio = new Audio(message.audioUrl);
                                              audio.play();
                                            }}
                                            className="p-2 rounded-full bg-opacity-20 bg-white hover:bg-opacity-30"
                                          >
                                            <Play className="h-4 w-4" />
                                          </button>
                                          <span className="text-xs">Voice message</span>
                                        </div>
                                      ) : (
                                        <p className="text-sm">{message.content}</p>
                                      )}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                      <span className="font-medium">
                                        {message.senderId === user?.id ? 'You' : (message.sender?.firstName || 'Classmate')}
                                      </span>
                                      <span> • {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}</span>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
                                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm text-gray-500 dark:text-gray-400">No group messages yet. Start the conversation!</p>
                              </div>
                            )
                          ) : (
                            // Show private messages
                            privateMessages && (privateMessages as any[]).length > 0 ? (
                              (privateMessages as any[])
                                .filter((msg: any) =>
                                  (msg.senderId === selectedConversation || msg.receiverId === selectedConversation)
                                )
                                .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                                .map((message: any) => (
                                  <div key={message.id} className={`flex items-start space-x-3 mb-4 ${message.senderId === user?.id ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                    <Avatar className="h-8 w-8">
                                      <AvatarFallback className={message.senderId === user?.id ? 'bg-purple-500 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200'}>
                                        {message.senderId === user?.id ? user?.firstName?.[0] : (
                                          classmates?.find(c => c.id === selectedConversation)?.firstName[0] || 'U'
                                        )}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className={`flex-1 ${message.senderId === user?.id ? 'items-end' : 'items-start'} flex flex-col`}>
                                      <div className={`inline-block rounded-xl p-3 max-w-xs ${message.senderId === user?.id ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100'}`}>
                                        {message.messageType === 'voice' && message.audioUrl ? (
                                          <div className="flex items-center space-x-2">
                                            <button
                                              onClick={() => {
                                                const audio = new Audio(message.audioUrl);
                                                audio.play();
                                              }}
                                              className="p-2 rounded-full bg-opacity-20 bg-white hover:bg-opacity-30"
                                            >
                                              <Play className="h-4 w-4" />
                                            </button>
                                            <span className="text-xs">Voice message</span>
                                          </div>
                                        ) : (
                                          <p className="text-sm">{message.content}</p>
                                        )}
                                      </div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        <span className="font-medium">
                                          {message.senderId === user?.id ? 'You' : (
                                            classmates?.find(c => c.id === selectedConversation)?.firstName || 'Classmate'
                                          )}
                                        </span>
                                        <span> • {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}</span>
                                      </div>
                                    </div>
                                  </div>
                                ))
                            ) : (
                              <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
                                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm text-gray-500 dark:text-gray-400">No messages yet. Start the conversation!</p>
                              </div>
                            )
                          )}
                          <div ref={messagesEndRef} />
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-700 p-2 sm:p-4">
                          {audioBlob && (
                            <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/40 rounded-lg flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Mic className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                                <span className="text-sm text-blue-800 dark:text-blue-200">Voice message recorded</span>
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => setAudioBlob(null)} className="text-red-500 hover:text-red-700 dark:text-red-300 dark:hover:text-red-400">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}

                          {attachedFile && (
                            <div className="mb-3 p-3 bg-green-50 dark:bg-green-900/40 rounded-lg flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Paperclip className="h-4 w-4 text-green-600 dark:text-green-300" />
                                <span className="text-sm text-green-800 dark:text-green-200 truncate">{attachedFile.name}</span>
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => setAttachedFile(null)} className="text-red-500 hover:text-red-700 dark:text-red-300 dark:hover:text-red-400">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}

                          <div className="flex items-center space-x-2">
                            <Input
                              placeholder="Type your message..."
                              value={messageContent}
                              onChange={(e) => setMessageContent(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                              className="flex-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                            />
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleFileAttachment}
                              className="hidden"
                              accept="image/*,application/pdf,.doc,.docx"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => fileInputRef.current?.click()}
                              className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hidden sm:inline-flex"
                            >
                              <Paperclip className="h-5 w-5" />
                            </Button>
                            <Button
                              variant={isRecording ? "destructive" : "ghost"}
                              size="icon"
                              onClick={isRecording ? stopRecording : startRecording}
                              className={isRecording ? "bg-red-500 text-white hover:bg-red-600" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"}
                            >
                              {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                            </Button>
                            <Button onClick={sendMessage} disabled={createPrivateMessageMutation.isPending || createGroupMessageMutation.isPending} className="bg-purple-600 hover:bg-purple-700 text-white">
                              <Send className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="h-full bg-white dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700 shadow-lg">
                      <div className="text-center text-gray-500 dark:text-gray-300">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <h3 className="font-medium mb-2 text-gray-900 dark:text-gray-100">Select a conversation</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Choose a classmate or group to start messaging</p>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-6">
            {isLoadingLeaderboard || isLoadingCommunityPoints || isLoadingBadges ? (
              <FunnyLoader text="Tallying points and achievements..." />
            ) : (
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-gray-100">Class Leaderboard</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {leaderboard && (leaderboard as any[]).map((student: any, index: number) => (
                      <motion.div
                        key={student.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08, duration: 0.4 }}
                      >
                        <div className="flex items-center space-x-4 p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                          <div className="text-xl sm:text-2xl font-bold text-gray-400 dark:text-gray-300 w-8 text-center">#{index + 1}</div>
                          <Avatar>
                            <AvatarFallback className="bg-purple-200 text-purple-800 dark:bg-purple-800 dark:text-purple-200">
                              {student.firstName?.[0]}{student.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100">{student.firstName} {student.lastName}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{student.points} points</p>
                          </div>
                          <Badge variant={index === 0 ? "default" : "secondary"} className={index === 0 ? "bg-yellow-400 text-yellow-900 dark:bg-yellow-600 dark:text-yellow-100 font-bold" : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"}>
                            {index === 0 ? "🏆" : ""} {index < 3 ? ['Champion', 'Pro', 'Rising Star'][index] : `${student.points} pts`}
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}