import { useState, createElement } from "react";
import { useAuth } from "../hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import Navigation from "../components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Separator } from "../components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";
import { 
  Settings, 
  Bell, 
  Shield, 
  Palette,
  Globe,
  Key,
  AlertTriangle,
  Save,
  ArrowLeft
} from "lucide-react";
import { Link } from "wouter";

const settingsFormSchema = z.object({
  notifications: z.object({
    email: z.boolean(),
    push: z.boolean(),
    assignments: z.boolean(),
    grades: z.boolean(),
    messages: z.boolean(),
  }),
  privacy: z.object({
    profileVisible: z.boolean(),
    showOnlineStatus: z.boolean(),
  }),
  preferences: z.object({
    theme: z.enum(["light", "dark", "system"]),
    language: z.string(),
    timezone: z.string(),
  }),
});

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState("notifications");

  const currentRole = user?.role || "student";

  const settingsForm = useForm<z.infer<typeof settingsFormSchema>>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      notifications: {
        email: true,
        push: true,
        assignments: true,
        grades: true,
        messages: true,
      },
      privacy: {
        profileVisible: true,
        showOnlineStatus: false,
      },
      preferences: {
        theme: "system",
        language: "en",
        timezone: "UTC",
      },
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: z.infer<typeof settingsFormSchema>) => {
      const response = await apiRequest("/api/user/settings", "PUT", data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({ title: "Settings updated successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Failed to update settings", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: z.infer<typeof passwordFormSchema>) => {
      const response = await apiRequest("/api/user/change-password", "POST", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      return response;
    },
    onSuccess: () => {
      passwordForm.reset();
      toast({ title: "Password changed successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Failed to change password", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const onSubmitSettings = (data: z.infer<typeof settingsFormSchema>) => {
    updateSettingsMutation.mutate(data);
  };

  const onSubmitPassword = (data: z.infer<typeof passwordFormSchema>) => {
    changePasswordMutation.mutate(data);
  };

  const sections = [
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "preferences", label: "Preferences", icon: Palette },
    { id: "security", label: "Security", icon: Key },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentRole={currentRole} onRoleChange={() => {}} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back to Dashboard */}
        <div className="mb-4">
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-2">Manage your account preferences and security</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium rounded-none first:rounded-t-lg last:rounded-b-lg transition-colors ${
                          activeSection === section.id
                            ? "bg-primary text-white"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {section.label}
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  {sections.find(s => s.id === activeSection)?.label || "Settings"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeSection === "notifications" && (
                  <Form {...settingsForm}>
                    <form onSubmit={settingsForm.handleSubmit(onSubmitSettings)} className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Notification Preferences</h3>
                        
                        <FormField
                          control={settingsForm.control}
                          name="notifications.email"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between space-y-0">
                              <div>
                                <FormLabel>Email Notifications</FormLabel>
                                <p className="text-sm text-gray-600">Receive notifications via email</p>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={settingsForm.control}
                          name="notifications.push"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between space-y-0">
                              <div>
                                <FormLabel>Push Notifications</FormLabel>
                                <p className="text-sm text-gray-600">Receive push notifications in browser</p>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <Separator />

                        <FormField
                          control={settingsForm.control}
                          name="notifications.assignments"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between space-y-0">
                              <div>
                                <FormLabel>Assignment Updates</FormLabel>
                                <p className="text-sm text-gray-600">New assignments and due date reminders</p>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={settingsForm.control}
                          name="notifications.grades"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between space-y-0">
                              <div>
                                <FormLabel>Grade Updates</FormLabel>
                                <p className="text-sm text-gray-600">When grades are posted or updated</p>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={settingsForm.control}
                          name="notifications.messages"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between space-y-0">
                              <div>
                                <FormLabel>Messages</FormLabel>
                                <p className="text-sm text-gray-600">New messages and announcements</p>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <Button type="submit" disabled={updateSettingsMutation.isPending}>
                        <Save className="h-4 w-4 mr-2" />
                        {updateSettingsMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                    </form>
                  </Form>
                )}

                {activeSection === "privacy" && (
                  <Form {...settingsForm}>
                    <form onSubmit={settingsForm.handleSubmit(onSubmitSettings)} className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Privacy Settings</h3>
                        
                        <FormField
                          control={settingsForm.control}
                          name="privacy.profileVisible"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between space-y-0">
                              <div>
                                <FormLabel>Public Profile</FormLabel>
                                <p className="text-sm text-gray-600">Make your profile visible to other users</p>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={settingsForm.control}
                          name="privacy.showOnlineStatus"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between space-y-0">
                              <div>
                                <FormLabel>Show Online Status</FormLabel>
                                <p className="text-sm text-gray-600">Let others see when you're online</p>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <Button type="submit" disabled={updateSettingsMutation.isPending}>
                        <Save className="h-4 w-4 mr-2" />
                        {updateSettingsMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                    </form>
                  </Form>
                )}

                {activeSection === "preferences" && (
                  <Form {...settingsForm}>
                    <form onSubmit={settingsForm.handleSubmit(onSubmitSettings)} className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">App Preferences</h3>
                        
                        <FormField
                          control={settingsForm.control}
                          name="preferences.theme"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Theme</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select theme" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="light">Light</SelectItem>
                                  <SelectItem value="dark">Dark</SelectItem>
                                  <SelectItem value="system">System</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={settingsForm.control}
                          name="preferences.language"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Language</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select language" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="en">English</SelectItem>
                                  <SelectItem value="es">Spanish</SelectItem>
                                  <SelectItem value="fr">French</SelectItem>
                                  <SelectItem value="de">German</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={settingsForm.control}
                          name="preferences.timezone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Timezone</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select timezone" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="UTC">UTC</SelectItem>
                                  <SelectItem value="EST">Eastern (EST)</SelectItem>
                                  <SelectItem value="CST">Central (CST)</SelectItem>
                                  <SelectItem value="MST">Mountain (MST)</SelectItem>
                                  <SelectItem value="PST">Pacific (PST)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Button type="submit" disabled={updateSettingsMutation.isPending}>
                        <Save className="h-4 w-4 mr-2" />
                        {updateSettingsMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                    </form>
                  </Form>
                )}

                {activeSection === "security" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium">Change Password</h3>
                      <p className="text-sm text-gray-600 mt-1">Update your password to keep your account secure</p>
                    </div>

                    <Form {...passwordForm}>
                      <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="space-y-4">
                        <FormField
                          control={passwordForm.control}
                          name="currentPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={passwordForm.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>New Password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={passwordForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm New Password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button type="submit" disabled={changePasswordMutation.isPending}>
                          <Key className="h-4 w-4 mr-2" />
                          {changePasswordMutation.isPending ? "Changing..." : "Change Password"}
                        </Button>
                      </form>
                    </Form>

                    <Separator />

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-red-900">Danger Zone</h4>
                          <p className="text-sm text-red-700 mt-1">
                            Permanently delete your account and all associated data.
                          </p>
                          <Button variant="destructive" size="sm" className="mt-3">
                            Delete Account
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}