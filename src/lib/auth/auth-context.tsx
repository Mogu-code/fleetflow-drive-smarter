import React, { createContext, useContext, useState } from "react";
import type { AuthSession, LoginCredentials, SignupData, User, UserRole } from "@/types/auth";
import { authService, USER_PRESETS } from "./auth-service";
import { can as canHelper, type Permission } from "./permissions";

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  session: AuthSession | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  loginAsDemo: (role: UserRole) => Promise<void>;
  signup: (data: SignupData) => Promise<{ success: boolean }>;
  logout: () => Promise<void>;
  verifyEmail: () => Promise<void>;
  updateUser: (updated: Partial<User>) => void;
  can: (permission: Permission) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => {
    const existing = authService.getSession();
    if (existing) return existing;
    return {
      user: USER_PRESETS.Customer,
      token: "default_demo_token",
      expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(),
      isDemo: true,
    };
  });
  const [loading, setLoading] = useState(false);

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    const res = await authService.login(credentials);
    if (res.success && res.session) {
      setSession(res.session);
    }
    setLoading(false);
    return res;
  };

  const loginAsDemo = async (newRole: UserRole) => {
    setLoading(true);
    const newSession = await authService.loginAsDemo(newRole);
    setSession(newSession);
    setLoading(false);
  };

  const signup = async (data: SignupData) => {
    setLoading(true);
    const res = await authService.signup(data);
    if (res.success && res.session) {
      setSession(res.session);
    }
    setLoading(false);
    return res;
  };

  const logout = async () => {
    setLoading(true);
    await authService.logout();
    setSession(null);
    setLoading(false);
  };

  const verifyEmail = async () => {
    await authService.verifyEmail();
    if (session) {
      setSession({
        ...session,
        user: { ...session.user, emailVerified: true },
      });
    }
  };

  const updateUser = (updated: Partial<User>) => {
    if (session) {
      const updatedUser = { ...session.user, ...updated };
      const newSession = { ...session, user: updatedUser };
      setSession(newSession);
      authService.saveSession(newSession);
    }
  };

  const user = session?.user ?? null;
  const role: UserRole = user?.role ?? "Customer";
  const isAuthenticated = !!session;

  const can = (permission: Permission) => canHelper(user, permission);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        session,
        loading,
        login,
        loginAsDemo,
        signup,
        logout,
        verifyEmail,
        updateUser,
        can,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
