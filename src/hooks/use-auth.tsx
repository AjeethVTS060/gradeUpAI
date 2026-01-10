import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";
import { mockUser, mockTeacher } from "../lib/mockData";

// Set to true to use mock authentication (no backend required)
const USE_MOCK_AUTH = true;

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, RegisterData>;
};

type LoginData = {
  email: string;
  password: string;
};

type RegisterData = {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  grade?: number;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [mockAuthUser, setMockAuthUser] = useState<SelectUser | null>(null);
  const [mockIsLoading, setMockIsLoading] = useState(true);

  // Load mock user from localStorage on mount
  useEffect(() => {
    if (USE_MOCK_AUTH) {
      const savedUser = localStorage.getItem("gradeup_mock_user");
      if (savedUser) {
        setMockAuthUser(JSON.parse(savedUser));
      }
      setMockIsLoading(false);
    }
  }, []);

  const {
    data: apiUser,
    error,
    isLoading: apiIsLoading,
  } = useQuery<SelectUser | undefined, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !USE_MOCK_AUTH,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      if (USE_MOCK_AUTH) {
        // Simulate login with mock data
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check credentials and return appropriate mock user
        if (credentials.email.includes("teacher")) {
          return mockTeacher as SelectUser;
        }
        return mockUser as SelectUser;
      }

      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      if (USE_MOCK_AUTH) {
        setMockAuthUser(user);
        localStorage.setItem("gradeup_mock_user", JSON.stringify(user));
      } else {
        queryClient.setQueryData(["/api/user"], user);
      }
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterData) => {
      if (USE_MOCK_AUTH) {
        // Simulate registration with mock data
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const newUser = {
          ...mockUser,
          username: credentials.username,
          email: credentials.email,
          firstName: credentials.firstName,
          lastName: credentials.lastName,
          role: credentials.role as "student" | "teacher",
          grade: credentials.grade || 10,
        };
        return newUser as SelectUser;
      }

      const res = await apiRequest("POST", "/api/register", credentials);
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      if (USE_MOCK_AUTH) {
        setMockAuthUser(user);
        localStorage.setItem("gradeup_mock_user", JSON.stringify(user));
      } else {
        queryClient.setQueryData(["/api/user"], user);
      }
      toast({
        title: "Welcome to GradeUp!",
        description: "Your account has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      if (USE_MOCK_AUTH) {
        await new Promise(resolve => setTimeout(resolve, 300));
        return;
      }
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      if (USE_MOCK_AUTH) {
        setMockAuthUser(null);
        localStorage.removeItem("gradeup_mock_user");
      } else {
        queryClient.setQueryData(["/api/user"], null);
      }
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const user = USE_MOCK_AUTH ? mockAuthUser : (apiUser ?? null);
  const isLoading = USE_MOCK_AUTH ? mockIsLoading : apiIsLoading;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error: USE_MOCK_AUTH ? null : error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
