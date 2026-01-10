import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../hooks/use-auth";
import { queryClient, apiRequest } from "../lib/queryClient";
import { Link } from "wouter";
import { 
  ArrowLeft, Heart, MessageCircle, Share2, Trophy, Star, 
  Crown, Medal, Award, Flame, Users, MessageSquare, 
  Settings, Pin, ThumbsUp, Send, Image, Paperclip,
  CheckCircle, XCircle, Eye, EyeOff, Filter, Search,
  TrendingUp, Calendar, Clock, Target
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { 
  CommunityPost, InsertCommunityPost, PostComment, InsertPostComment,
  PrivateMessage, InsertPrivateMessage, CommunitySettings, User,
  CommunityPoints, CommunityBadge, UserBadge
} from "@shared/schema";

export default function CommunityPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("feed");
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostType, setNewPostType] = useState<"general" | "photo" | "celebration" | "announcement" | "discussion" | "achievement" | "question">("general");
  const [showMessaging, setShowMessaging] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<number | string | null>(null);
  const [messageContent, setMessageContent] = useState("");
  const [filterType, setFilterType] = useState<"all" | "general" | "photo" | "celebration" | "announcement" | "discussion" | "achievement" | "question">("all");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Queries
  const { data: courses = [] } = useQuery({
    queryKey: ["/api/courses"],
  });

  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ["/api/community/posts", selectedCourse, filterType, searchQuery],
    enabled: !!selectedCourse,
  });

  const { data: communitySettings } = useQuery<CommunitySettings>({
    queryKey: ["/api/community/settings", selectedCourse],
    enabled: !!selectedCourse,
  });

  const { data: userPoints } = useQuery<CommunityPoints>({
    queryKey: ["/api/community/points", selectedCourse],
    enabled: !!selectedCourse,
  });

  const { data: leaderboard = [] } = useQuery({
    queryKey: ["/api/community/leaderboard", selectedCourse],
    enabled: !!selectedCourse,
  });

  const { data: userBadges = [] } = useQuery<UserBadge[]>({
    queryKey: ["/api/community/badges", selectedCourse],
    enabled: !!selectedCourse,
  });

  const { data: privateMessages = [] } = useQuery<PrivateMessage[]>({
    queryKey: ["/api/community/messages", selectedCourse],
    enabled: !!selectedCourse && showMessaging,
  });

  const { data: classmates = [] } = useQuery({
    queryKey: ["/api/community/classmates", selectedCourse],
    enabled: !!selectedCourse,
  });

  // Mutations
  const createPostMutation = useMutation({
    mutationFn: async (data: InsertCommunityPost) => {
      const res = await apiRequest("POST", "/api/community/posts", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
      setNewPostContent("");
      toast({ title: "Post created successfully!", description: "Your post is pending approval." });
    },
  });

  const likePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      const res = await apiRequest("POST", `/api/community/posts/${postId}/like`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
    },
  });

  const createCommentMutation = useMutation({
    mutationFn: async ({ postId, content }: { postId: number; content: string }) => {
      const res = await apiRequest("POST", `/api/community/posts/${postId}/comments`, { content });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: InsertPrivateMessage) => {
      const res = await apiRequest("POST", "/api/community/messages", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/messages"] });
      setMessageContent("");
      toast({ title: "Message sent!" });
    },
  });

  const approvePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      const res = await apiRequest("PATCH", `/api/community/posts/${postId}/approve`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
      toast({ title: "Post approved!" });
    },
  });

  const pinPostMutation = useMutation({
    mutationFn: async (postId: number) => {
      const res = await apiRequest("PATCH", `/api/community/posts/${postId}/pin`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
      toast({ title: "Post pinned!" });
    },
  });

  const handleCreatePost = () => {
    if (!newPostContent.trim() && !selectedImage) return;

    createPostMutation.mutate({
      content: newPostContent,
      type: newPostType,
      courseId: null, // Community posts are not course-specific
      authorId: user!.id,
      isApproved: user?.role === "teacher",
    });
  };

  const handleSendMessage = () => {
    if (!messageContent.trim() || !selectedConversation) return;

    sendMessageMutation.mutate({
      content: messageContent,
      receiverId: selectedConversation,
      senderId: user!.id,
      courseId: null, // Messages are not course-specific
    });
  };

  const PostCard = ({ post }: { post: any }) => (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.author?.profileImage} />
              <AvatarFallback>{post.author?.firstName?.[0]}{post.author?.lastName?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-semibold">{post.author?.firstName} {post.author?.lastName}</h4>
                {post.type === "achievement" && <Trophy className="h-4 w-4 text-yellow-500" />}
                {post.isPinned && <Pin className="h-4 w-4 text-blue-500" />}
              </div>
              <p className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={post.type === "achievement" ? "default" : "secondary"}>
              {post.type}
            </Badge>
            {!post.isApproved && user?.role === "teacher" && (
              <div className="flex space-x-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => approvePostMutation.mutate(post.id)}
                  className="h-8"
                >
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => pinPostMutation.mutate(post.id)}
                  className="h-8"
                >
                  <Pin className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 mb-4">{post.content}</p>
        
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => likePostMutation.mutate(post.id)}
              className="flex items-center space-x-1"
            >
              <Heart className="h-4 w-4" />
              <span>{post.likesCount || 0}</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center space-x-1">
              <MessageCircle className="h-4 w-4" />
              <span>{post.commentsCount || 0}</span>
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Comments section */}
        {post.comments && post.comments.length > 0 && (
          <div className="mt-4 space-y-3">
            {post.comments.map((comment: any) => (
              <div key={comment.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.author?.profileImage} />
                  <AvatarFallback>{comment.author?.firstName?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm">{comment.author?.firstName}</span>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add comment */}
        <div className="mt-4 flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.profileImage} />
            <AvatarFallback>{user?.firstName?.[0]}</AvatarFallback>
          </Avatar>
          <Input
            placeholder="Write a comment..."
            onKeyPress={(e) => {
              if (e.key === "Enter" && e.currentTarget.value.trim()) {
                createCommentMutation.mutate({
                  postId: post.id,
                  content: e.currentTarget.value,
                });
                e.currentTarget.value = "";
              }
            }}
          />
        </div>
      </CardContent>
    </Card>
  );

  const GameStats = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <span>Your Progress</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{userPoints?.totalPoints || 0}</div>
            <div className="text-sm text-gray-500">Total Points</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{userPoints?.weeklyPoints || 0}</div>
            <div className="text-sm text-gray-500">This Week</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{userBadges.length}</div>
            <div className="text-sm text-gray-500">Badges Earned</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {leaderboard.findIndex((l: any) => l.userId === user?.id) + 1 || "-"}
            </div>
            <div className="text-sm text-gray-500">Rank</div>
          </div>
        </div>
        
        {userBadges.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Recent Badges</h4>
            <div className="flex flex-wrap gap-2">
              {userBadges.slice(0, 3).map((badge: any) => (
                <Badge key={badge.id} variant="outline" className="flex items-center space-x-1">
                  <Award className="h-3 w-3" />
                  <span>{badge.badge?.name}</span>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const Leaderboard = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Crown className="h-5 w-5 text-yellow-500" />
          <span>Leaderboard</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leaderboard.slice(0, 10).map((entry: any, index: number) => (
            <div key={entry.userId} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={entry.user?.profileImage} />
                  <AvatarFallback>{entry.user?.firstName?.[0]}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{entry.user?.firstName} {entry.user?.lastName}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="font-semibold">{entry.totalPoints}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const MessagingPanel = () => (
    <Card className="h-96 flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Messages</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowMessaging(!showMessaging)}>
            {showMessaging ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 border rounded-lg p-3 mb-3 overflow-y-auto">
          {selectedConversation ? (
            <div className="space-y-2">
              {privateMessages
                .filter(m => m.senderId === selectedConversation || m.receiverId === selectedConversation)
                .map((message) => (
                  <div
                    key={message.id}
                    className={`p-2 rounded-lg max-w-xs ${
                      message.senderId === user?.id
                        ? "bg-blue-500 text-white ml-auto"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                ))}
            </div>
          ) : (
            <div className="space-y-2">
              {classmates.map((classmate: any) => (
                <div
                  key={classmate.id}
                  className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                  onClick={() => setSelectedConversation(classmate.id)}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={classmate.profileImage} />
                    <AvatarFallback>{classmate.firstName?.[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{classmate.firstName} {classmate.lastName}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {selectedConversation && (
          <div className="flex space-x-2">
            <Input
              placeholder="Type a message..."
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <Button size="sm" onClick={handleSendMessage}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Dashboard</span>
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">Community</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="text-sm">
                Open Community - All Students Welcome
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Community Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="feed">Feed</TabsTrigger>
              <TabsTrigger value="discussions">Discussions</TabsTrigger>
              <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
              {user?.role === "teacher" && <TabsTrigger value="moderate">Moderate</TabsTrigger>}
            </TabsList>

            <TabsContent value="discussions">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Subject Discussions</CardTitle>
                    <CardDescription>Join subject-specific discussions with your classmates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Mathematics */}
                      <Card className="cursor-pointer hover:shadow-md transition-shadow border-blue-200">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <span className="text-lg">📊</span>
                            </div>
                            <div>
                              <h3 className="font-semibold">Mathematics</h3>
                              <p className="text-sm text-gray-600">42 active discussions</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="text-sm text-gray-600">Recent topics:</div>
                            <div className="space-y-1">
                              <div className="text-xs bg-gray-50 p-2 rounded">Calculus help needed</div>
                              <div className="text-xs bg-gray-50 p-2 rounded">Algebra study group</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Science */}
                      <Card className="cursor-pointer hover:shadow-md transition-shadow border-green-200">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                              <span className="text-lg">🔬</span>
                            </div>
                            <div>
                              <h3 className="font-semibold">Science</h3>
                              <p className="text-sm text-gray-600">38 active discussions</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="text-sm text-gray-600">Recent topics:</div>
                            <div className="space-y-1">
                              <div className="text-xs bg-gray-50 p-2 rounded">Physics lab results</div>
                              <div className="text-xs bg-gray-50 p-2 rounded">Chemistry equations</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* English */}
                      <Card className="cursor-pointer hover:shadow-md transition-shadow border-purple-200">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                              <span className="text-lg">📚</span>
                            </div>
                            <div>
                              <h3 className="font-semibold">English</h3>
                              <p className="text-sm text-gray-600">29 active discussions</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="text-sm text-gray-600">Recent topics:</div>
                            <div className="space-y-1">
                              <div className="text-xs bg-gray-50 p-2 rounded">Shakespeare analysis</div>
                              <div className="text-xs bg-gray-50 p-2 rounded">Essay writing tips</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* History */}
                      <Card className="cursor-pointer hover:shadow-md transition-shadow border-orange-200">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
                              <span className="text-lg">🏛️</span>
                            </div>
                            <div>
                              <h3 className="font-semibold">History</h3>
                              <p className="text-sm text-gray-600">15 active discussions</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="text-sm text-gray-600">Recent topics:</div>
                            <div className="space-y-1">
                              <div className="text-xs bg-gray-50 p-2 rounded">World War timeline</div>
                              <div className="text-xs bg-gray-50 p-2 rounded">Ancient civilizations</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Art */}
                      <Card className="cursor-pointer hover:shadow-md transition-shadow border-pink-200">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="h-10 w-10 bg-pink-100 rounded-lg flex items-center justify-center">
                              <span className="text-lg">🎨</span>
                            </div>
                            <div>
                              <h3 className="font-semibold">Art</h3>
                              <p className="text-sm text-gray-600">22 active discussions</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="text-sm text-gray-600">Recent topics:</div>
                            <div className="space-y-1">
                              <div className="text-xs bg-gray-50 p-2 rounded">Digital art techniques</div>
                              <div className="text-xs bg-gray-50 p-2 rounded">Portfolio reviews</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* General Academic */}
                      <Card className="cursor-pointer hover:shadow-md transition-shadow border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              <span className="text-lg">💬</span>
                            </div>
                            <div>
                              <h3 className="font-semibold">General Academic</h3>
                              <p className="text-sm text-gray-600">56 active discussions</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="text-sm text-gray-600">Recent topics:</div>
                            <div className="space-y-1">
                              <div className="text-xs bg-gray-50 p-2 rounded">Study strategies</div>
                              <div className="text-xs bg-gray-50 p-2 rounded">Exam preparation</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="feed" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* Create Post */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Share with your class</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user?.profileImage} />
                          <AvatarFallback>{user?.firstName?.[0]}</AvatarFallback>
                        </Avatar>
                        <Textarea
                          placeholder={
                            newPostType === "celebration" ? "Share birthday wishes or celebrate an achievement..." :
                            newPostType === "photo" ? "Share a photo or video with your class..." :
                            newPostType === "announcement" && user?.role === "teacher" ? "Make an important announcement..." :
                            newPostType === "general" ? "What's on your mind?" :
                            "Share your thoughts..."
                          }
                          value={newPostContent}
                          onChange={(e) => setNewPostContent(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Select value={newPostType} onValueChange={(value: any) => setNewPostType(value)}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="general">General</SelectItem>
                              <SelectItem value="photo">Photo/Video</SelectItem>
                              <SelectItem value="celebration">Birthday/Celebration</SelectItem>
                              <SelectItem value="announcement">Announcement</SelectItem>
                              <SelectItem value="discussion">Discussion</SelectItem>
                              <SelectItem value="question">Question</SelectItem>
                              <SelectItem value="achievement">Achievement</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => document.getElementById('image-upload')?.click()}
                          >
                            <Image className="h-4 w-4" />
                          </Button>
                          <input
                            id="image-upload"
                            type="file"
                            accept="image/*,video/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setSelectedImage(file);
                                setNewPostType("photo");
                              }
                            }}
                          />
                          <Button variant="outline" size="sm">
                            <Paperclip className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button onClick={handleCreatePost} disabled={!newPostContent.trim() && !selectedImage}>
                          Post
                        </Button>
                      </div>

                      {/* Image Preview */}
                      {selectedImage && (
                        <div className="mt-4 relative">
                          <img
                            src={URL.createObjectURL(selectedImage)}
                            alt="Preview"
                            className="max-h-48 rounded-lg border"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70"
                            onClick={() => setSelectedImage(null)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Filters */}
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Search className="h-4 w-4 text-gray-500" />
                      <Input
                        placeholder="Search posts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-64"
                      />
                    </div>
                    <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Posts</SelectItem>
                        <SelectItem value="discussion">Discussions</SelectItem>
                        <SelectItem value="question">Questions</SelectItem>
                        <SelectItem value="achievement">Achievements</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Posts */}
                  {postsLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <Card key={i} className="animate-pulse">
                          <CardContent className="p-6">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {posts.map((post: any) => (
                        <PostCard key={post.id} post={post} />
                      ))}
                      {posts.length === 0 && (
                        <Card>
                          <CardContent className="p-8 text-center">
                            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-600 mb-2">No posts yet</h3>
                            <p className="text-gray-500">Be the first to start a discussion!</p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <GameStats />
                  <Leaderboard />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="leaderboard">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <Leaderboard />
                </div>
                <div>
                  <GameStats />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="messages">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chat List */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Chats</span>
                      <Button size="sm" variant="outline">
                        <MessageSquare className="h-4 w-4" />
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
                            <p className="text-sm text-gray-600 truncate">Teacher: Tomorrow's homework...</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="secondary" className="text-xs">12 members</Badge>
                              <Badge variant="destructive" className="text-xs">3</Badge>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Individual Chats */}
                      {classmates.map((classmate: any) => (
                        <div 
                          key={classmate.id}
                          className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${selectedConversation === classmate.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                          onClick={() => setSelectedConversation(classmate.id)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={classmate.profileImage} />
                                <AvatarFallback>{classmate.firstName?.[0]}</AvatarFallback>
                              </Avatar>
                              <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full"></div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">{classmate.firstName} {classmate.lastName}</h4>
                                <span className="text-xs text-gray-500">5m ago</span>
                              </div>
                              <p className="text-sm text-gray-600 truncate">Hey, can you help me with...</p>
                              <Badge variant="destructive" className="text-xs mt-1">1</Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Chat Window */}
                <div className="lg:col-span-2">
                  {selectedConversation ? (
                    <Card className="h-96">
                      <CardHeader className="border-b">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {selectedConversation === 'group' ? (
                              <>
                                <Users className="h-8 w-8 p-1 bg-blue-100 text-blue-600 rounded-full" />
                                <div>
                                  <h3 className="font-medium">Class Group Chat</h3>
                                  <p className="text-sm text-gray-500">12 members online</p>
                                </div>
                              </>
                            ) : (
                              <>
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={classmates.find((c: any) => c.id === selectedConversation)?.profileImage} />
                                  <AvatarFallback>{classmates.find((c: any) => c.id === selectedConversation)?.firstName?.[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="font-medium">
                                    {classmates.find((c: any) => c.id === selectedConversation)?.firstName} {classmates.find((c: any) => c.id === selectedConversation)?.lastName}
                                  </h3>
                                  <p className="text-sm text-gray-500">Online</p>
                                </div>
                              </>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="ghost">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="flex-1 p-0">
                        <div className="h-64 overflow-y-auto p-4 space-y-4">
                          {/* Sample Messages */}
                          <div className="flex items-start space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>T</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                                <p className="text-sm">Don't forget about tomorrow's assignment on photosynthesis!</p>
                              </div>
                              <span className="text-xs text-gray-500 mt-1">Teacher • 2 minutes ago</span>
                            </div>
                          </div>

                          <div className="flex items-start space-x-3 flex-row-reverse">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{user?.firstName?.[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 text-right">
                              <div className="bg-blue-500 text-white rounded-lg p-3 max-w-xs ml-auto">
                                <p className="text-sm">Got it! I'll submit it by tonight.</p>
                              </div>
                              <span className="text-xs text-gray-500 mt-1">You • 1 minute ago</span>
                            </div>
                          </div>
                        </div>

                        <div className="border-t p-4">
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="ghost">
                              <Paperclip className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Image className="h-4 w-4" />
                            </Button>
                            <Input
                              placeholder="Type a message..."
                              value={messageContent}
                              onChange={(e) => setMessageContent(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === "Enter" && messageContent.trim()) {
                                  // Handle send message
                                  setMessageContent("");
                                }
                              }}
                              className="flex-1"
                            />
                            <Button size="sm" disabled={!messageContent.trim()}>
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="h-96 flex items-center justify-center">
                      <div className="text-center">
                        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-600">Select a chat to start messaging</h3>
                        <p className="text-gray-500">Choose from group chat or individual conversations</p>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            {user?.role === "teacher" && (
              <TabsContent value="moderate">
                <Card>
                  <CardHeader>
                    <CardTitle>Moderation Panel</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <h3 className="font-semibold">Pending Approval</h3>
                      {posts.filter((post: any) => !post.isApproved).map((post: any) => (
                        <PostCard key={post.id} post={post} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
}