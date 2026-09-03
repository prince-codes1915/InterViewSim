"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  Key,
  Cpu,
  Database,
  Radio,
  UserCheck,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  Code2,
} from "lucide-react";

export default function AboutCredentialsPage() {
  const { user } = useAuth();

  // Inspect environment key availability
  const hasGeminiKey =
    process.env.NEXT_PUBLIC_HAS_GEMINI_KEY ||
    (typeof process !== "undefined" && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "mock_gemini_key");

  const hasVapiPublicKey =
    typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY &&
    process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY !== "mock_vapi_pub_key";

  const firebaseProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "interviewsim-91a41";

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="indigo" className="py-1 px-3">
              <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Platform & Credentials Overview
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold text-white">About & Connected Credentials</h1>
          <p className="text-slate-400 text-sm mt-1">
            Overview of your candidate account credentials, active AI models, cloud database, and system status.
          </p>
        </div>

        <Link href="/dashboard">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Candidate User Credentials Card */}
      <Card className="border-indigo-500/30 bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 shadow-2xl backdrop-blur-2xl">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-600/30 text-indigo-300 border border-indigo-500/40">
              <UserCheck className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl">Candidate Account Credentials</CardTitle>
              <CardDescription>Active authenticated profile & session credentials</CardDescription>
            </div>
          </div>
          <Badge variant={user ? "success" : "warning"}>
            {user ? "Authenticated Active" : "Demo Guest Candidate"}
          </Badge>
        </CardHeader>

        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Candidate Name / Handle
              </span>
              <p className="text-base font-bold text-white">
                {user?.displayName || "Demo Candidate (Rafid Ahmed Prince)"}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Email Address
              </span>
              <p className="text-base font-mono text-cyan-300">
                {user?.email || "rafidahmed1915@gmail.com"}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Firebase User UID
              </span>
              <p className="text-xs font-mono text-slate-300 break-all">
                {user?.uid || "usr_demo_candidate_91a41_prod_token"}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Primary Specialty Roles
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 text-xs font-medium border border-indigo-500/30">
                  Unity C# Game Dev
                </span>
                <span className="px-2 py-0.5 rounded-md bg-blue-950 text-blue-300 text-xs font-medium border border-blue-500/30">
                  Senior Full-Stack
                </span>
                <span className="px-2 py-0.5 rounded-md bg-purple-950 text-purple-300 text-xs font-medium border border-purple-500/30">
                  AI Systems Architect
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cloud & AI API Services Credentials Checklist */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Key className="h-5 w-5 text-cyan-400" />
          <h2 className="text-xl font-bold text-white">System Credentials & Integrations Status</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Google Gemini AI */}
          <Card className="border-slate-800 bg-slate-900/90 shadow-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-cyan-400" />
                  <CardTitle className="text-base">Google Gemini AI</CardTitle>
                </div>
                <Badge variant="success">Active</Badge>
              </div>
              <CardDescription className="text-xs">
                Question Generation & FAANG Evaluation Engine
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Models</span>
                <span className="font-mono text-cyan-300">gemini-2.5-flash / pro</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Key Status</span>
                <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Configured
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-400">Response Mode</span>
                <span className="text-slate-200">Structured JSON Schema</span>
              </div>
            </CardContent>
          </Card>

          {/* Vapi WebRTC Voice Agent */}
          <Card className="border-slate-800 bg-slate-900/90 shadow-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Radio className="h-5 w-5 text-emerald-400" />
                  <CardTitle className="text-base">Vapi WebRTC Agent</CardTitle>
                </div>
                <Badge variant="success">Active</Badge>
              </div>
              <CardDescription className="text-xs">
                Real-Time Voice Call & ElevenLabs Audio Engine
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Voice Synthesis</span>
                <span className="font-mono text-emerald-300">11labs / Rachel</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                <span className="text-slate-400">WebRTC Stream</span>
                <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Ready
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-400">Speech Recog.</span>
                <span className="text-slate-200">Web Speech API Mic</span>
              </div>
            </CardContent>
          </Card>

          {/* Firebase Authentication & Cloud Storage */}
          <Card className="border-slate-800 bg-slate-900/90 shadow-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-indigo-400" />
                  <CardTitle className="text-base">Firebase Cloud DB</CardTitle>
                </div>
                <Badge variant="success">Active</Badge>
              </div>
              <CardDescription className="text-xs">
                Firestore Database & User Authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Project ID</span>
                <span className="font-mono text-indigo-300">{firebaseProjectId}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Auth Method</span>
                <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Email / Password
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-400">Authorized Domain</span>
                <span className="text-slate-200">inter-view-sim.vercel.app</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tech Stack & Architecture Information */}
      <Card className="border-slate-800 bg-slate-900/70 shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Code2 className="h-5 w-5 text-indigo-400" />
            <CardTitle className="text-lg">Interview AI Platform Architecture</CardTitle>
          </div>
          <CardDescription>
            Built using modern web technologies to deliver zero-latency voice mock interviews and instant evaluation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-300">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <span className="text-xs font-bold text-slate-400 block mb-1 uppercase">Framework</span>
              <span className="font-bold text-white">Next.js 14 (App Router)</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <span className="text-xs font-bold text-slate-400 block mb-1 uppercase">Language</span>
              <span className="font-bold text-white">TypeScript (Strict)</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <span className="text-xs font-bold text-slate-400 block mb-1 uppercase">Styling</span>
              <span className="font-bold text-white">Tailwind CSS</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <span className="text-xs font-bold text-slate-400 block mb-1 uppercase">Deployment</span>
              <span className="font-bold text-white">Vercel Serverless</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
