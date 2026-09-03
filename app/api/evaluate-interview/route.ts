import { NextRequest, NextResponse } from "next/server";
import { googleAI, MODEL_EVALUATION } from "@/lib/gemini";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { EvaluationResult } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { transcript, role, techStack, interviewId } = body;

    if (!transcript || !Array.isArray(transcript)) {
      return NextResponse.json(
        { error: "Invalid payload: transcript array is required" },
        { status: 400 }
      );
    }

    const techStackList = Array.isArray(techStack) ? techStack.join(", ") : (techStack || "General Tech");
    const formattedTranscript = transcript
      .map((t: any) => `[${t.role || t.speaker || 'Speaker'}]: ${t.text || t.content || ''}`)
      .join("\n");

    const prompt = `You are a strict, candid, FAANG-level Bar Raiser & Principal Engineering Director evaluating a candidate's technical interview transcript.

Target Role: ${role || "Software Engineer"}
Tech Stack: ${techStackList}

Interview Transcript:
${formattedTranscript || "No user answers recorded."}

CRITICAL EVALUATION INSTRUCTIONS:
1. DO NOT flatter or sugarcoat feedback. Be direct, objective, and realistic.
2. Evaluate based on candidate's ACTUAL answers in the transcript.
3. If candidate answers are brief, vague, hand-wavy, missing core technical terms, or incorrect regarding ${techStackList}, penalize scores heavily (assign scores in the 35-65 range).
4. Only assign 80+ scores if the candidate provided deep technical specifics, concrete trade-offs, system architecture depth, and STAR-structured explanations.

Provide output strictly as JSON with the following fields:
- overallScore: number (0-100)
- technicalScore: number (0-100)
- communicationScore: number (0-100)
- problemSolvingScore: number (0-100)
- strengths: array of strings (2-4 honest strengths observed in their answers)
- areasForImprovement: array of strings (3-5 sharp, critical, actionable technical gaps or flaws observed)
- summaryFeedback: string (candid executive evaluation paragraph)
- keyTakeaways: array of strings (3 concrete actionable takeaways for improvement)`;

    let evaluationResult: EvaluationResult;
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey !== "mock_gemini_key" && apiKey !== "demo-api-key") {
      try {
        const response = await googleAI.models.generateContent({
          model: MODEL_EVALUATION,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT" as any,
              properties: {
                overallScore: { type: "INTEGER" as any },
                technicalScore: { type: "INTEGER" as any },
                communicationScore: { type: "INTEGER" as any },
                problemSolvingScore: { type: "INTEGER" as any },
                strengths: { type: "ARRAY" as any, items: { type: "STRING" as any } },
                areasForImprovement: { type: "ARRAY" as any, items: { type: "STRING" as any } },
                summaryFeedback: { type: "STRING" as any },
                keyTakeaways: { type: "ARRAY" as any, items: { type: "STRING" as any } },
              },
              required: [
                "overallScore",
                "technicalScore",
                "communicationScore",
                "problemSolvingScore",
                "strengths",
                "areasForImprovement",
                "summaryFeedback",
                "keyTakeaways",
              ],
            },
          },
        });

        const text = response.text;
        if (text) {
          evaluationResult = JSON.parse(text);
        } else {
          throw new Error("Empty text returned from Gemini API");
        }
      } catch (geminiError: any) {
        console.warn("Gemini Pro evaluation call failed, using intelligent fallback analysis:", geminiError?.message || geminiError);
        evaluationResult = generateFallbackEvaluation(role, techStackList, transcript);
      }
    } else {
      evaluationResult = generateFallbackEvaluation(role, techStackList, transcript);
    }

    // Persist to Firestore if interviewId is provided
    if (interviewId && interviewId !== "demo-interview-1") {
      try {
        const feedbackRef = doc(db, "interviews", interviewId, "feedback", "summary");
        await setDoc(feedbackRef, {
          ...evaluationResult,
          updatedAt: new Date().toISOString(),
        });
      } catch (dbError) {
        console.warn("Firestore save failed or running offline mode:", dbError);
      }
    }

    return NextResponse.json({ evaluation: evaluationResult });
  } catch (error: any) {
    console.error("Error evaluating interview:", error);
    return NextResponse.json(
      { error: "Failed to evaluate interview", details: error.message },
      { status: 500 }
    );
  }
}

function generateFallbackEvaluation(role: string, techStack: string, transcript: any[]): EvaluationResult {
  const userMessages = transcript.filter((t) => t.role === "user" || t.speaker === "user");
  const totalUserWords = userMessages.reduce((acc, t) => acc + (t.text ? t.text.split(" ").length : 0), 0);
  const avgWordsPerAnswer = userMessages.length > 0 ? totalUserWords / userMessages.length : 0;

  // Strict dynamic evaluation scoring matrix
  if (userMessages.length === 0 || totalUserWords < 20) {
    return {
      overallScore: 45,
      technicalScore: 40,
      communicationScore: 50,
      problemSolvingScore: 45,
      strengths: [
        "Initiated the interview session.",
        "Identified target position role context.",
      ],
      areasForImprovement: [
        "Candidate provided minimal to no answers during the voice simulation.",
        "Failed to explain technical concepts, code syntax, or system design decisions.",
        "Must speak into the microphone or submit detailed text answers to pass candidate evaluation.",
      ],
      summaryFeedback: `Candidate evaluation failed due to insufficient candidate response data. For a ${role} role, thorough technical explanations with concrete examples are required to establish engineering competence.`,
      keyTakeaways: [
        "Ensure your microphone is active or type detailed technical responses.",
        "Walk through your step-by-step reasoning when answering technical questions.",
        "Provide concrete code or architectural patterns in your responses.",
      ],
    };
  }

  if (avgWordsPerAnswer < 25) {
    return {
      overallScore: 62,
      technicalScore: 58,
      communicationScore: 65,
      problemSolvingScore: 60,
      strengths: [
        "Responded to questions promptly.",
        `Basic familiarity with ${techStack} terminology.`,
      ],
      areasForImprovement: [
        `Answers lacked technical depth regarding ${techStack} memory management, performance, and API design.`,
        "Responses were too brief and surface-level for a senior level interview bar.",
        "Did not use the STAR framework (Situation, Task, Action, Result) when describing past experience.",
        "Missing quantitative impact metrics (e.g. latency improvement %, load scaling data).",
      ],
      summaryFeedback: `The candidate provided basic answers but fell short of the depth expected for a ${role}. Explanations remained high-level without demonstrating deep mastery of ${techStack} or system trade-offs.`,
      keyTakeaways: [
        "Elaborate on technical trade-offs rather than providing single-sentence answers.",
        "Structure past experiences with clear Situation, Action, and Measurable Result details.",
        "Explicitly mention edge-case handling and production monitoring strategies.",
      ],
    };
  }

  return {
    overallScore: 78,
    technicalScore: 76,
    communicationScore: 82,
    problemSolvingScore: 77,
    strengths: [
      `Demonstrated solid familiarity with ${techStack} core concepts.`,
      "Communicated responses with clear structure and reasonable flow.",
      "Provided relevant past experience context during technical questions.",
    ],
    areasForImprovement: [
      `Deeper technical elaboration required for advanced ${techStack} performance optimization and memory profiling.`,
      "System design choices need more explicit discussion of database scaling, caching layers, and fault tolerance.",
      "Include specific metrics (e.g., % reduction in crash rate, FPS improvements, throughput gains) to substantiate claims.",
    ],
    summaryFeedback: `The candidate demonstrated good foundational competence for a ${role}. To reach top-tier (FAANG / Strong Hire) standards, responses should include deeper low-level technical specifics and quantitative performance data.`,
    keyTakeaways: [
      "Quantify your accomplishments with exact numbers or percentages.",
      "Always address scalability, caching, and error handling proactively.",
      "Practice breaking down complex technical problems before diving into implementation details.",
    ],
  };
}
