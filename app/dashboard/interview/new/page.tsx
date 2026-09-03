"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Question } from "@/types";
import {
  Sparkles,
  Briefcase,
  Code2,
  Sliders,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Zap,
} from "lucide-react";

const POPULAR_ROLES = [
  "Unity C# Game Developer",
  "Unreal Engine C++ Developer",
  "Game Gameplay & Systems Engineer",
  "3D Graphics Programmer (Shaders/HLSL)",
  "Senior Full-Stack Engineer",
  "Backend Systems Engineer",
  "Frontend Architect",
  "AI / LLM Application Engineer",
  "Cloud & DevOps Engineer",
  "System Design Specialist",
];

const COMMON_TECH_STACKS = [
  "Unity",
  "C#",
  "Unreal Engine",
  "C++",
  "HLSL / Shaders",
  "PhysX / Physics",
  "Photon / Multiplayer",
  "TypeScript",
  "Next.js",
  "React",
  "Node.js",
  "Python",
  "PostgreSQL",
  "Docker",
  "Gemini 2.5",
];

export default function NewInterviewPage() {
  const router = useRouter();
  const [role, setRole] = useState("Senior Full-Stack Engineer");
  const [selectedTech, setSelectedTech] = useState<string[]>(["TypeScript", "Next.js", "Node.js"]);
  const [customTechInput, setCustomTechInput] = useState("");
  const [yearsExperience, setYearsExperience] = useState<number>(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleTechChip = (tech: string) => {
    if (selectedTech.includes(tech)) {
      setSelectedTech(selectedTech.filter((t) => t !== tech));
    } else {
      setSelectedTech([...selectedTech, tech]);
    }
  };

  const addCustomTech = () => {
    if (customTechInput.trim() && !selectedTech.includes(customTechInput.trim())) {
      setSelectedTech([...selectedTech, customTechInput.trim()]);
      setCustomTechInput("");
    }
  };

  const handleStartInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role || selectedTech.length === 0) {
      setError("Please specify a target role and select at least one technology.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call Gemini 2.5 question generation API
      const res = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          techStack: selectedTech,
          yearsExperience,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate questions");

      const generatedQuestions: Question[] = data.questions;
      const interviewId = `interview-${Date.now()}`;

      // Save session setup in sessionStorage for local transport to live interview room
      sessionStorage.setItem(
        `session_${interviewId}`,
        JSON.stringify({
          id: interviewId,
          role,
          techStack: selectedTech,
          yearsExperience,
          questions: generatedQuestions,
        })
      );

      router.push(`/dashboard/interview/${interviewId}`);
    } catch (err: any) {
      console.error("Error setting up interview session:", err);
      setError(err.message || "Failed to generate interview configuration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-6">
      <div className="space-y-2 text-center sm:text-left">
        <Badge variant="indigo" className="py-1 px-3">
          <Sparkles className="h-3.5 w-3.5 mr-1" /> Dynamic Question Generation
        </Badge>
        <h1 className="text-3xl font-extrabold text-white">Configure Your AI Mock Interview</h1>
        <p className="text-slate-400 text-sm">
          Select your target role, stack, and experience level. Google Gemini 2.5 Flash will craft custom interview questions.
        </p>
      </div>

      <Card className="border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-2xl">
        <form onSubmit={handleStartInterview}>
          <CardContent className="space-y-6 pt-6">
            {error && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Target Role Selector */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-indigo-400" /> Target Job Role
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Senior Full-Stack Engineer"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
              <div className="flex flex-wrap gap-2 pt-1">
                {POPULAR_ROLES.map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setRole(r)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                      role === r
                        ? "bg-indigo-950/80 border-indigo-500 text-indigo-300 font-semibold"
                        : "bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Tech Stack Chips & Input */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Code2 className="h-4 w-4 text-purple-400" /> Primary Technologies & Tools
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customTechInput}
                  onChange={(e) => setCustomTechInput(e.target.value)}
                  placeholder="Add custom technology (e.g. Rust, Kafka)"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomTech();
                    }
                  }}
                  className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
                <Button type="button" variant="outline" size="sm" onClick={addCustomTech}>
                  Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {COMMON_TECH_STACKS.map((tech) => {
                  const isSelected = selectedTech.includes(tech);
                  return (
                    <button
                      type="button"
                      key={tech}
                      onClick={() => toggleTechChip(tech)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-indigo-600 text-white border-indigo-500 font-semibold shadow-md shadow-indigo-500/20"
                          : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="h-3 w-3 text-white" />}
                      {tech}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Experience Level Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-emerald-400" /> Experience Level
                </label>
                <span className="text-sm font-extrabold text-indigo-400 bg-indigo-950/80 px-3 py-0.5 rounded-full border border-indigo-500/30">
                  {yearsExperience} Years Experience
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={15}
                value={yearsExperience}
                onChange={(e) => setYearsExperience(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                <span>Entry (0-1 YOE)</span>
                <span>Mid-Level (2-4 YOE)</span>
                <span>Senior (5-8 YOE)</span>
                <span>Staff / Principal (9+ YOE)</span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="pt-2">
            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Generating 5 Customized Questions with Gemini 2.5...
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5 mr-2 fill-white" />
                  Generate Questions & Start Live Voice Agent Session
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
