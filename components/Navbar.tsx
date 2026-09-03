"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Mic, Sparkles, LogOut, LayoutDashboard, PlusCircle } from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, logout, setDemoUser } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-emerald-400 shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-transform">
            <Mic className="h-5 w-5 text-slate-950 font-extrabold" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
              Interview <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 bg-clip-text text-transparent">AI</span>
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors hover:text-cyan-400 ${
              pathname === "/" ? "text-cyan-400 font-semibold" : "text-slate-400"
            }`}
          >
            Home
          </Link>
          {user && (
            <>
              <Link
                href="/dashboard"
                className={`text-sm font-medium flex items-center gap-1.5 transition-colors hover:text-cyan-400 ${
                  pathname === "/dashboard" ? "text-cyan-400 font-semibold" : "text-slate-400"
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                href="/dashboard/interview/new"
                className={`text-sm font-medium flex items-center gap-1.5 transition-colors hover:text-cyan-400 ${
                  pathname.includes("/interview/new") ? "text-cyan-400 font-semibold" : "text-slate-400"
                }`}
              >
                <PlusCircle className="h-4 w-4" />
                Start Interview
              </Link>
            </>
          )}
        </nav>

        {/* Auth Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-800 bg-slate-900/60 text-xs text-slate-300">
                <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>{user.displayName || user.email}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} title="Sign Out">
                <LogOut className="h-4 w-4 text-slate-400 hover:text-white" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDemoUser();
                  router.push("/dashboard");
                }}
              >
                Demo Candidate Mode
              </Button>
              <Link href="/login">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
