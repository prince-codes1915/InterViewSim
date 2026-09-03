"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { VoiceAgentModal } from "@/components/VoiceAgentModal";
import { Question, TranscriptMessage } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowLeft, Loader2, Sparkles, HelpCircle, CheckCircle2 } from "lucide-react";

export default function LiveInterviewPage() {
  const params = useParams();
  const router = useRouter();
  const interviewId = params.id as string;

  const [session, setSession] = useState<{
    role: string;
    techStack: string[];
    yearsExperience: number;
    questions: Question[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);

  useEffect(() => {
    // Attempt to load created session configuration from sessionStorage
    const stored = typeof window !== "undefined" ? sessionStorage.getItem(`session_${interviewId}`) : null;
    if (stored) {
      try {
        setSession(JSON.parse(stored));
        setLoading(false);
        return;
      } catch (e) {
        // Fallback
      }
    }

    // Default high-quality session setup if direct link access
    const defaultSession = {
      role: "Senior Full-Stack Engineer",
      techStack: ["Next.js", "TypeScript", "Node.js", "PostgreSQL"],
      yearsExperience: 5,
      questions: [
        {
          id: 1,
          question: "Can you walk me through your experience building full-stack web applications with Next.js and TypeScript?",
          category: "Technical" as const,
        },
        {
          id: 2,
          question: "How do you handle state management, caching, and SSR performance optimization in complex client apps?",
          category: "System Design" as const,
        },
        {
          id: 3,
          question: "Describe a situation where you had to debug a critical memory leak or database deadlock under tight deadlines.",
          category: "Problem Solving" as const,
        },
        {
          id: 4,
          question: "How do you structure code reviews and align technical architecture decisions across multi-disciplinary teams?",
          category: "Behavioral" as const,
        },
        {
          id: 5,
          question: "What strategies do you employ for API rate limiting, WebSockets scalability, and end-to-end type safety?",
          category: "Technical" as const,
        },
      ],
    };
    setSession(defaultSession);
    setLoading(false);
  }, [interviewId]);

  const handleInterviewComplete = async (transcript: TranscriptMessage[]) => {
    setEvaluating(true);
    try {
      // Save actual real transcript in sessionStorage
      if (typeof window !== "undefined") {
        sessionStorage.setItem(`transcript_${interviewId}`, JSON.stringify(transcript));
      }

      // Call Gemini 2.5 Pro evaluation API route
      const res = await fetch("/api/evaluate-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewId,
          transcript,
          role: session?.role || "Software Engineer",
          techStack: session?.techStack || ["TypeScript"],
        }),
      });

      const data = await res.json();
      if (data.evaluation) {
        sessionStorage.setItem(`eval_${interviewId}`, JSON.stringify(data.evaluation));
      }
    } catch (err) {
      console.warn("Evaluation request warning:", err);
    } finally {
      // Redirect to detailed scorecard & breakdown page
      router.push(`/dashboard/interview/${interviewId}/feedback`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        <span className="text-sm font-medium">Initializing WebRTC Audio Session & Gemini Prompt...</span>
      </div>
    );
  }

  if (evaluating) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center text-slate-200 gap-4 text-center px-4">
        <div className="relative">
          <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 blur-lg animate-pulse" />
          <div className="relative p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <Sparkles className="h-12 w-12 text-indigo-400 animate-spin" />
          </div>
        </div>
        <h2 className="text-2xl font-extrabold text-white">Analyzing Interview Transcript</h2>
        <p className="text-sm text-slate-400 max-w-md">
          Google Gemini 2.5 Pro is currently evaluating your technical depth, communication structure, and problem-solving response...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
        </Button>

        <div className="flex items-center gap-2">
          <Badge variant="indigo">{session?.role}</Badge>
          <Badge variant="outline">{session?.yearsExperience} YOE</Badge>
        </div>
      </div>

      {/* Main Voice Agent WebRTC Modal Component */}
      {session && (
        <VoiceAgentModal
          role={session.role}
          techStack={session.techStack}
          yearsExperience={session.yearsExperience}
          questions={session.questions}
          onInterviewComplete={handleInterviewComplete}
        />
      )}

      {/* Questions Reference Card */}
      {session && (
        <Card className="max-w-4xl mx-auto border-slate-800 bg-slate-900/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-indigo-400" />
              <CardTitle className="text-base">Generated Interview Questions Agenda</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {session.questions.map((q, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-400">Question #{q.id}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {q.category}
                    </Badge>
                  </div>
                  <p className="text-slate-200">{q.question}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
