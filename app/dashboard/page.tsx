"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  BarChart2,
  PlusCircle,
  Clock,
  Sparkles,
  ArrowUpRight,
  Target,
  ChevronRight,
  Calendar,
  Layers,
} from "lucide-react";

interface MockInterviewSummary {
  id: string;
  role: string;
  techStack: string[];
  yearsExperience: number;
  score: number;
  status: "completed" | "in-progress" | "created";
  date: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState<MockInterviewSummary[]>([]);

  useEffect(() => {
    // Populate realistic candidate interview history
    const history: MockInterviewSummary[] = [
      {
        id: "demo-interview-unity",
        role: "Unity C# Game Developer",
        techStack: ["Unity", "C#", "Object Pooling", "Shader Graph"],
        yearsExperience: 4,
        score: 91,
        status: "completed",
        date: "Just now",
      },
      {
        id: "demo-interview-1",
        role: "Senior Full-Stack Engineer",
        techStack: ["Next.js", "TypeScript", "Node.js", "PostgreSQL"],
        yearsExperience: 5,
        score: 88,
        status: "completed",
        date: "Today",
      },
      {
        id: "demo-interview-2",
        role: "AI Systems Architect",
        techStack: ["Python", "LangChain", "Gemini 2.5", "Pinecone"],
        yearsExperience: 6,
        score: 92,
        status: "completed",
        date: "2 days ago",
      },
    ];
    setInterviews(history);
  }, []);

  const totalInterviews = interviews.length;
  const avgScore = totalInterviews > 0 ? Math.round(interviews.reduce((acc, item) => acc + item.score, 0) / totalInterviews) : 0;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 shadow-xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            Welcome back, {user?.displayName || "Candidate"}! 👋
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Track your mock interview progress and practice real-time technical voice simulations.
          </p>
        </div>

        <Link href="/dashboard/interview/new">
          <Button variant="primary" size="lg" className="shadow-lg shadow-indigo-500/30">
            <PlusCircle className="h-5 w-5 mr-2" /> Start New Interview Session
          </Button>
        </Link>
      </div>

      {/* Candidate Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="border-indigo-500/20 bg-indigo-950/20">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Total Interviews</p>
              <h3 className="text-3xl font-extrabold text-white mt-1">{totalInterviews}</h3>
              <span className="text-xs text-slate-400 mt-1 inline-block">Sessions Completed</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-indigo-600/30 text-indigo-300 border border-indigo-500/40">
              <Layers className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/20 bg-emerald-950/20">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Average Performance</p>
              <h3 className="text-3xl font-extrabold text-white mt-1">{avgScore} / 100</h3>
              <span className="text-xs text-emerald-400 mt-1 inline-block font-medium">Strong Hire Benchmark</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-600/30 text-emerald-300 border border-emerald-500/40">
              <Trophy className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-500/20 bg-purple-950/20">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-purple-400">Top Technical Skill</p>
              <h3 className="text-2xl font-extrabold text-white mt-1">System Architecture</h3>
              <span className="text-xs text-slate-400 mt-1 inline-block">92% Category Rating</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-purple-600/30 text-purple-300 border border-purple-500/40">
              <Target className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Past Interviews List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Mock Interview Sessions</CardTitle>
            <CardDescription>Review scores, feedback, and interactive voice transcripts</CardDescription>
          </div>
          <Badge variant="outline">{interviews.length} Recorded Sessions</Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {interviews.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all duration-200"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <h4 className="font-bold text-white text-base">{item.role}</h4>
                    <Badge variant={item.score >= 85 ? "success" : "warning"}>
                      Score: {item.score} / 100
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-slate-500" /> {item.date}
                    </span>
                    <span>•</span>
                    <span>{item.yearsExperience} YOE</span>
                    <span>•</span>
                    <div className="flex gap-1.5 flex-wrap">
                      {item.techStack.map((tech, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono text-[11px]">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Link href={`/dashboard/interview/${item.id}/feedback`}>
                    <Button variant="outline" size="sm">
                      View Score Card <ArrowUpRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                  <Link href={`/dashboard/interview/${item.id}`}>
                    <Button variant="secondary" size="sm">
                      Re-Enter Session <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
