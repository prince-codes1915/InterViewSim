"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { UserSession } from "@/types";

interface AuthContextType {
  user: UserSession | null;
  firebaseUser: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  setDemoUser: (email?: string, name?: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
  logout: async () => {},
  setDemoUser: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for demo session first if present
    const demoSessionStr = typeof window !== "undefined" ? localStorage.getItem("interview_ai_demo_user") : null;
    if (demoSessionStr) {
      try {
        const parsed = JSON.parse(demoSessionStr);
        setUser(parsed);
        setLoading(false);
      } catch (e) {
        // ignore
      }
    }

    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        setUser({
          uid: fbUser.uid,
          email: fbUser.email || "candidate@interviewai.dev",
          displayName: fbUser.displayName || "Tech Candidate",
          photoURL: fbUser.photoURL || undefined,
          createdAt: new Date(),
        });
      } else if (!demoSessionStr) {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("interview_ai_demo_user");
    }
    setUser(null);
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.warn("Sign out error:", e);
    }
  };

  const setDemoUser = (email = "rafid.candidate@example.com", name = "Raf") => {
    const demoSession: UserSession = {
      uid: "demo-user-123",
      email,
      displayName: name,
      photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      createdAt: new Date(),
    };
    if (typeof window !== "undefined") {
      localStorage.setItem("interview_ai_demo_user", JSON.stringify(demoSession));
    }
    setUser(demoSession);
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, logout, setDemoUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
