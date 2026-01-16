import { useState, useEffect } from "react";
import { useAuth } from "../hooks/use-auth";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Separator } from "../components/ui/separator";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Redirect, useLocation } from "wouter";
import { Loader2, GraduationCap, Users, BookOpen, Award, Shield, RefreshCw, AlertTriangle, Eye, EyeOff, Lock, Mail, Sparkles, Brain, Target } from "lucide-react";
import { FaGoogle, FaMicrosoft } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "../hooks/use-toast";
import { Link } from "wouter";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [loginForm, setLoginForm] = useState({ email: "", password: "", captchaAnswer: "" });
  const [registerForm, setRegisterForm] = useState({
    email: "",
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "student",
    grade: 9,
  });
  const [captchaData, setCaptchaData] = useState<{ svg: string; sessionId: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [requiresCaptcha, setRequiresCaptcha] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const error = urlParams.get('error');
    if (error === 'google_auth_failed') {
      toast({
        title: "Google Login Failed",
        description: "There was an error signing in with Google. Please try again.",
        variant: "destructive",
      });
    } else if (error === 'microsoft_auth_failed') {
      toast({
        title: "Microsoft Login Failed", 
        description: "There was an error signing in with Microsoft. Please try again.",
        variant: "destructive",
      });
    }
  }, [location, toast]);

  const { refetch: generateCaptcha, isLoading: captchaLoading } = useQuery({
    queryKey: ['/api/captcha/generate'],
    enabled: false,
    queryFn: async () => {
      // Mock CAPTCHA for USE_MOCK_AUTH = true
      return {
        svg: `<svg width="150" height="50" viewBox="0 0 150 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="150" height="50" fill="#F3F4F6"/>
                <text x="75" y="30" font-family="Arial" font-size="20" fill="#1F2937" text-anchor="middle" dominant-baseline="middle">GRADEUP</text>
                <line x1="10" y1="15" x2="140" y2="35" stroke="#9CA3AF" stroke-width="1"/>
                <line x1="10" y1="35" x2="140" y2="15" stroke="#9CA3AF" stroke-width="1"/>
              </svg>`,
        sessionId: "mock-session-123",
      };
    },
  });

  const loadCaptcha = async () => {
    try {
      const result = await generateCaptcha();
      if (result.data) {
        setCaptchaData(result.data);
      }
    } catch (error) {
      console.error('Failed to load CAPTCHA:', error);
      toast({
        title: "Error",
        description: "Failed to load security verification.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (requiresCaptcha && !captchaData) {
      loadCaptcha();
    }
  }, [requiresCaptcha]);



  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const loginData = {
        email: loginForm.email,
        password: loginForm.password,
        ...(requiresCaptcha && captchaData ? {
          captchaSessionId: captchaData.sessionId,
          captchaAnswer: loginForm.captchaAnswer
        } : {})
      };
      // Prefer using the loginMutation provided by `useAuth` (supports mock auth).
      try {
        await loginMutation.mutateAsync(loginData as any);
        navigate('/dashboard'); // Navigate to dashboard on successful login
      } catch (err: any) {
        // If server returned captcha requirement, handle it; otherwise show generic error.
        const result = err?.response || err;
        if (result?.requiresCaptcha) {
          setRequiresCaptcha(true);
          setLoginAttempts(prev => prev + 1);
          if (!captchaData) {
            await loadCaptcha();
          }
        }

        toast({
          title: "Login Failed",
          description: result?.message || err?.message || "Invalid credentials",
          variant: "destructive",
        });

        if (requiresCaptcha) {
          setLoginForm(prev => ({ ...prev, captchaAnswer: '' }));
          await loadCaptcha();
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(registerForm);
  };

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Learning",
      description: "Get personalized tutoring with our advanced AI"
    },
    {
      icon: Target,
      title: "Track Progress",
      description: "Monitor your learning journey with detailed analytics"
    },
    {
      icon: Sparkles,
      title: "Gamified Experience",
      description: "Earn badges, streaks, and climb the leaderboard"
    },
    {
      icon: Users,
      title: "Community",
      description: "Learn together with students worldwide"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Hero Section - Shows on top for mobile, right side for desktop */}
      <div className="order-first lg:order-last flex-1 bg-gradient-to-br from-primary via-blue-600 to-indigo-700 p-6 sm:p-8 lg:p-12 text-white flex items-center justify-center relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-blue-400/10 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-md text-center relative z-10">
          {/* Mobile: Compact view, Desktop: Full view */}
          <div className="lg:hidden mb-6">
            <div className="bg-white/20 rounded-2xl p-4 inline-flex items-center gap-3 backdrop-blur-sm">
              <GraduationCap className="h-8 w-8" />
              <span className="text-2xl font-bold">GradeUp!</span>
            </div>
          </div>
          
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 lg:mb-6 hidden lg:block">
            Transform Your Learning Experience
          </h2>
          <p className="text-base sm:text-lg lg:text-xl mb-6 lg:mb-8 text-blue-100 hidden sm:block">
            Join thousands of students and teachers achieving academic excellence
          </p>
          
          {/* Feature Grid - Hidden on small mobile */}
          <div className="hidden sm:grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-left hover:bg-white/20 transition-colors"
              >
                <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 mb-2" />
                <h3 className="font-semibold text-sm sm:text-base">{feature.title}</h3>
                <p className="text-xs sm:text-sm text-blue-100 mt-1">{feature.description}</p>
              </div>
            ))}
          </div>
          
          {/* Mobile Quick Stats */}
          <div className="flex justify-center gap-6 sm:hidden mt-4">
            <div className="text-center">
              <p className="text-2xl font-bold">10K+</p>
              <p className="text-xs text-blue-200">Students</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">500+</p>
              <p className="text-xs text-blue-200">Courses</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">4.9</p>
              <p className="text-xs text-blue-200">Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Logo - Desktop only (mobile shows in hero) */}
          <div className="hidden lg:flex items-center justify-center mb-8">
            <div className="bg-primary text-white p-3 rounded-xl mr-3 shadow-lg">
              <GraduationCap className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">GradeUp!</h1>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login" className="text-sm sm:text-base" data-testid="tab-login">Login</TabsTrigger>
              <TabsTrigger value="register" className="text-sm sm:text-base" data-testid="tab-register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl sm:text-2xl">Welcome Back</CardTitle>
                  <CardDescription className="text-sm">
                    Sign in to continue your learning journey
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* OAuth Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="w-full h-10 sm:h-11 text-sm"
                      onClick={async () => {
                        await loginMutation.mutateAsync({ email: "student@example.com", password: "password123" });
                        navigate('/dashboard');
                      }}
                      data-testid="button-google-login"
                    >
                      <FaGoogle className="mr-2 h-4 w-4 text-red-500" />
                      <span className="hidden sm:inline">Google</span>
                      <span className="sm:hidden">Google</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full h-10 sm:h-11 text-sm"
                      onClick={async () => {
                        await loginMutation.mutateAsync({ email: "teacher@example.com", password: "password123" });
                        navigate('/dashboard');
                      }}
                      data-testid="button-microsoft-login"
                    >
                      <FaMicrosoft className="mr-2 h-4 w-4 text-blue-500" />
                      <span className="hidden sm:inline">Microsoft</span>
                      <span className="sm:hidden">Microsoft</span>
                    </Button>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">
                        Or with email
                      </span>
                    </div>
                  </div>

                  {requiresCaptcha && (
                    <Alert variant="destructive" className="py-2">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-xs sm:text-sm">
                        Please complete security verification
                      </AlertDescription>
                    </Alert>
                  )}

                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          className="pl-10 h-10 sm:h-11"
                          value={loginForm.email}
                          onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                          required
                          data-testid="input-email"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          className="pl-10 pr-10 h-10 sm:h-11"
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                          required
                          data-testid="input-password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    {requiresCaptcha && (
                      <div className="space-y-2">
                        <Label className="text-sm">Security Check</Label>
                        <div className="border rounded-lg p-3 bg-muted/20">
                          {captchaData ? (
                            <div className="space-y-3">
                              <div 
                                className="flex justify-center bg-white rounded p-2"
                                dangerouslySetInnerHTML={{ __html: captchaData.svg }}
                              />
                              <div className="flex gap-2">
                                <Input
                                  placeholder="Enter text"
                                  className="text-center h-10"
                                  value={loginForm.captchaAnswer}
                                  onChange={(e) => setLoginForm({ ...loginForm, captchaAnswer: e.target.value })}
                                  required
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={loadCaptcha}
                                  disabled={captchaLoading}
                                  className="shrink-0"
                                >
                                  <RefreshCw className={`h-4 w-4 ${captchaLoading ? 'animate-spin' : ''}`} />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={loadCaptcha}
                              disabled={captchaLoading}
                              className="w-full"
                            >
                              {captchaLoading ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...</>
                              ) : (
                                <><Shield className="mr-2 h-4 w-4" /> Load Verification</>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full h-10 sm:h-11 text-sm sm:text-base"
                      disabled={loginMutation.isPending}
                      data-testid="button-login"
                    >
                      {loginMutation.isPending ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing In...</>
                      ) : (
                        "Sign In"
                      )}
                    </Button>

                    <div className="text-center">
                      <Link 
                        href="/forgot-password"
                        className="text-sm text-muted-foreground hover:text-primary underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl sm:text-2xl">Create Account</CardTitle>
                  <CardDescription className="text-sm">
                    Start your learning journey today
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-3 sm:space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="firstName" className="text-sm">First Name</Label>
                        <Input
                          id="firstName"
                          placeholder="John"
                          className="h-10"
                          value={registerForm.firstName}
                          onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                          required
                          data-testid="input-firstname"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="lastName" className="text-sm">Last Name</Label>
                        <Input
                          id="lastName"
                          placeholder="Doe"
                          className="h-10"
                          value={registerForm.lastName}
                          onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                          required
                          data-testid="input-lastname"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label htmlFor="reg-username" className="text-sm">Username</Label>
                      <Input
                        id="reg-username"
                        placeholder="johndoe"
                        className="h-10"
                        value={registerForm.username}
                        onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                        required
                        data-testid="input-username"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label htmlFor="reg-email" className="text-sm">Email</Label>
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="john@example.com"
                        className="h-10"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                        required
                        data-testid="input-reg-email"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label htmlFor="reg-password" className="text-sm">Password</Label>
                      <Input
                        id="reg-password"
                        type="password"
                        placeholder="Create a strong password"
                        className="h-10"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                        required
                        data-testid="input-reg-password"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="role" className="text-sm">I am a</Label>
                        <Select 
                          value={registerForm.role} 
                          onValueChange={(value) => setRegisterForm({ ...registerForm, role: value })}
                        >
                          <SelectTrigger className="h-10" data-testid="select-role">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="teacher">Teacher</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {registerForm.role === "student" && (
                        <div className="space-y-1.5">
                          <Label htmlFor="grade" className="text-sm">Grade</Label>
                          <Select 
                            value={registerForm.grade.toString()} 
                            onValueChange={(value) => setRegisterForm({ ...registerForm, grade: parseInt(value) })}
                          >
                            <SelectTrigger className="h-10" data-testid="select-grade">
                              <SelectValue placeholder="Grade" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="9">Grade 9</SelectItem>
                              <SelectItem value="10">Grade 10</SelectItem>
                              <SelectItem value="11">Grade 11</SelectItem>
                              <SelectItem value="12">Grade 12</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                    
                    <Button
                      type="submit"
                      className="w-full h-10 sm:h-11 text-sm sm:text-base mt-2"
                      disabled={registerMutation.isPending}
                      data-testid="button-register"
                    >
                      {registerMutation.isPending ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground mt-4">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
