"use client";

import React, { useState, useEffect, useRef } from "react";
import { getVapiInstance } from "@/lib/vapi";
import { Question, TranscriptMessage, VapiCallState } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Mic,
  MicOff,
  PhoneOff,
  PhoneCall,
  Volume2,
  Sparkles,
  AlertCircle,
  MessageSquare,
  Radio,
  CheckCircle2,
} from "lucide-react";

interface VoiceAgentModalProps {
  role: string;
  techStack: string[];
  yearsExperience: number;
  questions: Question[];
  onInterviewComplete: (transcript: TranscriptMessage[]) => void;
  initialInterviewerMode?: "friendly" | "strict";
}

export const VoiceAgentModal: React.FC<VoiceAgentModalProps> = ({
  role,
  techStack,
  yearsExperience,
  questions,
  onInterviewComplete,
  initialInterviewerMode = "friendly",
}) => {
  const [callState, setCallState] = useState<VapiCallState>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [interviewerMode, setInterviewerMode] = useState<"friendly" | "strict">(initialInterviewerMode);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isListeningForSpeech, setIsListeningForSpeech] = useState(false);
  const recognitionRef = useRef<any>(null);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);

  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number | null>(null);

  // Dynamically calculate active question index from candidate response turns or manual selection
  const candidateTurnCount = transcript.filter((m) => m.role === "user").length;
  const activeQuestionIndex =
    selectedQuestionIndex !== null
      ? selectedQuestionIndex
      : Math.min(candidateTurnCount, Math.max(0, questions.length - 1));

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          const spokenText = event.results[0][0]?.transcript;
          if (spokenText) {
            handleSimulatedUserAnswer(spokenText);
          }
        };

        recognition.onend = () => {
          setIsListeningForSpeech(false);
        };

        recognition.onerror = (e: any) => {
          console.warn("Speech recognition notice:", e);
          setIsListeningForSpeech(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  useEffect(() => {
    if (transcriptContainerRef.current) {
      transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight;
    }
  }, [transcript]);

  // Helper for natural browser audio voice synthesis (Web Speech API)
  const speakAloud = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const preferredVoice =
        voices.find(
          (v) =>
            (v.name.includes("Natural") ||
              v.name.includes("Google") ||
              v.name.includes("Samantha") ||
              v.name.includes("Victoria") ||
              v.name.includes("Karen") ||
              v.name.includes("Zira")) &&
            v.lang.startsWith("en")
        ) || voices.find((v) => v.lang.startsWith("en")) || voices[0];

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => setCallState("speaking");
      utterance.onend = () => setCallState("listening");
      utterance.onerror = () => setCallState("listening");

      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    let vapi: any = null;
    try {
      vapi = getVapiInstance();
    } catch (e) {
      // Ignore SSR
    }

    if (!vapi) return;

    const handleCallStart = () => {
      setCallState("listening");
      setErrorMessage(null);
    };

    const handleCallEnd = () => {
      setCallState("ended");
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };

    const handleSpeechStart = () => {
      setCallState("speaking");
    };

    const handleSpeechEnd = () => {
      setCallState("listening");
    };

    const handleMessage = (message: any) => {
      if (message.type === "transcript" && message.transcript) {
        setTranscript((prev) => {
          const role = message.transcriptType === "final" ? message.role : message.role;
          const newMsg: TranscriptMessage = {
            role: role === "user" ? "user" : "assistant",
            text: message.transcript,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          };
          return [...prev.filter((m) => m.text !== message.transcript), newMsg];
        });
      }
    };

    const handleError = (e: any) => {
      console.warn("Vapi SDK Event Warning/Error:", e);
      if (callState === "connecting") {
        setErrorMessage("Notice: Interactive Voice Simulation Active.");
        setCallState("listening");
      }
    };

    vapi.on("call-start", handleCallStart);
    vapi.on("call-end", handleCallEnd);
    vapi.on("speech-start", handleSpeechStart);
    vapi.on("speech-end", handleSpeechEnd);
    vapi.on("message", handleMessage);
    vapi.on("error", handleError);

    return () => {
      vapi.off("call-start", handleCallStart);
      vapi.off("call-end", handleCallEnd);
      vapi.off("speech-start", handleSpeechStart);
      vapi.off("speech-end", handleSpeechEnd);
      vapi.off("message", handleMessage);
      vapi.off("error", handleError);
    };
  }, [callState]);

  const startInterviewCall = async () => {
    setCallState("connecting");
    setErrorMessage(null);

    const isStrict = interviewerMode === "strict";
    const questionsListText = questions.map((q, i) => `${i + 1}. [${q.category}] ${q.question}`).join("\n");
    const systemPrompt = isStrict
      ? `You are a strict, highly demanding, no-nonsense FAANG Senior Staff Engineering Manager & Bar Raiser conducting a technical stress-test for a ${role} position.
Required Tech Stack: ${techStack.join(", ")}.
Candidate Experience: ${yearsExperience} years.

Interview Questions to ask step by step:
${questionsListText}

Instructions:
1. Greet the candidate in a direct, serious, unyielding tone and ask Question 1.
2. DO NOT flatter or offer sugarcoated praise.
3. If candidate answers are vague or missing low-level memory/performance trade-offs, probe firmly or move directly to the next question with zero fluff.
4. Conclude strictly after covering all 5 questions.`
      : `You are a professional, friendly, and human AI Senior Technical Interviewer conducting a mock voice interview for a ${role} position.
Required Tech Stack: ${techStack.join(", ")}.
Candidate Experience: ${yearsExperience} years.

Interview Questions to ask step by step:
${questionsListText}

Instructions:
1. Greet the candidate in a warm, conversational, human tone and ask Question 1.
2. Listen carefully to their response. Speak naturally with realistic phrasing and brief encouraging feedback before asking follow-ups or moving to the next question.
3. Keep answers conversational, direct, and engaging.
4. Conclude warmly after covering the topics.`;

    const initialGreetingText = isStrict
      ? `State your background concisely. Starting Question 1: ${questions[0]?.question || "Introduce your background."}`
      : `Hello! Welcome to your ${role} mock interview. I'm excited to speak with you today. Let's start with our first question: ${questions[0]?.question || "Can you introduce your technical background?"}`;

    try {
      const vapi = getVapiInstance();
      const pubKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;

      if (pubKey && pubKey !== "mock_vapi_pub_key") {
        await vapi.start({
          model: {
            provider: "openai",
            model: "gpt-4o-mini",
            messages: [{ role: "system", content: systemPrompt }],
          },
          voice: {
            provider: "11labs",
            voiceId: "21m00Tcm4TlvDq8ikWAM",
            stability: 0.5,
            similarityBoost: 0.75,
          } as any,
        });
      } else {
        setTimeout(() => {
          const initialGreeting: TranscriptMessage = {
            role: "assistant",
            text: initialGreetingText,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          };
          setTranscript([initialGreeting]);
          speakAloud(initialGreetingText);
        }, 800);
      }
    } catch (e: any) {
      console.warn("Vapi WebRTC start exception, using browser audio synthesis:", e);
      const fallbackGreeting: TranscriptMessage = {
        role: "assistant",
        text: initialGreetingText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setTranscript([fallbackGreeting]);
      speakAloud(initialGreetingText);
    }
  };

  const toggleMute = () => {
    try {
      const vapi = getVapiInstance();
      const newMuteState = !isMuted;
      vapi.setMuted(newMuteState);
      setIsMuted(newMuteState);
    } catch (e) {
      setIsMuted(!isMuted);
    }
  };

  const endInterviewCallWithTranscript = (currentTranscript?: TranscriptMessage[]) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    try {
      const vapi = getVapiInstance();
      vapi.stop();
    } catch (e) {
      // Ignore
    }
    setCallState("ended");
    onInterviewComplete(currentTranscript || transcript);
  };

  const endInterviewCall = () => {
    endInterviewCallWithTranscript(transcript);
  };

  const handleSimulatedUserAnswer = (text: string) => {
    if (!text.trim()) return;
    const userMsg: TranscriptMessage = {
      role: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setCallState("speaking");

    setTranscript((prevTranscript) => {
      const newTranscript = [...prevTranscript, userMsg];
      const currentAnswerCount = newTranscript.filter((m) => m.role === "user").length;
      const isStrict = interviewerMode === "strict";

      if (currentAnswerCount < questions.length) {
        const nextQ = questions[currentAnswerCount];
        const aiResponseText = isStrict
          ? `Noted. Question ${currentAnswerCount + 1}: ${nextQ.question}`
          : `Thank you for that response. Moving to question ${currentAnswerCount + 1}: ${nextQ.question}`;

        setTimeout(() => {
          const aiMsg: TranscriptMessage = {
            role: "assistant",
            text: aiResponseText,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          };
          setTranscript((p) => [...p, aiMsg]);
          speakAloud(aiResponseText);
        }, 800);
      } else {
        const finalMsgText = isStrict
          ? "Session complete. Generating your strict FAANG evaluation scorecard..."
          : "Thank you! That completes all questions for today. Generating your detailed evaluation scorecard now...";

        setTimeout(() => {
          const aiMsg: TranscriptMessage = {
            role: "assistant",
            text: finalMsgText,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          };
          setTranscript((p) => {
            const fullTranscript = [...p, aiMsg];
            speakAloud(finalMsgText);
            setTimeout(() => {
              endInterviewCallWithTranscript(fullTranscript);
            }, 3500);
            return fullTranscript;
          });
        }, 800);
      }

      return newTranscript;
    });
  };

  const getStatusBadge = () => {
    switch (callState) {
      case "connecting":
        return <Badge variant="warning" className="animate-pulse flex gap-1"><Radio className="h-3 w-3 animate-spin" /> Connecting Agent...</Badge>;
      case "listening":
        return <Badge variant="indigo" className="flex gap-1"><Mic className="h-3 w-3 text-cyan-400 animate-pulse" /> Agent Listening</Badge>;
      case "speaking":
        return <Badge variant="success" className="flex gap-1"><Volume2 className="h-3 w-3 text-emerald-400 animate-bounce" /> Agent Speaking Aloud...</Badge>;
      case "ended":
        return <Badge variant="default" className="flex gap-1"><CheckCircle2 className="h-3 w-3 text-slate-400" /> Interview Finished</Badge>;
      default:
        return <Badge variant="outline">Ready to Connect</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
      {/* Visualizer & Agent Status Bar */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/90 backdrop-blur-2xl p-8 shadow-2xl">
        <div className="absolute top-0 right-0 p-32 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
          {/* Agent Avatar & Pulsing Radar */}
          <div className="flex items-center gap-5">
            <div className="relative">
              {callState === "speaking" && (
                <div className="absolute -inset-2 rounded-full bg-emerald-500/30 animate-pulseWave" />
              )}
              {callState === "listening" && (
                <div className="absolute -inset-2 rounded-full bg-cyan-500/30 animate-pulseWave" />
              )}
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-slate-900 border border-cyan-400/40 shadow-lg shadow-cyan-500/30">
                <Sparkles className="h-8 w-8 text-cyan-200 animate-float" />
              </div>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-bold text-white">AI Voice Interviewer</h3>
                {getStatusBadge()}
                <button
                  type="button"
                  onClick={() => setInterviewerMode(interviewerMode === "friendly" ? "strict" : "friendly")}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all cursor-pointer font-medium flex items-center gap-1 ${
                    interviewerMode === "strict"
                      ? "bg-rose-950/80 border-rose-500/50 text-rose-300 shadow-md shadow-rose-500/20"
                      : "bg-emerald-950/80 border-emerald-500/50 text-emerald-300 shadow-md shadow-emerald-500/20"
                  }`}
                  title="Click to toggle interviewer tone"
                >
                  {interviewerMode === "strict" ? "🔥 Strict Bar Raiser" : "😊 Friendly Mode"}
                </button>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                Conducting interview for <span className="text-cyan-300 font-semibold">{role}</span>
              </p>
            </div>
          </div>

          {/* Audio Wave Visualizer representation */}
          <div className="flex items-center gap-1.5 h-10 px-4 py-2 rounded-2xl bg-slate-950/60 border border-slate-800">
            {[40, 75, 55, 90, 60, 100, 45, 80, 65, 30].map((h, i) => (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-300 ${
                  callState === "speaking"
                    ? "bg-emerald-400 animate-pulse"
                    : callState === "listening"
                    ? "bg-cyan-400 animate-pulse"
                    : "bg-slate-700"
                }`}
                style={{
                  height: callState !== "idle" && callState !== "ended" ? `${Math.max(15, (h * (i % 2 === 0 ? 1 : 0.7)))}%` : "20%",
                  animationDelay: `${i * 100}ms`,
                }}
              />
            ))}
          </div>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-xs text-cyan-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Interactive Question Stepper Agenda */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Interview Questions Agenda ({activeQuestionIndex + 1} of {questions.length})
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={activeQuestionIndex === 0}
                onClick={() => setSelectedQuestionIndex(Math.max(0, activeQuestionIndex - 1))}
                className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
              >
                ◀ Prev Q
              </button>
              <button
                type="button"
                disabled={activeQuestionIndex === questions.length - 1}
                onClick={() => setSelectedQuestionIndex(Math.min(questions.length - 1, activeQuestionIndex + 1))}
                className="px-2.5 py-1 rounded-lg bg-indigo-950 border border-indigo-500/40 text-xs text-indigo-300 hover:text-white disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
              >
                Next Q ▶
              </button>
            </div>
          </div>

          {/* Interactive Question Pills Stepper */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {questions.map((q, idx) => {
              const isActive = idx === activeQuestionIndex;
              const isAnswered = idx < activeQuestionIndex;
              return (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setSelectedQuestionIndex(idx)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-cyan-500/20 border-cyan-400 text-cyan-200 ring-2 ring-cyan-500/30 font-bold"
                      : isAnswered
                      ? "bg-slate-950/80 border-slate-700 text-emerald-400"
                      : "bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  {isAnswered ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <span className="h-4 w-4 rounded-full bg-slate-800 text-[10px] flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                  )}
                  <span>{q.category || `Q${idx + 1}`}</span>
                </button>
              );
            })}
          </div>

          {/* Active Focus Question Box */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-sm text-slate-200 shadow-inner">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Active Question {activeQuestionIndex + 1} Focus ({questions[activeQuestionIndex]?.category || "Technical"})
              </span>
              <span className="text-[11px] text-slate-500">
                Click Next/Prev or any pill above to change question focus
              </span>
            </div>
            <p className="text-slate-100 font-medium leading-relaxed">
              {questions[activeQuestionIndex]?.question || "Introduce your background."}
            </p>
          </div>
        </div>

        {/* Call Action Controls */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          {callState === "idle" ? (
            <Button variant="primary" size="lg" onClick={startInterviewCall} className="w-full sm:w-auto">
              <PhoneCall className="h-5 w-5 mr-2" /> Start Voice Interview Session
            </Button>
          ) : (
            <>
              <Button
                variant={isMuted ? "danger" : "outline"}
                size="md"
                onClick={toggleMute}
                disabled={callState === "ended"}
              >
                {isMuted ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
                {isMuted ? "Unmute Mic" : "Mute Mic"}
              </Button>

              <Button variant="danger" size="md" onClick={endInterviewCall}>
                <PhoneOff className="h-4 w-4 mr-2" /> End Interview & Evaluate
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Real-time Transcript Feed */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 backdrop-blur-xl p-6 shadow-xl flex flex-col h-80">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-cyan-400" />
            <h4 className="font-bold text-white text-base">Live Call Transcript & Audio Feed</h4>
          </div>
          <span className="text-xs text-slate-400">{transcript.length} messages</span>
        </div>

        <div ref={transcriptContainerRef} className="flex-1 overflow-y-auto py-4 space-y-4 pr-2">
          {transcript.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm italic">
              <Radio className="h-8 w-8 text-slate-600 mb-2 animate-pulse" />
              <span>Transcript & audio feed will stream alow here in real-time...</span>
            </div>
          ) : (
            transcript.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col ${
                  msg.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-slate-400">
                    {msg.role === "user" ? "You (Candidate)" : "AI Interviewer (Speaking)"}
                  </span>
                  {msg.timestamp && <span className="text-[10px] text-slate-500">{msg.timestamp}</span>}
                </div>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-cyan-950/80 text-cyan-100 border border-cyan-500/40 rounded-tr-none"
                      : "bg-slate-800/80 text-slate-200 border border-slate-700/60 rounded-tl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))
          )}
        </div>

        {callState !== "idle" && callState !== "ended" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const input = (e.currentTarget.elements.namedItem("userInput") as HTMLInputElement);
              if (input && input.value) {
                handleSimulatedUserAnswer(input.value);
                input.value = "";
              }
            }}
            className="mt-2 flex gap-2 pt-3 border-t border-slate-800"
          >
            <input
              name="userInput"
              type="text"
              placeholder="Type your answer or speak into microphone..."
              className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
            />
            {recognitionRef.current && (
              <Button
                type="button"
                variant={isListeningForSpeech ? "danger" : "outline"}
                size="sm"
                onClick={() => {
                  if (isListeningForSpeech) {
                    try { recognitionRef.current.stop(); } catch (e) {}
                    setIsListeningForSpeech(false);
                  } else {
                    try {
                      setIsListeningForSpeech(true);
                      recognitionRef.current.start();
                    } catch (e) {
                      setIsListeningForSpeech(false);
                    }
                  }
                }}
                className={isListeningForSpeech ? "animate-pulse" : ""}
              >
                <Mic className="h-4 w-4 mr-1 text-cyan-400" />
                {isListeningForSpeech ? "Listening..." : "Speak Mic"}
              </Button>
            )}
            <Button type="submit" variant="primary" size="sm">
              Send Answer
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};
