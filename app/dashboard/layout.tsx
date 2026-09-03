"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, setDemoUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // Auto-set demo session for frictionless testing if user hasn't explicitly logged out
      setDemoUser();
    }
  }, [loading, user, setDemoUser]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        <span className="text-sm font-medium">Loading Candidate Session...</span>
      </div>
    );
  }

  return <div className="min-h-[calc(100vh-4rem)] bg-slate-950 px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto">{children}</div>;
}
