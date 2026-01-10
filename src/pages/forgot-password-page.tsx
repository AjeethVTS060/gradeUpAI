import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Loader2, Mail, Shield, RefreshCw, Eye, EyeOff } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  captchaAnswer: z.string().min(1, "Please solve the CAPTCHA"),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  email: z.string().email("Please enter a valid email address"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain uppercase, lowercase, number, and special character"
    ),
  confirmPassword: z.string(),
  verificationCode: z.string().length(6, "Verification code must be 6 digits"),
  captchaAnswer: z.string().min(1, "Please solve the CAPTCHA"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;
type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ForgotPasswordPage() {
  const [location] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState<"forgot" | "reset">("forgot");
  const [captchaData, setCaptchaData] = useState<{ svg: string; sessionId: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetToken, setResetToken] = useState("");

  // Get token from URL if present
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const tokenFromUrl = urlParams.get('token');

  const forgotForm = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
      captchaAnswer: "",
    },
  });

  const resetForm = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: tokenFromUrl || "",
      email: "",
      newPassword: "",
      confirmPassword: "",
      verificationCode: "",
      captchaAnswer: "",
    },
  });

  // Generate CAPTCHA
  const { refetch: generateCaptcha, isLoading: captchaLoading } = useQuery({
    queryKey: ['/api/captcha/generate'],
    enabled: false,
    queryFn: async () => {
      const response = await fetch('/api/captcha/generate');
      if (!response.ok) throw new Error('Failed to generate CAPTCHA');
      return response.json();
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
        description: "Failed to load security verification. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Verify reset token
  const { data: tokenVerification, isLoading: verifyingToken } = useQuery({
    queryKey: ['/api/reset-password/verify', tokenFromUrl],
    enabled: !!tokenFromUrl,
    queryFn: async () => {
      const response = await fetch(`/api/reset-password/verify/${tokenFromUrl}`);
      return response.json();
    },
  });

  // Initialize based on URL token
  useState(() => {
    if (tokenFromUrl) {
      setStep("reset");
      setResetToken(tokenFromUrl);
      resetForm.setValue("token", tokenFromUrl);
    }
    loadCaptcha();
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: async (data: ForgotPasswordForm) => {
      return apiRequest('/api/forgot-password', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          captchaSessionId: captchaData?.sessionId,
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Email Sent",
        description: "If an account with that email exists, you'll receive password reset instructions.",
      });
      forgotForm.reset();
      loadCaptcha();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send reset email. Please try again.",
        variant: "destructive",
      });
      loadCaptcha();
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: ResetPasswordForm) => {
      return apiRequest('/api/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          captchaSessionId: captchaData?.sessionId,
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Password Reset Successful",
        description: "Your password has been reset. You can now log in with your new password.",
      });
      setStep("forgot");
      resetForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reset password. Please try again.",
        variant: "destructive",
      });
      loadCaptcha();
    },
  });

  const onForgotSubmit = async (data: ForgotPasswordForm) => {
    if (!captchaData) {
      toast({
        title: "Error",
        description: "Please complete the security verification.",
        variant: "destructive",
      });
      return;
    }
    forgotPasswordMutation.mutate(data);
  };

  const onResetSubmit = async (data: ResetPasswordForm) => {
    if (!captchaData) {
      toast({
        title: "Error",
        description: "Please complete the security verification.",
        variant: "destructive",
      });
      return;
    }
    resetPasswordMutation.mutate(data);
  };

  if (step === "reset" && tokenFromUrl && verifyingToken) {
    return (
      <div className="container flex items-center justify-center min-h-screen py-8">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Verifying reset token...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "reset" && tokenFromUrl && tokenVerification && !tokenVerification.valid) {
    return (
      <div className="container flex items-center justify-center min-h-screen py-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Invalid Reset Link</CardTitle>
            <CardDescription className="text-center">
              This password reset link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/forgot-password">Request New Reset Link</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">
            {step === "forgot" ? "Forgot Password" : "Reset Password"}
          </CardTitle>
          <CardDescription className="text-center">
            {step === "forgot" 
              ? "Enter your email address and we'll send you reset instructions"
              : "Enter your new password and the verification code from your email"
            }
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {step === "forgot" ? (
            <Form {...forgotForm}>
              <form onSubmit={forgotForm.handleSubmit(onForgotSubmit)} className="space-y-4">
                <FormField
                  control={forgotForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            type="email"
                            placeholder="Enter your email"
                            className="pl-10"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* CAPTCHA Section */}
                <div className="space-y-2">
                  <FormLabel>Security Verification</FormLabel>
                  <div className="border rounded-lg p-4 bg-muted/10">
                    {captchaData ? (
                      <div className="space-y-3">
                        <div 
                          className="flex justify-center"
                          dangerouslySetInnerHTML={{ __html: captchaData.svg }}
                        />
                        <div className="flex space-x-2">
                          <FormField
                            control={forgotForm.control}
                            name="captchaAnswer"
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="Enter the text above"
                                    className="text-center"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={loadCaptcha}
                            disabled={captchaLoading}
                          >
                            <RefreshCw className={`h-4 w-4 ${captchaLoading ? 'animate-spin' : ''}`} />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={loadCaptcha}
                          disabled={captchaLoading}
                        >
                          {captchaLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            <>
                              <Shield className="mr-2 h-4 w-4" />
                              Load Security Check
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={forgotPasswordMutation.isPending}
                >
                  {forgotPasswordMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Instructions"
                  )}
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...resetForm}>
              <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4">
                <FormField
                  control={resetForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            type="email"
                            placeholder="Enter your email"
                            className="pl-10"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={resetForm.control}
                  name="verificationCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Verification Code</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter 6-digit code from email"
                          maxLength={6}
                          className="text-center tracking-widest"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={resetForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter new password"
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={resetForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm new password"
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* CAPTCHA Section */}
                <div className="space-y-2">
                  <FormLabel>Security Verification</FormLabel>
                  <div className="border rounded-lg p-4 bg-muted/10">
                    {captchaData ? (
                      <div className="space-y-3">
                        <div 
                          className="flex justify-center"
                          dangerouslySetInnerHTML={{ __html: captchaData.svg }}
                        />
                        <div className="flex space-x-2">
                          <FormField
                            control={resetForm.control}
                            name="captchaAnswer"
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="Enter the text above"
                                    className="text-center"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={loadCaptcha}
                            disabled={captchaLoading}
                          >
                            <RefreshCw className={`h-4 w-4 ${captchaLoading ? 'animate-spin' : ''}`} />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={loadCaptcha}
                          disabled={captchaLoading}
                        >
                          {captchaLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            <>
                              <Shield className="mr-2 h-4 w-4" />
                              Load Security Check
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={resetPasswordMutation.isPending}
                >
                  {resetPasswordMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </form>
            </Form>
          )}

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              This page is protected by advanced security measures including CAPTCHA verification and rate limiting.
            </AlertDescription>
          </Alert>
        </CardContent>

        <CardFooter className="flex justify-center">
          <Link href="/login" className="text-sm text-muted-foreground hover:text-primary">
            Back to Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}