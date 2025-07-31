"use client";

import { User } from "@/types/types";
import { useRouter } from "next/router";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (
    email: string,
    password: string,
    confirmPassword: string,
    name: string
  ) => Promise<void>;
  refetchUser: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // checkAuthStatus();
    getUserData();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error("Login error:", error);
        throw new Error(error.error || "Login failed");
      }

      const data = await response.json();
      const { user: userData, token } = data;

      localStorage.setItem("auth_token", token);
      router.push("/app");
    } catch (error: any) {
      setError(
        error?.message ? error.message : "An error occurred during login"
      );
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    confirmPassword: string,
    name: string
  ) => {
    setLoading(true);
    setError(null);

    if (!email || !password || !name) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }

    // Check password complexity
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(password)) {
      setError("Password must contain uppercase, lowercase, number, and special character");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password, name }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Registration failed");
      }

      const data = await response.json();
      const { user: userData, token } = data;

      localStorage.setItem("auth_token", token);

      router.push("/app");
    } catch (error: any) {
      setError(
        error?.message ? error.message : "An error occurred during registration"
      );
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    router.push("/login");
  };

  const getUserData = async () => {
    const token = localStorage.getItem("auth_token");
    console.log("token", token);
    if (!token) {
      setUser(null);
      return false;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();
      setUser(data);

      if (data) {
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error fetching user data:", error);
      //   setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    logout,
    register,
    refetchUser: getUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
