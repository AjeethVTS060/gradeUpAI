import React, { useState } from "react";
import { useAuth } from "../hooks/use-auth";
import { useTheme } from "../hooks/use-theme";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "../components/ui/sheet";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "../components/ui/dropdown-menu";
import { cn } from "../lib/utils";
import { 
  GraduationCap, 
  Bell, 
  ChevronDown, 
  User, 
  Settings, 
  LogOut, 
  Menu,
  Home,
  BookOpen,
  MessageSquare,
  FileText,
  ClipboardList,
  BarChart3,
  Users,
  FolderOpen,
  ArrowLeft,
  Sun,
  Moon,
  Bot,
  Trophy,
  MessagesSquare,
  PlusCircle,
  Calendar,
  ChevronRight
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";

interface NavigationProps {
  currentRole: string;
  onRoleChange: (role: string) => void;
}

function Navigation({ currentRole, onRoleChange }: NavigationProps) {
  const { user, logoutMutation } = useAuth();
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [openSubs, setOpenSubs] = React.useState<Record<string, boolean>>({});

  const toggleSub = (key: string) =>
    setOpenSubs((s) => ({ ...s, [key]: !s[key] }));

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const allStudentLinks = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: BookOpen, label: "My Courses", href: "/courses" },
    { icon: FileText, label: "Assignments", href: "/homework" },
    { icon: BarChart3, label: "Progress", href: "/progress" },
    { icon: Bot, label: "AI Tutor", href: "/ai-tutor" },
    { icon: FileText, label: "Book Content", href: "/bookExpanded" },
    {
      icon: FileText,
      label: "Homework Tool",
      href: "/homework",
    },
    { icon: MessageSquare, label: "Community", href: "/community" },
    { icon: MessageSquare, label: "Community New", href: "/communityNew" },

    { icon: Trophy, label: "Achievements", href: "/achievements" },
    { icon: Users, label: "Seminar Tool", href: "/seminar-tool" },
    { icon: MessagesSquare, label: "Debate Tool", href: "/debate-tool" },
    {
      icon: Home,
      label: "Exam Windows",
      href: "/preparation-exam",
      children: [
        { label: "Prep", href: "/preparation-exam" },
        { label: "Main Exam", href: "/main-exam" },
      ],
    },
  ];

  const allTeacherLinks = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    {
      icon: PlusCircle,
      label: "Create Content",
      href: "/enhanced-content-manager",
    },
    { icon: Users, label: "My Students", href: "/students" },
    { icon: FileText, label: "Assignments", href: "/teacher/homework" },
    { icon: MessageSquare, label: "Community", href: "/community" },
    { icon: BarChart3, label: "Student Progress", href: "/analytics" },
    { icon: Calendar, label: "Analytics", href: "/analytics" },
  ];

  const mainStudentLinks = allStudentLinks.slice(0, 5);
  const mainTeacherLinks = allTeacherLinks.slice(0, 5);

  const navLinks = currentRole === "teacher" ? allTeacherLinks : allStudentLinks;
  const mainNavLinks = currentRole === "teacher" ? mainTeacherLinks : mainStudentLinks;

  const isActive = (href: string) => {
    if (href === "/dashboard") return location === "/dashboard" || location === "/";
    return location.startsWith(href);
  };

  const isDashboard = location === "/dashboard" || location === "/";

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo and Mobile Menu */}
          <div className="flex items-center">
             {/* Back to Dashboard Button */}
            <AnimatePresence>
              {!isDashboard && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <Button variant="ghost" size="icon" className="mr-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setLocation('/dashboard')}>
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="lg:hidden mr-2 text-gray-600 dark:text-gray-300"
                  data-testid="mobile-menu-button"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 bg-white dark:bg-gray-900">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="flex flex-col h-full">
                  {/* Mobile Menu Header */}
                  <div className="flex items-center justify-between p-4 border-b dark:border-gray-800">
                    <div className="flex items-center">
                      <div className="bg-primary text-white p-2 rounded-lg">
                        <GraduationCap className="h-5 w-5" />
                      </div>
                      <span className="ml-2 text-lg font-bold text-gray-900 dark:text-white">GradeUp!</span>
                    </div>
                  </div>

                  {/* Mobile Navigation Links */}
                  <div className="flex-1 overflow-y-auto py-4">
                    <div className="space-y-1 px-3">
                      {navLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                            isActive(link.href)
                              ? "bg-primary text-white"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                          }`}
                          data-testid={`mobile-nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          <link.icon className="h-5 w-5 mr-3" />
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Mobile Menu Footer - User Info */}
                  <div className="border-t dark:border-gray-800 p-4">
                    <div className="flex items-center mb-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user?.profileImage ?? undefined} alt={user?.firstName ?? "User"} />
                        <AvatarFallback>
                          {user?.firstName?.[0] || "U"}{user?.lastName?.[0] || ""}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">{currentRole}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Link
                        href="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <User className="h-4 w-4 mr-3" />
                        Profile
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <Settings className="h-4 w-4 mr-3" />
                        Settings
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setMobileMenuOpen(false);
                        }}
                        className="flex items-center w-full px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link href="/dashboard" className="flex items-center">
              <div className="bg-primary text-white p-1.5 sm:p-2 rounded-lg">
                <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <span className="ml-2 sm:ml-3 text-lg sm:text-xl font-bold text-gray-900 dark:text-white">GradeUp!</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {mainNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "bg-primary/10 text-primary"
                    : "text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                data-testid={`nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          
          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Theme Toggle */}
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9 sm:h-10 sm:w-10 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
              <Sun className="h-5 w-5 sm:h-6 sm:w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 sm:h-6 sm:w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative h-9 w-9 sm:h-10 sm:w-10 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center text-[10px] sm:text-xs p-0"
              >
                3
              </Badge>
            </Button>
            
            {/* User Profile - Desktop */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 h-9 sm:h-10 px-2 sm:px-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                  <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                    <AvatarImage src={user?.profileImage ?? undefined} alt={user?.firstName ?? "User"} />
                    <AvatarFallback className="text-xs sm:text-sm">
                      {user?.firstName?.[0] || "U"}{user?.lastName?.[0] || ""}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden md:block max-w-[100px] truncate">
                    {user?.firstName}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-500 hidden sm:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <div className="px-2 py-1.5 border-b dark:border-gray-800 mb-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-muted-foreground dark:text-gray-400">{user?.email}</p>
                </div>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center cursor-pointer text-gray-700 dark:text-gray-300 focus:bg-gray-100 dark:focus:bg-gray-800">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center cursor-pointer text-gray-700 dark:text-gray-300 focus:bg-gray-100 dark:focus:bg-gray-800">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-500/10">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
