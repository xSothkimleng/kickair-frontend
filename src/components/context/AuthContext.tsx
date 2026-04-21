"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { api, EmailUnverifiedError } from "@/lib/api";
import { User, EmailRegisterData, PhoneRegisterData } from "@/types/user";
import EmailVerificationWall from "@/components/auth/EmailVerificationWall";

const PENDING_EMAIL_KEY = "pending_verification_email";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  emailVerificationPending: boolean;
  pendingEmail: string | null;
  loginEmail: (email: string, password: string) => Promise<User>;
  loginPhone: (telephone: string, password: string) => Promise<User>;
  registerEmail: (data: EmailRegisterData) => Promise<void>;
  registerPhone: (data: PhoneRegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  resendVerification: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function isEmailUnverified(user: User): boolean {
  return !!user.email && !user.email_verified_at;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailVerificationPending, setEmailVerificationPending] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  const refreshUser = useCallback(async () => {
    try {
      const updatedUser = await api.getUser();
      setUser(updatedUser);
      if (isEmailUnverified(updatedUser)) {
        setEmailVerificationPending(true);
        setPendingEmail(updatedUser.email);
      } else {
        setEmailVerificationPending(false);
        setPendingEmail(null);
        localStorage.removeItem(PENDING_EMAIL_KEY);
      }
    } catch (err) {
      if (err instanceof EmailUnverifiedError) {
        setEmailVerificationPending(true);
        const stored = localStorage.getItem(PENDING_EMAIL_KEY);
        setPendingEmail(stored);
      } else {
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    api
      .getUser()
      .then((fetchedUser) => {
        setUser(fetchedUser);
        if (isEmailUnverified(fetchedUser)) {
          setEmailVerificationPending(true);
          setPendingEmail(fetchedUser.email);
        }
      })
      .catch((err) => {
        if (err instanceof EmailUnverifiedError) {
          setEmailVerificationPending(true);
          const stored = localStorage.getItem(PENDING_EMAIL_KEY);
          setPendingEmail(stored);
        } else {
          setUser(null);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const loginEmail = async (email: string, password: string): Promise<User> => {
    const loggedInUser = await api.loginEmail(email, password);
    setUser(loggedInUser);
    if (isEmailUnverified(loggedInUser)) {
      setEmailVerificationPending(true);
      setPendingEmail(loggedInUser.email);
      localStorage.setItem(PENDING_EMAIL_KEY, loggedInUser.email);
    }
    return loggedInUser;
  };

  const loginPhone = async (telephone: string, password: string): Promise<User> => {
    const loggedInUser = await api.loginPhone(telephone, password);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const registerEmail = async (data: EmailRegisterData) => {
    const registeredUser = await api.registerEmail(data);
    setUser(registeredUser);
    setEmailVerificationPending(true);
    setPendingEmail(data.email);
    localStorage.setItem(PENDING_EMAIL_KEY, data.email);
  };

  const registerPhone = async (data: PhoneRegisterData) => {
    const registeredUser = await api.registerPhone(data);
    setUser(registeredUser);
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      api.clearToken();
    }
    setUser(null);
    setEmailVerificationPending(false);
    setPendingEmail(null);
    localStorage.removeItem(PENDING_EMAIL_KEY);
  };

  const resendVerification = async () => {
    await api.resendVerificationEmail();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        emailVerificationPending,
        pendingEmail,
        loginEmail,
        loginPhone,
        registerEmail,
        registerPhone,
        logout,
        refreshUser,
        resendVerification,
        setUser,
      }}
    >
      {!loading && emailVerificationPending && !user?.is_admin ? (
        <EmailVerificationWall email={pendingEmail} onResend={resendVerification} onLogout={logout} />
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
