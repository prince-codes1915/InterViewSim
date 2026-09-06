"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ScoreCard } from "@/components/ScoreCard";
import { EvaluationResult, TranscriptMessage } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  RotateCcw,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Sparkles,
  FileText,
} from "lucide-react";

export default function InterviewFeedbackPage() {
  const params = useParams();
  const router = useRouter();
  const interviewId = params.id as string;

  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [showTranscript, setShowTranscript] = useState(true);

  useEffect(() => {
    // Attempt to load evaluation from storage
    let storedEval: string | null = null;
    let storedTranscriptStr: string | null = null;
    if (typeof window !== "undefined") {
      storedEval = sessionStorage.getItem(`eval_${interviewId}`) || localStorage.getItem(`eval_${interviewId}`);
      storedTranscriptStr = sessionStorage.getItem(`transcript_${interviewId}`) || localStorage.getItem(`transcript_${interviewId}`);
    }

    if (storedEval) {
      try {
        setEvaluation(JSON.parse(storedEval));
      } catch (e) {}
    }

    if (storedTranscriptStr) {
      try {
        const parsed = JSON.parse(storedTranscriptStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTranscript(parsed);
        }
      } catch (e) {}
    }

    // Role-specific matching fallback evaluations & transcripts if accessed via direct URL
    if (interviewId === "demo-interview-unity") {
      if (!storedEval) {
        setEvaluation({
          overallScore: 91,
          technicalScore: 93,
          communicationScore: 89,
          problemSolvingScore: 90,
          strengths: [
            "Exceptional knowledge of Unity C# memory management and Garbage Collection (GC) optimization.",
            "Demonstrated strong implementation patterns for Object Pooling and C# Structs.",
            "Clear explanation of Unity engine lifecycle execution (Update, FixedUpdate, LateUpdate).",
          ],
          areasForImprovement: [
            "Elaborate further on Shader Graph vs HLSL custom vertex/fragment shader optimization.",
            "Quantify frametime gains (e.g. 60 FPS to 120 FPS latency improvements) in past game builds.",
          ],
          summaryFeedback:
            "Outstanding performance for a Unity C# Game Developer position. Explanations demonstrated deep engine knowledge, low-allocation C# programming techniques, and real-time physics pipeline awareness.",
          keyTakeaways: [
            "Use Physics.RaycastNonAlloc and pre-allocated buffers to prevent GC allocation spikes.",
            "Always state target frametime budgets (e.g., 16.6ms for 60 FPS) during technical discussions.",
          ],
        });
      }

      if (!storedTranscriptStr) {
        setTranscript([
          {
            role: "assistant",
            text: "Hello! Welcome to your Unity C# Game Developer mock interview. Let's begin with our first question: In Unity C#, how do you manage memory allocation and minimize Garbage Collection (GC) spikes during intensive gameplay to maintain 60 FPS?",
            timestamp: "10:00 AM",
          },
          {
            role: "user",
            text: "To prevent GC spikes, I implement Object Pooling for high-frequency entities like bullets and particle effects, avoid instantiating objects inside Update(), use NonAlloc physics queries like Physics.RaycastNonAlloc, and favor Structs over Classes for transient data.",
            timestamp: "10:01 AM",
          },
          {
            role: "assistant",
            text: "Excellent response. Walk me through your implementation strategy for Object Pooling when instantiating game entities in C#.",
            timestamp: "10:02 AM",
          },
          {
            role: "user",
            text: "I create a generic Queue-based ObjectPool manager in C# that pre-allocates game objects at scene load. When an object is needed, we call GetFromPool() which sets active state to true, and ReturnToPool() disables the object and enqueues it back without triggering GC.GarbageCollect.",
            timestamp: "10:04 AM",
          },
        ]);
      }
    } else if (interviewId === "demo-interview-2") {
      if (!storedEval) {
        setEvaluation({
          overallScore: 92,
          technicalScore: 94,
          communicationScore: 90,
          problemSolvingScore: 92,
          strengths: [
            "Profound architecture depth in LLM agent orchestration, RAG pipelines, and vector database indexing.",
            "Strong grasp of Gemini 2.5 API token streaming and latency reduction.",
          ],
          areasForImprovement: [
            "Elaborate further on fine-tuning vs RAG trade-offs for domain-specific context.",
          ],
          summaryFeedback:
            "Superb technical evaluation for an AI Systems Architect role. Demonstrates production experience with vector retrieval, LLM prompt engineering, and scalable backend pipelines.",
          keyTakeaways: [
            "Benchmark vector similarity metrics (Cosine vs HNSW) when explaining retrieval accuracy.",
          ],
        });
      }

      if (!storedTranscriptStr) {
        setTranscript([
          {
            role: "assistant",
            text: "Welcome to your AI Systems Architect mock interview. How do you design low-latency RAG systems with Gemini 2.5 and vector databases?",
            timestamp: "10:00 AM",
          },
          {
            role: "user",
            text: "We implement semantic caching using Redis to short-circuit frequent LLM queries, stream tokens with WebSockets, and chunk documents using dynamic overlap to maximize retrieval precision.",
            timestamp: "10:01 AM",
          },
        ]);
      }
    } else if (interviewId === "demo-interview-1") {
      if (!storedEval) {
        setEvaluation({
          overallScore: 88,
          technicalScore: 91,
          communicationScore: 84,
          problemSolvingScore: 89,
          strengths: [
            "Demonstrated solid mastery of Next.js 14 App Router, WebSockets, and state management trade-offs.",
            "Clear and concise technical communication with logical step-by-step problem decomposition.",
            "Strong awareness of microservice caching strategies, Redis cluster failover, and data consistency.",
          ],
          areasForImprovement: [
            "Quantify achievements more aggressively (e.g. mention specific latency reduction percentages or throughput numbers).",
            "Elaborate further on database indexing strategy and query execution plans during high-concurrency spikes.",
          ],
          summaryFeedback:
            "The candidate performed well for a Senior Full-Stack position. Responses displayed technical competence in modern Web architectures, type safety, and real-time WebRTC communication layers.",
          keyTakeaways: [
            "Prepare 2-3 specific quantitative metrics for every key project on your resume.",
            "Always outline high-level component diagrams before diving into code-level implementation details.",
          ],
        });
      }
    } else if (!storedEval) {
      // Dynamic fallback for user interviews if session storage was cleared but transcript exists
      const transcriptArr = storedTranscriptStr ? JSON.parse(storedTranscriptStr) : [];
      const userMsgs = transcriptArr.filter((t: any) => t.role === "user" || t.speaker === "user");
      const totalWords = userMsgs.reduce((acc: number, t: any) => acc + (t.text ? t.text.split(/\s+/).filter(Boolean).length : 0), 0);
      const avgWords = userMsgs.length > 0 ? totalWords / userMsgs.length : 0;

      if (userMsgs.length === 0 || totalWords < 15) {
        setEvaluation({
          overallScore: 25,
          technicalScore: 20,
          communicationScore: 30,
          problemSolvingScore: 22,
          strengths: ["Attempted interview connection."],
          areasForImprovement: [
            "Minimal to no candidate answers recorded.",
            "Lacks technical explanations for target position.",
          ],
          summaryFeedback: "UNSATISFACTORY: Evaluation failed due to missing or empty candidate responses.",
          keyTakeaways: ["Ensure audio mic input is active and provide detailed answers."],
        });
      } else if (avgWords < 25) {
        setEvaluation({
          overallScore: 45,
          technicalScore: 40,
          communicationScore: 50,
          problemSolvingScore: 42,
          strengths: ["Responded to questions."],
          areasForImprovement: [
            "Answers were overly brief and lacked technical depth.",
            "Did not provide specific architectural trade-offs.",
          ],
          summaryFeedback: "BELOW BAR: Candidate responses were too high-level and brief for passing criteria.",
          keyTakeaways: ["Elaborate thoroughly with concrete examples and technical details."],
        });
      } else {
        setEvaluation({
          overallScore: 72,
          technicalScore: 70,
          communicationScore: 76,
          problemSolvingScore: 71,
          strengths: ["Provided detailed responses to interview questions."],
          areasForImprovement: ["Add quantitative performance metrics to strengthen answers."],
          summaryFeedback: "COMPETENT: Solid performance with clear technical responses.",
          keyTakeaways: ["Incorporate specific STAR framework metrics in future interviews."],
        });
      }
    }
  }, [interviewId]);

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
        </Button>

        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="indigo" className="py-1 px-3">
            <Sparkles className="h-3.5 w-3.5 mr-1" /> Gemini 2.5 Pro Evaluated
          </Badge>
          <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/interview/new")}>
            <RotateCcw className="h-4 w-4 mr-2" /> Try Another Mock Interview
          </Button>
        </div>
      </div>

      {/* Main ScoreCard Component */}
      {evaluation && <ScoreCard evaluation={evaluation} />}

      {/* Expandable Interview Transcript Component */}
      <Card className="max-w-5xl mx-auto border-slate-800 bg-slate-900/80">
        <CardHeader
          className="cursor-pointer select-none flex flex-row items-center justify-between hover:bg-slate-800/30 transition-colors rounded-t-2xl p-6"
          onClick={() => setShowTranscript(!showTranscript)}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-500/20">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Full Interview Voice Transcript</CardTitle>
              <span className="text-xs text-slate-400">Click to {showTranscript ? "collapse" : "expand"} complete audio transcript transcript</span>
            </div>
          </div>

          <Button variant="ghost" size="sm">
            {showTranscript ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
          </Button>
        </CardHeader>

        {showTranscript && (
          <CardContent className="p-6 pt-0 border-t border-slate-800 space-y-4">
            <div className="mt-4 space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {transcript.map((msg, index) => (
                <div
                  key={index}
                  className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-slate-400">
                      {msg.role === "user" ? "Candidate Response" : "AI Senior Interviewer"}
                    </span>
                    {msg.timestamp && <span className="text-[10px] text-slate-500">{msg.timestamp}</span>}
                  </div>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-indigo-600/30 text-indigo-100 border border-indigo-500/40 rounded-tr-none"
                        : "bg-slate-800/80 text-slate-200 border border-slate-700/60 rounded-tl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
