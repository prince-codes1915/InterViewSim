"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  Mic,
  Sparkles,
  Bot,
  BarChart3,
  CheckCircle2,
  Play,
  ArrowRight,
} from "lucide-react";

export default function HomePage() {
  const { user, setDemoUser } = useAuth();
  const router = useRouter();

  const handleLaunchDemo = () => {
    setDemoUser();
    router.push("/dashboard");
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background Glowing Ambient Orbs */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-blue-600/20 via-cyan-500/20 to-teal-400/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="relative px-4 pt-16 pb-24 mx-auto max-w-7xl sm:px-6 lg:px-8 text-center">
        <Badge variant="indigo" className="mb-6 py-1.5 px-4 text-xs font-semibold uppercase tracking-wider animate-float inline-flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
          Powered by Vapi WebRTC & Gemini 2.5 Intelligence
        </Badge>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
          Master Tech Interviews with <br />
          <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 bg-clip-text text-transparent">
            Real-Time AI Voice Agents
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
          Simulate high-stakes voice interviews tailored to your exact tech stack and seniority level. Get instant, granular feedback on communication, system architecture, and technical depth.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button variant="primary" size="lg" onClick={handleLaunchDemo} className="shadow-2xl shadow-cyan-500/30">
            <Play className="h-5 w-5 mr-2 fill-slate-950" /> Try Instant Demo Candidate
          </Button>

          <Link href={user ? "/dashboard/interview/new" : "/register"}>
            <Button variant="glass" size="lg">
              Start Custom Mock Interview <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Social Proof & Badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-slate-400 text-xs font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" /> WebRTC Ultra-low Latency Audio
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Structured Gemini 2.5 Evaluation
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Interactive Scorecard & Transcripts
          </div>
        </div>

        {/* Dynamic Voice Simulator Preview Graphic */}
        <div className="mt-16 relative mx-auto max-w-4xl rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl text-left">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex space-x-1.5">
                <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-xs font-mono text-slate-400">interview-session-live.webrtc</span>
            </div>
            <Badge variant="indigo" className="text-[10px]">Live WebRTC Voice Feed</Badge>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-xs space-y-2">
                <span className="text-cyan-400 font-bold uppercase tracking-wider block">AI Senior Interviewer (Jennifer)</span>
                <p className="text-slate-200 text-sm leading-relaxed">
                  "Walk me through how you'd design a distributed caching layer using Redis for a high-concurrency Node.js API with zero downtime."
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs space-y-2 ml-4">
                <span className="text-sky-400 font-bold uppercase tracking-wider block">You (Candidate Answer)</span>
                <p className="text-slate-300 text-sm leading-relaxed">
                  "I'd implement a cache-aside pattern with write-through invalidation, utilizing cluster replication across availability zones..."
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-center items-center p-6 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
              <div className="relative mb-4">
                <div className="absolute -inset-3 rounded-full bg-cyan-500/20 animate-pulseWave" />
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 shadow-lg">
                  <Mic className="h-8 w-8 font-extrabold" />
                </div>
              </div>
              <h4 className="text-base font-bold text-white">Interactive Voice Agent Active</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Real-time audio streaming powered by Vapi WebRTC SDK with automatic transcript indexing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="px-4 py-20 mx-auto max-w-7xl sm:px-6 lg:px-8 border-t border-slate-800/60">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Built for Engineers & Technical Leaders
          </h2>
          <p className="mt-4 text-slate-400 text-base">
            Everything you need to practice, iterate, and ace your technical interviews.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="hover:border-cyan-500/40">
            <div className="p-3 rounded-xl bg-cyan-950/80 text-cyan-400 w-fit mb-4 border border-cyan-500/20">
              <Bot className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Real-Time Voice WebRTC</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Experience zero-latency voice conversations with natural interruptions, human-like voice synthesis, and dynamic follow-up questions.
            </p>
          </Card>

          <Card className="hover:border-sky-500/40">
            <div className="p-3 rounded-xl bg-sky-950/80 text-sky-400 w-fit mb-4 border border-sky-500/20">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Gemini 2.5 Intelligence</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Questions generated dynamically by Gemini 2.5 Flash tailored to your target role, stack, and seniority. Evaluated by Gemini 2.5 Pro reasoning.
            </p>
          </Card>

          <Card className="hover:border-emerald-500/40">
            <div className="p-3 rounded-xl bg-emerald-950/80 text-emerald-400 w-fit mb-4 border border-emerald-500/20">
              <BarChart3 className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Detailed Score Cards</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Get 0-100 overall scores, communication breakdowns, key strengths in green, areas for improvement, and actionable key takeaways.
            </p>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-12 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Mic className="h-4 w-4 text-cyan-400" />
            <span className="font-bold text-slate-300">Interview AI</span> — Next-Gen Voice Mock Interview Platform
          </div>
          <div>© {new Date().getFullYear()} Interview AI. Built with Next.js 14, Vapi WebRTC & Gemini 2.5.</div>
        </div>
      </footer>
    </div>
  );
}
