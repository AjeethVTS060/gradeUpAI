import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
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
  ArrowLeft
} from "lucide-react";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch current user
  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  // Fetch community data
  const { data: posts } = useQuery<any[]>({
    queryKey: ["/api/community/posts"],
  });

  const { data: privateMessages } = useQuery<any[]>({
    queryKey: ["/api/community/messages"],
  });

  const { data: groupMessages } = useQuery<any[]>({
    queryKey: ["/api/community/group-messages"],
  });

  const { data: classmates } = useQuery<any[]>({
    queryKey: ["/api/community/classmates"],
  });

  // Auto-scroll to latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [groupMessages, privateMessages, selectedConversation]);

  const { data: communityPoints } = useQuery<number>({
    queryKey: ["/api/community/points"],
  });

  const { data: leaderboard } = useQuery<any[]>({
    queryKey: ["/api/community/leaderboard"],
  });

  const { data: badges } = useQuery<any[]>({
    queryKey: ["/api/community/badges"],
  });

  const { data: communitySettings } = useQuery<any>({
    queryKey: ["/api/community/settings"],
  });

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
    console.log("sendMessage called:", { messageContent, selectedConversation, type: typeof selectedConversation, hasAudio: !!audioBlob });
    
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
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-4 sm:mb-6">
          <div className="mb-3 sm:mb-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900"
              onClick={() => window.location.href = '/dashboard'}
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Community Hub</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Connect, learn, and grow together</p>
            </div>
            <div className="flex items-center">
              <Badge variant="secondary" className="px-2.5 sm:px-3 py-1 text-xs sm:text-sm">
                <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                {communityPoints || 0} Points
              </Badge>
            </div>
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-sm sm:max-w-md text-xs sm:text-sm">
            <TabsTrigger value="community">Community Feed</TabsTrigger>
            <TabsTrigger value="messaging">Messages</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>

          {/* Community Feed Tab */}
          <TabsContent value="community" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Create Post */}
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Share with your class</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Select value={postType} onValueChange={setPostType}>
                      <SelectTrigger>
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
                      className="min-h-[100px]"
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
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
                      <Button onClick={createPost} disabled={createPostMutation.isPending}>
                        {createPostMutation.isPending ? "Posting..." : "Post"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Search and Filter Controls */}
                <div className="flex items-center space-x-4 mt-6 mb-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search posts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={contentFilter} onValueChange={setContentFilter}>
                    <SelectTrigger className="w-48">
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
                    .map((post: any) => (
                    <Card key={post.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <Avatar>
                            <AvatarFallback>
                              {post.author?.firstName?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-semibold">
                                  {post.author?.firstName} {post.author?.lastName}
                                </h4>
                                <Badge variant="outline" className="text-xs">
                                  {post.type}
                                </Badge>
                                <span className="text-sm text-gray-500">
                                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                                </span>
                              </div>
                              {post.authorId === user?.id && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deletePostMutation.mutate(post.id)}
                                  disabled={deletePostMutation.isPending}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                            <p className="text-gray-800 mb-3">{post.content}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
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
                              <div className="mt-4 border-t pt-4">
                                <div className="space-y-3 mb-4">
                                  {post.comments && post.comments.map((comment: any) => (
                                    <div key={comment.id} className="flex items-start space-x-3">
                                      <Avatar className="h-6 w-6">
                                        <AvatarFallback className="text-xs">
                                          {comment.author?.firstName?.[0] || 'U'}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1 bg-gray-50 rounded-lg p-3">
                                        <div className="flex items-center space-x-2 mb-1">
                                          <span className="text-sm font-medium">
                                            {comment.author?.firstName} {comment.author?.lastName}
                                          </span>
                                          <span className="text-xs text-gray-500">
                                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                          </span>
                                        </div>
                                        <p className="text-sm text-gray-700">{comment.content}</p>
                                      </div>
                                    </div>
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
                                      className="flex-1"
                                      onKeyPress={(e) => {
                                        if (e.key === 'Enter' && commentTexts[post.id]?.trim()) {
                                          commentPostMutation.mutate({
                                            postId: post.id,
                                            content: commentTexts[post.id].trim()
                                          });
                                        }
                                      }}
                                    />
                                    <Button 
                                      size="sm"
                                      onClick={() => {
                                        if (commentTexts[post.id]?.trim()) {
                                          commentPostMutation.mutate({
                                            postId: post.id,
                                            content: commentTexts[post.id].trim()
                                          });
                                        }
                                      }}
                                      disabled={commentPostMutation.isPending || !commentTexts[post.id]?.trim()}
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
                  ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No posts found. Be the first to share something!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Community Points</span>
                      <Badge variant="secondary">{communityPoints || 0}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Badges Earned</span>
                      <Badge variant="secondary">{badges?.length || 0}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Messaging Tab */}
          <TabsContent value="messaging" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Contact List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Messages
                    <Button size="sm" variant="ghost">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-1">
                    {/* Group Chat */}
                    <div 
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${selectedConversation === 'group' ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                      onClick={() => setSelectedConversation('group')}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Users className="h-10 w-10 p-2 bg-blue-100 text-blue-600 rounded-full" />
                          <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full"></div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Class Group</h4>
                            <span className="text-xs text-gray-500">2m ago</span>
                          </div>
                          <p className="text-sm text-gray-600 truncate">Click to join group chat...</p>
                        </div>
                      </div>
                    </div>

                    {/* Individual Classmates */}
                    {classmates && (classmates as any[]).map((classmate: any) => (
                      <div 
                        key={classmate.id}
                        className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${selectedConversation === classmate.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
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
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{classmate.firstName} {classmate.lastName}</h4>
                              <span className="text-xs text-gray-500">5m ago</span>
                            </div>
                            <p className="text-sm text-gray-600 truncate">Hey, can you help me with...</p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Test Contacts */}
                    <div 
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${selectedConversation === 6 ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                      onClick={() => setSelectedConversation(6)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>AJ</AvatarFallback>
                          </Avatar>
                          <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full"></div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Alice Johnson</h4>
                            <span className="text-xs text-gray-500">2m ago</span>
                          </div>
                          <p className="text-sm text-gray-600 truncate">Hi! Need help with problem 5.</p>
                        </div>
                      </div>
                    </div>

                    <div 
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${selectedConversation === 7 ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                      onClick={() => setSelectedConversation(7)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>BS</AvatarFallback>
                          </Avatar>
                          <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full"></div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Bob Smith</h4>
                            <span className="text-xs text-gray-500">5m ago</span>
                          </div>
                          <p className="text-sm text-gray-600 truncate">Ready for tomorrow's exam?</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Chat Window */}
              <div className="lg:col-span-3">
                {selectedConversation ? (
                  <Card className="h-96">
                    <CardHeader className="border-b">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>
                            {selectedConversation === 'group' ? 'G' : 
                             selectedConversation === 6 ? 'AJ' :
                             selectedConversation === 7 ? 'BS' : 'U'
                            }
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">
                            {selectedConversation === 'group' ? 'Class Group Chat' :
                             selectedConversation === 6 ? 'Alice Johnson' :
                             selectedConversation === 7 ? 'Bob Smith' : 'Chat'
                            }
                          </h3>
                          <p className="text-sm text-gray-500">
                            {selectedConversation === 'group' ? 'Online' : 'Last seen 2 minutes ago'}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="flex-1 p-0">
                      <div className="h-64 overflow-y-auto p-4 space-y-4">
                        {selectedConversation === 'group' ? (
                          // Show group messages
                          groupMessages && (groupMessages as any[]).length > 0 ? (
                            (groupMessages as any[])
                              .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                              .map((message: any) => (
                              <div key={message.id} className={`flex items-start space-x-3 mb-4 ${message.senderId === user?.id ? 'flex-row-reverse' : ''}`}>
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className={message.senderId === user?.id ? 'bg-blue-500 text-white' : 'bg-gray-300'}>
                                    {message.senderId === user?.id ? user?.firstName?.[0] : (message.sender?.firstName?.[0] || 'U')}
                                  </AvatarFallback>
                                </Avatar>
                                <div className={`flex-1 ${message.senderId === user?.id ? 'text-right' : 'text-left'}`}>
                                  <div className={`inline-block rounded-lg p-3 max-w-xs ${message.senderId === user?.id ? 'bg-blue-500 text-white ml-auto' : 'bg-gray-100 text-gray-800'}`}>
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
                                  <div className={`text-xs text-gray-500 mt-1 ${message.senderId === user?.id ? 'text-right' : 'text-left'}`}>
                                    <span className="font-medium">
                                      {message.senderId === user?.id ? 'You' : (message.sender?.firstName || 'Classmate')}
                                    </span>
                                    <span> • {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}</span>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center text-gray-500 mt-8">
                              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">No group messages yet. Start the conversation!</p>
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
                                <div key={message.id} className={`flex items-start space-x-3 mb-4 ${message.senderId === user?.id ? 'flex-row-reverse' : ''}`}>
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback className={message.senderId === user?.id ? 'bg-blue-500 text-white' : 'bg-gray-300'}>
                                      {message.senderId === user?.id ? user?.firstName?.[0] : (
                                        selectedConversation === 6 ? 'AJ' :
                                        selectedConversation === 7 ? 'BS' : 'U'
                                      )}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className={`flex-1 ${message.senderId === user?.id ? 'text-right' : 'text-left'}`}>
                                    <div className={`inline-block rounded-lg p-3 max-w-xs ${message.senderId === user?.id ? 'bg-blue-500 text-white ml-auto' : 'bg-gray-100 text-gray-800'}`}>
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
                                    <div className={`text-xs text-gray-500 mt-1 ${message.senderId === user?.id ? 'text-right' : 'text-left'}`}>
                                      <span className="font-medium">
                                        {message.senderId === user?.id ? 'You' : (
                                          selectedConversation === 6 ? 'Alice Johnson' :
                                          selectedConversation === 7 ? 'Bob Smith' : 'Classmate'
                                        )}
                                      </span>
                                      <span> • {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}</span>
                                    </div>
                                  </div>
                                </div>
                              ))
                          ) : (
                            <div className="text-center text-gray-500 mt-8">
                              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">No messages yet. Start the conversation!</p>
                            </div>
                          )
                        )}
                        <div ref={messagesEndRef} />
                      </div>

                      <div className="border-t p-4">
                        {audioBlob && (
                          <div className="mb-3 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Mic className="h-4 w-4 text-blue-600" />
                              <span className="text-sm text-blue-800">Voice message recorded</span>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setAudioBlob(null)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}

                        {attachedFile && (
                          <div className="mb-3 p-3 bg-green-50 rounded-lg flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Paperclip className="h-4 w-4 text-green-600" />
                              <span className="text-sm text-green-800">{attachedFile.name}</span>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setAttachedFile(null)}>
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
                            className="flex-1"
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
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Paperclip className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <ImageIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={isRecording ? "destructive" : "ghost"}
                            size="sm"
                            onClick={isRecording ? stopRecording : startRecording}
                          >
                            {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                          </Button>
                          <Button onClick={sendMessage} disabled={createPrivateMessageMutation.isPending || createGroupMessageMutation.isPending}>
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="h-96 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <h3 className="font-medium mb-2">Select a conversation</h3>
                      <p className="text-sm">Choose a classmate or group to start messaging</p>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Class Leaderboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaderboard && (leaderboard as any[]).map((student: any, index: number) => (
                    <div key={student.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-gray-400">#{index + 1}</div>
                      <Avatar>
                        <AvatarFallback>
                          {student.firstName?.[0]}{student.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-semibold">{student.firstName} {student.lastName}</h4>
                        <p className="text-sm text-gray-600">{student.points} points</p>
                      </div>
                      <Badge variant={index === 0 ? "default" : "secondary"}>
                        {index === 0 ? "🏆 Champion" : `${student.points} pts`}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}