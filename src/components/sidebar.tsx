import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { cn } from "../lib/utils";
import {
  BarChart3,
  BookOpen,
  Calendar,
  FileText,
  Home,
  PlusCircle,
  Bot,
  Trophy,
  Users,
  Flame,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "../components/ui/card";

interface SidebarProps {
  currentRole: "student" | "teacher";
}

export default function Sidebar({ currentRole }: SidebarProps) {
  const [location] = useLocation();

  /* ---------------- Sidebar Collapse State ---------------- */
  const [collapsed, setCollapsed] = React.useState<boolean>(() => {
    try {
      return localStorage.getItem("dashboard_sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });

  React.useEffect(() => {
    try {
      localStorage.setItem(
        "dashboard_sidebar_collapsed",
        collapsed ? "true" : "false"
      );
    } catch {}
  }, [collapsed]);

  /* ---------------- Submenu Open State (FIXED) ---------------- */
  const [openSubs, setOpenSubs] = React.useState<Record<string, boolean>>({});

  const toggleSub = (key: string) =>
    setOpenSubs((s) => ({ ...s, [key]: !s[key] }));

  /* ---------------- Streak Query ---------------- */
  const { data: streak } = useQuery<{
    currentStreak?: number;
    longestStreak?: number;
  }>({
    queryKey: ["/api/student/streak"],
    enabled: currentRole === "student",
  });

  /* ---------------- Menu Config ---------------- */
  const studentItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: BookOpen, label: "My Courses", href: "/courses" },
    { icon: FileText, label: "Assignments", href: "/homework" },
    { icon: BarChart3, label: "Progress", href: "/progress" },
  ];

  const studentTools = [
    { icon: Bot, label: "AI Tutor", href: "/ai-tutor" },
    { icon: BookOpen, label: "Book Content", href: "/bookGallery" },
    { icon: FileText, label: "Expanded Content", href: "/bookExpanded" },
    {
      icon: FileText,
      label: "Homework Tool",
      href: "/homework",
      children: [
        { label: "My Assignments", href: "/homework" },
        { label: "Create Assignment", href: "/homework/create" },
      ],
    },
    { icon: MessageSquare, label: "Community", href: "/community" },
    { icon: Trophy, label: "Achievements", href: "/progress" },
    { icon: Users, label: "Seminar Tool", href: "/seminar-tool" },
    { icon: Users, label: "Debate Tool", href: "/debate-tool" },
    {
      icon: Home,
      label: "Exam Windows",
      href: "/studio/quiz?questions=20&time=30",
      children: [
        { label: "Prep", href: "/studio/quiz?questions=10&time=15" },
        { label: "Main Exam", href: "/studio/quiz?questions=20&time=30" },
      ],
    },
  ];

  const teacherItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    {
      icon: PlusCircle,
      label: "Create Content",
      href: "/enhanced-content-manager",
    },
    { icon: Users, label: "My Students", href: "/students" },
    { icon: FileText, label: "Assignments", href: "/teacher/homework" },
  ];

  const teacherAnalytics = [
    { icon: MessageSquare, label: "Community", href: "/community" },
    { icon: BarChart3, label: "Student Progress", href: "/analytics" },
    { icon: Calendar, label: "Analytics", href: "/analytics" },
  ];

  const items = currentRole === "student" ? studentItems : teacherItems;
  const secondaryItems =
    currentRole === "student" ? studentTools : teacherAnalytics;

  /* ---------------- Render ---------------- */
  return (
    <aside
      id="dashboard-sidebar"
      className={cn(
        "hidden lg:block bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-sm sticky top-14 bottom-0 transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex flex-col h-[calc(100vh-3.5rem)] p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          {!collapsed && (
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {currentRole === "student" ? "Learning" : "Teaching"}
            </span>
          )}
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="h-8 w-8 rounded hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Main Menu */}
        <div className="flex-1 overflow-y-auto space-y-1">
          {items.map((item) => (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center px-3 py-2 rounded-lg text-sm font-medium cursor-pointer",
                  location === item.href
                    ? "bg-blue-50 text-primary dark:bg-primary/10"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800",
                  collapsed && "justify-center"
                )}
              >
                <item.icon
                  className={cn(
                    "transition-all duration-200",
                    collapsed ? "h-6 w-6" : "h-4 w-4"
                  )}
                />

                {!collapsed && <span className="ml-3">{item.label}</span>}
              </div>
            </Link>
          ))}

          {!collapsed && (
            <div className="pt-4 mt-4 border-t dark:border-gray-700 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
              {currentRole === "student" ? "Tools" : "Analytics"}
            </div>
          )}

          {/* Secondary Menu */}
          {secondaryItems.map((item) => {
            const hasChildren = "children" in item;
            const key = `${item.label}-${item.href}`;

            if (!hasChildren) {
              return (
                <Link key={key} href={item.href}>
                  <div
                    className={cn(
                      "flex items-center px-3 py-2 rounded-lg text-sm font-medium cursor-pointer",
                      location === item.href
                        ? "bg-blue-50 text-primary dark:bg-primary/10"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800",
                      collapsed && "justify-center"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "transition-all duration-200",
                        collapsed ? "h-6 w-6" : "h-4 w-4"
                      )}
                    />

                    {!collapsed && <span className="ml-3">{item.label}</span>}
                  </div>
                </Link>
              );
            }

            return (
              <div key={key}>
                <div
                  onClick={() => toggleSub(key)}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-lg text-sm font-medium cursor-pointer",
                    "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800",
                    collapsed && "justify-center"
                  )}
                >
                  <item.icon
                    className={cn(
                      "transition-all duration-200",
                      collapsed ? "h-6 w-6" : "h-4 w-4"
                    )}
                  />

                  {!collapsed && (
                    <>
                      <span className="ml-3 flex-1">{item.label}</span>
                      <ChevronRight
                        className={cn(
                          "h-4 w-4 transition-transform",
                          openSubs[key] && "rotate-90"
                        )}
                      />
                    </>
                  )}
                </div>

                {openSubs[key] && !collapsed && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.children.map((c) => (
                      <Link key={c.href} href={c.href}>
                        <div
                          className={cn(
                            "px-2 py-1 rounded text-sm cursor-pointer",
                            location === c.href
                              ? "bg-blue-50 text-primary dark:bg-primary/10"
                              : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                          )}
                        >
                          {c.label}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Student Streak */}
        {currentRole === "student" && (
          <Card
            className={cn(
              "mt-4 border-0 shadow-lg",
              collapsed
                ? "p-2 bg-white dark:bg-gray-800"
                : "bg-gradient-to-r from-orange-400 to-pink-400 text-white"
            )}
          >
            <CardContent className="p-3 flex items-center justify-between">
              {!collapsed && (
                <div>
                  <p className="text-sm opacity-90">Learning Streak</p>
                  <p className="text-3xl font-bold">
                    {streak?.currentStreak ?? 0}
                  </p>
                  <p className="text-xs opacity-80">days in a row</p>
                </div>
              )}
              <Flame className={cn("h-8 w-8", !collapsed && "text-white")} />
            </CardContent>
          </Card>
        )}
      </div>
    </aside>
  );
}
